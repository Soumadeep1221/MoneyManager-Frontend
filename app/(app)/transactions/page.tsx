"use client";

import * as React from "react";
import {
  Search, SlidersHorizontal, ArrowUpRight, ArrowDownRight, X, RefreshCw,
} from "lucide-react";
import {
  defaultFilterStartDate, filterService, formatDate, formatTransactionAmount, isApiError, todayISO,
  type FilterDTO, type FilterResponse, type FilterResult,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { TransactionListSkeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { IconDisplay } from "@/components/ui/icon-picker";
import { cn } from "@/lib/utils";

const TYPE_OPTIONS = [
  { value: "",        label: "Select type" },
  { value: "income",  label: "Income" },
  { value: "expense", label: "Expenses" },
];
const SORT_OPTIONS = [
  { value: "",       label: "Default" },
  { value: "date",   label: "Date" },
  { value: "amount", label: "Amount" },
  { value: "name",   label: "Name" },
];

/** Returns the correct order-dropdown options for the selected sort field. */
function orderOptionsFor(sortField: string | undefined) {
  if (sortField === "amount") {
    return [
      { value: "DESC", label: "Highest to lowest" },
      { value: "ASC",  label: "Lowest to highest" },
    ];
  }
  if (sortField === "name") {
    return [
      { value: "ASC",  label: "A → Z" },
      { value: "DESC", label: "Z → A" },
    ];
  }
  // date or default
  return [
    { value: "DESC", label: "Newest first" },
    { value: "ASC",  label: "Oldest first" },
  ];
}

/** Sensible default sort order for each sort field. */
function defaultOrderFor(sortField: string | undefined): "ASC" | "DESC" {
  // For name, ascending (A→Z) is the natural default.
  return sortField === "name" ? "ASC" : "DESC";
}

type TxItem = FilterResult & { icon?: string; categoryName?: string; date?: string; amount?: number; id?: number };

function TxRow({ tx, fallbackType }: { tx: TxItem; fallbackType?: string }) {
  const displayType = (tx.type ?? fallbackType ?? "").toUpperCase();
  const isIncome = displayType === "INCOME";

  return (
    <div className="flex items-center gap-3 py-3 px-5 hover:bg-divider transition-colors">
      {/* Icon */}
      <div className={cn(
        "flex items-center justify-center h-9 w-9 rounded-md flex-shrink-0",
        isIncome ? "bg-success-light" : "bg-danger-light",
      )}>
        <IconDisplay
          name={tx.icon}
          size={15}
          className={isIncome ? "text-success" : "text-danger"}
        />
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate leading-snug">{tx.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant={isIncome ? "income" : "expense"} size="sm">
            {displayType || "—"}
          </Badge>
          {tx.categoryName && (
            <span className="text-xs text-foreground-muted">{tx.categoryName}</span>
          )}
          {tx.date && (
            <span className="text-xs text-foreground-muted">{formatDate(tx.date)}</span>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {isIncome
          ? <ArrowUpRight size={13} className="text-success" />
          : <ArrowDownRight size={13} className="text-danger" />
        }
        <p className={cn(
          "text-sm font-semibold tabular-nums",
          isIncome ? "text-success" : "text-danger",
        )}>
          {formatTransactionAmount(tx.amount ?? 0, displayType)}
        </p>
      </div>
    </div>
  );
}

const DEFAULT_FILTERS: FilterDTO = { sortOrder: "DESC" };

export default function TransactionsPage() {
  const [results, setResults]           = React.useState<TxItem[]>([]);
  const [loading, setLoading]           = React.useState(false);
  const [hasSearched, setHasSearched]   = React.useState(false);
  const [error, setError]               = React.useState("");
  const [filters, setFilters]           = React.useState<FilterDTO>(DEFAULT_FILTERS);
  const [keyword, setKeyword]           = React.useState("");
  const [showFilters, setShowFilters]   = React.useState(false);
  const [effectiveDates, setEffectiveDates] = React.useState<{ startDate: string; endDate: string } | null>(null);

  // ── Core search ──────────────────────────────────────────────────────────
  const applyFilters = React.useCallback(async (f: FilterDTO, kw: string) => {
    setLoading(true);
    setError("");
    setHasSearched(true);
    try {
      const data = await filterService.filter({ ...f, keyword: kw.trim() || undefined });
      const response = Array.isArray(data) ? null : (data as FilterResponse);
      const records  = Array.isArray(data)
        ? data
        : response?.data ?? response?.results ?? response?.transactions ?? [];

      setResults(records as TxItem[]);
      setEffectiveDates({
        startDate: response?.startDate ?? f.startDate ?? defaultFilterStartDate(),
        endDate:   response?.endDate   ?? f.endDate   ?? todayISO(),
      });
    } catch (err) {
      // Pass through any real backend message; only use the generic fallback
      // when the error is the raw "Request failed (NNN)" placeholder.
      const message =
        isApiError(err) && !/^Request failed(?: \(\d+\))?$/.test(err.message)
          ? err.message
          : "Failed to load transactions. Please try again.";
      setError(message);
      setEffectiveDates(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Auto-reload: re-run search whenever filters or keyword change,
  //    but ONLY after the user has already performed at least one search.
  const filtersRef  = React.useRef(filters);
  const keywordRef  = React.useRef(keyword);
  const searchedRef = React.useRef(hasSearched);
  filtersRef.current  = filters;
  keywordRef.current  = keyword;
  searchedRef.current = hasSearched;

  React.useEffect(() => {
    if (!searchedRef.current) return;        // Don't fire on initial mount
    const timer = setTimeout(() => {
      applyFilters(filtersRef.current, keywordRef.current);
    }, 300);                                 // 300 ms debounce
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, keyword, applyFilters]);

  // ── Reset ────────────────────────────────────────────────────────────────
  function handleReset() {
    setFilters(DEFAULT_FILTERS);
    setKeyword("");
    setResults([]);
    setHasSearched(false);
    setError("");
    setEffectiveDates(null);
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const selectedType   = filters.type?.toUpperCase();
  const selectedTotal  = results.reduce(
    (sum, tx) => sum + Math.abs(Number(tx.amount) || 0), 0,
  );
  const currentOrderOptions = orderOptionsFor(filters.sortField);
  const hasActiveFilters    = !!(filters.type || filters.startDate || filters.endDate || filters.sortField);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Page title */}
      <div>
        <h2 className="text-lg font-bold text-foreground tracking-tight">Transactions</h2>
        <p className="text-sm text-foreground-muted mt-0.5">
          Search and filter across all your transactions.
        </p>
      </div>

      {/* ── Search bar ── */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="Search by name or keyword…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            leftIcon={<Search size={14} />}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyFilters(filters, keyword);
            }}
          />
        </div>
        <Button
          onClick={() => applyFilters(filters, keyword)}
          loading={loading}
          size="default"
        >
          <Search size={14} />
          Search
        </Button>
        <Button
          variant="outline"
          size="default"
          onClick={() => setShowFilters((v) => !v)}
          className={cn(hasActiveFilters && "border-primary text-primary")}
        >
          <SlidersHorizontal size={14} />
          Filters
          {hasActiveFilters && (
            <span className="flex items-center justify-center h-4 w-4 rounded-full bg-primary text-white text-[10px] font-bold -mr-1">!</span>
          )}
        </Button>
        {hasSearched && (
          <Button variant="ghost" size="default" onClick={handleReset}>
            <X size={14} />
            Reset
          </Button>
        )}
      </div>

      {/* ── Filter panel ── */}
      {showFilters && (
        <div className="bg-background-secondary rounded-xl border border-border p-5 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-foreground">Filter options</p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="flex items-center gap-1 text-xs text-foreground-muted hover:text-foreground transition-colors"
              >
                <X size={11} />
                Clear filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Type */}
            <Select
              label="Type"
              options={TYPE_OPTIONS}
              value={filters.type ?? ""}
              onChange={(e) =>
                setFilters((p) => ({ ...p, type: e.target.value || undefined }))
              }
            />

            {/* From date */}
            <Input
              label="From date"
              type="date"
              value={filters.startDate ?? ""}
              onChange={(e) =>
                setFilters((p) => ({ ...p, startDate: e.target.value || undefined }))
              }
            />

            {/* To date */}
            <Input
              label="To date"
              type="date"
              value={filters.endDate ?? ""}
              onChange={(e) =>
                setFilters((p) => ({ ...p, endDate: e.target.value || undefined }))
              }
            />

            {/* Sort by + Order — reset sortOrder when sortField changes */}
            <div className="flex gap-2">
              <Select
                label="Sort by"
                options={SORT_OPTIONS}
                value={filters.sortField ?? ""}
                onChange={(e) => {
                  const newField = e.target.value || undefined;
                  setFilters((p) => ({
                    ...p,
                    sortField: newField,
                    // Reset to the natural default for the new field
                    sortOrder: defaultOrderFor(newField),
                  }));
                }}
              />
              <Select
                label="Order"
                options={currentOrderOptions}
                value={filters.sortOrder ?? "DESC"}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, sortOrder: e.target.value }))
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Results summary ── */}
      {hasSearched && !loading && !error && results.length > 0 && (
        <div className="flex items-center gap-5 flex-wrap">
          {/* Count */}
          <p className="text-sm text-foreground-muted">
            <span className="font-semibold text-foreground">{results.length}</span>
            {" "}result{results.length !== 1 ? "s" : ""}
          </p>

          {/* Single-type total + effective date range */}
          {(selectedType === "INCOME" || selectedType === "EXPENSE") && (
            <div className={cn(
              "flex flex-col",
              selectedType === "INCOME" ? "text-success" : "text-danger",
            )}>
              <span className="text-[11px] font-semibold uppercase tracking-wide">
                Total {selectedType === "INCOME" ? "Income" : "Expenses"}
              </span>
              <span className="flex items-center gap-1 text-sm font-medium">
                {selectedType === "INCOME"
                  ? <ArrowUpRight size={13} />
                  : <ArrowDownRight size={13} />
                }
                {formatTransactionAmount(selectedTotal, selectedType)}
              </span>
              {effectiveDates && (
                <span className="mt-0.5 text-xs text-foreground-muted">
                  From {formatDate(effectiveDates.startDate)} → {formatDate(effectiveDates.endDate)}
                </span>
              )}
            </div>
          )}

          {/* Refresh */}
          <button
            type="button"
            onClick={() => applyFilters(filters, keyword)}
            className="ml-auto flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground transition-colors"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
      )}

      {/* ── Results list ── */}
      <div className="bg-background-secondary rounded-xl border border-border overflow-hidden">
        {error ? (
          <ErrorState
            message={error}
            onRetry={() => applyFilters(filters, keyword)}
            size="sm"
          />
        ) : loading ? (
          <TransactionListSkeleton rows={6} />
        ) : !hasSearched ? (
          <EmptyState
            icon={Search}
            title="Search your transactions"
            description="Use the search bar above to find transactions. Add filters for more precise results."
          />
        ) : results.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No transactions found"
            description="Try adjusting your search terms or filters."
            action={
              <Button variant="outline" size="sm" onClick={handleReset}>
                <X size={13} />
                Clear all
              </Button>
            }
          />
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                Transaction
              </p>
              <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                Amount
              </p>
            </div>
            <div className="divide-y divide-border">
              {results.map((tx, i) => (
                <TxRow key={tx.id ?? i} tx={tx} fallbackType={filters.type} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
