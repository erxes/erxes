import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Textarea, toast } from 'erxes-ui';
import { useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { Attributes, AutomationActionFormProps } from 'ui-modules';
import { InputTextCounter } from '~/widgets/automations/modules/facebook/components/action/components/InputTextCounter';
import {
  commentActionFormSchema,
  TCommentActionForm,
} from '~/widgets/automations/modules/facebook/components/action/states/replyCommentActionForm';

export const CommentActionForm = ({
  formRef,
  currentAction,
  onSaveActionConfig,
}: AutomationActionFormProps) => {
  const form = useForm<TCommentActionForm>({
    resolver: zodResolver(commentActionFormSchema),
    defaultValues: { ...(currentAction?.config || {}) },
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
    <div className="!w-2xl p-4">
      <Form {...form}>
        <Form.Field
          control={control}
          name="text"
          render={({ field }) => (
            <Form.Item>
              <Form.Label className="flex flex-row justify-between ">
                <div className="flex flex-row gap-2 items-center">
                  Text
                  <InputTextCounter
                    count={field.value?.length || 0}
                    limit={8000}
                  />
                </div>
                <Attributes
                  contentType="frontline:facebook.comments"
                  value={field.value}
                  onSelect={field.onChange}
                  buttonText="Attributes"
                />
              </Form.Label>
              <Form.Control>
                <Textarea {...field} placeholder="Enter your text" />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="attachments"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Attachments</Form.Label>
              <Form.Control>
                <Button disabled variant="secondary">
                  Upload Attachments (Work in progress)
                </Button>
              </Form.Control>
            </Form.Item>
          )}
        />
      </Form>
    </div>
  );
};
