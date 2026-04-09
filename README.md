# G-Metrics Clinical Dashboard 👁️

> **Enterprise-grade MedTech platform for Glaucoma monitoring and AI-driven predictive care.**

This repository contains the frontend application for the G-Metrics Clinical Dashboard

## 🏗️ Architectural Overview

This project is built utilizing the Next.js App Router. The architecture separates clinical data processing from client-side rendering.

### Tech Stack
* **Framework:** Next.js 16 (App Router) + React 19
* **Styling:** Tailwind CSS v4
* **Animations:** Framer Motion
* **Clinical Standards:** SMART on FHIR (R4)
* **Language/Typing:** TypeScript

### Key Architectural Decisions

1. **Server-Side FHIR Operations:** All interactions with the FHIR server (fetching patients, writing conditions) happen on the server via Server Components or Server Actions. Raw clinical data and OAuth tokens **never** enter the client's browser bundle.
2. **Secure Token Management:** SMART on FHIR access tokens and patient contexts are managed exclusively via `HttpOnly`, `Secure` cookies. 
3. **Native Internationalization (i18n):** The app utilizes a dynamic dictionary approach (`src/dictionaries`) routed through `[lang]` parameters, supporting seamless switching between English (`en`) and German (`de`).

## 📂 Project Structure

```text
rmerlos-g-metrics/
├── src/
│   ├── actions/          # Server Actions (secure processes like SMART Launch)
│   ├── app/              # Next.js App Router 
│   │   ├── api/          # API Routes (OAuth callbacks, webhooks)
│   │   └── [lang]/       # i18n Route Grouping
│   │       ├── (auth)/   # Route group for login/auth flow (bypasses url segment)
│   │       ├── (marketing)/ # Route group for landing page, impressum, GDPR
│   │       └── dashboard/# Protected dashboard route
│   ├── components/       # Reusable React UI Components
│   │   ├── auth/         # Login forms, provider pickers
│   │   ├── clinical/     # Patient cards, FHIR condition buttons
│   │   ├── sections/     # Large marketing page sections (Hero, Tech)
│   │   ├── theme/        # Dark/Light mode providers
│   │   └── ui/           # Generic components (Buttons, Navbars, Footers)
│   ├── dictionaries/     # JSON files for translation strings (en.json, de.json)
│   └── middleware.ts     # Edge routing logic (i18n redirection & route protection)
├── public/               # Public Assets (images)
└── package.json          # Dependencies and scripts