# HiddenSpot — Backend API

A REST API for HiddenSpot, a platform for discovering hidden gems and micro-adventures around Dhaka, Bangladesh. Built with Express, TypeScript, and the native MongoDB driver (no ORM/ODM).

## Tech Stack

- **Runtime:** Node.js + Express
- **Language:** TypeScript
- **Database:** MongoDB (native `mongodb` driver — no Mongoose)
- **Auth:** JWT (jsonwebtoken) + bcryptjs for password hashing

## Features

- JWT-based authentication (register, login, protected routes)
- Full CRUD for "spots" (hidden gems), with ownership-based delete permissions
- Search, category/difficulty filtering, sorting, and pagination
- Review system with automatic average rating recalculation
- Role-based access (`user` / `admin`)

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your own values:
```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PORT` | Port the server runs on (default `5000`) |
| `MONGO_URI` | MongoDB connection string (local or Atlas) |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Secret used to sign JWTs — use a long random string |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`, `30d`) |
| `CLIENT_URL` | Frontend URL, for CORS |

### 3. Seed the database

Populates 10+ real Dhaka spots and two demo accounts:
```bash
npm run seed
```

### 4. Run the dev server
```bash
npm run dev
```
Server starts at `http://localhost:5000`.

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@hiddenspot.com` | `admin123` |
| User | `demo@hiddenspot.com` | `demo123` |

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Log in, receive JWT |
| GET | `/api/auth/me` | Protected | Get current user |

### Spots
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/spots` | Public | List spots — supports `?search=&category=&difficulty=&sort=&page=` |
| GET | `/api/spots/mine` | Protected | Get spots added by the logged-in user |
| GET | `/api/spots/:id` | Public | Get a single spot + related spots |
| POST | `/api/spots` | Protected | Create a new spot |
| DELETE | `/api/spots/:id` | Protected | Delete own spot (or any spot, if admin) |
| POST | `/api/spots/:id/reviews` | Protected | Add a review to a spot |

## Project Structure
src/
config/       — MongoDB connection (singleton)
models/       — TypeScript interfaces for User, Spot
controllers/  — Route handler logic
routes/       — Express route definitions
middleware/   — Auth (JWT verification), error handling
utils/        — Password hashing, token generation, validation
seed/         — Database seed script

## Scripts
| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run seed` | Seed database with demo data |

## Notes

- Uses the native MongoDB driver directly (no Mongoose) — data shape is enforced via TypeScript interfaces and manual validation, not a schema layer.
- Passwords are hashed with bcrypt before storage; plaintext passwords are never stored or logged.
