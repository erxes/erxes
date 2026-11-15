import { isFolderListRow } from '@/automations/hooks/useAutomationListRows';
import { TAutomationListRow } from '@/automations/types';
import { cn, RecordTable } from 'erxes-ui';
import React from 'react';

/** A folder heading reads as a band across the list; other rows are plain. */
export const AutomationListRow = React.forwardRef<
  HTMLTableRowElement,
  React.ComponentProps<typeof RecordTable.Row>
>(({ original, className, ...props }, ref) => {
  const row = original as TAutomationListRow | undefined;

  return (
    <RecordTable.Row
      ref={ref}
      original={original}
      className={cn(row && isFolderListRow(row) && 'bg-muted/40', className)}
      {...props}
    />
  );
});

AutomationListRow.displayName = 'AutomationListRow';
