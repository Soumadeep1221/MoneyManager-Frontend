/**
 * MoneyManager — live data seeding script
 * ------------------------------------------
 * Logs into your REAL running backend, wipes existing categories/
 * incomes/expenses, then creates realistic data spread across
 * several days — so the dashboard charts, pie chart, and the
 * /filter endpoint all have real, multi-day data to show.
 *
 * Nothing here touches the database directly — every action goes
 * through your actual REST endpoints, exactly like the frontend does.
 *
 * SETUP:
 *   npm install axios
 *   node seed-moneymanager.js
 */

const axios = require("axios");

// ---- CONFIG: fill these in ----
const BASE_URL = "http://localhost:8080/api/v1.0"; // adjust port if different
const EMAIL = "soumadeepdey2882@gmail.com";
const PASSWORD = "123456";
// --------------------------------

const api = axios.create({ baseURL: BASE_URL });

// Delay between each API call so you can actually watch your frontend
// update in real time instead of everything firing instantly.
const STEP_DELAY_MS = 1000;
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Small helper so each entry can be dated N days ago (YYYY-MM-DD)
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

async function login() {
  const res = await api.post("/login", { email: EMAIL, password: PASSWORD });
  const token = res.data.token;
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  console.log("Logged in as:", res.data.user.email);
}

// Wipe existing expenses/incomes using the filter endpoint with a wide
// date range (LocalDate.MIN to today) to fetch everything, then delete
// each one via its real DELETE endpoint.
async function wipeTransactions(type) {
  const res = await api.post("/filter", {
    type,
    startDate: "0001-01-01",
    endDate: daysAgo(0),
    keyword: "",
    sortField: "date",
    sortOrder: "asc",
  });
  const items = res.data;
  for (const item of items) {
    await api.delete(`/${type}s/${item.id}`);
  }
  console.log(`Deleted ${items.length} existing ${type}(s)`);
}

// Wipe existing categories. Assumes DELETE /categories/{id} exists —
// if you haven't added that endpoint yet, comment this call out below.
async function wipeCategories() {
  const res = await api.get("/categories");
  const categories = res.data;
  for (const cat of categories) {
    await api.delete(`/categories/${cat.id}`);
  }
  console.log(`Deleted ${categories.length} existing categor${categories.length === 1 ? "y" : "ies"}`);
}

async function createCategory(name, type, icon) {
  const res = await api.post("/categories", { name, type, icon });
  console.log(`  ${icon} Category created: ${name} (${type})`);
  await sleep(STEP_DELAY_MS);
  return res.data.id;
}

async function createIncome(name, categoryId, amount, icon, date) {
  await api.post("/incomes", { name, categoryId, amount, icon, date });
  console.log(`  ${icon} Income created: ${name} — ₹${amount} on ${date}`);
  await sleep(STEP_DELAY_MS);
}

async function createExpense(name, categoryId, amount, icon, date) {
  await api.post("/expenses", { name, categoryId, amount, icon, date });
  console.log(`  ${icon} Expense created: ${name} — ₹${amount} on ${date}`);
  await sleep(STEP_DELAY_MS);
}

async function main() {
  await login();

  // --- Wipe existing data ---
  await wipeTransactions("expense");
  await wipeTransactions("income");
  await wipeCategories(); // comment out if DELETE /categories/{id} doesn't exist yet

  // --- Create categories ---
  console.log("\nCreating categories (watch your Categories page)...");
  const salaryId = await createCategory("Salary", "income", "💰");
  const freelanceId = await createCategory("Freelance", "income", "💻");
  const groceriesId = await createCategory("Groceries", "expense", "🛒");
  const rentId = await createCategory("Rent", "expense", "🏠");
  const transportId = await createCategory("Transport", "expense", "🚌");

  // --- Incomes, spread across the last few days ---
  console.log("\nCreating incomes (watch your dashboard/income page)...");
  await createIncome("Monthly Salary", salaryId, 45000, "💰", daysAgo(3));
  await createIncome("Freelance Project Payment", freelanceId, 12000, "💻", daysAgo(2));
  await createIncome("Year-End Bonus", salaryId, 8000, "🎁", daysAgo(1));
  await createIncome("Cashback Reward", freelanceId, 350, "💳", daysAgo(0));
  await createIncome("Dividend Payout", salaryId, 1200, "📈", daysAgo(0));

  // --- Expenses, spread across the last few days ---
  console.log("\nCreating expenses (watch your dashboard/expense page and pie chart)...");
  await createExpense("Weekly Groceries", groceriesId, 2200, "🛒", daysAgo(3));
  await createExpense("House Rent", rentId, 15000, "🏠", daysAgo(2));
  await createExpense("Cab Fare", transportId, 450, "🚕", daysAgo(2));
  await createExpense("Dinner Out", groceriesId, 900, "🍽️", daysAgo(1));
  await createExpense("Fuel", transportId, 1500, "⛽", daysAgo(0));
  console.log("\nDone. Data now spans the last 3 days plus today —");
  console.log("enough to check the dashboard, the pie chart, and /filter across date ranges.");
}

main().catch((err) => {
  console.error("Failed:", err.response ? err.response.data : err.message);
});
