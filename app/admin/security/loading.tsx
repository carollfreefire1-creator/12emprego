import { SkeletonTable } from "@/components/Skeleton";
export default function Loading() {
  return <div className="p-6"><SkeletonTable rows={8} cols={4} /></div>;
}
