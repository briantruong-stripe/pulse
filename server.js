const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DASHBOARD_KEY = process.env.DASHBOARD_KEY || 'sa-atr';
const DATA_FILE = path.join(__dirname, 'data', 'feedback.json');

const USE_SHEETS = !!(process.env.GOOGLE_SERVICE_ACCOUNT_KEY && process.env.GOOGLE_SHEETS_ID);
const USE_SFDC = !!(process.env.SFDC_USERNAME && process.env.SFDC_PASSWORD);

// ── Google Sheets ─────────────────────────────────────────────────────────────

let _sheetsClient = null;

async function getSheetsClient() {
  if (_sheetsClient) return _sheetsClient;
  const { google } = require('googleapis');
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  _sheetsClient = google.sheets({ version: 'v4', auth });
  return _sheetsClient;
}

const HEADERS = ['id', 'timestamp', 'name', 'role', 'context', 'sfdcOppName', 'sfdcOppId', 'sfdcUrl', 'doneWell', 'couldBeBetter'];

async function ensureHeaders() {
  const client = await getSheetsClient();
  const res = await client.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: 'Sheet1!A1:J1',
  });
  if (!res.data.values?.[0]?.length) {
    await client.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Sheet1!A1:J1',
      valueInputOption: 'RAW',
      resource: { values: [HEADERS] },
    });
  }
}

async function loadFromSheets() {
  await ensureHeaders();
  const client = await getSheetsClient();
  const res = await client.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: 'Sheet1!A2:J',
  });
  return (res.data.values || []).filter(r => r[0]).map(
    ([id, timestamp, name, role, context, sfdcOppName, sfdcOppId, sfdcUrl, doneWell, couldBeBetter]) => ({
      id, timestamp, name,
      role: role || '', context: context || '',
      sfdcOppName: sfdcOppName || '', sfdcOppId: sfdcOppId || '',
      sfdcUrl: sfdcUrl || '',
      doneWell, couldBeBetter,
    })
  );
}

async function appendToSheets(entry) {
  await ensureHeaders();
  const client = await getSheetsClient();
  await client.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: 'Sheet1!A:J',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [[
        entry.id, entry.timestamp, entry.name, entry.role,
        entry.context, entry.sfdcOppName, entry.sfdcOppId,
        entry.sfdcUrl, entry.doneWell, entry.couldBeBetter,
      ]],
    },
  });
}

// ── Local JSON fallback ───────────────────────────────────────────────────────

function ensureLocalFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, '[]');
  }
}

function loadFromLocal() {
  ensureLocalFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function appendToLocal(entry) {
  ensureLocalFile();
  const data = loadFromLocal();
  data.push(entry);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ── Unified storage ───────────────────────────────────────────────────────────

async function loadFeedback() {
  return USE_SHEETS ? loadFromSheets() : loadFromLocal();
}

async function saveFeedback(entry) {
  if (USE_SHEETS) await appendToSheets(entry);
  else appendToLocal(entry);
}

// ── Salesforce ────────────────────────────────────────────────────────────────

let _sfdcConn = null;
let _sfdcConnTime = null;

async function getSfdcConnection() {
  const TTL = 25 * 60 * 1000;
  if (_sfdcConn && _sfdcConnTime && Date.now() - _sfdcConnTime < TTL) return _sfdcConn;
  const jsforce = require('jsforce');
  const conn = new jsforce.Connection({
    loginUrl: process.env.SFDC_LOGIN_URL || 'https://login.salesforce.com',
  });
  await conn.login(
    process.env.SFDC_USERNAME,
    process.env.SFDC_PASSWORD + (process.env.SFDC_SECURITY_TOKEN || ''),
  );
  _sfdcConn = conn;
  _sfdcConnTime = Date.now();
  return conn;
}

// ── Routes ────────────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/feedback', async (req, res) => {
  const { name, role, context, doneWell, couldBeBetter, sfdcOppName, sfdcOppId, sfdcUrl } = req.body;
  if (!name?.trim() || !doneWell?.trim() || !couldBeBetter?.trim()) {
    return res.status(400).json({ error: 'Name, done well, and could be better are required.' });
  }
  const entry = {
    id: crypto.randomUUID(),
    name: name.trim(),
    role: role?.trim() || '',
    context: context?.trim() || '',
    sfdcOppName: sfdcOppName?.trim() || '',
    sfdcOppId: sfdcOppId?.trim() || '',
    sfdcUrl: sfdcUrl?.trim() || '',
    doneWell: doneWell.trim(),
    couldBeBetter: couldBeBetter.trim(),
    timestamp: new Date().toISOString(),
  };
  try {
    await saveFeedback(entry);
    res.json({ success: true });
  } catch (err) {
    console.error('Save error:', err.message);
    res.status(500).json({ error: 'Failed to save feedback.' });
  }
});

app.get('/api/feedback', async (req, res) => {
  try {
    res.json(await loadFeedback());
  } catch (err) {
    console.error('Load error:', err.message);
    res.status(500).json({ error: 'Failed to load feedback.' });
  }
});

// Open to form submitters — they're internal teammates with SFDC access anyway
app.get('/api/opportunities', async (req, res) => {
  if (!USE_SFDC) return res.json({ available: false, records: [] });
  try {
    const conn = await getSfdcConnection();
    const result = await conn.query(
      `SELECT Id, Name, Account.Name, StageName, Amount, CloseDate
       FROM Opportunity
       WHERE IsClosed = false
       ORDER BY LastModifiedDate DESC
       LIMIT 100`
    );
    res.json({
      available: true,
      instanceUrl: process.env.SFDC_INSTANCE_URL || conn.instanceUrl || '',
      records: result.records.map(r => ({
        id: r.Id,
        name: r.Name,
        account: r.Account?.Name || '',
        stage: r.StageName,
        amount: r.Amount || 0,
        closeDate: r.CloseDate,
      })),
    });
  } catch (err) {
    console.error('SFDC error:', err.message);
    res.json({ available: false, records: [], error: err.message });
  }
});

// Protected pipeline summary for dashboard
app.get('/api/pipeline', async (req, res) => {
  if (!USE_SFDC) return res.json({ available: false });
  try {
    const conn = await getSfdcConnection();
    const result = await conn.query(
      `SELECT Id, Name, Account.Name, StageName, Amount, CloseDate, LastModifiedDate
       FROM Opportunity
       WHERE IsClosed = false
       ORDER BY Amount DESC NULLS LAST
       LIMIT 50`
    );
    const records = result.records.map(r => ({
      id: r.Id,
      name: r.Name,
      account: r.Account?.Name || '',
      stage: r.StageName,
      amount: r.Amount || 0,
      closeDate: r.CloseDate,
    }));
    const totalPipeline = records.reduce((s, r) => s + r.amount, 0);
    res.json({
      available: true,
      instanceUrl: process.env.SFDC_INSTANCE_URL || conn.instanceUrl || '',
      records,
      totalPipeline,
      count: records.length,
    });
  } catch (err) {
    console.error('SFDC pipeline error:', err.message);
    res.json({ available: false, error: err.message });
  }
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n✅  Pulse  http://localhost:${PORT}`);
    console.log(`📋  Form   http://localhost:${PORT}`);
    console.log(`🔐  Dash   http://localhost:${PORT}/dashboard  (key: ${DASHBOARD_KEY})`);
    console.log(`📊  Sheets ${USE_SHEETS ? '✓ enabled' : '✗ local JSON'}`);
    console.log(`☁️   SFDC   ${USE_SFDC ? '✓ enabled' : '✗ not configured'}\n`);
  });
}

module.exports = app;
