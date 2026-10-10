"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Plus, RefreshCw, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { dashboardService, expenseService, formatDate, formatINR, formatTransactionAmount, incomeService, type ExpenseDTO, type IncomeDTO } from "@/lib/api";
import { groupByCategory, mergeTimeline, totalOf } from "@/lib/finance";
import { BalanceRing, CategoryDonut, ChartLegend, FinanceTrendChart } from "@/components/ui/finance-visuals";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { StatCard } from "@/components/ui/stat-card";
import { StatCardSkeleton, TransactionListSkeleton } from "@/components/ui/skeleton";
import { IconDisplay } from "@/components/ui/icon-picker";
import { Badge } from "@/components/ui/badge";

type RecentItem = (IncomeDTO | ExpenseDTO) & { type: "INCOME" | "EXPENSE" };

function RecentRow({ item }: { item: RecentItem }) {
  const income = item.type === "INCOME";
  return (
    <div className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-divider">
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md ${income ? "bg-success-light" : "bg-danger-light"}`}>
        <IconDisplay name={item.icon} size={16} className={income ? "text-success" : "text-danger"} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
        <div className="mt-0.5 flex items-center gap-2">
          {item.categoryName && <Badge variant={income ? "income" : "expense"} size="xs">{item.categoryName}</Badge>}
          <span className="text-xs text-foreground-muted">{formatDate(item.date)}</span>
        </div>
      </div>
      <p className={`text-sm font-bold tabular-nums ${income ? "text-success" : "text-danger"}`}>
        {formatTransactionAmount(item.amount, item.type)}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [incomes, setIncomes] = React.useState<IncomeDTO[]>([]);
  const [expenses, setExpenses] = React.useState<ExpenseDTO[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [, incomeRecords, expenseRecords] = await Promise.all([
        dashboardService.getData(),
        incomeService.getAll(),
        expenseService.getAll(),
      ]);
      setIncomes(incomeRecords);
      setExpenses(expenseRecords);
    } catch {
      setError("Could not load your financial overview.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const totalIncome = totalOf(incomes);
  const totalExpense = totalOf(expenses);
  const balance = totalIncome - totalExpense;

  const recent: RecentItem[] = [
    ...incomes.map((item) => ({ ...item, type: "INCOME" as const })),
    ...expenses.map((item) => ({ ...item, type: "EXPENSE" as const })),
  ]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 8);

  const displayName = user?.fullName?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Financial Overview</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Good morning, {displayName}</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            A clear view of what came in, what went out, and what remains.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={load}
          className="gap-2"
        >
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>

      {/* Error state */}
      {error && !loading && <ErrorState message={error} onRetry={load} size="sm" />}

      {/* Summary stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => <StatCardSkeleton key={index} />)
        ) : (
          <>
            <StatCard
              label="Current Balance"
              value={formatINR(balance)}
              subtext={balance > 0 ? "Positive cash flow" : balance < 0 ? "Needs attention" : "Balanced"}
              icon={Wallet}
              tone={balance > 0 ? "income" : balance < 0 ? "expense" : "neutral"}
            />
            <StatCard
              label="Total Income"
              value={formatINR(totalIncome)}
              subtext={`${incomes.length} income records`}
              icon={TrendingUp}
              tone="income"
            />
            <StatCard
              label="Total Expenses"
              value={formatINR(totalExpense)}
              subtext={`${expenses.length} expense records`}
              icon={TrendingDown}
              tone="expense"
            />
            <StatCard
              label="Net Savings"
              value={formatINR(balance)}
              subtext={balance >= 0 ? "Income exceeds spending" : "Spending exceeds income"}
              icon={TrendingUp}
              tone={balance >= 0 ? "income" : "expense"}
            />
          </>
        )}
      </div>

      {/* Trend chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <CardTitle>Income vs Expenses</CardTitle>
              <CardDescription>Daily movement across all your transactions</CardDescription>
            </div>
            <ChartLegend />
          </div>
        </CardHeader>
        <CardContent>
          <FinanceTrendChart data={mergeTimeline(incomes, expenses)} loading={loading} error={error} />
        </CardContent>
      </Card>

      {/* Charts grid */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet size={16} className="text-primary" />
              <CardTitle>Balance Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <BalanceRing income={totalIncome} expense={totalExpense} loading={loading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income Distribution</CardTitle>
            <CardDescription>Where earnings come from</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryDonut data={groupByCategory(incomes)} loading={loading} title="Income" tone="income" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
            <CardDescription>Where spending goes</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryDonut data={groupByCategory(expenses)} loading={loading} title="Expenses" tone="expense" />
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest activity from your account</CardDescription>
          </div>
          <Link href="/transactions">
            <Button variant="ghost" size="sm" className="text-primary">
              View all
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="px-0">
          {loading ? (
            <div className="px-4">
              <TransactionListSkeleton rows={5} />
            </div>
          ) : recent.length ? (
            <div className="divide-y divide-border">
              {recent.map((item) => (
                <RecentRow key={`${item.type}-${item.id}`} item={item} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ArrowUpRight}
              title="No transactions yet"
              description="Add your first income or expense to see it here."
              size="sm"
              action={
                <div className="flex gap-2">
                  <Link href="/income">
                    <Button size="sm">
                      <Plus size={14} />
                      Income
                    </Button>
                  </Link>
                  <Link href="/expenses">
                    <Button size="sm" variant="outline">
                      <Plus size={14} />
                      Expense
                    </Button>
                  </Link>
                </div>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
