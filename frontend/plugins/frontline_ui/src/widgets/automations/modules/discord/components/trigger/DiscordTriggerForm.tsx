import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  AutomationTriggerFormProps,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import { z } from 'zod';

const discordTriggerSchema = z.object({
  // Optional comma-separated keyword filter. Kept as a real config field so the
  // builder's "custom triggers must include a config" rule is satisfied, and so
  // checkCustomTrigger can filter enrollment by content.
  keywords: z.string().optional().default(''),
});

export type TDiscordTriggerForm = z.infer<typeof discordTriggerSchema>;

/** Automation trigger config form for Discord message events. */
export const DiscordTriggerForm = ({
  activeTrigger,
  onSaveTriggerConfig,
  formRef,
}: AutomationTriggerFormProps<TDiscordTriggerForm>) => {
  const form = useForm<TDiscordTriggerForm>({
    resolver: zodResolver(discordTriggerSchema),
    defaultValues: {
      keywords: (activeTrigger?.config as TDiscordTriggerForm)?.keywords || '',
    },
  });
  const { control, handleSubmit } = form;
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Discord Message Trigger',
  });

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => handleSubmit(onSaveTriggerConfig, handleValidationErrors)(),
  });

  // The sidebar reuses this same form instance across different selected
  // trigger nodes (no remount), so `defaultValues` above only ever applies to
  // the first node opened. Reset on every node switch or the field would keep
  // showing (and could re-save) the previous node's keywords.
  useEffect(() => {
    form.reset({
      keywords: (activeTrigger?.config as TDiscordTriggerForm)?.keywords || '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrigger?.config]);

  return (
    <Form {...form}>
      <div className="p-4 space-y-2">
        <Form.Field
          control={control}
          name="keywords"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Keyword filter (optional)</Form.Label>
              <Form.Control>
                <Input
                  {...field}
                  value={field.value || ''}
                  placeholder="e.g. help, support — leave blank for every event"
                />
              </Form.Control>
              <Form.Description>
                Only enroll when the message content contains one of these
                comma-separated keywords. Blank triggers on every event.
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
    </Form>
  );
};
