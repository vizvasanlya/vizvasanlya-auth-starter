# Auth Starter

Secure authentication starter API with password hashing, bearer tokens, protected routes, profile updates, and logout.

## Features

- `POST /register`
- `POST /login`
- `GET /me`
- `PATCH /me`
- `POST /logout`
- PBKDF2 password hashing with salt
- Bearer token middleware
- JSON file persistence

## Run

```bash
npm install
npm start
```

## Health

```bash
curl http://localhost:3000/health
```
