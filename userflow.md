I'll provide you with a comprehensive, step-by-step flow of the complete user interaction:

## Complete User Flow: Unauthenticated → Search → Login → Authenticated

### **Phase 1: Unauthenticated User Visits Website**

```
User visits: https://website.com/ or https://website.com/home
```

**What happens:**
1. Browser requests `/` (since both `/` and `/home` render same component)
2. `app/layout.tsx` → `LayoutContent` component mounts
3. `useAuth()` hook checks localStorage for auth token
4. **No token found** → `isAuthenticated = false`, `isLoading = false`
5. `LayoutContent` renders:
   - `{isAuthenticated && <AppSidebar />}` → **Sidebar NOT rendered** (hidden)
   - `SidebarProvider defaultOpen={false}` (since `isAuthenticated ? defaultOpen : false`)
   - `<Navbar />` is rendered
   - `{children}` (home page content)

6. **Navbar appearance** (unauthenticated):
   - ❌ Sidebar toggle button (hamburger) **HIDDEN** (only shows if `isAuthenticated`)
   - ✅ Page title: "Log In"
   - ✅ Theme toggle button visible
   - ❌ Home icon **HIDDEN** (only shows if authenticated and not on `/` route)

7. **Home page** (`app/home/page.tsx`):
   - Renders `<LandingSearch />` component
   - `useAuth()` is called → `isAuthenticated = false`

8. **LandingSearch component displays** (unauthenticated state):
   ```
   ┌─────────────────────────────────┐
   │                                 │
   │           Library               │  (title)
   │   Discover books and explore    │  (subtitle)
   │         our collection          │
   │                                 │
   │   ┌────────────────────────────┐│
   │   │ 🔍 Search for books...     ││  (disabled input)
   │   └────────────────────────────┘│
   │   Sign in to search and manage  │
   │           your library          │
   │                                 │
   │        ┌──────────────┐         │
   │        │   Log In     │         │  (visible button)
   │        └──────────────┘         │
   │                                 │
   └─────────────────────────────────┘
   ```

**User's perspective:**
- ✅ Can see the app layout with library title
- ✅ Search bar is visible but disabled (greyed out)
- ✅ Message tells them to sign in
- ✅ Login button is prominent

---

### **Phase 2: User Attempts Search (Dummy)**

```
User tries to click on search bar or type
```

**What happens:**
1. Search bar is disabled (`disabled` attribute on Input)
2. Click/typing has no effect
3. User sees message: "Sign in to search and manage your library"
4. User must click "Log In" button to proceed

**User's perspective:**
- They know they need to log in to search
- Clear call-to-action

---

### **Phase 3: User Clicks Login Button**

```
User clicks: Log In button on landing page
```

**What happens:**
1. `<Link href="/login">` navigates to `/login` route
2. Browser requests `/login` page
3. `app/layout.tsx` → `LayoutContent` component processes
4. `useAuth()` still returns `isAuthenticated = false` (no token in localStorage)
5. Sidebar still NOT rendered
6. Login page (`app/login/page.tsx`) renders

**Layout structure:**
```
┌──────────────────────────────────────┐
│  Navbar (no sidebar, no sidebar toggle)
├──────────────────────────────────────┤
│                                      │
│         ┌──────────────────┐        │
│         │  Welcome         │        │
│         │ Enter your creds │        │
│         │                  │        │
│         │ Email input      │        │
│         │ Password input   │        │
│         │ [Log In button]  │        │
│         │                  │        │
│         └──────────────────┘        │
│                                      │
└──────────────────────────────────────┘
```

**User's perspective:**
- ✅ Clean login form centered on screen
- ✅ No distracting sidebar
- ✅ Can enter email and password
- ✅ Has password visibility toggle (eye icon)

---

### **Phase 4: User Enters Credentials**

```
User enters:
- Email: user@example.com
- Password: ••••••••
```

