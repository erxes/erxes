import { IconArchive } from '@tabler/icons-react';
import { Button, Form, Popover, Select, Spinner, Switch, cn } from 'erxes-ui';
import { useEffect } from 'react';
import {
  FieldValues,
  UseFormReturn,
  useFormState,
  useWatch,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { DateTimeInput } from './DateTimeInput';

interface PostThumbnail {
  url: string;
  name?: string;
  type?: string;
}

export interface PostFormData {
  title: string;
  slug: string;
  description?: string;
  content?: string;
  type?: string;
  status?: 'draft' | 'published' | 'scheduled' | 'archived';
  categoryIds?: string[];
  tagIds?: string[];
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  thumbnail?: PostThumbnail | null;
  gallery?: string[];
  video?: string | null;
  audio?: string | null;
  documents?: string[];
  attachments?: string[];
  pdf?: string | null;
  publishDate?: Date | null;
  scheduledDate?: Date | null;
  autoArchiveDate?: Date | null;
  enableAutoArchive?: boolean;
  customFieldsData?: { field: string; value: unknown }[];
}

interface AddPostHeaderActionsProps {
  form: UseFormReturn<FieldValues>;
  onSubmit: (data?: FieldValues) => void | Promise<void>;
  creating: boolean;
  saving: boolean;
  isSaveBlocked: boolean;
}

const POST_STATUS_DOTS = {
  published: 'bg-success',
  draft: 'bg-muted-foreground',
  scheduled: 'bg-warning',
} as const;

type PostStatus = keyof typeof POST_STATUS_DOTS;

const POST_STATUSES = Object.keys(POST_STATUS_DOTS) as PostStatus[];

const formatDateTime = (value?: Date | null) =>
  value
    ? new Date(value).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      })
    : '';

const PostStatusSelect = ({ form }: { form: UseFormReturn<FieldValues> }) => {
  const { t } = useTranslation('content');

  return (
    <Form.Field
      control={form.control}
      name="status"
      render={({ field }) => (
        <Select
          value={field.value}
          onValueChange={(value) => {
            field.onChange(value);
            if (value === 'published' && !form.getValues('publishDate')) {
              form.setValue('publishDate', new Date());
            }
          }}
        >
          <Select.Trigger className="w-32">
            <Select.Value placeholder={t('status')} />
          </Select.Trigger>
          <Select.Content align="end">
            {POST_STATUSES.map((status) => (
              <Select.Item key={status} value={status}>
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      'size-2 rounded-full',
                      POST_STATUS_DOTS[status],
                    )}
                  />
                  {t(status)}
                </span>
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      )}
    />
  );
};

const PostDateField = ({
  form,
  status,
}: {
  form: UseFormReturn<FieldValues>;
  status: 'published' | 'scheduled';
}) => {
  const { t } = useTranslation('content');
  const dateField = status === 'published' ? 'publishDate' : 'scheduledDate';
  const dateLabel = status === 'published' ? t('publish-date') : t('schedule');

  return (
    <Form.Field
      key={dateField}
      control={form.control}
      name={dateField}
      render={({ field }) => (
        <DateTimeInput
          value={field.value || undefined}
          onChange={field.onChange}
          placeholder={dateLabel}
        />
      )}
    />
  );
};

const PostAutoArchive = ({ form }: { form: UseFormReturn<FieldValues> }) => {
  const { t } = useTranslation('content');
  const [enableAutoArchive, autoArchiveDate] = useWatch({
    control: form.control,
    name: ['enableAutoArchive', 'autoArchiveDate'],
  });

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button
          variant={enableAutoArchive ? 'secondary' : 'ghost'}
          className="font-normal text-muted-foreground"
        >
          <IconArchive />
          {(enableAutoArchive && formatDateTime(autoArchiveDate)) ||
            t('auto-archive')}
        </Button>
      </Popover.Trigger>
      <Popover.Content align="end" className="flex w-auto flex-col gap-3 p-3">
        <Form.Field
          control={form.control}
          name="enableAutoArchive"
          render={({ field }) => (
            <Form.Item className="flex items-center justify-between gap-4 space-y-0">
              <Form.Label>{t('auto-archive')}</Form.Label>
              <Form.Control>
                <Switch
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        {enableAutoArchive && (
          <Form.Field
            control={form.control}
            name="autoArchiveDate"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('archive-date')}</Form.Label>
                <Form.Control>
                  <DateTimeInput
                    value={field.value || undefined}
                    onChange={field.onChange}
                    placeholder={t('archive-date')}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
        )}
      </Popover.Content>
    </Popover>
  );
};

export const AddPostHeaderActions = ({
  form,
  onSubmit,
  creating,
  saving,
  isSaveBlocked,
}: AddPostHeaderActionsProps) => {
  const { t } = useTranslation('content');
  const status = useWatch({
    control: form.control,
    name: 'status',
  });
  const { isDirty } = useFormState({ control: form.control });
  const disabled = creating || saving || isSaveBlocked;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (!disabled) {
          form.handleSubmit(onSubmit)();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, form, onSubmit]);

  return (
    <div className="flex items-center gap-2">
      {isDirty && !creating && !saving && (
        <span className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-warning" />
          {t('unsaved-changes')}
        </span>
      )}
      <Form {...form}>
        {(status === 'published' || status === 'scheduled') && (
          <>
            <PostDateField form={form} status={status} />
            <PostAutoArchive form={form} />
          </>
        )}
        <PostStatusSelect form={form} />
      </Form>
      <Button
        onClick={() => form.handleSubmit(onSubmit)()}
        disabled={disabled}
        title={t('save-shortcut')}
      >
        {creating || saving ? (
          <>
            <Spinner size="sm" className="mr-2" />
            {status === 'published'
              ? t('publishing')
              : status === 'draft'
                ? t('saving')
                : status === 'scheduled'
                  ? t('scheduling')
                  : t('saving')}
          </>
        ) : (
          <div>
            {status === 'published'
              ? t('publish')
              : status === 'draft'
                ? t('save-draft')
                : status === 'scheduled'
                  ? t('schedule')
                  : t('save')}
          </div>
        )}
      </Button>
    </div>
  );
};
