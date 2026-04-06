## Directory structure

app/
├── (auth)/                 # Public routes
│   ├── login/
│   │   └── page.tsx        # Uses /auth/login
│   └── layout.tsx          # Simple centered layout
│
├── (dashboard)/            # Protected routes (Readers & Admins)
│   ├── favorites/
│   │   └── page.tsx        # Uses /reader/favorites
│   ├── settings/
│   │   └── page.tsx        # Uses /manage/update-my-password
|   ├── (admin)/                # Protected routes (Admin & Root only)
│   |   ├── logs/
│   |   │       └── page.tsx        # Uses /admin/audit-logs
|   |   └── users/
│   |       └── page.tsx        # Uses /admin/manage/reader
│   └── layout.tsx          # Sidebar + Header navigation
── layout.tsx              # Root layout (Providers, fonts)