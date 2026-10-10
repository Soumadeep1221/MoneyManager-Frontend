# Money Manager Frontend

The frontend for **Money Manager**, a personal finance application for recording income and expenses, organizing transactions, and understanding cash flow through dashboards and charts.

The application is built with Next.js App Router and communicates with a separate backend API.

## Related repository

- **Backend:** [Money Manager Backend](https://github.com/your-organization/your-money-manager-backend)

> Replace the placeholder backend URL above with the actual backend repository URL.

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

## Tech stack

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

## Prerequisites

- Node.js 20 or newer
- pnpm 12 or newer
- A running instance of the [backend](https://github.com/your-organization/your-money-manager-backend)
- Google OAuth client credentials if Google sign-in is enabled
- Cloudinary cloud name and unsigned upload preset if profile image uploads are enabled

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy the example file:

```bash
copy .env.example .env.local
```

On macOS or Linux:

```bash
cp .env.example .env.local
```

Update `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1.0
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-cloudinary-upload-preset
```

### 3. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The backend must be reachable at the URL configured by `NEXT_PUBLIC_API_BASE_URL`. The default local backend URL is:

```text
http://localhost:8080/api/v1.0
```

## Available scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Next.js development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Start the production server after building |

There is currently no dedicated test or lint script in `package.json`.

## Application routes

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
| `/transactions` | Search and filter all transactions |
| `/settings` | Manage the profile picture and view profile details |

Protected routes are grouped under `app/(app)` and rendered inside the shared `AppShell`. Unauthenticated users are redirected to `/login`.

## Backend API integration

The API base URL is read from `NEXT_PUBLIC_API_BASE_URL`. API access is centralized in [`lib/api.ts`](./lib/api.ts), which provides typed services for:

- Authentication: `/login`, `/register`, `/activate`, `/auth/google`
- Profile: `/profile/image`
- Categories: `/categories`, `/categories/{type}`, `/categories/{categoryId}`
- Income: `/incomes`, `/incomes/{incomeId}`
- Expenses: `/expenses`, `/expenses/{expenseId}`
- Reports: `/excel/download/income`, `/excel/download/expense`, `/email/income-excel`, `/email/expense-excel`
- Transactions: `/filter`
- Dashboard and health: `/dashboard`, `/health`

An OpenAPI snapshot for the backend contract is available in [`api-docs_Money.json`](./api-docs_Money.json).

### Authentication behavior

- After login, the frontend stores the backend token in browser `sessionStorage` under `mm_token`.
- The serialized profile is stored under `mm_user`.
- API requests include the token as a bearer authorization header.
- Unauthorized responses clear the session and redirect the user to `/login`.
- Because the token is stored in `sessionStorage`, the session is scoped to the current browser tab and is not persisted across browser restarts.

## Profile image uploads

Profile pictures are uploaded directly from the browser to Cloudinary using:

1. `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
2. `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
3. The returned Cloudinary URL is saved through the backend profile-image endpoint.

The signup flow uploads the optional image before registration. The settings flow provides circular cropping, dragging, zooming, preview, and upload behavior.

## Project structure

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

## Development notes

- Amounts are displayed in Indian Rupees using `en-IN` formatting.
- Income and expense records use ISO dates in `YYYY-MM-DD` form.
- Income is represented with positive values and expenses with negative display signs; the API DTOs store the numeric amount and the UI applies the transaction-type sign when rendering.
- The dashboard currently loads dashboard data along with income and expense records, then derives the displayed totals and visualizations from the record collections.
- The Next.js configuration currently sets `typescript.ignoreBuildErrors` to `true`. TypeScript errors should still be fixed locally even though production builds do not fail on them.

## Production build

Build and run the production application with:

```bash
pnpm build
pnpm start
```

Set the production values for all `NEXT_PUBLIC_*` variables before building, because these values are exposed to the browser and are embedded into the client bundle.

## Troubleshooting

### The frontend cannot connect to the backend

1. Confirm the backend is running.
2. Confirm `NEXT_PUBLIC_API_BASE_URL` includes the `/api/v1.0` prefix.
3. Confirm the backend allows requests from `http://localhost:3000`.
4. Restart the Next.js development server after changing `.env.local`.

### Google sign-in fails

1. Confirm `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set.
2. Add `http://localhost:3000` to the authorized JavaScript origins in Google Cloud.
3. Confirm the backend supports the frontend’s `/auth/google` request.

### Profile image upload fails

1. Confirm both Cloudinary variables are set.
2. Confirm the upload preset is unsigned and permits browser uploads.
3. Confirm the backend accepts the resulting Cloudinary URL at `/profile/image`.

## License

No license has been specified for this repository yet.
