export function DateSeparator({ date }: { date: string }) {
  return (
    <div className="relative flex items-center justify-center my-3">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-black/5"></div>
      </div>
      <div className="relative bg-muted px-3 py-1">
        <span className="text-xs text-accent-foreground font-medium">{date}</span>
      </div>
    </div>
  );
}
