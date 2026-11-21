# E-Voting Platform

A full-stack MERN e-voting application. Registered voters log in, browse elections and candidates, cast a ballot (once per election), and view published results. Administrators manage elections, candidates, and voters from a dedicated dashboard.

- **Voters** — register, log in, browse elections, review candidates, vote, and view results.
- **Admins** — dashboard with live stats, full CRUD over elections and candidates, voter management (activate/deactivate), and per-election results.

## Technology Stack

| Layer     | Technology                                                          |
| --------- | ------------------------------------------------------------------- |
| Frontend  | React (JavaScript), Vite, React Router DOM, Axios, plain CSS        |
| Backend   | Node.js, Express.js, MongoDB (Mongoose)                             |
| Auth      | JSON Web Tokens (JWT), bcryptjs (password hashing)                  |
| Tooling   | dotenv, cors, express-validator, nodemon, concurrently              |

## Project Structure

```
e-voting-platform/
├── frontend/                  # React (Vite) SPA
│   ├── public/
│   └── src/
│       ├── assets/            # images/, icons/
│       ├── components/        # Navbar, Modal, CandidateCard, guards, etc.
│       ├── context/           # AuthContext, ToastContext
│       ├── hooks/             # (reserved)
│       ├── pages/             # public + voter pages; admin/ subfolder
│       ├── routes/            # AppRoutes.jsx
│       ├── services/          # api.js + auth/election/candidate/vote/user services
│       ├── utils/             # format.js
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css          # design system
├── backend/                   # Express REST API
│   ├── config/                # db.js (MongoDB connection)
│   ├── controllers/
│   ├── models/                # User, Election, Candidate, Vote, VoterRecord
│   ├── routes/
│   ├── middleware/            # auth, admin, error, 404
│   ├── utils/                 # asyncHandler, validators, seed, etc.
│   ├── test/                  # API integration tests (npm test)
│   ├── server.js
│   └── .env.example
├── package.json               # root: concurrently scripts
├── .gitignore
└── README.md
```

## Prerequisites

- **Node.js 18+** (22 recommended)
- **npm**
- **MongoDB** — either a local instance (Docker) or a MongoDB Atlas cluster

## Installation (first-time setup)

### 1. Install dependencies

```bash
npm run install-all
```

This installs the root, backend, and frontend dependencies.

### 2. Configure environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

`backend/.env`:

```
PORT=5050
MONGO_URI=mongodb://127.0.0.1:27017/evoting
JWT_SECRET=your-long-random-secret
CLIENT_URL=http://localhost:5173
ADMIN_NAME=Ada Admin
ADMIN_EMAIL=ada@example.com
ADMIN_PASSWORD=Str0ngPass!
```

`frontend/.env`:

```
VITE_API_URL=http://localhost:5050/api
```

> **Port note:** the backend uses `5050`, not `5000` — macOS AirPlay Receiver occupies
> port 5000 by default and the backend cannot bind there. If you change `PORT`, also
> update `VITE_API_URL` in `frontend/.env`.

Generate a real secret for `JWT_SECRET` (e.g. `openssl rand -hex 32`).

### 3. Set up MongoDB

**Option A — local MongoDB in Docker:**

```bash
docker run -d --name evoting-mongo -p 27017:27017 -v evoting-data:/data/db mongo:7
```

Then use `MONGO_URI=mongodb://127.0.0.1:27017/evoting`.

**Option B — MongoDB Atlas:** paste your connection string (e.g.
`mongodb+srv://user:pass@cluster.mongodb.net/evoting`) into `MONGO_URI`. No code changes
are needed.

### 4. Seed an administrator

Public registration always creates `voter` accounts — the admin role can never be
assigned from a public request. The initial administrator is created by a backend seed
script (`backend/scripts/createAdmin.js`) that reads administrator details from
environment variables. Set them in `backend/.env`:

```
ADMIN_NAME=Ada Admin
ADMIN_EMAIL=ada@example.com
ADMIN_PASSWORD=Str0ngPass!
```

Then run:

```bash
npm run create-admin
```

The password is bcrypt-hashed before saving, and the script is idempotent — running it
again will not create a duplicate account.

### 5. Run the application

Start both servers together:

```bash
npm run dev
```

Or separately:

```bash
npm run server   # backend  → http://localhost:5050  (nodemon)
npm run client   # frontend → http://localhost:5173  (Vite)
```

Verify with:

```bash
curl http://localhost:5050/api/health
# { "success": true, "message": "E-Voting Platform API is running", "data": { ..., "database": "connected" } }
```

## Frontend Routes

| Route                        | Access | Description                          |
| ---------------------------- | ------ | ------------------------------------ |
| `/`                          | public | Landing page                         |
| `/login`, `/register`        | public | Authentication                       |
| `/elections`, `/elections/:id` | public | Browse elections and candidates    |
| `/results`                   | public | Published results                    |
| `/dashboard`                 | auth   | Voter dashboard                      |
| `/elections/:id/vote`        | auth   | Cast a vote                          |
| `/profile`                   | auth   | View / update own profile            |
| `/admin/dashboard`           | admin  | Admin overview                       |
| `/admin/elections`           | admin  | Manage elections                     |
| `/admin/candidates`          | admin  | Manage candidates                    |
| `/admin/users`               | admin  | Manage voters                        |
| `/admin/results`             | admin  | Per-election results                 |

## API

