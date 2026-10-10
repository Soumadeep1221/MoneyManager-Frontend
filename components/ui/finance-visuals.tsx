"use client";

import * as React from "react";
import {
  Area, AreaChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { formatINR } from "@/lib/api";
import { formatChartDate, type CategoryTotal, type TimelinePoint } from "@/lib/finance";
import { EmptyState } from "./empty-state";
import { ChartSkeleton } from "./skeleton";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";

// Using CSS variables for dynamic theming
const getColors = () => ({
  INCOME: "var(--income-color)",
  EXPENSE: "var(--expense-color)",
  CHART_1: "var(--chart-1)",
  CHART_2: "var(--chart-2)",
  CHART_3: "var(--chart-3)",
  CHART_4: "var(--chart-4)",
  CHART_5: "var(--chart-5)",
  CHART_6: "var(--chart-6)",
  GRID: "var(--border)",
  TICK: "var(--foreground-muted)",
});

const CATEGORY_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

type TooltipItem = { name?: string; value?: number; color?: string };

function FinanceTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipItem[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const income = payload.find((item) => item.name === "income")?.value ?? 0;
  const expense = payload.find((item) => item.name === "expense")?.value ?? 0;
  return (
    <div className="min-w-[170px] rounded-md border border-border bg-background-secondary px-3 py-2.5 text-xs shadow-md">
      <p className="mb-2 font-semibold text-foreground">{label ? formatChartDate(label) : ""}</p>
      <div className="flex justify-between gap-4 py-0.5"><span className="text-income-color">Income</span><strong>{formatINR(Number(income))}</strong></div>
      <div className="flex justify-between gap-4 py-0.5"><span className="text-expense-color">Expense</span><strong>{formatINR(Number(expense))}</strong></div>
      <div className="mt-1 border-t border-border pt-1 flex justify-between gap-4"><span className="text-foreground-muted">Net</span><strong>{formatINR(Number(income) - Number(expense))}</strong></div>
    </div>
  );
}

export function FinanceTrendChart({ data, loading, error, mode = "combined" }: {
  data: TimelinePoint[];
  loading?: boolean;
  error?: string;
  mode?: "combined" | "income" | "expense";
}) {
  if (loading) return <ChartSkeleton />;
  if (error) return <div className="flex min-h-[260px] items-center justify-center text-sm text-danger">{error}</div>;
  if (!data.length) return <EmptyState icon={BarChart3} title={mode === "income" ? "No income data yet" : mode === "expense" ? "No expense data yet" : "No financial activity yet"} description="Add a transaction to see your financial trends." size="sm" />;
  const showIncome = mode !== "expense";
  const showExpense = mode !== "income";
  const INCOME = getComputedStyle(document.documentElement).getPropertyValue("--income-color").trim();
  const EXPENSE = getComputedStyle(document.documentElement).getPropertyValue("--expense-color").trim();

  return (
    <ResponsiveContainer width="100%" height={270}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id={`income-fill-${mode}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={INCOME} stopOpacity={0.15} /><stop offset="100%" stopColor={INCOME} stopOpacity={0} /></linearGradient>
          <linearGradient id={`expense-fill-${mode}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={EXPENSE} stopOpacity={0.12} /><stop offset="100%" stopColor={EXPENSE} stopOpacity={0} /></linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatChartDate} tick={{ fontSize: 11, fill: "var(--foreground-muted)" }} axisLine={false} tickLine={false} minTickGap={24} />
        <YAxis tickFormatter={(value) => `₹${Math.round(Number(value) / 1000)}k`} tick={{ fontSize: 11, fill: "var(--foreground-muted)" }} axisLine={false} tickLine={false} width={42} />
        <Tooltip content={<FinanceTooltip />} />
        {showIncome && <Area type="monotone" dataKey="income" name="income" stroke={INCOME} strokeWidth={2.5} fill={`url(#income-fill-${mode})`} dot={{ r: 3, fill: INCOME, strokeWidth: 0 }} activeDot={{ r: 5 }} animationDuration={800} />}
        {showExpense && <Area type="monotone" dataKey="expense" name="expense" stroke={EXPENSE} strokeWidth={2.5} fill={`url(#expense-fill-${mode})`} dot={{ r: 3, fill: EXPENSE, strokeWidth: 0 }} activeDot={{ r: 5 }} animationDuration={800} />}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryDonut({ data, loading, title = "By category", tone = "income" }: {
  data: CategoryTotal[];
  loading?: boolean;
  title?: string;
  tone?: "income" | "expense";
}) {
  if (loading) return <ChartSkeleton />;
  if (!data.length) return <EmptyState icon={PieChartIcon} title={`No ${tone} categories yet`} description="Category totals will appear here once you add transactions." size="sm" />;
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const colors = CATEGORY_COLORS;
  return (
    <div className="relative h-[270px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="amount" nameKey="name" cx="50%" cy="45%" innerRadius={60} outerRadius={88} paddingAngle={3} animationDuration={700}>
            {data.map((item, index) => <Cell key={item.name} fill={colors[index % colors.length]} />)}
          </Pie>
          <Tooltip formatter={(value) => formatINR(Number(value ?? 0))} contentStyle={{ borderRadius: 6, border: "1px solid var(--border)", backgroundColor: "var(--background-secondary)", fontSize: 12, color: "var(--foreground)" }} />
          <Legend verticalAlign="bottom" iconType="circle" iconSize={6} wrapperStyle={{ fontSize: 11, paddingTop: 10, color: "var(--foreground-muted)" }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute left-1/2 top-[39%] -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-foreground-muted">{title}</p>
        <p className="mt-1 text-base font-bold text-foreground">{formatINR(total)}</p>
      </div>
    </div>
  );
}

export function BalanceRing({ income, expense, loading }: { income: number; expense: number; loading?: boolean }) {
  if (loading) return <ChartSkeleton />;
  const total = income + expense;
  const balance = income - expense;
  const incomeRatio = total ? income / total : 0.5;
  const expenseRatio = total ? expense / total : 0.5;
  const INCOME = getComputedStyle(document.documentElement).getPropertyValue("--income-color").trim();
  const EXPENSE = getComputedStyle(document.documentElement).getPropertyValue("--expense-color").trim();
  
  const data = total ? [{ name: "Income", value: income }, { name: "Expenses", value: expense }] : [{ name: "Empty", value: 1 }];
  return (
    <div className="relative h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" cx="50%" cy="46%" innerRadius={82} outerRadius={104} startAngle={90} endAngle={-270} paddingAngle={total ? 3 : 0} animationDuration={800}>
            {data.map((entry, index) => <Cell key={entry.name} fill={total ? (index === 0 ? INCOME : EXPENSE) : "var(--border-subtle)"} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-muted">Current balance</p>
        <p className={`mt-1 text-2xl font-bold tracking-tight ${balance > 0 ? "text-success" : balance < 0 ? "text-danger" : "text-foreground-muted"}`}>{formatINR(balance)}</p>
        <p className="mt-1 text-[11px] text-foreground-muted">{total ? `${Math.round(incomeRatio * 100)}% income · ${Math.round(expenseRatio * 100)}% expense` : "No activity yet"}</p>
      </div>
    </div>
  );
}

export function ChartLegend({ combined = true }: { combined?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-muted">
      {combined && <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-income-color" />Income</span>}
      <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-expense-color" />Expenses</span>
    </div>
  );
}