**Component state in LoginForm:**
- `email = "user@example.com"`
- `password = "mypassword"`
- `showPassword = false`
- `error = null`
- `isLoading = false`

**User's perspective:**
- ✅ Can see masked password
- ✅ Can click eye icon to toggle visibility
- ✅ Log In button is ready to click

---

### **Phase 5: User Submits Login Form**

```
User clicks: Log In button
```

**What happens step-by-step:**

**Step 1: Form Validation** (client-side in LoginForm)
```javascript
validateForm() → checks:
- Email and password not empty ✅
- Email matches email regex ✅
- Password length >= 6 chars ✅
```

**Step 2: Loading State**
- `setIsLoading(true)`
- Button text changes: "Logging in..." with spinner
- Inputs become disabled (cannot interact)
- User sees loading indicator

**Step 3: API Call**
```javascript
POST /auth/login
{
  email: "user@example.com",
  password: "mypassword"
}
```

Backend (authController.js) responds:
```javascript
{
  status: "success",
  message: "Authenticated",
  data: {
    user: { id: "123", email: "user@example.com" },
    tokens: { accessToken: "eyJhbGc..." }
  }
}
```

**Step 4: Token Storage**
```javascript
if (response.data?.tokens?.accessToken) {
  setToken(token, true)  // Calls useAuth hook
  token is saved to localStorage
  setToken() also decodes JWT and sets:
  - decodedToken.id
  - decodedToken.firstName
  - decodedToken.email
  - decodedToken.role (READER, ADMIN, or ROOT_ADMIN)
}
```

**Step 5: Page Reload**
```javascript
setTimeout(() => {
  window.location.href = "/"  // Full page reload after 100ms
}, 100)
```

**User's perspective:**
- ✅ Button shows loading spinner
- ✅ Brief pause (100ms + page reload time ~1-2 seconds)
- ✅ Page gracefully transitions

---

### **Phase 6: Page Reloads - Authentication Check**

```
Full page reload triggered: window.location.href = "/"
Browser makes new request to /
```

**What happens on new page load:**

**Step 1: Layout mounts fresh**
```
app/layout.tsx
↓
LayoutContent component mounts
↓
useAuth() hook runs:
  - Checks localStorage
  - Finds token (saved in Phase 5)
  - isAuthenticated = true ✅
  - Decodes token and extracts user info
  - isLoading = false
```

**Step 2: Conditional Rendering in LayoutContent**
```javascript
return (
  <SidebarProvider defaultOpen={isAuthenticated ? defaultOpen : false}>
    // Sidebar NOW VISIBLE because isAuthenticated = true
    {isAuthenticated && <AppSidebar />}  
    
    <main>
      <Navbar />  // Toggle button NOW VISIBLE
      {children}  // Home page
    </main>
  </SidebarProvider>
)
```

**Step 3: Navbar renders with authenticated state**
- `useAuth()` → `isAuthenticated = true`
- Sidebar toggle button **NOW VISIBLE**
- Home icon conditional:
  - `usePathname()` → `pathname = "/"`
  - `isHomeRoute = true`
  - Home icon **HIDDEN** (because on home route)

**Step 4: Sidebar renders (AppSidebar)**
```
<Sidebar collapsible="icon">
  <SidebarHeader>
  
  <SidebarContent>
    - Home group (Home item)
    - Overview group (Dashboard, Audit Logs) - if ADMIN/ROOT_ADMIN
    - Manage group (Users, Books) - if ADMIN/ROOT_ADMIN
    - Personal group (My Favorites)
    
  <SidebarProfile>
    Shows user avatar, name, email
    Has settings icon + profile expansion
    Can click to expand and see:
    - Profile button
    - Role badge
    - Placeholder
    - Logout button
```

**Step 5: Home page renders with authenticated state**
- `app/home/page.tsx` renders `<LandingSearch />`
- `useAuth()` → `isAuthenticated = true`

