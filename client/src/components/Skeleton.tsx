interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} />;
}

export function SongCardSkeleton() {
  return (
    <div className="card flex items-center gap-4 p-4">
      <Skeleton className="h-16 w-16 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-3/5 rounded" />
        <Skeleton className="h-3 w-2/5 rounded" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-9 w-9 rounded-full" />
    </div>
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="card p-8">
      <div className="flex items-start gap-6">
        <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-48 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}
