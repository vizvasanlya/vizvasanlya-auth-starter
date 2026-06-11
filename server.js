const crypto = require('crypto');
const express = require('express');

const app = express();
const users = new Map();
const tokens = new Map();

app.use(express.json());

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('hex');
}

function token() {
  return crypto.randomBytes(24).toString('hex');
}

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const tokenValue = header.replace('Bearer ', '');
  const userId = tokens.get(tokenValue);
  if (!userId) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
  req.userId = userId;
  return next();
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-starter' });
});

app.post('/register', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password || password.length < 8) {
    return res.status(400).json({ error: 'Email and password with at least 8 characters are required.' });
  }
  if (users.has(email)) {
    return res.status(409).json({ error: 'User already exists.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  users.set(email, {
    email,
    salt,
    passwordHash: hashPassword(password, salt),
    createdAt: new Date().toISOString()
  });

  return res.status(201).json({ email, message: 'User created.' });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = users.get(email);
  if (!user || user.passwordHash !== hashPassword(password, user.salt)) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const accessToken = token();
  tokens.set(accessToken, email);
  return res.json({ accessToken, tokenType: 'Bearer' });
});

app.get('/me', auth, (req, res) => {
  const user = users.get(req.userId);
  return res.json({ email: user.email, createdAt: user.createdAt });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`auth-starter listening on ${port}`);
});
