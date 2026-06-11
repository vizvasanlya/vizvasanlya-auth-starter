const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json({ limit: '1mb' }));

function load() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { users: [] };
  }
}

function save(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 160000, 32, 'sha256').toString('hex');
}

function token() {
  return crypto.randomBytes(32).toString('hex');
}

function userResponse(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name || null,
    createdAt: user.createdAt
  };
}

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const value = header.startsWith('Bearer ') ? header.slice(7) : '';
  const data = load();
  const match = data.tokens.find((entry) => entry.token === value && (!entry.expiresAt || new Date(entry.expiresAt) > new Date()));
  if (!match) return res.status(401).json({ error: 'Invalid or expired token.' });
  const user = data.users.find((entry) => entry.id === match.userId);
  if (!user) return res.status(401).json({ error: 'User not found.' });
  req.user = user;
  next();
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-starter' });
});

app.post('/register', (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || password.length < 8 || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Provide a valid email and password with at least 8 characters.' });
  }

  const data = load();
  if (data.users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'User already exists.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const user = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    email: email.toLowerCase(),
    name: name || null,
    salt,
    passwordHash: hashPassword(password, salt),
    createdAt: new Date().toISOString()
  };

  data.users.push(user);
  save(data);
  return res.status(201).json({ user: userResponse(user) });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const data = load();
  const user = data.users.find((entry) => entry.email === String(email || '').toLowerCase());
  if (!user || user.passwordHash !== hashPassword(password, user.salt)) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const accessToken = token();
  data.tokens.push({ token: accessToken, userId: user.id, expiresAt: new Date(Date.now() + 86400000).toISOString() });
  data.tokens = data.tokens.filter((entry) => new Date(entry.expiresAt) > new Date());
  save(data);
  return res.json({ accessToken, tokenType: 'Bearer', expiresIn: 86400, user: userResponse(user) });
});

app.get('/me', auth, (req, res) => {
  res.json({ user: userResponse(req.user) });
});

app.patch('/me', auth, (req, res) => {
  const data = load();
  const user = data.users.find((entry) => entry.id === req.user.id);
  const name = req.body.name;
  if (name !== undefined) user.name = String(name).slice(0, 80);
  save(data);
  res.json({ user: userResponse(user) });
});

app.post('/logout', auth, (req, res) => {
  const header = req.headers.authorization || '';
  const value = header.startsWith('Bearer ') ? header.slice(7) : '';
  const data = load();
  data.tokens = data.tokens.filter((entry) => entry.token !== value);
  save(data);
  res.json({ ok: true });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`auth-starter listening on ${port}`);
});
