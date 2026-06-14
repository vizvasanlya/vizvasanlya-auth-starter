# Auth Starter

![License](https://img.shields.io/badge/license-MIT-blue)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)

A production-ready authentication API with user registration, login, token management, and profile endpoints.

## Features

- **User Registration** — Email/password signup with validation and hashing
- **Secure Login** — PBKDF2 password hashing with salt
- **Token Auth** — Bearer token authentication with expiry
- **Profile Management** — Get and update user profiles
- **Health Check** — Service health endpoint
- **JSON File Storage** — Simple persistence layer (swap for DB in production)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Service health check |
| `POST` | `/register` | Create a new user account |
| `POST` | `/login` | Authenticate and receive token |
| `GET` | `/me` | Get current user profile |
| `PATCH` | `/me` | Update user profile |
| `POST` | `/logout` | Invalidate current token |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Auth | PBKDF2 + Bearer Tokens |
| Storage | JSON file |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/vizvasanlya/First.git
cd First/vizvasanlya-auth-starter
npm install
```

### Run

```bash
npm start
```

Server starts on [http://localhost:3000](http://localhost:3000)

### Docker

```bash
docker compose up --build
```

## Example Usage

```bash
# Register
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepass123"}'

# Login
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepass123"}'

# Get profile (use token from login response)
curl http://localhost:3000/me \
  -H "Authorization: Bearer <token>"
```

## License

MIT
