export const TypingStatus = () => (
  <div className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground">
    <span className="animate-bounce [animation-delay:0ms] size-1.5 rounded-full bg-muted-foreground" />
    <span className="animate-bounce [animation-delay:150ms] size-1.5 rounded-full bg-muted-foreground" />
    <span className="animate-bounce [animation-delay:300ms] size-1.5 rounded-full bg-muted-foreground" />
    <span className="ml-1">Typing…</span>
  </div>
);
