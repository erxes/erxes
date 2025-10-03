import { Form, Textarea } from 'erxes-ui';
import { FacebookMessageProps } from '~/widgets/automations/modules/facebook/components/action/types/messageActionForm';
import { FacebookMessageButtonsGenerator } from './FacebookMessageButtonsGenerator';
import { InputTextCounter } from './InputTextCounter';
import { useReplyMessageAction } from '~/widgets/automations/modules/facebook/components/action/context/ReplyMessageProvider';

export const FacebookTextMessage = ({
  index,
  message,
}: FacebookMessageProps) => {
  const { control } = useReplyMessageAction();
  const limit = (message.buttons || []).length ? 640 : 2000;

  return (
    <div className="flex flex-col gap-2">
      <Form.Field
        control={control}
        name={`messages.${index}.text`}
        render={({ field }) => (
          <Form.Item>
            <Form.Label className="flex flex-row justify-between">
              Text
              <InputTextCounter
                count={field.value?.length || 0}
                limit={limit}
              />
            </Form.Label>
            <Form.Control>
              <Textarea {...field} />
            </Form.Control>
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name={`messages.${index}.buttons`}
        render={({ field }) => (
          <Form.Item>
            <Form.Label className="flex flex-row justify-between">
              Buttons
              <InputTextCounter count={field.value?.length || 0} limit={13} />
            </Form.Label>
            <Form.Control>
              <FacebookMessageButtonsGenerator
                limit={3}
                buttons={field.value || []}
                setButtons={field.onChange}
              />
            </Form.Control>
          </Form.Item>
        )}
      />
    </div>
  );
};
