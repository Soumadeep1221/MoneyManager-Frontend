import axios from "axios";

// ─── API Base ────────────────────────────────────────────────────────────────

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://moneymanager-1-0-mwxa.onrender.com/api/v1.0";

export const apiClient = axios.create({ baseURL: BASE_URL });

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ProfileDTO {
  id?: number;
  fullName: string;
  email: string;
  password?: string;
  profileImageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthDTO {
  email: string;
  password: string;
  token?: string;
}

export interface ActivationResponse {
  status?: "ACTIVATED" | "ALREADY_ACTIVE" | "NOT_FOUND" | string;
}

export interface CategoryDTO {
  id?: number;
  profileId?: number;
  name: string;
  type: "INCOME" | "EXPENSE";
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IncomeDTO {
  id?: number;
  name: string;
  icon?: string;
  categoryName?: string;
  categoryId?: number;
  date: string; // ISO date: "YYYY-MM-DD"
  amount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseDTO {
  id?: number;
  name: string;
  icon?: string;
  categoryName?: string;
  categoryId?: number;
  date: string; // ISO date: "YYYY-MM-DD"
  amount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FilterDTO {
  type?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
  sortField?: string;
  sortOrder?: string;
}

export interface FilterResponse {
  data?: FilterResult[];
  results?: FilterResult[];
  transactions?: FilterResult[];
  startDate?: string;
  endDate?: string;
}

export interface DashboardData {
  totalIncome?: number;
  totalExpense?: number;
  totalBalance?: number;
  recentTransactions?: Array<IncomeDTO & ExpenseDTO & { type?: string }>;
  categoryBreakdown?: Array<{ name: string; amount: number; type: string }>;
  monthlyTrend?: Array<{ month: string; income: number; expense: number }>;
  [key: string]: unknown;
}

export type FilterResult = (IncomeDTO | ExpenseDTO) & { type?: string };

// ─── Auth Token Storage ───────────────────────────────────────────────────────

const TOKEN_KEY = "mm_token";
const USER_KEY = "mm_user";

apiClient.interceptors.request.use((config) => {
  const token = auth.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const auth = {
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(TOKEN_KEY);
  },
  setToken: (token: string): void => {
    if (typeof window !== "undefined") sessionStorage.setItem(TOKEN_KEY, token);
  },
  clearToken: (): void => {
    if (typeof window !== "undefined") sessionStorage.removeItem(TOKEN_KEY);
  },
  getUser: (): ProfileDTO | null => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ProfileDTO;
    } catch {
      return null;
    }
  },
  setUser: (user: ProfileDTO): void => {
    if (typeof window !== "undefined")
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearUser: (): void => {
    if (typeof window !== "undefined") sessionStorage.removeItem(USER_KEY);
  },
  clear: (): void => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    }
  },
  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false;
    return !!sessionStorage.getItem(TOKEN_KEY);
  },
};

// ─── Core Request Helper ──────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  const token = auth.getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const method = (options.method ?? "GET").toUpperCase();
    const isReadRequest = method === "GET" || path === "/filter";
    if (res.status === 401 || (res.status === 403 && token && isReadRequest)) {
      auth.clear();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("mm:unauthorized"));
      }
      throw new ApiError("Session expired. Please login again.", 401);
    }

    if (res.status === 204 || res.headers.get("content-length") === "0") {
      return undefined as T;
    }

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    if (!res.ok) {
      let message = `Request failed (${res.status})`;
      if (isJson) {
        const err = await res.json().catch(() => ({}));
        const candidates = [
          err?.message,
          err?.error,
          err?.detail,
          err?.errors?.message,
          Array.isArray(err?.errors) ? err.errors.join(", ") : undefined,
        ];
        const usableMessage = candidates.find(
          (candidate): candidate is string => typeof candidate === "string" && candidate.trim().length > 0
        );
        if (usableMessage) message = usableMessage;
      } else {
        // Backend returned a plain-text error body (e.g. text/plain, text/html).
        // Use it directly if it contains readable text.
        const text = await res.text().catch(() => "");
        const trimmed = text.trim();
        if (trimmed.length > 0 && trimmed.length < 500) {
          message = trimmed;
        }
      }
      throw new ApiError(message, res.status);
    }

    if (!isJson) {
      const text = await res.text();
      return text as unknown as T;
    }

    return res.json() as Promise<T>;
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("Request timed out. Please try again.", 408);
    }
    throw new ApiError(
      err instanceof Error ? err.message : "Network error",
      0
    );
  }
}

// ─── Error Class ─────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

