import type { ExpenseDTO, IncomeDTO } from "./api";

export type FinanceRecord = IncomeDTO | ExpenseDTO;
export type TimelinePoint = { date: string; income: number; expense: number };
export type CategoryTotal = { name: string; amount: number };

export function totalOf(records: FinanceRecord[]): number {
  return records.reduce((total, record) => total + (Number(record.amount) || 0), 0);
}

export function averageOf(records: FinanceRecord[]): number {
  return records.length ? totalOf(records) / records.length : 0;
}

export function latestOf(records: FinanceRecord[]): FinanceRecord | null {
  return [...records].sort((a, b) => toDateKey(b.date).localeCompare(toDateKey(a.date)))[0] ?? null;
}

export function largestOf(records: FinanceRecord[]): FinanceRecord | null {
  return [...records].sort((a, b) => b.amount - a.amount)[0] ?? null;
}

export function toDateKey(value: string): string {
  if (!value) return "";
  const match = value.match(/^\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString().slice(0, 10);
}

export function formatChartDate(value: string): string {
  const date = new Date(`${toDateKey(value)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export function mergeTimeline(incomes: IncomeDTO[], expenses: ExpenseDTO[]): TimelinePoint[] {
  const byDate = new Map<string, TimelinePoint>();
  for (const income of incomes) {
    const date = toDateKey(income.date);
    const point = byDate.get(date) ?? { date, income: 0, expense: 0 };
    point.income += Number(income.amount) || 0;
    byDate.set(date, point);
  }
  for (const expense of expenses) {
    const date = toDateKey(expense.date);
    const point = byDate.get(date) ?? { date, income: 0, expense: 0 };
    point.expense += Number(expense.amount) || 0;
    byDate.set(date, point);
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function groupByCategory(records: FinanceRecord[]): CategoryTotal[] {
  const totals = new Map<string, number>();
  for (const record of records) {
    const name = record.categoryName?.trim() || "Uncategorized";
    totals.set(name, (totals.get(name) ?? 0) + (Number(record.amount) || 0));
  }
  return [...totals.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
}
