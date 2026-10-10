import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div 
      className={cn(
        "bg-divider rounded animate-pulse",
        className
      )} 
      aria-hidden="true" 
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-background-secondary rounded-lg border border-border p-4">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="h-3.5 w-24 rounded" />
        <Skeleton className="h-8 w-8 rounded-md flex-shrink-0" />
      </div>
      <Skeleton className="h-7 w-32 rounded mb-2" />
      <Skeleton className="h-3 w-20 rounded" />
    </div>
  );
}

export function TransactionListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-0 divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3 px-4">
          <Skeleton className="h-10 w-10 rounded-md flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-3.5 w-36 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
          <Skeleton className="h-3.5 w-20 rounded flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="bg-background-secondary rounded-lg border border-border p-4 flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-md flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-24 rounded" />
        <Skeleton className="h-3 w-14 rounded" />
      </div>
      <Skeleton className="h-7 w-7 rounded-md" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-background-secondary rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-3 w-40 rounded" />
        </div>
      </div>
      <Skeleton className="h-52 w-full rounded-lg" />
    </div>
  );
}
