# PraiThan v5.0 Revenue Ready Patch

This patch adds:
- Stripe Checkout API starter: app/api/checkout/route.ts
- Admin password login page: app/login/page.tsx
- Admin login API: app/api/admin-login/route.ts
- Admin auth helper: lib/auth.ts
- package.json updated to include stripe

## Upload to GitHub

Upload these extracted files/folders into your current repository:
- app/api/checkout/route.ts
- app/api/admin-login/route.ts
- app/login/page.tsx
- lib/auth.ts
- package.json

## Vercel Environment Variables to add

Required for admin login:
- ADMIN_PASSWORD = choose a strong password
- ADMIN_COOKIE_SECRET = choose a long random secret

Required for Stripe:
- STRIPE_SECRET_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

Already existing Supabase variables must remain:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

## Important

This patch does not automatically block /admin yet, to avoid overwriting your working admin dashboard.
After testing the login page, we can add the admin protection wrapper as the next patch.
