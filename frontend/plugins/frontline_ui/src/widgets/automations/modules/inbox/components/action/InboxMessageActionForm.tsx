import { Form, Textarea, toast } from 'erxes-ui';
import { useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { AutomationActionFormProps } from 'ui-modules';

type TInboxMessageActionForm = {
  text: string;
};

export const InboxMessageActionForm = ({
  formRef,
  currentAction,
  onSaveActionConfig,
}: AutomationActionFormProps<TInboxMessageActionForm>) => {
  const form = useForm<TInboxMessageActionForm>({
    defaultValues: { text: currentAction?.config?.text || '' },
  });
  const { control } = form;

  useImperativeHandle(formRef, () => ({
    submit: form.handleSubmit(onSaveActionConfig, () =>
      toast({
        title: 'There is some error in the form',
        variant: 'destructive',
      }),
    ),
  }));

  return (
    <div className="w-full p-4">
      <Form {...form}>
        <Form.Field
          control={control}
          name="text"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Message</Form.Label>
              <Form.Control>
                <Textarea
                  {...field}
                  rows={4}
                  placeholder={
                    'Enter message text. Use {{ prevAction.text }} to insert the AI response.'
                  }
                />
              </Form.Control>
              <Form.Description className="text-xs">
                Use{' '}
                <code className="rounded bg-muted px-1 py-0.5 font-mono">
                  {'{{ prevAction.text }}'}
                </code>{' '}
                to insert the AI agent&apos;s response.
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
      </Form>
    </div>
  );
};
