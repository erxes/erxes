import { Checkbox, Label, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { StatusInlineIcon } from '@/status/components/StatusInline';
import { useTicketStatusChecklist } from '@/status/hooks/useTicketStatusChecklist';

/** Pick statuses of one pipeline; "All" picks every one there is. */
export const TicketStatusChecklist = ({
  pipelineId,
  value,
  onChange,
}: {
  pipelineId?: string;
  value: string[];
  onChange: (statusIds: string[]) => void;
}) => {
  const { t } = useTranslation('frontline');
  const { statuses, loading, allState, toggleAll, toggle } =
    useTicketStatusChecklist({ pipelineId, value, onChange });

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!statuses.length) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('status-checklist-empty', 'This pipeline has no statuses yet.')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1 rounded-md border p-1">
      <Label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 font-medium hover:bg-accent">
        <Checkbox checked={allState} onCheckedChange={toggleAll} />
        {t('status-checklist-all', 'All statuses')}
      </Label>
      <div className="border-t" />
      {statuses.map((status) => (
        <Label
          key={status.value}
          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 font-normal hover:bg-accent"
        >
          <Checkbox
            checked={value.includes(status.value)}
            onCheckedChange={(checked) => toggle(status.value, !!checked)}
          />
          <StatusInlineIcon
            statusType={status.type}
            color={status.color ?? undefined}
            className="size-4 shrink-0"
          />
          <span className="truncate">{status.label}</span>
        </Label>
      ))}
    </div>
  );
};
