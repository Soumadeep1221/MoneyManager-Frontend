"use client";

import * as React from "react";
import { Plus, Tag, Trash2, Pencil } from "lucide-react";
import { categoryService, type CategoryDTO } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { CategoryCardSkeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { IconDisplay, IconPicker, IconToggleButton } from "@/components/ui/icon-picker";
import { cn } from "@/lib/utils";

const TYPE_OPTIONS = [
  { value: "INCOME",  label: "Income" },
  { value: "EXPENSE", label: "Expense" },
];

// ─── Category Modal ───────────────────────────────────────────────────────────

function CategoryModal({ open, onClose, onSuccess, editing }: {
  open: boolean;
  onClose: () => void;
  onSuccess: (category: CategoryDTO) => void;
  editing?: CategoryDTO | null;
}) {
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [selectedIcon, setSelectedIcon] = React.useState(editing?.icon ?? "🏷️");
  const [showIconPicker, setShowIconPicker] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open) {
      setSelectedIcon(editing?.icon ?? "🏷️");
      setShowIconPicker(false);
      setFieldErrors({});
    }
  }, [open, editing]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string).trim();
    const type = fd.get("type") as string;

    const errs: Record<string, string> = {};
    if (!name) errs.name = "Name is required";
    if (!type) errs.type = "Type is required";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setLoading(true);

    const payload: CategoryDTO = { name, type: type as "INCOME" | "EXPENSE", icon: selectedIcon };

    try {
      let result: CategoryDTO;
      if (editing?.id != null) {
        result = await categoryService.update(editing.id, { ...editing, ...payload });
        success("Category updated.");
      } else {
        result = await categoryService.create(payload);
        success("Category created.");
      }
      onSuccess(result);
      onClose();
    } catch {
      toastError(editing ? "Failed to update category." : "Failed to create category.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit Category" : "New Category"}
      description={editing ? "Update this category." : "Create a new category."} size="sm">
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          <div>
            <p className="text-[13px] font-medium text-[#374151] mb-1.5">Icon</p>
            <IconToggleButton selectedIcon={selectedIcon} open={showIconPicker} onToggle={() => setShowIconPicker((v) => !v)} tone="neutral" />
            {showIconPicker && (
              <div className="mt-2 p-3 border border-[#e2e6ea] rounded-xl bg-white animate-fade-in-up">
                <IconPicker value={selectedIcon} onChange={(icon) => { setSelectedIcon(icon); setShowIconPicker(false); }} />
              </div>
            )}
          </div>
          <Input label="Category name" name="name" placeholder="e.g. Groceries" defaultValue={editing?.name ?? ""} error={fieldErrors.name} required />
          <Select label="Type" name="type" options={TYPE_OPTIONS} defaultValue={editing?.type ?? ""} placeholder="Select type" error={fieldErrors.type} />
        </div>
        <ModalFooter>
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" size="sm" loading={loading}>{editing ? "Save changes" : "Create"}</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

// ─── Category card ────────────────────────────────────────────────────────────

function CategoryCard({ category, onEdit, onDelete }: {
  category: CategoryDTO;
  onEdit: (c: CategoryDTO) => void;
  onDelete: (id: number) => void;
}) {
  const isIncome = category.type === "INCOME";
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-[#e9edf2] p-4 group hover:border-[#d1d9e0] hover:shadow-sm transition-all duration-150">
      <div className={cn("flex items-center justify-center h-9 w-9 rounded-xl flex-shrink-0", isIncome ? "bg-[#f0fdf4]" : "bg-[#fef2f2]")}>
        <IconDisplay name={category.icon} size={16} className={isIncome ? "text-[#16a34a]" : "text-[#ef4444]"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-semibold text-[#0f1117] truncate leading-snug">{category.name}</p>
        <Badge variant={isIncome ? "income" : "expense"} size="sm" className="mt-0.5">
          {isIncome ? "Income" : "Expense"}
        </Badge>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button type="button" onClick={() => onEdit(category)}
          className="flex items-center justify-center h-7 w-7 rounded-lg text-[#b0b8c4] hover:bg-[#f4f6f8] hover:text-[#374151] transition-colors" aria-label="Edit">
          <Pencil size={13} />
        </button>
        <button type="button" onClick={() => category.id != null && onDelete(category.id)}
          className="flex items-center justify-center h-7 w-7 rounded-lg text-[#b0b8c4] hover:bg-[#fef2f2] hover:text-[#ef4444] transition-colors" aria-label="Delete">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const { success, error: toastError } = useToast();
  const [categories, setCategories] = React.useState<CategoryDTO[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<CategoryDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<number | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"ALL" | "INCOME" | "EXPENSE">("ALL");

  const load = React.useCallback(async () => {
    setLoading(true); setError("");
    try { setCategories(await categoryService.getAll()); }
    catch { setError("Failed to load categories."); }
    finally { setLoading(false); }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  async function handleDelete() {
    if (deleteTarget == null) return;
    setDeleting(true);
    try {
      await categoryService.delete(deleteTarget);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget));
      success("Category deleted.");
    } catch { toastError("Failed to delete — category may be in use."); }
    finally { setDeleting(false); setDeleteTarget(null); }
  }

  function handleModalSuccess(cat: CategoryDTO) {
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === cat.id);
      if (idx >= 0) { const u = [...prev]; u[idx] = cat; return u; }
      return [cat, ...prev];
    });
  }

  const incomeCount  = categories.filter((c) => c.type === "INCOME").length;
  const expenseCount = categories.filter((c) => c.type === "EXPENSE").length;
  const visible = activeTab === "ALL" ? categories : categories.filter((c) => c.type === activeTab);

  const TABS = [
    { id: "ALL"     as const, label: "All",     count: categories.length },
    { id: "INCOME"  as const, label: "Income",  count: incomeCount },
    { id: "EXPENSE" as const, label: "Expense", count: expenseCount },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-[#0f1117] tracking-tight">Categories</h2>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">Organise your income and expenses.</p>
        </div>
        <Button size="sm" onClick={() => { setEditTarget(null); setModalOpen(true); }}>
          <Plus size={14} />New Category
        </Button>
      </div>

      {/* Summary counts */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total",   value: categories.length, color: "text-[#374151]" },
            { label: "Income",  value: incomeCount,       color: "text-[#16a34a]" },
            { label: "Expense", value: expenseCount,      color: "text-[#ef4444]" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-[#e9edf2] p-4 text-center">
              <p className={cn("text-[22px] font-bold tabular-nums leading-none", color)}>{value}</p>
              <p className="text-[12px] text-[#9ca3af] mt-1.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-0.5 bg-[#f4f6f8] p-1 rounded-xl w-fit">
        {TABS.map(({ id, label, count }) => (
          <button key={id} type="button" onClick={() => setActiveTab(id)}
            className={cn("px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all",
              activeTab === id ? "bg-white text-[#0f1117] shadow-sm" : "text-[#9ca3af] hover:text-[#374151]")}>
            {label}
            <span className={cn("ml-1.5 text-[11px]", activeTab === id ? "text-[#9ca3af]" : "text-[#c0c7d0]")}>{count}</span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {error ? <ErrorState message={error} onRetry={load} /> :
       loading ? (
         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
           {Array.from({ length: 6 }).map((_, i) => <CategoryCardSkeleton key={i} />)}
         </div>
       ) : visible.length === 0 ? (
         <div className="bg-white rounded-xl border border-[#e9edf2]">
           <EmptyState icon={Tag} title="No categories"
             description={activeTab === "ALL" ? "Create your first category." : `No ${activeTab.toLowerCase()} categories yet.`}
             action={<Button size="sm" onClick={() => { setEditTarget(null); setModalOpen(true); }}><Plus size={13} />New Category</Button>} />
         </div>
       ) : (
         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
           {visible.map((cat) => (
             <CategoryCard key={cat.id} category={cat}
               onEdit={(c) => { setEditTarget(c); setModalOpen(true); }}
               onDelete={setDeleteTarget} />
           ))}
         </div>
       )}

      <CategoryModal open={modalOpen} onClose={() => { setModalOpen(false); setEditTarget(null); }} onSuccess={handleModalSuccess} editing={editTarget} />
      <ConfirmDialog open={deleteTarget != null} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting}
        title="Delete category?" description="Transactions linked to this category may be affected." confirmLabel="Delete" />
    </div>
  );
}