const REPORT_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function notifyUnauthorized(): void {
  auth.clear();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("mm:unauthorized"));
  }
}

async function getAxiosErrorMessage(error: unknown, fallback: string): Promise<string> {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback;
  }

  const data = error.response?.data;
  if (data instanceof Blob) {
    const contentType = data.type || "";
    const text = await data.text().catch(() => "");
    if (contentType.includes("application/json") && text) {
      try {
        const parsed = JSON.parse(text) as Record<string, unknown>;
        const candidate = [parsed.message, parsed.error, parsed.detail].find(
          (value): value is string => typeof value === "string" && value.trim().length > 0
        );
        if (candidate) return candidate;
      } catch {
        // Fall through to the generic report error when the body is not valid JSON.
      }
    }
    if (text.trim().length > 0 && text.trim().length < 500) return text.trim();
  }

  if (typeof data === "object" && data !== null) {
    const candidate = [data.message, data.error, data.detail].find(
      (value): value is string => typeof value === "string" && value.trim().length > 0
    );
    if (candidate) return candidate;
  }

  return error.message || fallback;
}

// ─── Token Extraction ─────────────────────────────────────────────────────────

function extractToken(data: Record<string, unknown>): string | null {
  const candidates = ["token", "accessToken", "jwt", "access_token", "jwtToken"];
  for (const key of candidates) {
    const val = data[key];
    if (typeof val === "string" && val.length > 0) return val;
  }
  return null;
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  async login(credentials: AuthDTO): Promise<{ token: string; user?: ProfileDTO }> {
    const data = await request<Record<string, unknown>>("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    const token = extractToken(data);
    if (!token) throw new ApiError("No token returned from server", 401);

    auth.setToken(token);

    // Extract user profile from response if embedded
    const user = (data.profile || data.user || data.profileDTO) as ProfileDTO | undefined;
    if (user && typeof user === "object") {
      auth.setUser(user);
    }

    return { token, user };
  },

  async loginWithGoogle(token: string): Promise<{ token: string; user?: ProfileDTO }> {
    try {
      const response = await axios.post<Record<string, unknown>>(`${BASE_URL}/auth/google`, {
        token,
      });
      const data = response.data;
      const appToken = extractToken(data);
      if (!appToken) throw new ApiError("No token returned from server", 401);

      auth.setToken(appToken);

      const user = (data.profile || data.user || data.profileDTO) as ProfileDTO | undefined;
      if (user && typeof user === "object") {
        auth.setUser(user);
      }

      return { token: appToken, user };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      if (axios.isAxiosError(err)) {
        const message =
          typeof err.response?.data?.message === "string"
            ? err.response.data.message
            : err.message || "Google sign-in failed.";
        throw new ApiError(message, err.response?.status ?? 0);
      }
      throw new ApiError("Google sign-in failed.", 0);
    }
  },

  async register(profile: ProfileDTO): Promise<ProfileDTO> {
    return request<ProfileDTO>("/register", {
      method: "POST",
      body: JSON.stringify(profile),
    });
  },

  async activate(token: string): Promise<string> {
    return request<string>(`/activate?token=${encodeURIComponent(token)}`);
  },

  logout(): void {
    auth.clear();
  },
};

export const activationService = {
  async activate(token: string): Promise<ActivationResponse> {
    const response = await apiClient.get<ActivationResponse>("/activate", {
      params: { token },
    });
    return response.data;
  },
};

export const profileService = {
  async updateImage(profileImageUrl: string): Promise<ProfileDTO | undefined> {
    try {
      const response = await apiClient.put<ProfileDTO>("/profile/image", {
        profileImageUrl,
      });
      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          typeof err.response?.data?.message === "string"
            ? err.response.data.message
            : err.message || "Could not update your profile picture.";
        throw new ApiError(message, err.response?.status ?? 0);
      }
      throw err;
    }
  },
};

// ─── Category Service ─────────────────────────────────────────────────────────

export const categoryService = {
  getAll(): Promise<CategoryDTO[]> {
    return request<CategoryDTO[]>("/categories");
  },

  getByType(type: "INCOME" | "EXPENSE"): Promise<CategoryDTO[]> {
    return request<CategoryDTO[]>(`/categories/${type}`);
  },

  create(category: CategoryDTO): Promise<CategoryDTO> {
    return request<CategoryDTO>("/categories", {
      method: "POST",
      body: JSON.stringify(category),
    });
  },

  update(categoryId: number, category: CategoryDTO): Promise<CategoryDTO> {
    return request<CategoryDTO>(`/categories/${categoryId}`, {
      method: "PUT",
      body: JSON.stringify(category),
    });
  },

  delete(categoryId: number): Promise<void> {
    return request<void>(`/categories/${categoryId}`, { method: "DELETE" });
  },
};

