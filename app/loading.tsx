import { SkeletonCardGrid } from "@/components/Skeleton";

export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="skeleton mb-8 h-10 w-2/3 max-w-md" />
      <SkeletonCardGrid count={6} />
    </div>
  );
}
