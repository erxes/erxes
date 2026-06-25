import { zodResolver } from '@hookform/resolvers/zod';
import { cn, Form, Select, Switch, toast } from 'erxes-ui';
import { useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  AutomationTriggerFormProps,
  useFormValidationErrorHandler,
} from 'ui-modules';
import { z } from 'zod';
import { InstagramPostSelector } from '~/widgets/automations/modules/instagram/components/InstagramPostSelector';
import { InstagramBotSelector } from '~/widgets/automations/modules/instagram/components/InstagramBotSelector';
import { DirectMessageConfigForm } from './DirectMessageConfigForm';

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
  { label: 'specific-post', value: 'specific' },
  { label: 'any-post', value: 'any' },
];

export const CommentTriggerForm = ({
  formRef,
  activeTrigger,
  onSaveTriggerConfig,
}: AutomationTriggerFormProps) => {
  const { t } = useTranslation('frontline');
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { postType: 'specific', ...(activeTrigger.config || {}) },
  });
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Trigger',
  });
  const { control, watch } = form;

  useImperativeHandle(formRef, () => ({
    submit: form.handleSubmit(onSaveTriggerConfig, handleValidationErrors),
  }));

  const [botId, checkContent, postType] = watch([
    'botId',
    'checkContent',
    'postType',
  ]);

  return (
    <div className="h-full ">
      <Form {...form}>
        <Form.Field
          control={control}
          name="botId"
          render={({ field }) => (
            <InstagramBotSelector
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
                <Form.Label>{t('type')}</Form.Label>
                <Form.Control>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      {POST_TYPES.map(({ label, value }) => (
                        <Select.Item key={value} value={value}>
                          {t(label)}
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
                  <InstagramPostSelector
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
                <Form.Label>{t('track-first-level-comments')}</Form.Label>
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
                  {t('check-comment-text-keywords')}
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
