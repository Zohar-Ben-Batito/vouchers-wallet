# Grants & Vouchers (מענקים ושוברים) - Project Notes

This document contains context, architecture details, and developer references to help any future AI agent resume work on this project immediately.

---

## 🚀 Project Overview
* **Application Name:** Grants & Vouchers (מענקים ושוברים)
* **Goal:** A mobile-first wallet application for managing and syncing gift cards, vouchers, coupons, and club memberships.
* **Hosting:** Firebase Hosting (served at `https://vouchersproject.web.app` or `https://vouchersproject.firebaseapp.com`).
* **Source Control:** Git repository at `https://github.com/Zohar-Ben-Batito/vouchers-wallet.git` on branch `main`.
* **Deployment Flow:** Continuous deployment is configured—whenever code is pushed to the `main` branch on GitHub, the host automatically rebuilds and redeploys the app.

---

## 🛠️ Technology Stack
1. **Frontend:** React (v19) + Vite (v8) + Lucide React (for icons).
2. **Database & Sync:** Firestore database (documents stored under a `'vouchers'` collection, scoped per authenticated user `userId`).
3. **Authentication:** Firebase Auth (supports Email/Password and Google Sign-In).
4. **Offline Support:** Firestore has persistent local cache enabled with multi-tab support for offline usage on mobile devices.
5. **Styling:** Custom CSS with a responsive mobile-first glassmorphic UI.

---

## 🎨 Theme System (index.css)
The app features a premium dark/light mode theme toggler:
* Core structural tokens are declared under `:root`.
* Color variables are declared under `body` (defaulting to the **Dark Theme**).
* Overrides are declared under `body.light-theme` (for the **Light Theme**).
* Settings are persisted in the browser's `localStorage` as `'theme'`.

---

## 📁 Key File Map
* [App.jsx](file:///C:/Users/user/source/repos/productivity-hub/src/App.jsx): Main application codebase containing translations (English & Hebrew), authentication views, card layouts, barcode scanner rendering, and data actions.
* [index.css](file:///C:/Users/user/source/repos/productivity-hub/src/index.css): The design system styling sheet. Contains all CSS variables for the theme toggle.
* [firebase.js](file:///C:/Users/user/source/repos/productivity-hub/src/firebase.js): Initialization of Firebase App, Authentication, and Firestore (configured with offline persistence fallback).
* [package.json](file:///C:/Users/user/source/repos/productivity-hub/package.json): Package scripts and dependencies list.

---

## 🔑 Authentication Architecture
* **Email/Password:** Standard registration and login handlers.
* **Google Sign-In:** 
  * Initiates `signInWithPopup` by default to preserve context inside standalone Progressive Web App (PWA) containers on iOS.
  * If popups are blocked or unsupported by the device browser, it gracefully falls back to `signInWithRedirect`.
  * **Redirect Handlers:** An active listener (`getRedirectResult`) is declared on app startup to finalize authentication flows and raise appropriate diagnostics for unapproved domains (`auth/unauthorized-domain`).
* **Password Reset:** Standard `sendPasswordResetEmail` is supported with dual-language success/error views.

---

## 📝 Roadmap & Next Steps
* **Category Filters:** Expand categorization of vouchers, coupons, and club memberships.
* **QR/Barcode Rendering:** Fine-tune barcode scanners and rendering formats for card wallets.
* **Notifications:** Send push notifications for vouchers that are expiring soon.
