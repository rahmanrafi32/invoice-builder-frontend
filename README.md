# Invoice Builder Frontend

Invoice Builder Frontend is a professional single-page application for managing clients, account details, and
invoice-related settings in one place. Built with React, TypeScript, and Vite, it delivers a clean authenticated
experience with protected routes, API-driven data, and a polished UI.

## At a Glance

This project is the frontend for an invoice management platform. It is designed for small businesses, freelancers, and
internal finance tools that need a simple way to organize customer records and prepare for invoice generation.

Authenticated users can:

- create an account with business and billing defaults
- sign in securely and stay authenticated with token refresh support
- manage client records from a central dashboard
- update profile, sender, and banking information
- configure invoice defaults such as prefix, currency, and payment terms
- receive instant feedback through toast notifications and loading states

## Key Capabilities

- **Multi-step registration** for account, business, banking, and invoice preferences
- **Secure login flow** with local token storage and automatic refresh handling
- **Protected application routes** for authenticated users only
- **Client management workspace** with create, edit, and delete actions
- **Profile and billing settings** to keep invoice details current
- **Responsive interface** optimized for desktop and smaller screens
- **Consistent UX patterns** using dialogs, alerts, skeletons, and toasts
- **API-first architecture** backed by Axios and TanStack Query

## Pages and Areas of the App

- **Login** — authenticate existing users
- **Register** — onboard new users with business and payment details
- **Dashboard** — view the invoice table and core workspace
- **Clients** — manage customer records used for invoicing
- **Profile** — edit account, sender, banking, and invoice defaults

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Routing:** React Router
- **Data Fetching:** Axios, TanStack Query
- **Styling:** Tailwind CSS
- **UI Primitives:** Radix UI / shadcn-style components
- **Notifications:** Sonner
- **Icons:** Lucide React

## Prerequisites

- Node.js 18 or later
- npm, pnpm, or yarn
- A running backend API that supports authentication, profiles, clients, and invoices

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env` file in the project root:

```bash
VITE_API_URL=http://localhost:3000
```

Replace the URL with the address of your backend API.

### 3) Start the app locally

```bash
npm run dev
```

The Vite server will print the local URL in the terminal.

## Available Scripts

```bash
npm run dev      # Start the development server
npm run build    # Type-check and create a production build
npm run preview  # Preview the production build locally
npm run lint     # Run ESLint across the codebase
```

## Application Flow

1. A new user registers through the multi-step onboarding form.
2. Authentication data is stored locally after successful sign-in or registration.
3. Protected routes unlock the dashboard, clients page, and profile page.
4. API requests are sent through a shared Axios client configured with `VITE_API_URL`.
5. If an access token expires, the app attempts to refresh it automatically.
6. Client and profile changes are saved back to the backend and reflected immediately in the UI.

## Project Structure

```text
src/
├── components/   # Reusable UI, layout, and invoice components
├── lib/          # API client, auth helpers, context, and utilities
├── pages/        # Route-level screens such as Dashboard, Clients, Login, Register, Profile
├── types/        # Shared TypeScript types
└── utils/        # Small helper utilities
```

## Environment Notes

- `VITE_API_URL` is required for the frontend to communicate with the backend.
- The app expects auth endpoints for login, registration, refresh, and profile retrieval.
- Client and profile pages rely on the backend returning structured JSON responses.

## Deployment

This project can be deployed to static hosting platforms such as Vercel or similar services. The included `vercel.json`
can serve as a starting point for production routing and hosting configuration.

## Additional Notes

- This repository contains the frontend only.
- Start the backend before testing the UI end-to-end.
- If you change API hosts or auth behavior, update the frontend environment variables and auth flow accordingly.

