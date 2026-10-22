import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import {
  Button,
  Combobox,
  Command,
  Form,
  Input,
  Popover,
  Spinner,
} from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  EMPTY_TOPIC,
  TTopicForm,
  topicSchema,
} from '@/knowledgebase/topics/components/TopicFormFields';
import { useSaveTopic } from '@/knowledgebase/topics/hooks/useTopicMutations';
import { useTopicOptions } from '@/knowledgebase/topics/hooks/useTopics';

/** The essentials of a topic; the rest is edited in the knowledge base. */
const EMKbTopicCreate = ({
  brandId,
  onCreated,
  onCancel,
}: {
  brandId?: string;
  onCreated: (topicId: string) => void;
  onCancel?: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const { saveTopic, loading } = useSaveTopic();
  const form = useForm<TTopicForm>({
    resolver: zodResolver(topicSchema),
    defaultValues: { ...EMPTY_TOPIC, brandId: brandId ?? '' },
  });

  // A button, not a submit: this form sits inside the messenger's own form.
  const create = form.handleSubmit(async (values) => {
    const topicId = await saveTopic({ ...values, brandId: brandId ?? '' });

    if (topicId) {
      form.reset({ ...EMPTY_TOPIC, brandId: brandId ?? '' });
      onCreated(topicId);
    }
  });

  return (
    <Form {...form}>
      <div className="flex flex-col gap-4 rounded-lg border border-dashed bg-muted/40 p-4">
        <Form.Field
          control={form.control}
          name="title"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('title', 'Title')}</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="description"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('description', 'Description')}</Form.Label>
              <Form.Control>
                <Input {...field} value={field.value ?? ''} />
              </Form.Control>
            </Form.Item>
          )}
        />
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              {t('cancel', 'Cancel')}
            </Button>
          )}
          <Button type="button" onClick={create} disabled={loading}>
            {loading && <Spinner size="sm" />}
            {t('create-and-select', 'Create and select')}
          </Button>
        </div>
      </div>
    </Form>
  );
};

/** Picks the topic the widget's help tab shows, or creates one in place. */
export const EMKbTopicPicker = ({
  value,
  onChange,
  brandId,
}: {
  value?: string;
  onChange: (topicId: string) => void;
  brandId?: string;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const { topics, loading } = useTopicOptions();

  const onCreated = (topicId: string) => {
    onChange(topicId);
    setCreating(false);
  };

  if (loading) {
    return <Spinner containerClassName="py-6" />;
  }

  if (!topics.length) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          {t(
            'kb-topic-empty-create',
            'No knowledge base topic yet. Create one here; its articles show in the widget help tab.',
          )}
        </p>
        <EMKbTopicCreate brandId={brandId} onCreated={onCreated} />
      </div>
    );
  }

  const selected = topics.find((topic) => topic._id === value);

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.Trigger>
          <span className={selected ? '' : 'text-muted-foreground'}>
            {selected?.title ?? t('select-a-topic')}
          </span>
        </Combobox.Trigger>
        <Combobox.Content>
          <Command>
            <Command.Input placeholder={t('search-topic')} />
            <Command.List>
              {topics.map((topic) => (
                <Command.Item
                  key={topic._id}
                  value={topic.title ?? topic._id}
                  onSelect={() => {
                    onChange(topic._id === value ? '' : topic._id);
                    setOpen(false);
                  }}
                >
                  {topic.title}
                  {topic._id === value && <Combobox.Check />}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
      {creating ? (
        <EMKbTopicCreate
          brandId={brandId}
          onCreated={onCreated}
          onCancel={() => setCreating(false)}
        />
      ) : (
        <Button
          type="button"
          variant="secondary"
          className="self-start"
          onClick={() => setCreating(true)}
        >
          <IconPlus />
          {t('kb-new-topic', 'New Topic')}
        </Button>
      )}
    </div>
  );
};
