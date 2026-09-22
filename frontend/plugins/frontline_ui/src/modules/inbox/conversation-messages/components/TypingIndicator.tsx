const buildLabel = (names: string[]) => {
  if (names.length === 1) {
    return `${names[0]} is typing`;
  }

  if (names.length === 2) {
    return `${names[0]} and ${names[1]} are typing`;
  }

  return `${names[0]} and ${names.length - 1} others are typing`;
};

export const TypingIndicator = ({ names }: { names: string[] }) => {
  if (!names.length) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 pl-11 pt-3 text-xs text-muted-foreground">
      <span className="flex items-center gap-0.5">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
            style={{ animationDelay: `${dot * 150}ms` }}
          />
        ))}
      </span>
      <span className="truncate">{buildLabel(names)}</span>
    </div>
  );
};
