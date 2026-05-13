export const AutomationVariableBrowserEmptyState = ({
  text,
}: {
  text: string;
}) => {
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-muted-foreground">
      {text}
    </div>
  );
};
