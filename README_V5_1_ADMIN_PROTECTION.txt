# PraiThan v5.1 Admin Protection Patch

This patch forces `/admin` to redirect to `/login` unless the admin session cookie exists.

Upload these extracted files/folders into GitHub:
- app/admin/page.tsx
- app/admin/AdminDashboard.tsx
- app/api/admin-logout/route.ts
- lib/auth.ts

Before testing, make sure these Vercel environment variables exist:
- ADMIN_PASSWORD
- ADMIN_COOKIE_SECRET

After deployment:
1. Open /admin in a private/incognito browser.
2. You should be redirected to /login.
3. Log in using ADMIN_PASSWORD.
4. You should land on /admin.
5. Click Logout and confirm /admin is protected again.
