export function BotSeparator({ content }: { content: string }) {
  return (
    <div className="relative flex items-center justify-center my-3">
      <div className="relative bg-transparent px-3 py-1">
        <span className="text-xs text-muted-foreground font-medium">
          {content}
        </span>
      </div>
    </div>
  );
}
