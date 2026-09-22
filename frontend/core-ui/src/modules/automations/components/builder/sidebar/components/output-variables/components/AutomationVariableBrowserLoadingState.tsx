import { Spinner } from 'erxes-ui';

export const AutomationVariableBrowserLoadingState = ({
  text,
}: {
  text: string;
}) => {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-muted-foreground">
      <Spinner size="sm" />
      {text}
    </div>
  );
};