**Step 6: LandingSearch component displays** (authenticated state)
```
┌──────────────────────────────────────────┐
│                                          │
│             Library                      │  (title)
│      Discover books and explore          │  (subtitle)
│            our collection                │
│                                          │
│    ┌────────────────────────────────┐   │
│    │ 🔍 Search for books...         │   │  (disabled input)
│    └────────────────────────────────┘   │
│    Use the sidebar to navigate and       │  (message changed!)
│    manage your library                   │
│                                          │
│    (NO LOG IN BUTTON - hidden!)          │
│                                          │
└──────────────────────────────────────────┘
```

**Complete page structure after login:**
```
┌────────────────────────────────────────────┐
│ ☰  Page Title          Theme 🌙  🏠        │  Navbar with toggle now visible
├────────────────────────────────────────────┤
│┌─────────┐  ┌────────────────────────────┐│
││ Home    │  │         Library            ││ Sidebar visible (left)
││ ─────   │  │    [search bar disabled]   ││
││ Overview│  │  Use sidebar to navigate   ││
││ ─────   │  │                            ││
││ Manage  │  └────────────────────────────┘│
││ ─────   │                                │
││Personal │                                │
│└─────────┘                                │
│ [Avatar]                                  │
│ User Name                Profile ⚙️        │  
└────────────────────────────────────────────┘
```

**User's perspective:**
- ✅ Sidebar suddenly appears (smooth transition)
- ✅ Can see menu items based on their role
- ✅ Can click hamburger (☰) to toggle on mobile
- ✅ Message on landing changed to guide them to sidebar
- ✅ Message confirms they're logged in
- ✅ Can see their profile at bottom of sidebar

---

### **Phase 7: User Interacts with Sidebar**

#### **Option A: On Desktop**
```
User clicks on a sidebar item (e.g., "Dashboard")
```
1. `MobileSidebarMenuItem` component handles click
2. Checks `useIsMobile()` → false (desktop)
3. Checks `isMobile` from sidebar context → false
4. Just navigates to `/dashboard` (sidebar stays open for deskop UX)
5. Page loads, sidebar still open, showing Dashboard content

#### **Option B: On Mobile (small screen)**
```
User clicks on a sidebar item (e.g., "Dashboard")
```
1. `MobileSidebarMenuItem` component handles click
2. Checks `useIsMobile()` → true (mobile)
3. Checks `isMobile` from sidebar context → true
4. Calls `setOpenMobile(false)` - closes sidebar
5. Navigates to `/dashboard`
6. Page loads with sidebar closed
7. User sees full Dashboard content without sidebar obstruction

**User's perspective (mobile):**
- ✅ Click item
- ✅ Sidebar smoothly closes
- ✅ Navigate to new page
- ✅ More screen space for content

---

### **Phase 8: User Clicks Profile in Sidebar**

```
User clicks on the SidebarProfile component
```

**What happens:**
1. On Desktop (expanded sidebar):
   - Profile card animates to rounded corners
   - ExpandedGrid appears below with 4 buttons:
     - Profile (clickable)
     - Role badge
     - Placeholder
     - Logout
   - **Auto-close triggers:**
     - After 10 seconds → closes automatically
     - OR after 8 seconds of no activity → closes

2. On Mobile (collapsed sidebar):
   - Clicking avatar shows Popover
   - Profile card and ExpandedGrid show in popover
   - Same buttons available
   - Popover closes when user leaves it

**User's perspective:**
- ✅ Clicks profile → smooth animation
- ✅ Sees options (profile, role, logout)
- ✅ If they don't interact → closes itself after 8-10 seconds
- Very polished/auto-closing experience

---

### **Phase 9: User Logs Out**

```
User clicks Logout button in profile section
```

**What happens:**
1. `clearAuth()` called from `useAuth()` hook
   - Token removed from localStorage
   - `isAuthenticated = false`
   - `decodedToken = null`
