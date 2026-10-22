import { IconChevronDown, IconLock } from '@tabler/icons-react';
import { Separator, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TTicketLayoutField } from '@/pipelines/hooks/useTicketLayoutFields';

// How a field looks on the new-ticket sheet: "Label | value ▾".
export const FormChipPreview = ({
  label,
  value,
  muted,
  className,
}: {
  label: string;
  value: string;
  muted?: boolean;
  className?: string;
}) => (
  <div
    className={cn(
      'flex h-8 min-w-0 items-center overflow-hidden rounded-md border bg-background text-sm',
      muted && 'opacity-60',
      className,
    )}
  >
    <span className="truncate border-r px-3 text-muted-foreground">{label}</span>
    <span className="flex min-w-0 items-center gap-1 truncate px-3 text-muted-foreground">
      {value}
      <IconChevronDown className="size-3.5 shrink-0" />
    </span>
  </div>
);

// The fixed top of the new-ticket sheet, above the laid-out rows.
export const TicketCreateFormHeader = () => {
  const { t } = useTranslation('frontline');

  return (
    <div className="flex flex-col gap-2 pb-2">
      <span className="text-xl text-muted-foreground/60">
        {t('ticket-name', 'Ticket Name')}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <FormChipPreview label={t('channel', 'Channel')} value="—" muted />
        <FormChipPreview label={t('pipeline', 'Pipeline')} value="—" muted />
        <FormChipPreview label={t('status', 'Status')} value="—" muted />
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <IconLock className="size-3.5" />
          {t('always-on-form', 'Always on the form')}
        </span>
      </div>
    </div>
  );
};

// The fixed bottom of the new-ticket sheet, below the laid-out rows.
export const TicketCreateFormFooter = () => {
  const { t } = useTranslation('frontline');

  return (
    <div className="flex flex-col gap-3 pt-2">
      <Separator />
      <span className="text-sm text-muted-foreground/60">
        {t('description-placeholder', "Description — type '/' for commands…")}
      </span>
    </div>
  );
};

// A placed field drawn as its form chip; why it is hidden replaces the value.
export const TicketLayoutChip = ({ item }: { item?: TTicketLayoutField }) => {
  const { t } = useTranslation('frontline');

  if (!item) {
    return null;
  }

  const value = item.unsupported
    ? t('unsupported-type', 'Unsupported type')
    : !item.createOn
      ? t('off-for-create', 'Off for create')
      : item.typeLabel;

  return (
    <div className="flex min-w-0 items-center gap-1">
      <span className="truncate">{item.name}</span>
      {item.required && <span className="text-destructive">*</span>}
      <span className="ml-1 truncate text-xs text-muted-foreground">
        {value}
      </span>
    </div>
  );
};
