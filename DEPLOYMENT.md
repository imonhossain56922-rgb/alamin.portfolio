# MD AL AMIN Portfolio – GitHub, Firebase & Vercel Deployment Guide

## 1. Firebase Configuration
This application uses **Firebase Authentication**, **Cloud Firestore**, and **Firebase Storage**.

1. **Authentication Providers**:
   - **Google Sign-In** is ready out of the box.
   - To enable **Email & Password** login for the Admin Dashboard:
     1. Open the [Firebase Console](https://console.firebase.google.com/).
     2. Select your project -> **Authentication** -> **Sign-in method**.
     3. Enable **Email/Password** and click **Save**.
     4. Add your administrator account under **Authentication -> Users** and ensure the account's email is verified, or register the user's UID in the Firestore `admins` collection (`admins/{uid}`).
2. **Firebase Storage**:
   - Open **Storage** in the Firebase Console and click **Get Started** to activate the storage bucket.
   - Deploy `storage.rules` using the Firebase CLI:
     ```bash
     firebase deploy --only storage
     ```
3. **Firestore Security Rules**:
   - Hardened rules are defined in `firestore.rules` (backed by `firebase-blueprint.json`).
   - To deploy manually via CLI:
     ```bash
     firebase deploy --only firestore:rules
     ```

## 2. GitHub Repository Setup
1. Initialize Git (if not already initialized) and verify `.env*` files are ignored by `.gitignore`:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: MD AL AMIN Portfolio & Firebase CMS"
   ```
2. Create a new repository on GitHub and push:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git branch -M main
   git push -u origin main
   ```

## 3. Vercel Production Deployment
1. Log in to [Vercel](https://vercel.com/) and click **Add New -> Project**.
2. Import your GitHub repository.
3. Framework Preset: **Vite** (`npm run build`, output directory `dist`).
4. Add environment variables in Vercel Project Settings if overriding `firebase-applet-config.json` (see `.env.example`).
5. Click **Deploy**. `vercel.json` automatically configures SPA rewrites so `/admin` and direct URL refreshes work cleanly.
6. In the Firebase Console under **Authentication -> Settings -> Authorized domains**, add your deployed `*.vercel.app` domain (and custom domain if connected).
