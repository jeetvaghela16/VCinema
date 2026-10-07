# VCinema 🎬

> **"Your cinema. Your people. One screen."**

VCinema is a virtual cinema platform designed for synchronized film screenings with friends, family, and audiences worldwide. Users can discover authorized films, initialize private virtual auditoriums, invite viewers via unique room codes, synchronize playback in real-time under a single Host, and engage in live theatre chat.

---

## ✨ Features

- **🏛️ Virtual Auditoriums & Theatres**: Create rooms with customizable formats (*Private Screen*, *Friends Night*, *Family Room*, *Open Screen*), custom seating capacity, and optional admission passkeys.
- **👑 Host Playback Synchronization**: One Host controls Play, Pause, Seek, and Film selection. All connected viewers are kept synchronized in real-time.
- **🟢 Live Audience Presence**: Dynamic strip displaying who is currently seated in the auditorium with active status indicators and Host badges.
- **💬 Real-Time Theatre Chat**: Send and receive live messages with synchronized film timecodes during the screening.
- **🔐 Firebase Authentication**: Email & password registration, Google OAuth sign-in, and password recovery flow with custom security rules.
- **🎨 Atmospheric Cinematic Aesthetics**: Custom CSS & SVG poster artwork, warm champagne gold (`#C6A76A`) and deep burgundy accents, subtle film grain, vignettes, and responsive design with reduced motion support.
- **🔗 Instant Invitation**: Quick room codes (e.g., `VCX-4821`) and one-click shareable invitation links.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 18** | Component architecture & state management |
| **TypeScript 5** | Strict type safety and contracts |
| **Vite 5** | Fast development server & production bundler |
| **Tailwind CSS 3** | Utility-first cinematic design system |
| **React Router 6** | Client-side routing with lazy-loaded code splitting |
| **Firebase 12 (Auth & Firestore)** | Authentication, real-time database listeners (`onSnapshot`) |

---

## 📁 Project Structure

```text
VCinema/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI, layout & poster artwork components
│   │   ├── auth/           # ProtectedRoute and auth wrappers
│   │   ├── cards/          # MovieCard, SeriesCard, PosterArtwork
│   │   └── layout/         # Navbar, Footer
│   ├── context/            # AuthContext & React Context definitions
│   ├── data/               # Authorized movie, series, and theatre catalog data
│   ├── features/           # Hero, companion (Mira AI teaser), and catalogue sections
│   ├── hooks/              # useAuth, useTheatre, useIntersectionObserver, useReducedMotion
│   ├── layouts/            # MainLayout (header, outlet, footer)
│   ├── lib/
│   │   └── firebase/       # Centralized Firebase initialization, auth, and error formatters
│   ├── pages/              # Home, Movies, Series, CreateTheatre, JoinTheatre, TheatreRoom, Auth
│   ├── services/           # userService, theatreService (Firestore CRUD & subscriptions)
│   ├── styles/             # globals.css, theme tokens, animations
│   ├── types/              # TypeScript interfaces (auth, user, theatre, content)
│   └── utils/              # cn (clsx + tailwind-merge)
├── .env.example            # Environment variables template
├── firestore.rules         # Cloud Firestore security rules
├── requirements.txt        # Full project specifications & dependencies
├── package.json            # NPM dependencies & scripts
└── vite.config.ts          # Vite build configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- A **Firebase project** with **Authentication** and **Cloud Firestore** enabled.

### 2. Clone the Repository
```bash
git clone https://github.com/jeetvaghela16/VCinema.git
cd VCinema
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env.local` file in the project root:
```bash
cp .env.example .env.local
```

Populate `.env.local` with your Firebase Web App credentials:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef...
```

### 5. Deploy Firestore Security Rules
In the [Firebase Console](https://console.firebase.google.com/) under **Firestore Database** &rarr; **Rules**, publish the rules from [`firestore.rules`](./firestore.rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId) && request.resource.data.uid == userId;
      allow update: if isOwner(userId);
      allow delete: if false;
    }

    match /theatres/{theatreId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAuthenticated() && request.auth.uid == resource.data.hostId;

      match /participants/{participantId} {
        allow read: if true;
        allow write: if isAuthenticated();
      }

      match /messages/{messageId} {
        allow read: if true;
        allow create: if isAuthenticated();
        allow update, delete: if false;
      }
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 6. Run the Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 📜 Available Scripts

- `npm run dev` — Starts the local Vite development server with HMR.
- `npm run build` — Runs TypeScript type-checking (`tsc`) and compiles production bundle to `dist/`.
- `npm run preview` — Locally previews the production build.
- `npm run lint` — Runs ESLint across all `.ts` and `.tsx` source files.

---

## 🗺️ Roadmap & Milestones

- [x] **Step 1: Project Foundation** — React + Vite + TypeScript + Tailwind design tokens & routes.
- [x] **Step 1.5: Cinematic Polish** — Atmospheric poster compositions, mobile hero, custom aesthetics.
- [x] **Step 2: Firebase Authentication** — Email/password, Google OAuth, password reset, Firestore profile sync.
- [x] **Step 3: Virtual Theatres & Real-Time Sync** — Live rooms, 6-character room codes, host playback sync, audience presence, in-room chat.
- [ ] **Step 4: Real Video Streaming Integration** — HLS / WebRTC synchronized video player engine.
- [ ] **Step 5: Mira AI Cinema Companion** — AI concierge for personalized recommendations & film discussions.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
