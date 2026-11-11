# SIRA Web Replica (Next.js 16.3)

Next.js web replica generated from the supplied SIRA Android/Expo code dump.

## What is preserved

- Supabase authentication and user profiles
- Shared `sira_incidents` table
- Shared `incident-photos` storage bucket
- Stage / Sub-stage workflow
- Threat and Action Plan Details
- Restricted `update_sira_incident_workflow` RPC
- Workflow audit history (`sira_incident_stage_history`)
- User administration via `sira-user-admin` Edge Function
- Pakistan SubRegion / District reference data
- Street + Satellite map layers
- Incident map, dashboard, incidents, report, alerts, profile, detail/edit pages

## Web location behavior

The Report Incident page first requests browser geolocation using `navigator.geolocation.getCurrentPosition()` with high accuracy requested.

If the user denies location, the browser cannot provide coordinates, or the device has poor location capability, the user can still:

1. Select a SubRegion.
2. Select a District.
3. Drop/drag a pin anywhere inside Pakistan on the Leaflet map.

This is intentional and avoids making GPS permission a requirement for incident reporting.

## Run

```powershell
cd C:\NEXTJS\SIRA-Web
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

This generated package contains a `.env.local` mapped from the supplied Android code dump so it can use the same Supabase project. `.env.local` is excluded by `.gitignore`.

For a clean setup, copy `.env.example` to `.env.local` and provide:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## HTTPS requirement for deployed GPS

Browser geolocation requires a secure context in production. Deploy the app using HTTPS (Vercel and most modern hosting platforms provide this automatically). Browser permission is always controlled by the user.

## Database patch

The supplied Android Stage CRUD/Audit SQL has been copied to:

`supabase/APPLY_20260811_STAGE_CLEAN_CRUD.sql`

Apply it to the same Supabase database if it has not already been applied.

## Note about comments

The Android incident detail screen references `sira_incident_comments`, but the supplied code dump does not contain the SQL that creates that table. The web page therefore treats comments as optional: if the table exists, comments work; if it does not, the rest of Incident Detail continues to work and shows a clear note.

### Optional comments compatibility patch

If the database does not already have the comments table referenced by the Android Incident Detail screen, run:

`supabase/APPLY_OPTIONAL_INCIDENT_COMMENTS.sql`

This creates authenticated read/insert access with per-user delete ownership and a 1000-character limit matching the mobile client.
