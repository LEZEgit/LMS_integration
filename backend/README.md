# LMS Auth Backend

This is my first real backend project. I built this to move beyond following tutorials and actually implement a functional API for a Learning Management System. It handles the core mechanics of an app: user authentication, Role-Based Access Control (RBAC), and data persistence for reader favorites.

I developed this from scratch using a "bare bones" approach first, then used Claude and GitHub Copilot to refactor, harden the security, and implement better architectural patterns. I am still learning dev, and this repository is my way of documenting that progress.

## Why I Built This

I wanted to understand the "why" behind each layer of a modern API:

-   **The Start:** I began with basic Express routes and simple JSON responses to understand the request-response cycle.
-   **The Iteration:** I integrated **Prisma** to manage my PostgreSQL schema and added **Zod** because I realized how messy unvalidated input can be.
-   **The Hardening:** I implemented JWT refresh token logic and standardized error middlewares to move toward a more professional architecture.

## Tech Stack

-   **Runtime:** Node.js with Express.
-   **Database & ORM:** PostgreSQL using Prisma.
-   **Security:** JWT (Access + Refresh tokens), Bcrypt for hashing, and Helmet for header security.
-   **Validation:** Zod (my source of truth for request schemas).
-   **Testing:** Jest and Supertest.

---

### Internal Note

> This code represents where I am right now—it’s not "perfect," but it's functional and tested. I'm keeping this here as a reminder to myself: **Don't give up.** Every bug I hit is just a gap in my knowledge that I'm currently closing.

---

## Project Structure

I structured this to follow a standard pattern to keep my logic organized:

-   `src/config`: Setup for environment variables and DB clients.
-   `src/controllers`: The actual logic for handling requests.
-   `src/middleware`: Where I handled RBAC logic and JWT verification.
-   `src/validators`: Zod schemas to catch bad data before it hits my controllers.
-   `prisma`: My database schema and migration history.
-   `openapi.yaml`: My API contract reference.

## API Endpoints

### Auth

-   `POST /auth/login` - Generates the token pair.
-   `POST /auth/refresh` - Session management.
-   `POST /auth/logout` - Invalidation logic.

### Reader (User) Routes

-   `GET/POST/PUT/DELETE /reader/favorites` - CRUD for user-specific data.

### Admin (Protected) Routes

-   `GET/POST/PUT/DELETE /admin/manage/reader` - Full user management restricted by role.

## Getting Started

1.  **Install dependencies:** `npm install`
2.  **Environment Setup:** Create a `.env` file with `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `PORT`.
3.  **Run Migrations:** `npx prisma migrate dev`
4.  **Start the Server:** `npm run dev` (starts with nodemon).
5.  **Run Tests:** `npm test`

## Security & Hardening Features

-   **Rate Limiting:** Prevents brute-force attacks on the login endpoint.
-   **CORS Configuration:** Restricting access to the specific frontend origin.
-   **Environment Validation:** Ensuring the server won't start if critical variables (like `JWT_SECRET`) are missing.
-   **Standardized Errors:** Centralized error handling middleware for consistent API responses.

##