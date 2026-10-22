import {
  IconChevronLeft,
  IconChevronRight,
  IconCircleMinus,
  IconCirclePlus,
  IconPaperclip,
} from '@tabler/icons-react';
import { Button, Empty, Input, Select, Spinner, Textarea } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IConfig,
  useGetTicketConfigs,
} from '@/pipelines/components/configs/hooks/useGetTicketConfigs';

type TPreviewView =
  | { kind: 'home' }
  | { kind: 'select' }
  | { kind: 'form'; configId: string };

type TBasicFieldKey = 'name' | 'description' | 'attachment' | 'tags';

const BASIC_FIELD_KEYS: TBasicFieldKey[] = [
  'name',
  'description',
  'attachment',
  'tags',
];

const BASIC_FIELD_DEFAULT_LABELS: Record<TBasicFieldKey, string> = {
  name: 'Name',
  description: 'Description',
  attachment: 'Attachment',
  tags: 'Tags',
};

const FieldLabel = ({
  label,
  required,
}: {
  label: string;
  required?: boolean | null;
}) => (
  <span className="text-xs font-medium text-foreground">
    {label}
    {required && <span className="text-destructive"> *</span>}
  </span>
);

/** The form a customer fills for one ticket config, as the widget shows it. */
const EMPreviewTicketForm = ({ config }: { config: IConfig }) => {
  const { t } = useTranslation('frontline');

  const basicFields = BASIC_FIELD_KEYS.map((key) => ({
    key,
    field: config.formFields?.[key],
  }))
    .filter(({ field }) => field?.isShow)
    .sort((a, b) => (a.field?.order ?? 0) - (b.field?.order ?? 0));

  const propertyFields = [...(config.propertyFields ?? [])]
    .filter((field) => field !== null)
    .sort(
      (a, b) =>
        (a?.groupOrder ?? 0) - (b?.groupOrder ?? 0) ||
        (a?.order ?? 0) - (b?.order ?? 0),
    );

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-background p-3">
      {basicFields.map(({ key, field }) => {
        const label =
          field?.label ||
          t(`ticket-field-${key}`, {
            defaultValue: BASIC_FIELD_DEFAULT_LABELS[key],
          });
        const placeholder = field?.placeholder ?? '';

        return (
          <label key={key} className="flex flex-col gap-1">
            <FieldLabel label={label} required={key === 'name'} />
            {key === 'description' && (
              <Textarea placeholder={placeholder} rows={3} />
            )}
            {key === 'attachment' && (
              <span className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
                <IconPaperclip className="size-4" />
                {placeholder ||
                  t('upload-an-attachment', 'Upload an attachment')}
              </span>
            )}
            {(key === 'name' || key === 'tags') && (
              <Input placeholder={placeholder} />
            )}
          </label>
        );
      })}
      {propertyFields.map((field) => {
        if (!field) return null;

        const label = field.label || t('property', 'Property');
        const options = (field.options ?? []).filter(
          (option) => option !== null,
        );

        return (
          <label key={field.fieldId} className="flex flex-col gap-1">
            <FieldLabel label={label} required={field.isRequired} />
            {options.length ? (
              <Select>
                <Select.Trigger>
                  <Select.Value placeholder={field.placeholder ?? ''} />
                </Select.Trigger>
                <Select.Content>
                  {options.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            ) : field.type === 'textarea' ? (
              <Textarea placeholder={field.placeholder ?? ''} rows={3} />
            ) : (
              <Input
                placeholder={field.placeholder ?? ''}
                type={
                  field.type === 'number'
                    ? 'number'
                    : field.type === 'date'
                    ? 'date'
                    : 'text'
                }
              />
            )}
          </label>
        );
      })}
      {!basicFields.length && !propertyFields.length && (
        <p className="text-xs text-muted-foreground">
          {t(
            'ticket-config-no-fields',
            'This config asks for nothing yet. Turn on fields in its configuration.',
          )}
        </p>
      )}
      <Button type="button" disabled>
        {t('submit', 'Submit')}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        {t(
          'ticket-preview-not-sent',
          'Preview only: nothing is sent from here.',
        )}
      </p>
    </div>
  );
};

/**
 * The widget's ticket flow over the configs picked in setup: start, pick a
 * config when there are several, then its form.
 */
export const EMPreviewTicketFlow = ({
  channelId,
  configIds,
}: {
  channelId?: string;
  configIds: string[];
}) => {
  const { t } = useTranslation('frontline');
  const [view, setView] = useState<TPreviewView>({ kind: 'home' });
  const { ticketConfigs, loading } = useGetTicketConfigs({
    variables: channelId ? { channelId } : undefined,
  });

  const configs = (ticketConfigs ?? []).filter((config) =>
    configIds.includes(config.id),
  );

  if (loading) {
    return <Spinner containerClassName="py-8" />;
  }

  const start = () =>
    setView(
      configs.length === 1
        ? { kind: 'form', configId: configs[0].id }
        : { kind: 'select' },
    );

  if (view.kind === 'home') {
    return (
      <Empty>
        <Empty.Header>
          <Empty.Media>
            <IconCircleMinus size={64} className="text-scroll stroke-1" />
          </Empty.Media>
          <Empty.Title>{t('no-tickets-found', 'No tickets found')}</Empty.Title>
          <Empty.Description>
            {t(
              'create-a-ticket-to-get-started',
              'Create a ticket to get started.',
            )}
          </Empty.Description>
        </Empty.Header>
        <Empty.Content>
          <Button
            variant="outline"
            className="flex h-auto gap-2"
            onClick={start}
            disabled={!configs.length}
          >
            <span className="size-6 flex-0">
              <IconCirclePlus />
            </span>
            <span className="flex flex-col items-start gap-0.5">
              <span className="text-foreground">
                {t('issue-a-new-ticket', 'Issue a new ticket')}
              </span>
              <span className="text-xs font-normal text-accent-foreground">
                {t('choose-a-form', 'Choose a form')}
              </span>
            </span>
            <span className="size-5 flex-0 text-muted-foreground">
              <IconChevronRight size={16} />
            </span>
          </Button>
        </Empty.Content>
      </Empty>
    );
  }

  const back = (
    <Button
      variant="ghost"
      size="sm"
      className="self-start"
      onClick={() =>
        setView(
          view.kind === 'form' && configs.length > 1
            ? { kind: 'select' }
            : { kind: 'home' },
        )
      }
    >
      <IconChevronLeft />
      {t('back', 'Back')}
    </Button>
  );

  if (view.kind === 'select') {
    return (
      <div className="flex flex-col gap-2 p-2">
        {back}
        {configs.map((config) => (
          <Button
            key={config.id}
            variant="outline"
            className="h-auto justify-between py-3"
            onClick={() => setView({ kind: 'form', configId: config.id })}
          >
            <span className="truncate">{config.name}</span>
            <IconChevronRight size={16} />
          </Button>
        ))}
      </div>
    );
  }

  const config = configs.find(({ id }) => id === view.configId);

  return (
    <div className="flex flex-col gap-2 overflow-y-auto p-2">
      {back}
      {config ? (
        <>
          <h2 className="px-1 text-sm font-semibold">{config.name}</h2>
          <EMPreviewTicketForm config={config} />
        </>
      ) : (
        <p className="p-2 text-sm text-muted-foreground">
          {t('ticket-config-removed', 'This ticket config no longer exists.')}
        </p>
      )}
    </div>
  );
};
