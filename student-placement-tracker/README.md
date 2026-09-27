# Student Placement Tracker

Full-stack college placement management system for students, placement officers (admin), and recruiters.

## Tech Stack

- **Frontend:** React.js, Vite, React Router, Axios, CSS
- **Backend:** Node.js, Express.js, REST APIs
- **Database:** MySQL
- **Auth:** JWT + bcrypt password hashing

## Project Structure

```
student-placement-tracker/
├── backend/          # Express API + MySQL
│   ├── database/     # schema.sql
│   ├── scripts/      # initDb.js, seed.js
│   └── src/          # routes, controllers, middleware
└── frontend/         # React Vite app
```

## Prerequisites

1. **Node.js** (v18+)
2. **MySQL** (XAMPP / MySQL Server / MySQL Workbench)

> This machine did not have MySQL in PATH when the project was created. Install XAMPP or MySQL Server before running the backend.

## Setup

### 1. Configure backend environment

```bash
cd backend
copy .env.example .env
```

Edit `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=placement_tracker
JWT_SECRET=any_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@college.edu
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=Placement Officer
```

For XAMPP, `DB_PASSWORD` is often empty.

### 2. Install backend and create database

```bash
cd backend
npm install
npm run init-db
npm run seed
npm run dev
```

API runs at `http://localhost:5000`

Default admin login (from seed):

- Email: `admin@college.edu`
- Password: `Admin@123`

### 3. Install and run frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Roles

| Role | How to get access | Dashboard |
|------|-------------------|-----------|
| Student | Register as Student | `/student/dashboard` |
| Recruiter | Register as Recruiter | `/recruiter/dashboard` |
| Admin | Seed script only (cannot self-register) | `/admin/dashboard` |

## Main Features

### Student
- Profile (personal, academic, skills, projects, certifications, resume)
- View eligible jobs and apply
- Track applications, interviews, drives, statistics

### Admin
- Manage students, recruiters, companies, jobs, drives
- Review applications and schedule interviews
- View placed students and export students CSV
- Placement statistics

### Recruiter
- Manage company profile
- Create jobs with eligibility criteria
- Shortlist / reject / select applicants
- Schedule interview rounds
- View selected students

## Useful API Health Check

`GET http://localhost:5000/api/health`

## Notes for Viva / Demo

1. Start MySQL, then backend, then frontend.
2. Login as admin → add company → create job.
3. Register a student → complete profile + upload resume → apply.
4. Login as recruiter/admin → shortlist → schedule interview → select.
