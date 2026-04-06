# Quick Start Testing Guide

**Objective**: Get the integration working in ~10 minutes

---

## ⏱️ 5-Minute Setup

### Step 1: Prepare JWT Token (2 minutes)

Choose **ONE** option:

#### Option A: Quick Console Method (Easiest)

```javascript
// Copy this to browser console (F12 → Console tab)
// These are test tokens with updated structure that includes firstName, email, and role
// Note: These are fake tokens for testing only
// Real tokens are signed with JWT_SECRET from backend

// ROOT_ADMIN Token
const rootAdminToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImZpcnN0TmFtZSI6IkFkbWluIiwiZW1haWwiOiJhZG1pbkBsbXMuY29tIiwicm9sZSI6IlJPT1RfQURNSU4ifQ.test";
localStorage.setItem("lms_jwt_token", rootAdminToken);

// OR ADMIN Token
const adminToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDExMSIsImZpcnN0TmFtZSI6IkphbmUiLCJlbWFpbCI6ImphbmVAYWRtaW4uY29tIiwicm9sZSI6IkFETUlOIn0.test";
localStorage.setItem("lms_jwt_token", adminToken);

// OR READER Token
const readerToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc3MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MjIyMiIsImZpcnN0TmFtZSI6IkpvaG4iLCJlbWFpbCI6ImpvaG5AcmVhZGVyLmNvbSIsInJvbGUiOiJSRUFERVIifQ.test";
localStorage.setItem("lms_jwt_token", readerToken);

// Refresh page after setting token
location.reload();
```

#### Option B: Requestly Extension (More Realistic)

