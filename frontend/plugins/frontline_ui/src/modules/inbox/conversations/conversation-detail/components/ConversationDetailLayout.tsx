export const ConversationDetailLayout = ({
  children,
  input,
}: {
  children: React.ReactNode;
  input: React.ReactNode;
}) => {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="relative min-h-0 flex-1 overflow-hidden">{children}</div>
      {input && (
        <div className="relative z-20 shrink-0 border-t border-border/60 bg-background/95 backdrop-blur">
          {input}
        </div>
      )}
    </div>
  );
};
