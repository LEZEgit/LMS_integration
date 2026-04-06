# LMS Auth Backend - Learning Notes for New Developers 📚

This document compiles key learnings and concepts discovered while building this backend. Use this as a reference guide to understand the project structure and best practices implemented.

---

## Table of Contents

1.  [Database & Schema Design](#database--schema-design)
2.  [Prisma ORM Concepts](#prisma-orm-concepts)
3.  [Error Handling Strategy](#error-handling-strategy)
4.  [Authentication & Security](#authentication--security)
5.  [Input Validation](#input-validation)
6.  [Testing Framework](#testing-framework)
7.  [API Design Patterns](#api-design-patterns)
8.  [Code Organization](#code-organization)

---

## Database & Schema Design

### Composite Keys & Unique Constraints

**File:** `prisma/schema.prisma`

```prisma
// Prevents duplicate user-book pairs@@unique([userId, bookId])
```

**Key Learning:**

-   Use composite unique constraints to enforce business logic at the database level
-   Example: A user can add the same book to favorites only once
-   More efficient than application-level checking

### Indexes for Query Performance

```prisma
@@index([userId])    // Favorites filtered by user@@index([createdAt]) // Listings sorted by creation time@@index([role])      // Admin queries filtering by role
```

**Why Indexes Matter:**

-   Speed up `WHERE` and `ORDER BY` queries
-   Essential for frequently filtered fields
-   Added after schema design once hot queries identified

### Relationships & Cascading

```prisma
creator User? @relation("bookCreator", fields: [createdBy], references: [id], onDelete: SetNull, onUpdate: Cascade)
```

**onDelete: SetNull** - When user deleted, their `createdBy` reference becomes null (softer approach)**OnDelete: Cascade** - When user deleted, all related items are deleted too (aggressive cleanup)

**Decision Guidance:**

-   Use `SetNull` for audit trails (who created this? even if they're deleted)
-   Use `Cascade` for temporary data (don't need orphaned records)

### Nullable Fields

```prisma
lastName String?      // Optional fieldthumbnail_url String? // Optional metadata
```

**Rule of Thumb:**

-   Make fields nullable (`?`) only if they can truly be empty
-   Required fields (like email) should NOT have `?`
-   More strict schemas = fewer bugs

### Field Constraints

```prisma
email String @unique    // No duplicatesISBN String @unique     // Business requirementrole ROLE @default(READER)  // Sensible default value
```

---

## Prisma ORM Concepts

### "Find" Methods vs "Mutation" Methods

**File:** `src/controllers/favoritesController.js`

#### Find Methods (Return null, Don't Throw)

```javascript
// These return null if not found - NEVER throw errorsconst book = await prisma.book.findUnique({ where: { id: bookId } });if (!book) {  // Handle gracefully}const items = await prisma.favorites.findMany();// Returns empty array [], never null
```

**Behavior:**

-   `findUnique()` → returns object or `null`
-   `findMany()` → returns array (possibly empty `[]`)
-   `findFirst()` → returns object or `null`

#### Mutation Methods (Throw Errors)

```javascript
// These THROW errors if operation failsconst deleted = await prisma.favorites.delete({ where: { id: "123" } });// If ID doesn't exist → throws P2025 errorconst updated = await prisma.favorites.update({ where: { id: "123" }, data: {...} });// If ID doesn't exist → throws P2025 error
```

**Key Insight:**When you call `delete()` or `update()`, Prisma assumes the record exists. If not, it throws an exception rather than returning null. Always wrap mutations in `try-catch`.

### Prisma Error Codes

```javascript
// Common error codes to handle:if (error.code === "P2002") {  // Unique constraint violation (duplicate email, duplicate favorite)  error.code = "DUPLICATE_FAVORITE";}if (error.code === "P2025") {  // Record not found (trying to update/delete non-existent item)  error.code = "FAVORITE_NOT_FOUND";}if (error.code === "P2014") {  // Required relation missing (invalid foreign key)  error.code = "INVALID_REFERENCE";}
```

**Best Practice:** Map Prisma error codes to your custom application codes for frontend consistency.

### Race Conditions in Create Operations

```javascript
const favoriteItem = await prisma.favorites.create({  data: { userId, bookId, notes },});
```

**Race Condition Scenario:**

1.  User A checks if favorite exists → NOT found
2.  User A starts create operation
3.  User B creates same favorite → succeeds
4.  User A's create fails (P2002 duplicate)

**Solution:** Catch P2002 and handle gracefully

```javascript
try {  const favorite = await prisma.favorites.create({ data });} catch (error) {  if (error.code === "P2002") {    // Already exists, that's okay    throw new Error("Book already in Favorites");  }  throw error;}
```

---

## Error Handling Strategy

### Standardized Error Format

**All errors should follow this structure:**

```javascript
{  success: false,  error: {    code: "ERROR_CODE",           // Machine-readable    message: "Human readable message", // User-friendly    details: null                 // Optional: extra context  }}
```

### Error Throwing Pattern

```javascript
// BAD - Returns custom JSONreturn res.status(400).json({ error: "Something failed" });// GOOD - Throws standardized errorconst error = new Error("Something failed");error.status = 400;error.code = "SPECIFIC_ERROR_CODE";throw error;
```

**Why Throwing is Better:**

-   Centralized error handler catches ALL errors
-   Consistent response format everywhere
-   Easier middleware integration

### Authorization Checks

```javascript
if (req.user.role !== "ADMIN" && req.user.role !== "ROOT_ADMIN") {  const error = new Error("Access denied.");  error.status = 403;  error.code = "FORBIDDEN";  throw error;}
```

**Security:** Always check user role before performing admin operations.

### Self-Deletion Prevention

```javascript
if (id === currentUser.id) {  const error = new Error("You cannot delete your own account.");  error.status = 400;  error.code = "SELF_DELETION_NOT_ALLOWED";  throw error;}
```

**UX & Security:** Prevent users from accidentally locking themselves out.

---

## Authentication & Security

### Password Hashing Configuration

**File:** `src/controllers/authController.js`

```javascript
const DEFAULT_BCRYPT_ROUNDS = 12;const MIN_BCRYPT_ROUNDS = 10;const MAX_BCRYPT_ROUNDS = 12;// Ensures bcrypt rounds stay between 10-12const BCRYPT_ROUNDS = Math.max(  MIN_BCRYPT_ROUNDS,  Math.min(    Number(process.env.BCRYPT_SALT_ROUNDS) || DEFAULT_BCRYPT_ROUNDS,    MAX_BCRYPT_ROUNDS,  ),);
```

**Key Points:**

-   10-12 rounds is industry standard (balances security & performance)
-   Lower rounds = faster but less secure
-   Higher rounds = slower but very secure
-   Too high (>15) = severe performance impact

### Password Upgrade on Login

```javascript
const currentRounds = bcrypt.getRounds(user.password);if (currentRounds < MIN_BCRYPT_ROUNDS) {  const upgradedHash = await bcrypt.hash(password, BCRYPT_ROUNDS);  await prisma.user.update({    where: { id: user.id },    data: { password: upgradedHash },  });}
```

**Why This Matters:**

-   Old userbase might have weak hashes (8 rounds)
-   Silently upgrade their passwords on next login
-   No forced password reset needed

### Cookie Security

```javascript
const isProd = process.env.NODE_ENV === "production";res.cookie("refreshToken", token, {  httpOnly: true, // Can't be accessed by JavaScript  secure: isProd, // Only HTTPS in production  sameSite: "strict", // CSRF protection  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days});
```

**httpOnly:** JavaScript can't steal it via XSS**secure:** Only sent over HTTPS in production**sameSite: "strict":** Not sent in cross-site requests

### Uniform Error Messages

```javascript
// CRITICAL: Never leak whether user existsconst invalidCredsMsg = "Invalid credentials";if (!user) {  return invalidCredsMsg; // Don't say "User not found"}if (!isPasswordValid) {  return invalidCredsMsg; // Same message for wrong password}
```

**Why:** Prevents account enumeration attacks (attackers guessing valid emails)

---

## Input Validation

### Zod Schema Structure

**File:** `src/middleware/validateRequest.js`

```javascript
// Single schema validation (body only)validateRequest(loginSchema);// Validate specific partvalidateRequest(schema, "params");// Validate multiple partsvalidateRequest({  body: userSchema,  params: idSchema,});
```

### Validation Patterns

**Email normalization:**

```javascript
email: z.string({ required_error: "Email is required" })  .trim() // Remove whitespace  .toLowerCase() // Normalize case  .email("Invalid email format")  .min(1, "Email cannot be empty");
```

**Password requirements:**

```javascript
password: z.string()  .min(8, "Password must be at least 8 characters long")  .regex(/[A-Z]/, "Must contain at least one uppercase letter")  .regex(/[0-9]/, "Must contain at least one number");
```

**Optional fields with constraints:**

```javascript
lastName: z.string()  .min(2, "Last name must be at least 2 characters")  .optional(); // Can be omitted, but if provided must meet constraints
```

### Enum Validation

```javascript
role: z.enum(["ADMIN", "READER", "ROOT_ADMIN"], {  errorMap: () => ({    message: "Role must be one of: ADMIN, READER, ROOT_ADMIN",  }),}).optional();
```

### Array Validation

```javascript
ids: z.array(z.string().uuid("One or more IDs have an invalid format")).min(  1,  "You must select at least one item to delete",);
```

---

## Testing Framework

### Test Structure: Arrange → Act → Assert

```javascript
test("should add book to favorites successfully", async () => {  // ARRANGE - Setup test data  const userId = "550e8400-e29b-41d4-a716-446655440000";  const bookId = "660e8400-e29b-41d4-a716-446655440111";  const token = generateTestJWT(userId);  // ACT - Make the API request  const response = await request(app)    .post("/reader/favorites")    .set("Authorization", `Bearer ${token}`)    .send({ bookId, notes: "Great book!" });  // ASSERT - Verify the result  expect(response.status).toBe(201);  expect(response.body.data.favoriteItem.id).toBeDefined();});
```

### Prisma Mocking in Tests

```javascript
// Mock success casemockPrisma.book.findUnique.mockResolvedValue({  id: bookId,  title: "Test Book",});// Mock error case (P2002 - duplicate)mockPrisma.favorites.create.mockRejectedValue({  code: "P2002",});
```

**Why Mock?**

-   Tests run in milliseconds (no real DB queries)
-   No test database setup needed
-   Can simulate error scenarios easily

### Test Organization

```javascript
describe("Favorites Routes", () => {  describe("POST /reader/favorites - Add to Favorites", () => {    test("should add book to favorites", () => { ... });    test("should prevent duplicates", () => { ... });    test("should require authentication", () => { ... });  });  describe("DELETE /reader/favorites/:id", () => {    test("should delete favorite", () => { ... });    test("should prevent cross-user deletion", () => { ... });  });});
```

---

## API Design Patterns

### User Scoping in Favorites

```javascript
// Security: Always filter by current userconst deleted = await prisma.favorites.deleteMany({  where: {    id: { in: ids },    userId: currentUserId, // CRITICAL: Ensures user can only delete their own  },});
```

**Pattern:** Never trust user input alone. Use `req.user.id` to enforce ownership.

### Soft User Enumeration Prevention

```javascript
// Instead of detailed error messages// ❌ BADif (!book) {  return "Book not found"; // Reveals what's missing}// ✅ GOODif (!book || book.userId !== currentUserId) {  return "Not found"; // Same message for missing or unauthorized}
```

### Counting Deleted Items

```javascript
const deleted = await prisma.favorites.deleteMany({  where: { id: { in: ids }, userId: currentUserId },});// Return what was actually deleted vs requestedreturn res.status(200).json({  message: `${deleted.count} items removed from Favorites.`,  requestedCount: ids.length,  deletedCount: deleted.count,});
```

**UX:** Let user know if fewer items were deleted than requested (some might not exist).

### Middleware Ordering

**Correct order matters!**

```javascript
router.use(authenticate); // 1st: Who are you?router.post(  "/:id",  authorize(["ADMIN"]), // 2nd: Are you allowed?  validateRequest(schema), // 3rd: Is input valid?  handler, // 4th: Do the work);
```

**Why:**

1.  Authenticate first (no point validating for unauthenticated user)
2.  Authorize second (no point validating if user lacks permission)
3.  Validate last (only validate if user is authenticated and authorized)

---

## Code Organization

### Controller Structure

```javascript
const controllerFn = async (req, res) => {  // 1. Extract & validate inputs  const { id } = req.params;  // 2. Check authorization/ownership  if (item.userId !== req.user.id) {    throw error;  }  // 3. Perform business logic  const result = await prisma.operation();  // 4. Return response (throw errors, don't return them)  res.status(200).json({ data: result });};
```

### Comment Style

```javascript
// Single line comments for brief explanationsconst book = await prisma.book.findUnique({ where: { id: bookId } });// Numbered comments for multi-step processes// 1. Check book exists (good UX)// 2. Just try to create it directly// 3. Handle the duplicate case if it happens
```

### Separation of Concerns

```
src/├── controllers/    # Business logic├── routes/         # Route definitions├── middleware/     # Authentication, validation, error handling├── validators/     # Zod schemas└── utils/          # Helper functions
```

**Each file has a single responsibility:**

-   Don't mix validation in controllers
-   Don't mix auth checks in routes
-   Keep validators separate from controllers

---

## Best Practices Summary

### Security Checklist ✅

-   Hash passwords with adequate rounds (10-12)
-   Use httpOnly, secure, sameSite cookies
-   Never leak user enumeration info
-   Scope queries to current user ID
-   Validate all inputs with Zod
-   Check authorization before operations
-   Use unique constraints for business rules
-   Throw standardized errors

### Performance Checklist ✅

-   Add indexes to frequently queried fields
-   Use composite unique constraints
-   Don't select unnecessary fields
-   Use proper `where` conditions
-   Batch operations when possible
-   Mock Prisma in tests (don't hit DB)

### Code Quality Checklist ✅

-   Consistent error format
-   Numbered comments for complex logic
-   Middleware ordering: auth → authz → validation → handler
-   Single responsibility per function/file
-   Test critical paths
-   Document public APIs

### Routing Checklist ✅

-   Always add static routes before dynamic routes
-   DELETE method works best with params, use POST if doing bulk delete or bulk patching as it works best with req.body

---

## Quick Reference: Key Error Codes

Code

HTTP Status

Meaning

Example

`INVALID_CREDENTIALS`

401

Wrong email/password

Login failed

`TOKEN_EXPIRED`

401

JWT expired

Refresh needed

`VALIDATION_ERROR`

400

Invalid input

Email format bad

`DUPLICATE_EMAIL`

400

Email already taken

User registration

`DUPLICATE_FAVORITE`

400

Book already favorited

Add to favs twice

`INSUFFICIENT_PERMISSION`

403

User lacks role

READER accessing /admin

`SELF_DELETION_NOT_ALLOWED`

400

Can't delete self

Deleting own account

`BOOK_NOT_FOUND`

404

Book doesn't exist

Add nonexistent book

`FAVORITE_NOT_FOUND`

404

Favorite doesn't exist

Delete nonexistent fav

`ROUTE_NOT_FOUND`

404

Endpoint doesn't exist

/api/unknown

---

## Additional Resources

-   **Prisma Docs:** [https://www.prisma.io/docs/](https://www.prisma.io/docs/)
-   **Zod Validation:** [https://zod.dev/](https://zod.dev/)
-   **JWT Best Practices:** [https://tools.ietf.org/html/rfc7519](https://tools.ietf.org/html/rfc7519)
-   **OWASP Top 10:** [https://owasp.org/www-project-top-ten/](https://owasp.org/www-project-top-ten/)
-   **bcrypt Security:** [https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

---

## Tips for New Developers

1.  **Start with the schema** - Understand database design before writing controllers
2.  **Read error codes** - They tell you exactly what's happening
3.  **Test edge cases** - Duplicates, missing data, unauthorized access
4.  **Use middleware wisely** - Clean separation between concerns
5.  **Comment complex logic** - Future you will appreciate it
6.  **Mock in tests** - Real DB queries are slow and fragile
7.  **Throw, don't return errors** - Centralized error handler catches everything
8.  **Validate aggressively** - Better to reject bad data early

---

**Last Updated:** 2026-03-26

**Project:** LMS Auth Backend

**Created By:** LEZE with CLAUDE