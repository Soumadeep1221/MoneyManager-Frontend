# Money Manager — Frontend

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Google OAuth](https://img.shields.io/badge/Google_OAuth-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide_Icons-F56565?style=for-the-badge&logo=lucide&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20.9%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)

The frontend for **Money Manager**, a personal finance application for recording income and expenses, organizing transactions, and understanding cash flow through dashboards and charts.

Built with the Next.js App Router, it talks to a separate Spring Boot backend API.

**Backend repository:** [Money Manager Backend](https://github.com/Soumadeep1221/MoneyManager-Backend.git)

---

## Live Demo

**[https://moneymanager-soumadeep1221.netlify.app](https://moneymanager-soumadeep1221.netlify.app)**

> **Please be patient on the first load.** The app runs entirely on free tiers: the backend on Render and the database on Neon. After a period of inactivity, Render spins the backend down (after about 15 minutes) and Neon scales the database down to zero. The first request then has to wake both up, which takes about **2 minutes 10 seconds on average and up to about 2.5 minutes** in my tests. Nothing is broken and the app will not crash. Once the servers are awake, every feature works smoothly.

If you find an error, a bug, or any loophole while exploring the app, please let me know. It helps me find problems that could affect users later.

---

## Features

- Email/password registration and login
- Google sign-in
- Email account activation flow
- Protected application routes with session restoration
- Dashboard with:
  - Current balance
  - Total income
  - Total expenses
  - Net savings
  - Income-versus-expense trend chart
  - Balance summary ring
  - Income and expense category breakdowns
  - Recent transactions
- Income management:
  - Add income records
  - Assign categories and icons
  - Search income records
  - Delete income records
  - Download or email the current-month Excel report
- Expense management:
  - Add expense records
  - Assign categories and icons
  - Search expense records
  - Delete expense records
  - Download or email the current-month Excel report
- Category management:
  - Create income and expense categories
  - Edit categories
  - Delete categories
  - Filter categories by type
- Transaction search and filtering:
  - Keyword search
  - Income/expense type filter
  - Date range filter
  - Sort by date, amount, or name
  - Ascending and descending order
- Profile settings:
  - Upload a profile picture
  - Crop and zoom the image before upload
  - View the saved profile picture
- Responsive desktop and mobile navigation
- Loading skeletons, empty states, confirmation dialogs, toast notifications, and API error states
- Indian Rupee (`INR`) formatting and Indian locale date formatting
- Light and dark design tokens with a teal finance-focused visual theme

---

## Prerequisites

- Node.js 20.9 or newer (required by Next.js 16)
- pnpm
- A running instance of the [backend](https://github.com/Soumadeep1221/MoneyManager-Backend.git)
- Google OAuth client credentials, if Google sign-in is enabled
- A Cloudinary cloud name and unsigned upload preset, if profile image uploads are enabled

---

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy the example file.

Windows:

```bash
copy .env.example .env.local
```

macOS / Linux:

```bash
cp .env.example .env.local
```

Then fill in `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1.0
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-cloudinary-upload-preset
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend base URL, including the `/api/v1.0` prefix |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Web client ID (must match the backend's `GOOGLE_CLIENT_ID`) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for profile image uploads |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary **unsigned** upload preset name |

### 3. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The backend must be reachable at the URL in `NEXT_PUBLIC_API_BASE_URL`.

### Available scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Next.js development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Start the production server after building |

There is currently no dedicated test or lint script in `package.json`.

---

## Connecting Frontend and Backend

Four settings have to line up between this app and the backend, or specific features break:

| Backend setting | Must equal | Feature it affects |
| --- | --- | --- |
| `FRONTEND_URL` | This app's origin, e.g. `http://localhost:3000` | Activation emails link to `<FRONTEND_URL>/activate?token=...` |
| `GOOGLE_CLIENT_ID` | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | The backend rejects Google tokens whose audience differs from its own client ID |
| CORS allowed origin | This app's origin | Every browser request to the API |
| Google Cloud authorized JavaScript origins | This app's origin | The Google sign-in popup |

For the deployed app, the origin is `https://moneymanager-soumadeep1221.netlify.app` (written without a trailing slash).

---

## Technology

- [Next.js](https://nextjs.org/) 16
- [React](https://react.dev/) 19
- TypeScript 5.7
- Tailwind CSS 4
- Recharts
- Axios and the Fetch API
- `@react-oauth/google`
- Cloudinary unsigned image uploads
- Lucide React icons
- pnpm
- Netlify (frontend hosting)

---

## Application Routes

### Public routes

| Route | Purpose |
| --- | --- |
| `/` | Redirects to `/dashboard` for authenticated users or `/login` otherwise |
| `/login` | Email/password and Google sign-in |
| `/signup` | Account registration with optional profile picture |
| `/activate?token=...` | Account activation from an email link |

### Protected routes

| Route | Purpose |
| --- | --- |
| `/dashboard` | Financial overview and visual summaries |
| `/income` | Create, search, view, and delete income records |
| `/expenses` | Create, search, view, and delete expense records |
| `/categories` | Create, edit, filter, and delete categories |
| `/transactions` | Search and filter transactions |
| `/settings` | Manage the profile picture and view profile details |

Protected routes are grouped under `app/(app)` and rendered inside the shared `AppShell`. Unauthenticated users are redirected to `/login`.

---

## Backend API Integration

The API base URL is read from `NEXT_PUBLIC_API_BASE_URL`. API access is centralized in [`lib/api.ts`](./lib/api.ts), which provides typed services for:

- Authentication: `/login`, `/register`, `/activate`, `/auth/google`
- Profile: `/profile/image`
- Categories: `/categories`, `/categories/{type}`, `/categories/{categoryId}`
- Income: `/incomes`, `/incomes/{incomeId}`
- Expenses: `/expenses`, `/expenses/{expenseId}`
- Reports: `/excel/download/income`, `/excel/download/expense`, `/email/income-excel`, `/email/expense-excel`
- Transactions: `/filter`
- Dashboard and health: `/dashboard`, `/health`

An OpenAPI snapshot of the backend contract is available in [`api-docs_Money.json`](./api-docs_Money.json).

**Backend behavior to be aware of**

- `/incomes` and `/expenses` return only the **current calendar month**. Older records are reachable through `/filter`.
- `/filter` takes a single `type` (`income` or `expense`) per request and rejects anything else.
- The backend's `/dashboard` totals cover **all time**, so figures derived from the monthly record lists will differ from them.
- The Excel download and email endpoints cover the current month only.

### Authentication behavior

- After login, the frontend stores the backend token in browser `sessionStorage` under `mm_token`, and the serialized profile under `mm_user`.
- API requests send the token as a bearer authorization header.
- Google sign-in sends the Google ID token to `/auth/google` as `{ "token": "<id token>" }` and receives the same `{ token, user }` response as a password login.
- Backend tokens expire after **15 minutes** and there is no refresh token, so users sign in again after that.
- Unauthorized responses clear the session and redirect the user to `/login`.
- Because the token lives in `sessionStorage`, the session is scoped to the current browser tab and does not persist across browser restarts.

### Profile image uploads

1. The browser uploads the image directly to Cloudinary using `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and the unsigned preset in `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.
2. Cloudinary returns a `secure_url`.
3. The frontend saves that URL on the backend with `PUT /profile/image` and `{ "profileImageUrl": "<url>" }`.

On signup, the optional image is uploaded first and its URL is included in the registration request. The settings page adds circular cropping, dragging, zooming, and preview before upload. The backend stores only the URL, never the image file.

---

## Project Structure

```text
.
├── app/
│   ├── (app)/                  # Protected application pages
│   │   ├── categories/
│   │   ├── dashboard/
│   │   ├── expenses/
│   │   ├── income/
│   │   ├── settings/
│   │   └── transactions/
│   ├── activate/               # Account activation
│   ├── login/                  # Login page
│   ├── signup/                 # Registration page
│   ├── globals.css             # Global styles and design tokens
│   ├── layout.tsx              # Root providers and metadata
│   └── page.tsx                # Auth-based entry redirect
├── components/
│   ├── layout/                 # App shell, sidebar, and top bar
│   └── ui/                     # Reusable controls, cards, charts, dialogs, and states
├── context/
│   └── auth-context.tsx        # Authentication state and navigation
├── lib/
│   ├── api.ts                  # Typed API client and service functions
│   ├── cloudinary.ts           # Profile image upload helper
│   ├── finance.ts              # Financial totals, timelines, and grouping helpers
│   └── utils.ts                # Shared utility functions
├── public/                     # Static assets and fallback images
├── .env.example                # Environment variable template
├── api-docs_Money.json         # Backend OpenAPI snapshot
├── next.config.mjs             # Next.js configuration
├── package.json                # Scripts and dependencies
└── tsconfig.json               # TypeScript configuration
```

---

## Development Notes

- Amounts are displayed in Indian Rupees using `en-IN` formatting.
- Income and expense records use ISO dates in `YYYY-MM-DD` form.
- The backend stores both income and expense amounts as positive numbers. The UI applies the sign (negative for expenses) when rendering.
- The dashboard loads dashboard data along with income and expense records, then derives the displayed totals and visualizations from the record collections. Since those collections are current-month only, the derived figures reflect the current month rather than all time.
- `next.config.mjs` currently sets `typescript.ignoreBuildErrors` to `true`. Production builds will not fail on TypeScript errors, so fix them locally.

---

## Production Build

```bash
pnpm build
pnpm start
```

Set the production values for every `NEXT_PUBLIC_*` variable **before** building, because they are embedded in the client bundle.

When deploying, also update the backend and Google configuration for the new frontend URL:

1. Set the backend's `FRONTEND_URL` to the deployed frontend URL.
2. Allow the deployed frontend origin in the backend's CORS configuration.
3. Add the deployed frontend origin to the Google OAuth client's authorized JavaScript origins.
4. Point `NEXT_PUBLIC_API_BASE_URL` at the deployed backend, including `/api/v1.0`.

---

## Deployment

The full application is deployed on free tiers:

| Part | Platform | Details |
| --- | --- | --- |
| Frontend | Netlify | Next.js is auto-detected. Build command `pnpm run build`, publish directory `.next` |
| Backend | Render (Web Service, Free plan) | Spring Boot app packaged as a Docker image and pulled from Docker Hub |
| Database | Neon | Serverless PostgreSQL (free tier) |

### How it was deployed

1. **Database:** create a Neon project, copy its credentials, and give them to the backend through environment variables. The JDBC URL needs `sslmode=require`.
2. **Backend:** build the JAR with Maven, write a Dockerfile, build the image, test it locally against the Neon database, push it to Docker Hub, then create a Render Web Service from that existing image and add the environment variables.
3. **Frontend:** import this repository into Netlify and set every `NEXT_PUBLIC_*` variable **before** the first deploy, with `NEXT_PUBLIC_API_BASE_URL` pointing to the Render backend (including `/api/v1.0`).
4. **Connect both sides:** set the backend's `FRONTEND_URL` to the Netlify URL, allow that origin in the backend's CORS configuration, and add it to the Google OAuth client's authorized JavaScript origins.

A minimal Dockerfile for the backend (this lives in the backend repository):

```dockerfile
FROM eclipse-temurin:25-jre
COPY target/app.jar app.jar
CMD ["java", "-jar", "app.jar"]
```

### Free-tier limitations

- Render's free web service spins down after about 15 minutes of inactivity, and Neon scales its database to zero when idle. The first request after that can take about 2 to 2.5 minutes while both wake up.
- Render's free tier blocks outbound SMTP ports (25, 465, 587), so the backend sends activation emails through Brevo's HTTP API (over HTTPS) instead of SMTP.

---

## Troubleshooting

### The frontend cannot connect to the backend

1. Confirm the backend is running.
2. Confirm `NEXT_PUBLIC_API_BASE_URL` includes the `/api/v1.0` prefix.
3. Confirm the backend allows requests from `http://localhost:3000` (or the deployed frontend origin).
4. Restart the Next.js development server after changing `.env.local`.

### The deployed app seems stuck or very slow at first

On the free tiers, the backend and database go to sleep when idle. Wait up to about 2.5 minutes for the first request to finish. This is expected behavior and not an error.

### Google sign-in fails

1. Confirm `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set and is the same client ID the backend uses as `GOOGLE_CLIENT_ID`.
2. Add `http://localhost:3000` (and the deployed frontend origin) to the authorized JavaScript origins in Google Cloud.
3. While the Google consent screen is in Testing mode, only listed test users can sign in.
4. If a Google profile photo renders blank, set `referrerPolicy="no-referrer"` on the `<img>` element.

### The activation link does not open this app

The link is built by the backend from its `FRONTEND_URL` variable. Set it to this app's origin and restart the backend.

### The activation email does not arrive

Check the spam folder first. Emails sent from a free mailbox address through an email service can be filtered as spam.

### I get signed out after a short time

Backend tokens expire after 30 minutes and are not refreshed. Sign in again.

### Profile image upload fails

1. Confirm both Cloudinary variables are set.
2. Confirm the upload preset is **unsigned** and permits browser uploads.