All responses use the shape `{ success, message, data }` (errors: `{ success, message }`).

### Auth

| Method | Endpoint           | Access | Description                            |
| ------ | ------------------ | ------ | -------------------------------------- |
| POST   | /api/auth/register | public | Register a voter (role is always `voter`) |
| POST   | /api/auth/login    | public | Login, returns a JWT                   |
| GET    | /api/auth/me       | auth   | Current authenticated user             |

### Users

| Method | Endpoint               | Access     | Description                              |
| ------ | ---------------------- | ---------- | ---------------------------------------- |
| GET    | /api/users             | admin      | List all users                           |
| GET    | /api/users/:id         | admin/self | Get a user                               |
| PUT    | /api/users/:id         | admin/self | Update a user (admin-only fields gated)  |
| PATCH  | /api/users/:id/status  | admin      | Activate / deactivate an account         |

### Elections

| Method | Endpoint           | Access | Description                                      |
| ------ | ------------------ | ------ | ------------------------------------------------ |
| GET    | /api/elections     | public | List elections                                   |
| GET    | /api/elections/:id | public | Get one election                                 |
| POST   | /api/elections     | admin  | Create an election (validates dates)             |
| PUT    | /api/elections/:id | admin  | Update dates/status, publish results             |
| DELETE | /api/elections/:id | admin  | Delete (blocked if it has recorded votes)        |

### Candidates

| Method | Endpoint            | Access | Description                                         |
| ------ | ------------------- | ------ | --------------------------------------------------- |
| GET    | /api/candidates     | public | List candidates (optional `?election=<id>`)         |
| GET    | /api/candidates/:id | public | Get one candidate                                   |
| POST   | /api/candidates     | admin  | Create a candidate (must reference a real election) |
| PUT    | /api/candidates/:id | admin  | Update a candidate                                  |
| DELETE | /api/candidates/:id | admin  | Delete (blocked if it has recorded votes)           |

### Voting

| Method | Endpoint                        | Access | Description                                          |
| ------ | ------------------------------- | ------ | ---------------------------------------------------- |
| POST   | /api/votes                      | voter  | Cast a vote (active election, one per voter)         |
| GET    | /api/votes/results/:electionId  | public | Aggregated results (only when completed or published) |

Protected endpoints require an `Authorization: Bearer` header containing the JWT
returned by login.

## Authentication & Authorization

- Passwords are hashed with bcryptjs and never returned by the API.
- Login returns a JWT (7-day expiry) carrying the user id and role; every request
  re-loads the user from the database via `authMiddleware`.
- `adminMiddleware` enforces the admin role on every admin route; the frontend route
  guards are UX only — the backend is the source of truth.
- Public registration always forces `role: 'voter'`. Admins are created only via
  `npm run create-admin`.

## Voting Workflow

1. Register a voter account and log in.
2. Browse `/elections` and open an active election.
3. Review the candidates, select one, and confirm on the vote page.
4. The backend verifies the election is active, the candidate belongs to it, and the
   voter is a `voter` role — then records the ballot.
5. A database-level unique index on `{ election, voter }` (VoterRecord) rejects any
   duplicate or concurrent vote (HTTP 409).
6. Results are hidden until the election completes or an admin publishes them, and are
   aggregated anonymously by candidate.

## Security Notes

- Input validation via express-validator; malformed JSON returns 400.
- Duplicate email / registration number prevented by unique indexes (409 on race).
- Elections and candidates with recorded votes cannot be deleted.
- Election dates are validated (`endDate` must be after `startDate`).
- CORS is restricted to the frontend origin.
- Secrets come from environment variables; `.env` is git-ignored.

**Ballot secrecy model (and its limitations):** ballots are split across two
collections — `Vote` holds the candidate choice with no voter reference, and
`VoterRecord` holds who voted with no candidate reference. No API endpoint exposes a
voter→candidate mapping, and results are aggregates only. This is a *basic* secrecy
model, not cryptographic: an operator with direct database access could correlate the
two records by insertion order/timestamp. It is **not suitable for legally binding
public elections** without independent security audits, formal verification, and the
appropriate election certification.

## Testing

Backend integration tests cover health, auth/validation, and the full voting workflow
(including duplicate and concurrent vote rejection):

```bash
# start the backend and seed an admin first, then:
cd backend && npm test
```

## Deployment

This project is deployed with the frontend on Vercel and the backend on Render.

**Frontend (Vercel)** — https://frontend-tuta.vercel.app/
- Environment variable: `VITE_API_URL=https://evoting-damr.onrender.com/api`

**Backend (Render)** — https://evoting-damr.onrender.com
- `NODE_ENV=production`
- `CLIENT_URL=https://frontend-tuta.vercel.app`
- `MONGO_URI=<production MongoDB connection string>`
- `JWT_SECRET=<production secret>`
- `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` (for seeding an admin)

Steps:

1. **Frontend** — run `npm run build` (reads `VITE_API_URL` at build time) and deploy `dist/`.
2. **Backend** — run `node server.js` (or `npm start`); Render runs the `start` command automatically.
3. Seed an admin on the production database with `npm run create-admin`.
4. Use HTTPS (both platforms provide it by default).

## Notes

- The backend starts listening only after the MongoDB connection succeeds.
- Frontend and backend are separate apps with their own `package.json`.
- Root scripts: `npm run dev`, `npm run server`, `npm run client`, `npm run install-all`.
