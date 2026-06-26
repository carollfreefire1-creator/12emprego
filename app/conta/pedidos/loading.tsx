import { SkeletonCard } from "@/components/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 space-y-3">
      <div className="skeleton h-8 w-48 mb-4" />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </main>
  );
}