2. `window.location.href = "/"` - full page reload
3. New page load triggers `LayoutContent`
4. `useAuth()` finds NO token in localStorage
5. `isAuthenticated = false`
6. Sidebar NOT rendered
7. Navbar sidebar toggle button hidden
8. Home page shows `LandingSearch` with unauthenticated state
9. Back to **Phase 1** state

**User's perspective:**
- ✅ Click Logout
- ✅ Page reloads
- ✅ Sidebar disappears
- ✅ Landing page with "Sign in to search" message
- ✅ Can log in again

---

## **Complete Flow Diagram**

```
┌─────────────────────────────────────────┐
│  Unauthenticated User Visits / or /home │
└─────────────┬───────────────────────────┘
              │
              ↓
    ┌─────────────────────┐
    │   Check Token       │
    │  localStorage.get() │
    │  isAuth = false     │
    └─────────┬───────────┘
              │
              ↓
    ┌─────────────────────────────────────┐
    │ LandingSearch Shows                 │
    │ - Search bar (disabled)             │
    │ - "Sign in" message                 │
    │ - Log In button                     │
    │ - NO SIDEBAR                        │
    └─────────┬───────────────────────────┘
              │
              │ User clicks: Log In
              ↓
    ┌─────────────────────────────────────┐
    │ Navigate to /login                  │
    │ LoginForm Component                 │
    └─────────┬───────────────────────────┘
              │
              │ User enters email & password
              ↓
    ┌─────────────────────────────────────┐
    │ Click: Log In Button                │
    │ Form validates                      │
    │ POST /auth/login                    │
    └─────────┬───────────────────────────┘
              │
              │ Backend returns token
              ↓
    ┌─────────────────────────────────────┐
    │ Token saved to localStorage         │
    │ window.location.href = "/"          │
    │ (Full page reload)                  │
    └─────────┬───────────────────────────┘
              │
              ↓
    ┌─────────────────────────────────────┐
    │  NEW PAGE LOAD                      │
    │  Check Token                        │
    │  localStorage.get() ✅ Token found  │
    │  isAuth = true                      │
    └─────────┬───────────────────────────┘
              │
              ↓
    ┌─────────────────────────────────────┐
    │ Complete Layout Renders:            │
    │ - Navbar ✅                         │
    │ - Sidebar toggle ✅                 │
    │ - Sidebar ✅                        │
    │ - Home page ✅                      │
    └─────────┬───────────────────────────┘
              │
              ↓
    ┌─────────────────────────────────────┐
    │ LandingSearch Shows (Auth)          │
    │ - Search bar (disabled)             │
    │ - "Use sidebar" message             │
    │ - NO Log In button ✅              │
    │ - SIDEBAR VISIBLE ✅                │
    │ - Can toggle sidebar                │
    │ - Can navigate to other pages       │
    └─────────────────────────────────────┘
```

---

## **Key Technical Details**

| Component | Unauthenticated | Authenticated |
|-----------|-----------------|---------------|
| Sidebar | ❌ Hidden | ✅ Visible |
| Sidebar Toggle | ❌ Hidden | ✅ Visible |
| Home Icon | ❌ Hidden | ✅ Visible (if not on /) |
| LandingSearch Message | "Sign in to..." | "Use sidebar to..." |
| Search Bar | Disabled | Disabled |
| Login Button | ✅ Visible | ❌ Hidden |
| Profile Card | N/A | ✅ Clickable with auto-close |

---

## **Performance Optimizations**

1. **Full page reload on login** → Ensures all components re-initialize with fresh auth state
2. **Event delegation in profile** → Single event listener instead of many
3. **useRef for timers** → Proper cleanup prevents memory leaks
4. **Mobile detection** → Minimal rerenders using `useIsMobile()` hook
5. **Conditional rendering** → Sidebar doesn't render if not needed

This is the complete, polished user flow! 🎯