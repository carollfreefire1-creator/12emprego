import { SkeletonCardGrid } from "@/components/Skeleton";
export default function Loading() {
  return <div className="mx-auto max-w-6xl px-4 py-10"><SkeletonCardGrid count={6} /></div>;
}