1. Install: [Requestly Chrome Extension](https://chrome.google.com/webstore)
2. Click on Requestly icon → Create Rule → Modify Headers
3. Setup:
   - **URL Contains**: `localhost:5001`
   - **Add Header**:
     - Key: `Authorization`
     - Value: `Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6IjFjOTg0MjY3MDZkZjk4YjcifQ.eyJqdGkiOiI3OTJkZTdhNi00YzhkLTQwMmQtYWZiNi1hZGZjOTA5Yzc4MGEiLCJpc3MiOiJodHRwczovL2V4YW1wbGUuY29tIiwic3ViIjoiMjQ4NDA5NjEwMDEiLCJuYW1lIjoiQWRtaW4gVXNlciIsImlhdCI6MTcxMjQzMzAwMH0.test`

#### Option C: Get Real Token from Backend

```bash
cd backend
# Make sure backend is running
curl -X POST http://localhost:5001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lms.com","password":"password123"}'
# Copy the token from response
```

### Step 2: Start Servers (3 minutes)

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
# Should see: Server running on PORT 5001
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
# Should see: ▲ Next.js App ready - localhost:3000
```

### Step 3: Setup Token in Frontend (2 minutes)

1. Open Browser: `http://localhost:3000`
2. Open DevTools: Press `F12`
3. Go to **Console** tab
4. Paste one of these commands:

**Using localStorage (Persistent):**

```javascript
localStorage.setItem("lms_jwt_token", "your_token_here");
location.reload();
```

**Using sessionStorage (Session-only):**

```javascript
sessionStorage.setItem("lms_jwt_token", "your_token_here");
location.reload();
```

---

## ✅ Now Test These Features

### Test 1: Users List (30 seconds)

```
1. Navigate to: http://localhost:3000/manage/users
2. Expected: Should load list of users
3. Check:
   - [ ] Users display in table
   - [ ] Stats cards show numbers
   - [ ] Search box works
   - [ ] No error messages
```

### Test 2: Add Users Manually (2 minutes)

```
1. Click "Add users" button (top right)
2. Click "Manual Entry"
3. Fill form:
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@lms.com
   - Password: TestPass123
   - Role: READER
4. Click "Add to queue"
5. Click "Submit"
6. Expected: Success message with count
7. Refresh /manage/users to see new user
```

### Test 3: Upload Excel File (2 minutes)

```
1. Prepare Excel file with columns:
   | firstName | lastName | email | password | role |
   | John | Doe | john@lms.com | Pass123 | READER |
   | Jane | Smith | jane@lms.com | Pass123 | ADMIN |

2. Click "Add users" button
3. Click "File Upload"
4. Select your Excel file
5. Expected: Success message
6. Refresh to verify users added
```

### Test 4: Audit Logs (1 minute)

```
1. Navigate to: http://localhost:3000/logs
2. Expected: Should see paginated log entries
3. Check:
   - [ ] Logs display
   - [ ] Pagination works
   - [ ] Next/Previous buttons work
   - [ ] Action badges are colored
   - [ ] Click "View" to see JSON details
```

### Test 5: Error Handling (1 minute)

```
1. Clear token: localStorage.removeItem('lms_jwt_token')
2. Refresh page
3. Expected: Error message "No authentication token found"
4. Set token again and refresh
5. Should work again
```

---

## 🐛 Troubleshooting

### "No authentication token found" Error

**Solution:**

```javascript
// In console, check if token exists:
localStorage.getItem("lms_jwt_token"); // Should return token string, not null

// If null, set it:
localStorage.setItem("lms_jwt_token", "your_token_here");
location.reload();
```

### "Failed to fetch" / Network Error

**Solution:**

- Check if backend is running: `http://localhost:5001/health`
- Check browser console for CORS errors
- Backend `.env` must have: `CORS_ORIGIN=http://localhost:3000`

### Users Not Loading

**Solution:**

```javascript
// In console, check if token is being sent:
const token = localStorage.getItem("lms_jwt_token");
console.log("Token:", token); // Should not be null or "undefined"

// Test API directly:
fetch("http://localhost:5001/admin/manage/reader", {
  headers: { Authorization: `Bearer ${token}` },
})
  .then((r) => r.json())
  .then((d) => console.log(d));
```

### Bulk Upload Not Working

**Solution:**

- For Excel: File must be `.xlsx` format
- For JSON: Fill all required fields
- Watch browser console for error messages
- Check backend logs for validation errors

---

## 📋 Quick Reference

| Feature      | URL             | Expected         | Status |
| ------------ | --------------- | ---------------- | ------ |
| Users List   | `/manage/users` | Load from API    | ✅     |
| Audit Logs   | `/logs`         | Paginated logs   | ✅     |
| Add Users    | Click button    | Modal opens      | ✅     |
| File Upload  | Choose Excel    | Process & upload | ✅     |
| Search Users | Type in field   | Filter results   | ✅     |
| Pagination   | /logs           | Previous/Next    | ✅     |
| View User    | Click action    | ❌ Not available |        |
| Disable User | Click action    | ❌ Not available |        |

---

## 🎯 Success Criteria

All of these should work:

- [x] Frontend loads without errors
- [x] Users page shows real data from backend
- [x] Can manually add users
- [x] Can upload Excel file with users
- [x] Audit logs page displays logs
- [x] Pagination controls work
- [x] Error messages display on problems
- [ ] View User details (wait for backend endpoint)
- [ ] Disable User (wait for backend endpoint)

---

## 📝 Notes for Testing

1. **Token Expiration**: If you get "Not authenticated, invalid token" after a while, generate a new token
2. **User Limits**: Backend has 300 requests per 15 minutes rate limit
3. **File Size**: Excel uploads may have size limits (check backend)
4. **Database**: All changes are saved to actual database, not test data
5. **Refresh**: After adding users, refresh `/manage/users` to see them

---

## 🚀 Next: Report Findings

After testing, note down:

1. **What Works** ✅
   - Example: "Users load and search works"

2. **What Doesn't Work** ❌
   - Example: "File upload shows error: file too large"

3. **Error Messages**
   - Copy exact error text from console

4. **Steps to Reproduce** 🔄
   - Document how to cause the issue

Share this in `/INTEGRATION_ISSUES.md` update

---

## 💡 Pro Tips

### Test with Different Roles

```javascript
// Change role in token & test access
const roles = ["ROOT_ADMIN", "ADMIN", "READER"];
// ROOT_ADMIN: Should see everything
// ADMIN: Should see most things
// READER: Should get permission errors
```

### View API Responses in Console

```javascript
// Set before testing:
window.DEBUG = true;

// Then API client will log requests/responses
```

### Monitor Network Traffic

1. Open DevTools → Network tab
2. Do an action (like add user)
3. Look for POST request to `/register-users`
4. Check Response tab to see API response

### Reset Everything (Start Fresh)

```javascript
// Clear all stored data
localStorage.clear();
sessionStorage.clear();
// Then reload page
location.reload();
```

---

**Estimated Total Time**: 10 minutes ⏱️

**Next Step After Testing**: Report findings → Create missing endpoints → Full integration test
