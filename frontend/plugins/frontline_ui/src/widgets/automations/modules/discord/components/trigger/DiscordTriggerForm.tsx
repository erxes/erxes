import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input } from 'erxes-ui';
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
