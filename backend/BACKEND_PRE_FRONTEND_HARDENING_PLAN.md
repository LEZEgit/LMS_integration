# LMS Auth Backend Hardening Plan (Pre-Frontend)

## Goal

Implement critical backend hardening before frontend integration, while minimizing API breakage risk.

## Non-Breaking Constraints (Must Follow)

1. **Do not change existing route paths or HTTP methods** unless explicitly listed.
2. **Do not remove existing response fields** currently used by clients.
3. If adding a new standardized response format, use a **compatibility mode**:
   - keep legacy fields
   - add new fields (`success`, `data`, `error`) alongside legacy until migration is complete
4. **Do not change DB columns destructively** without migration strategy.
5. **Preserve existing auth behavior** unless security fixes require controlled changes.
6. Add tests before/with refactors for critical endpoints.

---

## Priority Order

## P0 — Critical (Do first)

### 1) Global Error Handling + 404 Handling

**Files:**

- `src/middleware/errorHandler.js` (new)
- `src/server.js` (wire middleware last)

**Implement:**

- `notFoundHandler(req, res, next)` -> 404 JSON error
- `errorHandler(err, req, res, next)` -> normalized error payload

**Target error shape:**

```json
{
  "success": false,
  "error": {
    "code": "SOME_CODE",
    "message": "Human readable message",
    "details": null
  }
}
```

**Compatibility note:**
If current controllers return custom error JSON, keep it temporarily by mapping into `error.details`.

---

### 2) Security Middleware in Server Bootstrap

**File:** `src/server.js`

**Add:**

- `helmet`
- `cors` with env-driven origins
- `express-rate-limit`
- `express.json({ limit: "1mb" })`
- `/health` route

**Order (important):**

1. security middleware
2. parsers
3. routes
4. 404 handler
5. error handler

---

### 3) Auth Hardening (Controller + Middleware)

**Files:**

- `src/controllers/authController.js`
- `src/middleware/authenticate.js`
- `src/middleware/authorize.js`
- `src/utils/generateToken.js`

**Implement:**

- Uniform invalid login response (do not reveal if email exists)
- Strict Bearer token parsing
- Expired token -> `401` with code like `TOKEN_EXPIRED`
- Minimal `req.user` payload (id, role only)
- Ensure bcrypt rounds are secure (10–12 minimum)
- Ensure token expiry values are explicit and consistent

**If refresh token flow is missing:**

- Add `refresh` and `logout` endpoints in backward-compatible way (new routes, no breaking of old).

---

### 4) Full Validation Coverage

**Files:**

- `src/middleware/validateRequest.js`
- `src/validators/*.js`
- `src/routes/**/*.js`

**Implement:**

- Every route must validate `params`, `query`, `body` as applicable
- Reject unknown fields for sensitive routes (auth/admin writes)
- Normalize inputs:
  - email: trim + lowercase
  - pagination: bounded `page`, `limit`
  - optional fields: explicit nullable handling (`notes`, `lastName`)

---

### 5) Prisma Integrity + Query Performance Pass

**Files:**

- `prisma/schema.prisma`
- `prisma/migrations/*` (new migration only; do not edit old applied migrations)

**Verify/Add:**

- `User.email` is unique
- Composite uniqueness for favorites if rule is one favorite per user-book:
  - `@@unique([userId, bookId])`
- Indexes for hot queries:
  - favorites by `userId`, timestamps
- Confirm relation `onDelete` behavior matches business rules

**Migration safety:**

- Add non-destructive migration first.
- If duplicates block unique constraints, write cleanup script before migration.

---

### 6) Environment Validation at Startup

**Files:**

- `src/config/env.js` (new)
- `src/server.js` (import/use)

**Validate:**

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `PORT`
- `CORS_ORIGIN`

App should fail fast on missing required env vars.

---

## P1 — Important (After P0)

### 7) Route Organization + Middleware Consistency

**Files:** `src/routes/**`

**Enforce per route order:**

1. `authenticate`
2. `authorize`
3. `validateRequest`
4. controller handler

**Optional (non-breaking):**

- add versioned aliases (`/api/v1/...`) while retaining old paths.

---

### 8) Minimum Integration Test Suite

**Suggested stack:** Jest + Supertest (or existing test stack)

**Must-cover flows:**

- register/login success and failures
- protected route without token / invalid token / expired token
- admin route forbidden for reader
- favorites create/list/delete
- duplicate favorite conflict behavior
- validation failures return normalized errors

---

### 9) API Contract for Frontend

**Deliverable:** OpenAPI spec (`openapi.yaml`)

Include:

- auth routes
- reader routes
- admin routes
- standardized error schema
- auth headers and example responses

---

## Suggested Execution Plan (Low Risk)

1. Add tests around current behavior (baseline).
2. Add global error middleware + server hardening (no route signature changes).
3. Apply validation coverage route-by-route.
4. Harden auth middleware/controller.
5. Add Prisma migration for missing constraints/indexes.
6. Add env validation.
7. Update docs/OpenAPI.
8. Re-run tests and smoke test all endpoints.

---

## Definition of Done (Pre-Frontend Gate)

- [ ] All existing endpoints still reachable with same path/method
- [ ] No known 500s for expected bad input cases
- [ ] Errors are consistent and machine-readable
- [ ] Auth/role checks verified with tests
- [ ] DB uniqueness/integrity rules enforced
- [ ] `.env` misconfig fails at startup
- [ ] OpenAPI doc available for frontend use

---

## Compatibility Checklist (Must Pass)

- [ ] Existing clients still parse success responses
- [ ] Existing clients still parse error responses (or equivalent fallback)
- [ ] No silent auth behavior changes
- [ ] No destructive schema changes without data migration
- [ ] CORS configured for frontend origin(s)

---

## Notes for LLM Implementer

1. Prefer incremental PRs/commits by section (P0.1, P0.2, etc.).
2. Do not refactor unrelated files while applying security/validation updates.
3. Preserve current business logic unless explicitly fixing a bug/security issue.
4. For each changed endpoint, include before/after response examples in PR notes.
5. If uncertain about existing frontend dependency, keep legacy fields and add new fields instead of replacing.
