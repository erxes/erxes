import type { Icon } from '@tabler/icons-react';
import { Combobox, Filter, Popover, Skeleton } from 'erxes-ui';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { useGetTicketStatusById } from '@/status/hooks/useGetTicketStatus';
import { StatusInlineIcon } from '@/status/components/StatusInline';

export interface TicketReportFilterChipProps {
  filterKey: string;
  label: string;
  IconComponent: Icon;
  value: ReactNode;
  onRemove: () => void;
  inDialog?: boolean;
  renderEditor?: (close: () => void) => ReactNode;
}

export const TicketReportFilterChip = ({
  filterKey,
  label,
  IconComponent,
  value,
  onRemove,
  inDialog,
  renderEditor,
}: TicketReportFilterChipProps) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);
  const valueButton = (
    <Filter.BarButton
      filterKey={filterKey}
      inDialog={inDialog}
      aria-label={`${t('edit', 'Edit')} ${label}`}
      className="h-7 gap-2 text-xs"
    >
      <span className="inline-flex items-center gap-1.5 truncate">{value}</span>
    </Filter.BarButton>
  );

  return (
    <div className="rounded flex gap-px h-7 items-stretch shadow-xs bg-muted text-xs font-medium max-w-full">
      <Filter.BarName className="shrink-0">
        <IconComponent />
        {label}
      </Filter.BarName>
      {inDialog ? (
        valueButton
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>{valueButton}</Popover.Trigger>
          <Combobox.Content align="start">
            {renderEditor?.(() => setOpen(false))}
          </Combobox.Content>
        </Popover>
      )}
      <Filter.BarClose
        filterKey={filterKey}
        aria-label={`${t('remove', 'Remove')} ${label}`}
        className="size-7 shrink-0"
        onClick={() => {
          setOpen(false);
          onRemove();
        }}
      />
    </div>
  );
};

export const TicketReportPipelineValue = ({ ids }: { ids: string[] }) => {
  const { t } = useTranslation('frontline');
  const { pipeline, loading } = useGetPipeline(ids[0]);
  if (loading) return <Skeleton className="h-4 w-16" />;
  return (
    <>
      {pipeline?.name || t('unknown', 'Unknown')}
      {ids.length > 1 && ` +${ids.length - 1}`}
    </>
  );
};

export const TicketReportStatusValue = ({ ids }: { ids: string[] }) => {
  const { t } = useTranslation('frontline');
  const { status, loading } = useGetTicketStatusById(ids[0]);
  if (loading) return <Skeleton className="h-4 w-16" />;
  return (
    <>
      <StatusInlineIcon statusType={status?.type} color={status?.color} />
      {status?.name || t('unknown', 'Unknown')}
      {ids.length > 1 && ` +${ids.length - 1}`}
    </>
  );
};
