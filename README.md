# 🎵 TuneLoop — Music Discovery Platform

> A university Agile/Scrum project for music discovery and sharing.

---

## 📁 Project Structure

```
tuneloop/
├── client/                 # React + Vite + TypeScript frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level page components
│   │   ├── services/       # API communication layer
│   │   ├── types/          # TypeScript type definitions
│   │   └── hooks/          # Custom React hooks
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── server/                 # Node + Express + TypeScript backend
│   ├── src/
│   │   ├── controllers/    # Route handler functions
│   │   ├── routes/         # Express route definitions
│   │   ├── services/       # Business logic layer
│   │   ├── middlewares/     # Express middleware
│   │   ├── db/             # Database connection & queries
│   │   └── utils/          # Config, logger, helpers
│   ├── tsconfig.json
│   └── package.json
│
├── docs/                   # Project documentation
├── .gitignore
├── package.json            # Root monorepo scripts
└── README.md
```

---

## ⚙️ Tech Stack

| Layer     | Technology                             |
| --------- | -------------------------------------- |
| Frontend  | React 19, Vite, TypeScript, TailwindCSS |
| Backend   | Node.js, Express, TypeScript           |
| Database  | PostgreSQL (via `pg`)                  |
| Linting   | ESLint 9 (flat config) + Prettier      |
| Dev Tools | tsx (watch mode), concurrently         |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **PostgreSQL** running locally (or a remote connection string)

### 1. Clone the repository

```bash
git clone <repo-url>
cd tuneloop
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

### 3. Configure environment variables

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env with your PostgreSQL credentials

# Client
cp client/.env.example client/.env
```

### 4. Run in development mode

```bash
# Run both client & server concurrently
npm run dev

# Or run individually:
npm run dev:client    # → http://localhost:5173
npm run dev:server    # → http://localhost:4000
```

### 5. Verify

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **API Health Check:** [http://localhost:4000/api/health](http://localhost:4000/api/health)

---

## 📜 Available Scripts

### Root (monorepo)

| Script           | Description                          |
| ---------------- | ------------------------------------ |
| `npm run dev`    | Start client & server concurrently   |
| `npm run build`  | Build both client & server           |
| `npm run lint`   | Lint both client & server            |
| `npm run install:all` | Install deps for both workspaces |

### Client (`client/`)

| Script           | Description                 |
| ---------------- | --------------------------- |
| `npm run dev`    | Start Vite dev server       |
| `npm run build`  | TypeScript check + Vite build |
| `npm run preview`| Preview production build    |
| `npm run lint`   | Run ESLint                  |

### Server (`server/`)

| Script           | Description                     |
| ---------------- | ------------------------------- |
| `npm run dev`    | Start with tsx watch mode       |
| `npm run build`  | Compile TypeScript              |
| `npm run start`  | Run compiled JS from `dist/`    |
| `npm run lint`   | Run ESLint                      |

---

## 🗂 API Endpoints

| Method | Route          | Description       |
| ------ | -------------- | ----------------- |
| GET    | `/api/health`  | Health check      |

_More endpoints will be added in Sprint 1._

---

## 🏃 Sprint Status

- [x] **Step 0:** Project scaffold & clean architecture
- [ ] **Sprint 1:** Core features (upcoming)

---

## 👥 Team

University Agile/Scrum project — TuneLoop Team

---

## 📄 License

This project is for educational purposes.
