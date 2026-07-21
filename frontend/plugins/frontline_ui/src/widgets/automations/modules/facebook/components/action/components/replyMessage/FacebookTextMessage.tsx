import { Form, Textarea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { FacebookMessageProps } from '~/widgets/automations/modules/facebook/components/action/types/messageActionForm';
import { FacebookMessageButtonsGenerator } from '../FacebookMessageButtonsGenerator';
import { InputTextCounter } from '../InputTextCounter';
import { useReplyMessageAction } from '~/widgets/automations/modules/facebook/components/action/context/ReplyMessageProvider';
import { TBotMessageButton } from '~/widgets/automations/modules/facebook/components/action/states/replyMessageActionForm';

export const FacebookTextMessage = ({
  index,
  message,
}: FacebookMessageProps<{ type: 'text' }>) => {
  const { t } = useTranslation('frontline');
  const { control, setValue } = useReplyMessageAction();
  const limit = (message.buttons || []).length ? 640 : 2000;

  const handleButtonsChange = (
    buttons: TBotMessageButton[],
    onChange: (buttons: TBotMessageButton[]) => void,
  ) => {
    // Adding a button drops the text limit from 2000 to 640
    const text = message.text || '';
    if (buttons.length && text.length > 640) {
      setValue(`messages.${index}.text`, text.slice(0, 640).trim());
    }
    onChange(buttons);
  };

  return (
    <div className="flex flex-col gap-2">
      <Form.Field
        control={control}
        name={`messages.${index}.text`}
        render={({ field }) => (
          <Form.Item>
            <Form.Label className="flex flex-row justify-between">
              {t('text')}
              <InputTextCounter
                count={field.value?.length || 0}
                limit={limit}
              />
            </Form.Label>
            <Form.Control>
              <Textarea {...field} maxLength={limit} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name={`messages.${index}.buttons`}
        render={({ field }) => (
          <Form.Item>
            <Form.Label className="flex flex-row justify-between">
              {t('button')}
              <InputTextCounter count={field.value?.length || 0} limit={3} />
            </Form.Label>
            <Form.Control>
              <FacebookMessageButtonsGenerator
                limit={3}
                buttons={field.value || []}
                setButtons={(buttons) =>
                  handleButtonsChange(buttons, field.onChange)
                }
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
