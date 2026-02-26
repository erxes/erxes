import { Button, Form, Spinner, Switch } from 'erxes-ui';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { DateTimeInput } from './DateTimeInput';

interface PostFormData {
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
  thumbnail?: any | null;
  gallery?: string[];
  video?: string | null;
  audio?: string | null;
  documents?: string[];
  attachments?: string[];
  pdf?: string | null;
  scheduledDate?: Date | null;
  autoArchiveDate?: Date | null;
  enableAutoArchive?: boolean;
  customFieldsData?: { field: string; value: any }[];
}

interface AddPostHeaderActionsProps {
  form: UseFormReturn<PostFormData>;
  onSubmit: () => void;
  creating: boolean;
  saving: boolean;
}

export const AddPostHeaderActions = ({
  form,
  onSubmit,
  creating,
  saving,
}: AddPostHeaderActionsProps) => {
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
              name="scheduledDate"
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
                        Auto archive
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
                        placeholder="Archive date"
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
                      onClick={() => field.onChange('published')}
                      className="h-8"
                    >
                      Publish
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === 'draft' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => field.onChange('draft')}
                      className="h-8"
                    >
                      Draft
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
                      Scheduled
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
              ? 'Publishing...'
              : status === 'draft'
              ? 'Saving...'
              : status === 'scheduled'
              ? 'Scheduling...'
              : 'Saving...'}
          </>
        ) : (
          <div>
            {status === 'published'
              ? 'Publish'
              : status === 'draft'
              ? 'Save Draft'
              : status === 'scheduled'
              ? 'Schedule'
              : 'Save'}
          </div>
        )}
      </Button>
    </div>
  );
};
