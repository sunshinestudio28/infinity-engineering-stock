# Infinity Engineering Stock — Fix Patch

Files to replace in the existing repository:
- `src/App.tsx` — fixes the broken/mixed app entry and enforces login before dashboard.
- `src/components/Login.tsx` — removes public sign-up UI; sign in with an account created in Firebase Authentication.
- `firestore.rules` — corrects the collection path from `stock_entries` to `stockEntries`.

## Important
The repository's `src/lib/firebase.ts` already points to `infinity-engineering-stock-new`. Keep that configuration. Do not change it to the old project.

This patch does not import, sync, or delete any stock records. It does not touch the old Firebase project. The new database should remain empty until you add stock manually.

## Apply
1. Download and extract this patch ZIP.
2. In the existing GitHub repo `sunshinestudio28/infinity-engineering-stock`, replace those three files with the matching files in this patch.
3. Commit the changes to `main` (or merge a PR) so Vercel can deploy the fix.
4. Firebase Console → `infinity-engineering-stock-new` → Firestore Database → Rules: paste the contents of `firestore.rules` and click Publish. Updating the GitHub file alone does not necessarily publish Firebase rules.
5. Confirm the authorized user exists in Firebase Authentication → Users.
6. Test login, add one Stock In entry, refresh, and confirm it remains. Do not import old records.

## Current limitation
The connected GitHub integration returned HTTP 403 when attempting to write changes, so this patch has been prepared for applying to the existing repo; no GitHub commit or Vercel deployment has been made by this assistant.
