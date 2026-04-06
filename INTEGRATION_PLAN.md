# Backend-Frontend Integration Plan

## Executive Summary

The frontend and backend are ready for integration. The **Users Management** and **Audit Logs** pages can be successfully integrated immediately. Based on code analysis, the following routes are integration-ready and have corresponding frontend pages prepared.

---

## ✅ ROUTES READY FOR INTEGRATION

### **1. Users Management Routes** ✅

**Status**: All routes except DELETE ready for integration  
**Frontend Page**: `/manage/users` (already has DataTable structure)

#### Available Endpoints:

```
GET    /admin/manage/reader                    → Fetch all users
POST   /admin/manage/reader/register-users     → Bulk add users (Excel or JSON)
PUT    /admin/manage/reader/:id                → Update user role
PUT    /admin/manage/reader/reset-password/:id → Reset user password
DELETE /admin/manage/reader/:id                → ❌ EXCLUDED (as requested)
POST   /admin/manage/reader/delete-many        → ❌ EXCLUDED (as requested)
```

#### Roles Required:

- **ROOT_ADMIN**: All operations including register-users
- **ADMIN**: GET users and reset password only
- **READER**: No access

#### Integration Points:

| Frontend            | Backend                                                 | Status          |
| ------------------- | ------------------------------------------------------- | --------------- |
| Fetch users table   | `GET /admin/manage/reader`                              | Ready           |
| Add users via Excel | `POST /admin/manage/reader/register-users` (FormData)   | Ready           |
| Add users manually  | `POST /admin/manage/reader/register-users` (JSON array) | Ready           |
| Change user role    | `PUT /admin/manage/reader/:id` (adminUpdateUserSchema)  | Ready           |
| Reset password      | `PUT /admin/manage/reader/reset-password/:id`           | Ready           |
| View user details   | ❌ No backend endpoint (need to implement)              | **Need to add** |
| Disable user        | ❌ No backend endpoint (need to implement)              | **Need to add** |

---

### **2. Audit Logs Routes** ✅

**Status**: Ready for integration  
**Frontend Page**: `/logs` (currently empty, needs implementation)

#### Available Endpoints:

```
GET /manage/audit-logs/admin/audit-logs?page=1&limit=20
```

#### Roles Required:

- **ADMIN** and **ROOT_ADMIN** only

#### Response Structure:

```json
{
  "status": "Success",
  "results": 15,
  "pagination": {
    "total": 150,
    "page": 1,
    "pages": 8
  },
  "data": [
    {
      "id": "uuid",
      "action": "USER_REGISTERED|PASSWORD_UPDATED|USER_BULK_UPLOAD",
      "entity": "User",
      "entityId": "user-uuid",
      "actorId": "admin-uuid",
      "actorEmail": "admin@lms.com",
      "details": {
        /* JSON */
      },
      "createdAt": "2026-04-06T10:30:00Z",
      "actor": {
        "firstName": "Admin",
        "lastName": "User",
        "role": "ADMIN"
      }
    }
  ]
}
```

#### Integration Points:

- Implement `/logs` page with paginated table
- Fetch with token in Authorization header
- Display logs with actor info and timestamp

---

### **3. Other Routes** (Not integrating yet)

```
GET    /reader/favorites                   → Fetch favorites (READER+)
POST   /reader/favorites                   → Add to favorites
DELETE /reader/favorites/:id               → Remove from favorites
PUT    /reader/favorites/:id               → Update favorite notes
GET    /manage/password/:id                → Update own password
POST   /auth/login                         → Login
POST   /auth/refresh                       → Refresh token
POST   /auth/logout                        → Logout
```

---

## 🔐 AUTHENTICATION BYPASS STRATEGY

### Option 1: **Manual Token Injection (Recommended for Testing)**

1. **Login normally** OR **generate JWT using Requestly**
2. **Store token in browser** using one of these methods:

#### Method A: Using Browser DevTools Console

```javascript
// Store token in localStorage
localStorage.setItem("jwt_token", "your-jwt-token-here");

// Or in sessionStorage
sessionStorage.setItem("jwt_token", "your-jwt-token-here");
```

#### Method B: Using Requestly Extension

1. Install Requestly browser extension
2. Create rule: **Modify Headers**
3. Rule trigger: URL contains your backend domain
4. Add Header: `Authorization: Bearer <your-jwt-token>`
5. Token will be automatically injected in all requests

### Option 2: **Generate JWT Token Using Requestly**

#### JWT Token Structure:

```json
{
  "id": "user-uuid",
  "email": "admin@lms.com",
  "role": "ROOT_ADMIN"
}
```

#### Steps to Generate:

1. Use `jsonwebtoken` library or online JWT tool
2. Payload example:
   ```json
   {
     "id": "123e4567-e89b-12d3-a456-426614174000",
     "email": "admin@lms.com",
     "role": "ROOT_ADMIN",
     "iat": 1712433000
   }
   ```
3. Secret: Must match backend's `JWT_SECRET` env variable
4. Paste token in Requestly header rule

---

