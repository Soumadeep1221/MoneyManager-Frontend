"use client";

import * as React from "react";
import { Calendar, Plus, Search, Trash2, TrendingUp } from "lucide-react";
import { categoryService, formatDate, formatINR, incomeService, todayISO, type CategoryDTO, type IncomeDTO } from "@/lib/api";
import { averageOf, formatChartDate, groupByCategory, latestOf, mergeTimeline, totalOf } from "@/lib/finance";
import { FinanceTrendChart, CategoryDonut } from "@/components/ui/finance-visuals";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { TransactionListSkeleton, StatCardSkeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { IconDisplay, IconPicker, IconToggleButton } from "@/components/ui/icon-picker";
import { ReportActions } from "@/components/ui/report-actions";

function AddIncomeModal({ open, onClose, onSuccess, categories }: { open: boolean; onClose: () => void; onSuccess: (income: IncomeDTO) => void; categories: CategoryDTO[] }) {
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [selectedIcon, setSelectedIcon] = React.useState("💰");
  const [showIconPicker, setShowIconPicker] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open) {
      setSelectedIcon("💰");
      setShowIconPicker(false);
      setFieldErrors({});
    }
  }, [open]);

  const catOptions = categories.map((category) => ({ value: String(category.id), label: category.name }));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const amount = String(form.get("amount") ?? "");
    const date = String(form.get("date") ?? "");
    const categoryId = String(form.get("categoryId") ?? "");
    const errors: Record<string, string> = {};

    if (!name) errors.name = "Name is required";
    if (!amount || Number(amount) <= 0 || Number.isNaN(Number(amount))) errors.amount = "Enter an amount greater than 0";
    if (!date) errors.date = "Date is required";

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setFieldErrors({});

    try {
      const created = await incomeService.create({
        name,
        amount: Number(amount),
        date,
        icon: selectedIcon,
        categoryId: categoryId ? Number(categoryId) : undefined,
        categoryName: categories.find((category) => String(category.id) === categoryId)?.name,
      });
      success("Income added");
      onSuccess(created);
      onClose();
    } catch {
      toastError("Failed to add income. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Income" description="Record a new income entry." size="md">
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-sm font-medium text-foreground">Category icon</p>
            <IconToggleButton selectedIcon={selectedIcon} open={showIconPicker} onToggle={() => setShowIconPicker((value) => !value)} tone="income" />
            {showIconPicker && (
              <div className="mt-2 rounded-md border border-border bg-background-secondary p-2">
                <IconPicker value={selectedIcon} onChange={(icon) => { setSelectedIcon(icon); setShowIconPicker(false); }} />
              </div>
            )}
          </div>
          <Input label="Name" name="name" placeholder="e.g. Monthly salary" error={fieldErrors.name} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Amount (₹)" name="amount" type="number" min="1" step="1" placeholder="0" error={fieldErrors.amount} required />
            <Input label="Date" name="date" type="date" defaultValue={todayISO()} error={fieldErrors.date} required />
          </div>
          {catOptions.length > 0 && <Select label="Category" name="categoryId" options={catOptions} placeholder="Select a category" />}
        </div>
        <ModalFooter>
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={loading}>
            Add Income
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

function IncomeRow({ income, onDelete }: { income: IncomeDTO; onDelete: (id: number) => void }) {
  return (
    <div className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-divider">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-success-light">
        <IconDisplay name={income.icon} size={16} className="text-success" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{income.name}</p>
        <div className="mt-0.5 flex items-center gap-2">
          {income.categoryName && <Badge variant="income" size="xs">{income.categoryName}</Badge>}
          <span className="flex items-center gap-1 text-xs text-foreground-muted">
            <Calendar size={12} />
            {formatDate(income.date)}
          </span>
        </div>
      </div>
      <p className="flex-shrink-0 text-sm font-bold tabular-nums text-success">+{formatINR(income.amount)}</p>
      <button
        type="button"
        onClick={() => income.id != null && onDelete(income.id)}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-foreground-muted opacity-0 transition-all hover:bg-danger-light hover:text-danger group-hover:opacity-100"
        aria-label="Delete income"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default function IncomePage() {
  const { success, error: toastError } = useToast();
  const [incomes, setIncomes] = React.useState<IncomeDTO[]>([]);
  const [categories, setCategories] = React.useState<CategoryDTO[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [addOpen, setAddOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<number | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [records, cats] = await Promise.all([incomeService.getAll(), categoryService.getByType("INCOME")]);
      setIncomes(records);
      setCategories(cats);
    } catch {
      setError("Failed to load income data.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    if (deleteTarget == null) return;
    setDeleting(true);
    try {
      await incomeService.delete(deleteTarget);
      setIncomes((items) => items.filter((item) => item.id !== deleteTarget));
      success("Income deleted.");
    } catch {
      toastError("Failed to delete. Please try again.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const filtered = incomes.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.categoryName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const total = totalOf(incomes);
  const latest = latestOf(incomes);
  const timeline = mergeTimeline(incomes, []);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Cash In</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Income</h1>
          <p className="mt-1 text-sm text-foreground-muted">Track your earnings and understand where your money comes from.</p>
        </div>
        <Button onClick={() => setAddOpen(true)} size="sm">
          <Plus size={14} />
          Add Income
        </Button>
      </div>

      {/* Error state */}
      {error && !loading && <ErrorState message={error} onRetry={load} size="sm" />}

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => <StatCardSkeleton key={index} />)
          : <>
              <Card variant="flat">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-widest text-foreground-muted">Total Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-success">{formatINR(total)}</p>
                  <p className="text-xs text-foreground-muted mt-1">{incomes.length} entr{incomes.length === 1 ? "y" : "ies"}</p>
                </CardContent>
              </Card>
              <Card variant="flat">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-widest text-foreground-muted">Average</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">{formatINR(averageOf(incomes))}</p>
                  <p className="text-xs text-foreground-muted mt-1">Across all entries</p>
                </CardContent>
              </Card>
              <Card variant="flat">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-widest text-foreground-muted">Latest</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-success">{latest ? formatINR(latest.amount) : "₹0"}</p>
                  <p className="text-xs text-foreground-muted mt-1">{latest ? formatChartDate(latest.date) : "No entries yet"}</p>
                </CardContent>
              </Card>
              <Card variant="flat">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-widest text-foreground-muted">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">{groupByCategory(incomes).length}</p>
                  <p className="text-xs text-foreground-muted mt-1">Income sources</p>
                </CardContent>
              </Card>
            </>}
      </div>

      {/* Charts */}
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Income Trend</CardTitle>
                <CardDescription>Every recorded earning, sorted by date</CardDescription>
              </div>
              <Badge variant="outline" size="sm">{incomes.length} records</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <FinanceTrendChart data={timeline} loading={loading} error={error} mode="income" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income Mix</CardTitle>
            <CardDescription>Distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryDonut data={groupByCategory(incomes)} loading={loading} title="Income" tone="income" />
          </CardContent>
        </Card>
      </div>

      {/* Records table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Income Records</CardTitle>
                <CardDescription>Review and manage every entry</CardDescription>
              </div>
              <ReportActions type="income" />
            </div>
            <div>
              <Input
                placeholder="Search income…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                leftIcon={<Search size={14} />}
                className="w-full max-w-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {error ? (
            <div className="px-4">
              <ErrorState message={error} onRetry={load} size="sm" />
            </div>
          ) : loading ? (
            <div className="px-4">
              <TransactionListSkeleton rows={5} />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title={search ? "No results" : "No income yet"}
              description={search ? `Nothing matching "${search}"` : "Add your first income to see trends here."}
              action={
                !search ? (
                  <Button size="sm" onClick={() => setAddOpen(true)}>
                    <Plus size={13} />
                    Add Income
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((income) => (
                <IncomeRow key={income.id} income={income} onDelete={setDeleteTarget} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AddIncomeModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={(income) => setIncomes((items) => [income, ...items])}
        categories={categories}
      />
      <ConfirmDialog
        open={deleteTarget != null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete income?"
        description="This record will be permanently removed."
        confirmLabel="Delete"
      />
    </div>
  );
}
