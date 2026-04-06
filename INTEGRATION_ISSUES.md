# Integration Issues & Blockers

## Current Status: Initial Integration Complete ✅

### Issues Found During Integration

#### 1. **Missing Backend Endpoints** ❌

- **Issue**: "View User" detail page expects a GET endpoint to fetch user details
- **Location**: `frontend/app/manage/users/columns.tsx` - Actions dropdown
- **Backend Status**: ❌ No endpoint exists at `/admin/manage/reader/:id` (GET)
- **Action Required**: Create backend route to fetch single user details
- **Expected Response**:
  ```json
  {
    "id": "uuid",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "ROOT_ADMIN|ADMIN|READER",
    "createdAt": "datetime",
    "createdBy": "uuid"
  }
  ```

#### 2. **Missing Backend Endpoints** ❌

- **Issue**: "Disable User" feature expects a PATCH endpoint to disable/enable users
- **Location**: `frontend/app/manage/users/columns.tsx` - Actions dropdown
- **Backend Status**: ❌ No endpoint exists
- **Action Required**: Create backend route to disable/enable users
- **Expected Payload**:
  ```json
  {
    "isActive": boolean
  }
  ```

#### 3. **File Upload Headers Issue** ⚠️

- **Issue**: FormData upload requires special header handling
- **Location**: `frontend/lib/api/client.ts` - apiCall function
- **Status**: ⚠️ Currently forcing 'multipart/form-data' which may cause issues
- **Action Required**: Fetch API will handle multipart/form-data automatically when body is FormData
- **Fix**: Remove custom Content-Type header for FormData requests
- **Priority**: HIGH - File uploads may fail

#### 4. **Token Bypass Setup Required** ⏳

- **Issue**: No login mechanism implemented yet
- **Location**: Frontend authorization system
- **Status**: ⏳ Manual token setup needed for testing
- **Action Required**:
  1. Setup Requestly extension with JWT token injection
  2. OR store token in localStorage/sessionStorage manually via console
  3. Token payload must include: `{ id, email, role }`
- **Example Token Generation**:
  ```javascript
  // In browser console after installing Requestly
  localStorage.setItem("lms_jwt_token", "your_jwt_token_here");
  ```

### Security & Best Practices Issues

#### 5. **CORS Configuration** ✅

- **Status**: ✅ Backend has CORS enabled
- **Location**: `backend/src/server.js` - cors middleware
- **Allowed Origins**: `process.env.CORS_ORIGIN`
- **Action Required**: Ensure frontend URL is added to backend's `.env` file
- **Example**: `CORS_ORIGIN=http://localhost:3000,http://localhost:3001`

#### 6. **Token Storage Security** ⚠️

- **Status**: ⚠️ Using localStorage (persistent but XSS vulnerable)
- **Location**: `frontend/lib/api/client.ts` - token storage
- **Recommendation**:
  - Use `sessionStorage` for session-only storage
  - Consider HTTP-only cookies (requires proxy)
  - Add token refresh mechanism
- **Priority**: MEDIUM - For production use

#### 7. **API Error Handling** ✅

- **Status**: ✅ Proper error handling implemented
- **Location**: `frontend/lib/api/client.ts` - ApiError class
- **Coverage**:
  - ✅ 401 Unauthorized (missing token)
  - ✅ 403 Forbidden (insufficient permissions)
  - ✅ Network errors
  - ✅ JSON parsing errors
- **Action Required**: Implement automatic token refresh on 401

#### 8. **Rate Limiting** ✅

- **Status**: ✅ Backend has rate limiting enabled
- **Location**: `backend/src/server.js` - rateLimit middleware
- **Limits**: 300 requests per 15 minutes
- **Action Required**: Monitor for rate limit issues during bulk operations

---

## Integration Checklist

### Phase 1: ✅ Infrastructure & Setup

- [x] Create API client with authentication
- [x] Setup token management (storage/retrieval)
- [x] Create API service layers (users, audit logs)
- [x] Setup custom React hooks (useAuth, useApi)
- [x] Configure environment variables

### Phase 2: ✅ Users Management Integration

- [x] Fetch and display users list
- [x] Integrate bulk user upload (JSON + Excel)
- [x] Add error handling and loading states
- [x] Add pagination support
- [x] Add search/filter functionality
- [ ] Implement "View User" action (BLOCKED - need backend endpoint)
- [ ] Implement "Disable User" action (BLOCKED - need backend endpoint)

### Phase 3: ✅ Audit Logs Integration

- [x] Design audit logs table
- [x] Fetch logs from backend
- [x] Implement pagination
- [x] Display actor information
- [x] Format timestamps
- [x] Add action filtering (color-coded badges)

### Phase 4: ⏳ Authentication

- [ ] Setup Requestly token injection (MANUAL - for testing)
- [ ] Implement automatic token refresh
- [ ] Add 401 response handling
- [ ] Logout functionality
- [ ] Login page (not implemented yet)

### Phase 5: ⏳ Testing

- [ ] Test with ROOT_ADMIN role
- [ ] Test with ADMIN role
- [ ] Test with READER role
- [ ] Test error scenarios (invalid token, permissions)
- [ ] Test bulk user upload
- [ ] Test audit log pagination

---

## Files Created/Modified

### New Files Created

- `frontend/lib/api/client.ts` - API client with auth
- `frontend/lib/api/users.ts` - Users API service
- `frontend/lib/api/auditLogs.ts` - Audit logs API service
- `frontend/hooks/useAuth.ts` - Auth state management hook
- `frontend/hooks/useApi.ts` - API call management hook
- `frontend/.env.local` - Environment variables

### Files Modified

- `frontend/app/manage/users/page.tsx` - Real API integration
- `frontend/app/manage/users/columns.tsx` - Schema update
- `frontend/app/logs/page.tsx` - Full implementation
- `frontend/components/BulkAddUsers.tsx` - API integration
- `frontend/components/BulkAddition/UploadingContent.tsx` - Error/Success display

---

## How to Test

### 1. Setup Token (Required)

```javascript
// In browser console:
localStorage.setItem("lms_jwt_token", "your_jwt_token_here");
// Then refresh the page
```

### 2. Test Users Page

- Navigate to `/manage/users`
- Should see "Loading users..." spinner
- Should fetch and display users from backend
- Should show error message if no token

### 3. Test Bulk Upload

- Click "Add users" button
- Try manual entry or file upload
- Should show success/error message

### 4. Test Audit Logs

- Navigate to `/logs`
- Should see paginated audit logs
- Click "View" on details to see JSON payload

---

## Next Steps (Priority Order)

### HIGH 🔴

1. Setup token bypass using Requestly for testing
2. Fix FormData header handling in API client
3. Run full integration test with valid JWT token
4. Test all functionality with ROOT_ADMIN role

### MEDIUM 🟡

1. Create missing backend endpoints (View User, Disable User)
2. Implement automatic token refresh
3. Add comprehensive error logging
4. Setup proper authentication flow

### LOW 🟢

1. Optimize API calls (add caching)
2. Add loading skeletons
3. Improve UX with toast notifications
4. Add unit tests

---

## References

- Backend Routes: `/backend/src/routes/adminRoutes/crudReader.js`
- Audit Logs Endpoint: `/backend/src/routes/adminRoutes/auditLogs.js`
- API Client: `/frontend/lib/api/client.ts`
- Integration Plan: `/INTEGRATION_PLAN.md`