## 📋 INTEGRATION CHECKLIST

### Phase 1: Setup & Infrastructure

- [ ] Create API utilities/service file for backend communication
- [ ] Create token management utility (storage, retrieval, validation)
- [ ] Setup Requestly with JWT token injection rule
- [ ] Setup environment variables for API base URL
- [ ] Create custom React hooks for API calls

### Phase 2: Users Management Integration

- [ ] Replace dummy data in `/manage/users` with real API calls
- [ ] Implement GET `/admin/manage/reader` fetch on page load
- [ ] Connect "Add Users" button to bulk upload endpoints
  - [ ] File upload (Excel) handler
  - [ ] Manual entry (JSON) handler
- [ ] Implement "View User" action
- [ ] Implement "Disable User" action (if backend endpoint created)
- [ ] Add error handling and loading states
- [ ] Add pagination if needed
- [ ] Add search/filter functionality

### Phase 3: Audit Logs Integration

- [ ] Design audit logs table layout
- [ ] Fetch logs from `GET /manage/audit-logs/admin/audit-logs`
- [ ] Implement pagination controls
- [ ] Display actor information (who did what)
- [ ] Format timestamps nicely
- [ ] Add filtering by action type (if needed)

### Phase 4: Authentication Setup

- [ ] Decide on token storage method (localStorage/sessionStorage)
- [ ] Create middleware to check token presence before API calls
- [ ] Create error handler for 401 responses (token expired)
- [ ] Setup automatic token refresh (using `/auth/refresh` endpoint)
- [ ] Create logout functionality

### Phase 5: Testing

- [ ] Test with different user roles (ROOT_ADMIN, ADMIN, READER)
- [ ] Test error scenarios (invalid token, missing permissions, etc.)
- [ ] Test bulk user upload with Excel file
- [ ] Test manual user addition
- [ ] Test audit log pagination
- [ ] Test role updates and password resets

---

## 🎯 NEXT STEPS

### Immediate (Today):

1. **Setup Authentication System**
   - Create `utils/auth.ts` for token management
   - Create `utils/api.ts` for API calls (adds Authorization header)
   - Setup Requestly with your test JWT token

2. **Create API Service Layer**
   - File: `lib/api/users.ts` - User CRUD operations
   - File: `lib/api/audit-logs.ts` - Audit logs fetch
   - File: `lib/api/client.ts` - Base API client

3. **Integrate Users Page**
   - Replace mock data in `/manage/users/page.tsx`
   - Connect to real API
   - Test with Requestly token

### Short Term (This Week):

1. Complete users management integration
2. Implement audit logs page from scratch
3. Add proper error handling and loading states
4. Test with multiple user roles

### Later:

1. Implement remaining routes (favorites, profile, etc.)
2. Setup proper authentication flow (login page)
3. Add token refresh mechanism
4. Setup proper error handling and user feedback

---

## 🔧 TECHNICAL DETAILS

### API Call Pattern (Example):

```typescript
// utils/api.ts
export const getUsers = async (token: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/manage/reader`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (response.status === 401) {
    // TOKEN EXPIRED - refresh or redirect to login
  }

  return response.json();
};
```

### Token Payload (for testing):

```javascript
const testToken = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "admin@lms.com",
  role: "ROOT_ADMIN",
};
// Encoded with your JWT_SECRET
```

### Frontend Type for User Data:

```typescript
type User = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  role: "ROOT_ADMIN" | "ADMIN" | "READER";
  createdAt: string;
  createdBy: string | null;
};
```

---

## ⚠️ IMPORTANT NOTES

1. **Token Management**: Currently no token storage system in frontend. Need to add.
2. **CORS**: Backend has CORS enabled with `CORS_ORIGIN` env variable
3. **Rate Limiting**: Backend has 300 requests per 15 minutes limit
4. **Database Events**: Any user changes create audit log entries automatically
5. **File Upload**: Must use FormData for Excel uploads, JSON for manual entry
6. **Email Field**: User email must be unique in database

---

## 📊 Data Models Reference

### User Model:

```prisma
- id: String (UUID)
- firstName: String
- lastName: String? (nullable)
- email: String (unique)
- password: String (hashed)
- role: ROLE (ROOT_ADMIN | ADMIN | READER)
- createdAt: DateTime
- createdBy: String? (UUID of creator)
```

### AuditLog Model:

```prisma
- id: String (UUID)
- action: String (USER_REGISTERED, PASSWORD_UPDATED, USER_BULK_UPLOAD, etc.)
- entity: String (e.g., "User")
- entityId: String?
- actorId: String?
- actorEmail: String
- details: JSON? (stores metadata)
- createdAt: DateTime
- actor: User relation
```

---

## 🚀 Summary

**You can start integration immediately with:**

- ✅ Users Management (all CRUD except delete)
- ✅ Audit Logs (read-only)
- ✅ Bulk user upload (Excel + manual)
- ✅ Token bypass using Requestly

**Total Integration Time Estimate**: 2-4 hours for Phase 1-2, 1-2 hours for Phase 3