// ─── Income Service ───────────────────────────────────────────────────────────

export const incomeService = {
  getAll(): Promise<IncomeDTO[]> {
    return request<IncomeDTO[]>("/incomes");
  },

  create(income: IncomeDTO): Promise<IncomeDTO> {
    return request<IncomeDTO>("/incomes", {
      method: "POST",
      body: JSON.stringify(income),
    });
  },

  delete(incomeId: number): Promise<void> {
    return request<void>(`/incomes/${incomeId}`, { method: "DELETE" });
  },
};

// ─── Expense Service ──────────────────────────────────────────────────────────

export const expenseService = {
  getAll(): Promise<ExpenseDTO[]> {
    return request<ExpenseDTO[]>("/expenses");
  },

  create(expense: ExpenseDTO): Promise<ExpenseDTO> {
    return request<ExpenseDTO>("/expenses", {
      method: "POST",
      body: JSON.stringify(expense),
    });
  },

  delete(expenseId: number): Promise<void> {
    return request<void>(`/expenses/${expenseId}`, { method: "DELETE" });
  },
};

// ─── Report Service ──────────────────────────────────────────────────────────

export const reportService = {
  async downloadIncomeExcel(): Promise<void> {
    await downloadReport("/excel/download/income", "incomes.xlsx");
  },

  async downloadExpenseExcel(): Promise<void> {
    await downloadReport("/excel/download/expense", "expenses.xlsx");
  },

  async emailIncomeReport(): Promise<void> {
    await emailReport("/email/income-excel");
  },

  async emailExpenseReport(): Promise<void> {
    await emailReport("/email/expense-excel");
  },
};

async function downloadReport(path: string, fallbackFilename: string): Promise<void> {
  try {
    const response = await apiClient.get<Blob>(path, {
      responseType: "blob",
      headers: { Accept: REPORT_CONTENT_TYPE },
    });
    const blob = new Blob([response.data], { type: REPORT_CONTENT_TYPE });
    const contentDisposition = response.headers["content-disposition"];
    const filenameMatch = typeof contentDisposition === "string"
      ? contentDisposition.match(/filename\*?=(?:UTF-8''|")?([^";\n]+)"?/i)
      : null;
    const filename = filenameMatch?.[1] ? decodeURIComponent(filenameMatch[1]) : fallbackFilename;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw await toReportApiError(error);
  }
}

async function emailReport(path: string): Promise<void> {
  try {
    await apiClient.get(path);
  } catch (error) {
    throw await toReportApiError(error);
  }
}

async function toReportApiError(error: unknown): Promise<ApiError> {
  if (isApiError(error)) return error;
  if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
    notifyUnauthorized();
  }
  const status = axios.isAxiosError(error) ? error.response?.status ?? 0 : 0;
  const message = await getAxiosErrorMessage(error, "Unable to generate the report. Please try again.");
  return new ApiError(message, status);
}

// ─── Filter Service ───────────────────────────────────────────────────────────

export const filterService = {
  filter(dto: FilterDTO): Promise<FilterResult[] | FilterResponse> {
    return request<FilterResult[] | FilterResponse>("/filter", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },
};

// ─── Dashboard Service ────────────────────────────────────────────────────────

export const dashboardService = {
  getData(): Promise<DashboardData> {
    return request<DashboardData>("/dashboard");
  },
};

// ─── Health Service ───────────────────────────────────────────────────────────

export const healthService = {
  check(): Promise<string> {
    return request<string>("/health");
  },
};

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Format a number as Indian Rupees */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format a transaction amount using its type rather than the API sign. */
export function formatTransactionAmount(
  amount: number | string,
  type: string | undefined
): string {
  const normalizedType = type?.toUpperCase();
  const absoluteAmount = Math.abs(Number(amount) || 0);
  const sign = normalizedType === "INCOME" ? "+" : normalizedType === "EXPENSE" ? "-" : "";
  return `${sign}${formatINR(absoluteAmount)}`;
}

/** Get the date used by the filter endpoint when no start date is supplied. */
export function defaultFilterStartDate(): string {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
}

/** Format a number as INR without the symbol */
export function formatINRPlain(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Get uppercase initials from a full name (max 2 chars) */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Format an ISO date string for display */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr + (dateStr.length === 10 ? "T00:00:00" : ""));
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/** Today's date in ISO format YYYY-MM-DD */
export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/** Get a greeting based on current hour */
export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
