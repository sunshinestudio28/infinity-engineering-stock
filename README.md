# Infinity Engineering Stock

A private stock management web app for tracking inventory in and out, built with React, TypeScript, Tailwind CSS, and Firebase.

## Features

- Email / password login (Firebase Auth)
- Dashboard with live totals: Total Stock In, Total Stock Out, Current Balance, Unique Models
- Manual Stock In and Stock Out entries with: date, model name, model number, serial number, HP, phase, quantity, party, invoice number, remarks
- Product photo upload (Firebase Storage)
- Firestore database (real-time, no mock data)
- Automatic total stock in / stock out / current balance
- Prevents Stock Out greater than available balance for a model
- Duplicate serial number warning
- Search by model name, model number, or serial number
- When searching (e.g. "ETN"), matching models show total in, total out and current balance at the top
- Date-wise total stock in / stock out summary
- Excel export (entries, model summary, date summary)
- Responsive mobile + desktop design
- Clean white & navy professional dashboard (no glassmorphism / gradients)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Firebase project

1. Go to <https://console.firebase.google.com> and create a new project.
2. Add a **Web app** (</> icon) to the project.
3. Copy the config values it shows you.

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in your Firebase credentials:

```bash
cp .env.example .env
```

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 4. Enable Authentication

1. In Firebase Console, go to **Authentication > Sign-in method**.
2. Enable **Email/Password**.
3. (Optional) Add your first user under **Authentication > Users > Add user**, or just use the Create Account tab on the login screen.

### 5. Create the Firestore database

1. Go to **Firestore Database > Create database**.
2. Start in **production mode** and pick a region.
3. Deploy the security rules (see step 7) so only signed-in users can read/write.

### 6. Enable Firebase Storage

1. Go to **Storage > Get started**.
2. Deploy the storage security rules (see step 7).

### 7. Deploy security rules

Using the Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase init   # select Firestore and Storage, use existing project
firebase deploy --only firestore:rules,storage
```

Or paste the contents of `firestore.rules` and `storage.rules` directly into the Firebase Console (Firestore > Rules, and Storage > Rules) and click Publish.

### 8. Run the app

```bash
npm run dev
```

Open the printed local URL, sign in (or create an account), and start adding stock.

## Build

```bash
npm run build
```

## Security rules summary

- **Firestore**: only authenticated users can read `stock_entries`; creates must set `createdBy` to their own uid; updates/deletes limited to the original creator.
- **Storage**: only authenticated users can read/write `product-photos/*`; uploads limited to images under 5 MB.

## Tech

- React 19 + TypeScript
- Tailwind CSS v4
- Firebase (Auth, Firestore, Storage)
- xlsx for Excel export
- Vite


## Performance update
- Stock records are saved to Firestore before photo/file upload, so the form closes quickly.
- Photo upload continues in the background and updates the same stock entry when complete.
- Large images are compressed before upload.
- Camera captures use a smaller JPEG to reduce mobile upload time.
- Cancel is disabled while the stock write is in progress to avoid interrupted UI state.
- Photo preview uses a blob URL instead of converting the whole image to base64.
