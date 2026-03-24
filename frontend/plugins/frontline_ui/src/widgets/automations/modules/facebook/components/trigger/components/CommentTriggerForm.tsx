import { zodResolver } from '@hookform/resolvers/zod';
import { cn, Form, Select, Switch, toast } from 'erxes-ui';
import { useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { AutomationTriggerFormProps } from 'ui-modules';
import { z } from 'zod';
import { FacebookPostSelector } from '~/widgets/automations/modules/facebook/components/FacebookPostSelector';
import { FacebookBotSelector } from '~/widgets/automations/modules/facebook/components/MessengerBotSelector';
import { DirectMessageConfigForm } from '~/widgets/automations/modules/facebook/components/trigger/components/DirectMessageConfigForm';

const formSchema = z.object({
  botId: z.string(),
  postType: z.enum(['specific', 'any']),
  postId: z.string(),
  checkContent: z.any().optional(),
  onlyFirstLevel: z.boolean().optional(),
  conditions: z
    .array(
      z.object({
        _id: z.string(),
        operator: z.string(),
        keywords: z.array(
          z.object({
            _id: z.string(),
            text: z.string(),
            isEditing: z.boolean().optional(),
          }),
        ),
      }),
    )
    .optional(),
});

const POST_TYPES = [
  {
    label: 'Specific post',
    value: 'specific',
  },
  {
    label: 'Any post',
    value: 'any',
  },
];

export const CommentTriggerForm = ({
  formRef,
  activeTrigger,
  onSaveTriggerConfig,
}: AutomationTriggerFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { postType: 'specific', ...(activeTrigger.config || {}) },
  });
  const { control, watch } = form;

  useImperativeHandle(formRef, () => ({
    submit: form.handleSubmit(onSaveTriggerConfig, () =>
      toast({
        title: 'There is some error in the form',
        variant: 'destructive',
      }),
    ),
  }));

  const [botId, checkContent, postType] = watch([
    'botId',
    'checkContent',
    'postType',
  ]);

  return (
    <div className="h-full w-2xl">
      <Form {...form}>
        <Form.Field
          control={control}
          name="botId"
          render={({ field }) => (
            <FacebookBotSelector
              botId={field.value}
              onSelect={field.onChange}
            />
          )}
        />
        <div className={cn('flex flex-col gap-2 p-4', { blur: !botId })}>
          <Form.Field
            control={control}
            name="postType"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Type</Form.Label>
                <Form.Control>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      {POST_TYPES.map(({ label, value }) => (
                        <Select.Item key={value} value={value}>
                          {label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </Form.Control>
              </Form.Item>
            )}
          />
          {postType === 'specific' && (
            <Form.Field
              control={control}
              name="postId"
              render={({ field }) => (
                <Form.Item>
                  <FacebookPostSelector
                    botId={botId}
                    selectedPostId={field.value}
                    onSelect={field.onChange}
                  />
                </Form.Item>
              )}
            />
          )}

          <Form.Field
            control={control}
            name="onlyFirstLevel"
            render={({ field }) => (
              <Form.Item className="flex items-center justify-between">
                <Form.Label>Track first level comments only</Form.Label>
                <Form.Control>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <Form.Field
            control={control}
            name="checkContent"
            render={({ field }) => (
              <Form.Item className="flex items-center justify-between">
                <Form.Label>
                  Check comment text contains with keywords
                </Form.Label>
                <Form.Control>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />

          {checkContent && (
            <Form.Field
              control={control}
              name="conditions"
              render={({ field }) => (
                <DirectMessageConfigForm
                  conditions={field.value || []}
                  onConditionChange={(_, values) => field.onChange(values)}
                />
              )}
            />
          )}
        </div>
      </Form>
    </div>
  );
};
