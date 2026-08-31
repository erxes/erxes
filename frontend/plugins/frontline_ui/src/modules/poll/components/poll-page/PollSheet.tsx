import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus, IconX } from '@tabler/icons-react';
import {
  Button,
  Form,
  Input,
  Select,
  Sheet,
  Spinner,
  Switch,
  Textarea,
  toast,
} from 'erxes-ui';
import { ReactNode, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  pollFormSchema,
  TPollForm,
} from '@/poll/constants/pollFormSchema';
import { usePollAdd, usePollEdit } from '@/poll/hooks/usePollMutations';
import {
  IPoll,
  MAX_POLL_OPTIONS,
  POLL_DURATIONS,
} from '@/poll/types/pollTypes';

const NO_DURATION = 'none';

const toFormValues = (poll?: IPoll): TPollForm => ({
  title: poll?.title || '',
  question: poll?.question || '',
  options: poll?.options?.length
    ? poll.options.map((option) => ({ _id: option._id, text: option.text }))
    : [{ text: '' }, { text: '' }],
  allowMultiselect: Boolean(poll?.allowMultiselect),
  durationHours: poll?.durationHours ?? null,
});

export const PollSheet = ({
  poll,
  channelId,
  trigger,
}: {
  poll?: IPoll;
  channelId?: string;
  trigger: ReactNode;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);
  const { addPoll, loading: adding } = usePollAdd();
  const { editPoll, loading: editing } = usePollEdit();

  const form = useForm<TPollForm>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: toFormValues(poll),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  });

  const loading = adding || editing;

  const onSubmit = form.handleSubmit((values) => {
    const variables = {
      title: values.title,
      question: values.question,
      channelId: poll?.channelId || channelId,
      options: values.options.map((option, index) => ({
        ...(option._id ? { _id: option._id } : {}),
        text: option.text,
        order: index,
      })),
      allowMultiselect: values.allowMultiselect,
      durationHours: values.durationHours,
    };

    const onCompleted = () => {
      toast({
        variant: 'success',
        title: poll ? t('poll-updated') : t('poll-created'),
      });
      setOpen(false);
      form.reset(poll ? values : toFormValues());
    };

    const onError = (error: Error) =>
      toast({
        variant: 'destructive',
        title: t('error'),
        description: error.message,
      });

    if (poll) {
      editPoll({ variables: { _id: poll._id, ...variables }, onCompleted, onError });
      return;
    }

    addPoll({ variables, onCompleted, onError });
  });

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          form.reset(toFormValues(poll));
        }
      }}
    >
      <Sheet.Trigger asChild>{trigger}</Sheet.Trigger>
      <Sheet.View className="p-0">
        <Form {...form}>
          <form className="flex flex-col size-full gap-0" onSubmit={onSubmit}>
            <Sheet.Header>
              <Sheet.Title>
                {poll ? t('edit-poll') : t('create-poll')}
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow flex flex-col px-5 py-4 gap-4 overflow-y-auto">
              <Form.Field
                control={form.control}
                name="title"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('poll-title')}</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder={t('poll-title-placeholder')} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="question"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('poll-question')}</Form.Label>
                    <Form.Control>
                      <Textarea
                        {...field}
                        rows={2}
                        placeholder={t('poll-question-placeholder')}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <div className="flex flex-col gap-2">
                <Form.Label>{t('poll-options')}</Form.Label>
                {fields.map((option, index) => (
                  <Form.Field
                    key={option.id}
                    control={form.control}
                    name={`options.${index}.text`}
                    render={({ field }) => (
                      <Form.Item>
                        <div className="flex items-center gap-2">
                          <Form.Control>
                            <Input
                              {...field}
                              placeholder={`${t('poll-option')} ${index + 1}`}
                            />
                          </Form.Control>
                          {fields.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="shrink-0 text-muted-foreground"
                              onClick={() => remove(index)}
                              aria-label={t('remove')}
                            >
                              <IconX />
                            </Button>
                          )}
                        </div>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                ))}
                {form.formState.errors.options?.root && (
                  <p className="text-destructive text-sm">
                    {form.formState.errors.options.root.message}
                  </p>
                )}
                {fields.length < MAX_POLL_OPTIONS && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-fit text-muted-foreground"
                    onClick={() => append({ text: '' })}
                  >
                    <IconPlus />
                    {t('add-option')}
                  </Button>
                )}
              </div>

              <Form.Field
                control={form.control}
                name="durationHours"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('poll-duration')}</Form.Label>
                    <Select
                      value={
                        field.value === null ? NO_DURATION : String(field.value)
                      }
                      onValueChange={(value) =>
                        field.onChange(
                          value === NO_DURATION ? null : Number(value),
                        )
                      }
                    >
                      <Form.Control>
                        <Select.Trigger>
                          <Select.Value />
                        </Select.Trigger>
                      </Form.Control>
                      <Select.Content>
                        {POLL_DURATIONS.map((duration) => (
                          <Select.Item
                            key={String(duration.value)}
                            value={
                              duration.value === null
                                ? NO_DURATION
                                : String(duration.value)
                            }
                          >
                            {duration.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="allowMultiselect"
                render={({ field }) => (
                  <Form.Item className="flex items-center justify-between gap-2">
                    <Form.Label>{t('allow-multiple-answers')}</Form.Label>
                    <Form.Control>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>
                  </Form.Item>
                )}
              />
            </Sheet.Content>
            <Sheet.Footer>
              <Sheet.Close asChild>
                <Button type="button" variant="ghost">
                  {t('cancel')}
                </Button>
              </Sheet.Close>
              <Button type="submit" disabled={loading}>
                {loading && <Spinner size="sm" />}
                {poll ? t('save') : t('create')}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
