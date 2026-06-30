import { Button, Form, Spinner, Switch } from 'erxes-ui';
import { UseFormReturn, useWatch } from 'react-hook-form';
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
  form: UseFormReturn<PostFormData>;
  onSubmit: (data?: PostFormData) => void | Promise<void>;
  creating: boolean;
  saving: boolean;
}

export const AddPostHeaderActions = ({
  form,
  onSubmit,
  creating,
  saving,
}: AddPostHeaderActionsProps) => {
  const { t } = useTranslation('content');
  const status = useWatch({
    control: form.control,
    name: 'status',
  });

  const enableAutoArchive = useWatch({
    control: form.control,
    name: 'enableAutoArchive',
  });

  return (
    <div className="flex items-center gap-2">
      <Form {...form}>
        <div className="flex items-center gap-2">
          {status === 'published' && (
            <Form.Field
              control={form.control}
              name="publishDate"
              render={({ field }) => (
                <Form.Item>
                  <Form.Control>
                    <DateTimeInput
                      value={field.value || undefined}
                      onChange={field.onChange}
                      placeholder="Нийтлэх огноо"
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
          )}

          {status === 'scheduled' && (
            <Form.Field
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <Form.Item>
                  <Form.Control>
                    <DateTimeInput
                      value={field.value || undefined}
                      onChange={field.onChange}
                      placeholder="Товлосон огноо"
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
          )}

          {(status === 'published' || status === 'scheduled') && (
            <Form.Field
              control={form.control}
              name="enableAutoArchive"
              render={({ field }) => (
                <Form.Item>
                  <Form.Control>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {t('auto-archive')}
                      </span>
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  </Form.Control>
                </Form.Item>
              )}
            />
          )}

          {enableAutoArchive &&
            (status === 'published' || status === 'scheduled') && (
              <Form.Field
                control={form.control}
                name="autoArchiveDate"
                render={({ field }) => (
                  <Form.Item>
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

          <Form.Field
            control={form.control}
            name="status"
            render={({ field }) => (
              <Form.Item>
                <Form.Control>
                  <div className="inline-flex items-center rounded-md border bg-background p-1 gap-1">
                    <Button
                      type="button"
                      variant={
                        field.value === 'published' ? 'default' : 'ghost'
                      }
                      size="sm"
                      onClick={() => {
                        field.onChange('published');
                        if (!form.getValues('publishDate')) {
                          form.setValue('publishDate', new Date());
                        }
                      }}
                      className="h-8"
                    >
                      {t('publish')}
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === 'draft' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => field.onChange('draft')}
                      className="h-8"
                    >
                      {t('draft')}
                    </Button>
                    <Button
                      type="button"
                      variant={
                        field.value === 'scheduled' ? 'default' : 'ghost'
                      }
                      size="sm"
                      onClick={() => field.onChange('scheduled')}
                      className="h-8"
                    >
                      {t('scheduled')}
                    </Button>
                  </div>
                </Form.Control>
              </Form.Item>
            )}
          />
        </div>
      </Form>
      <Button
        onClick={() => form.handleSubmit(onSubmit)()}
        disabled={creating || saving}
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
