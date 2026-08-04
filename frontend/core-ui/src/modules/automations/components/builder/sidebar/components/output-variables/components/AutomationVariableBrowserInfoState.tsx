import { IconInfoCircle } from '@tabler/icons-react';
import { TAutomationVariableEmptyState } from '../AutomationVariableBrowserTypes';

export const AutomationVariableBrowserInfoState = ({
  title,
  description,
}: TAutomationVariableEmptyState) => {
  return (
    <div className="rounded-md border border-dashed bg-background px-4 py-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <IconInfoCircle className="size-4" />
        </div>
        <div className="space-y-1">
          <div className="font-medium text-foreground">{title}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
      </div>
    </div>
  );
};
