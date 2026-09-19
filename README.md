# TaskFlow – MERN Task Management System

Full MERN stack: Express + MongoDB + JWT backend, React + Vite frontend.

## Run backend

```bash
cd server
npm install
npm run dev
```

API: `http://localhost:5000`, base `http://localhost:5000/api`

## Run frontend

```bash
cd client
npm install
npm run dev
```

App: `http://localhost:5173`

## Env

See `server/.env.example` and `client/.env.example`.
Local `server/.env` uses Atlas `taskflow` DB. `JWT_SECRET` is generated locally and git-ignored.

## API summary

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `POST/GET /api/projects`, `GET/PUT/DELETE /api/projects/:id`, `POST /api/projects/:id/members`
- `POST/GET /api/projects/:projectId/tasks`, `GET/PUT /api/tasks/:id`, `PATCH /api/tasks/:id/status`, `DELETE /api/tasks/:id`
- `GET/POST /api/tasks/:taskId/comments`, `DELETE /api/comments/:id`
- `GET /api/dashboard/stats`
