import { SkeletonText } from "@/components/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <div className="skeleton mb-2 h-8 w-2/3" />
      <div className="skeleton mb-8 h-4 w-full" />
      <SkeletonText lines={6} />
    </main>
  );
}
