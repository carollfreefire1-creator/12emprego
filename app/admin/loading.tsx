import { SkeletonStatGrid, SkeletonCard } from "@/components/Skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6 p-6">
      <SkeletonStatGrid count={4} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
