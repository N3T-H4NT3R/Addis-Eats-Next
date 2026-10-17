export default function DishListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-xl border border-[#292d31] bg-[#1b1e21]"
        >
          <div className="h-48 bg-[#292d31] sm:h-52" />
          <div className="space-y-3 p-4">
            <div className="h-5 w-2/3 rounded bg-[#292d31]" />
            <div className="h-4 w-full rounded bg-[#292d31]" />
            <div className="h-9 rounded bg-[#292d31]" />
          </div>
        </div>
      ))}
    </div>
  );
}
