import { IconUpload } from '@tabler/icons-react';
import { Avatar, Form, Textarea } from 'erxes-ui';
import { useReplyMessageAction } from '~/widgets/automations/modules/facebook/components/action/context/ReplyMessageProvider';
import { TBotMessageButton } from '~/widgets/automations/modules/facebook/components/action/states/replyMessageActionForm';
import { FacebookMessageProps } from '../types/messageActionForm';
import { FacebookMessageButtonsGenerator } from './FacebookMessageButtonsGenerator';
import { InputTextCounter } from './InputTextCounter';

export const FacebookQuickRepliesMessage = ({
  index,
}: FacebookMessageProps) => {
  const { control } = useReplyMessageAction();
  return (
    <>
      <Form.Field
        control={control}
        name={`messages.${index}.text`}
        render={({ field }) => {
          return (
            <Form.Item>
              <InputTextCounter count={field.value?.length || 0} limit={640} />

              <Textarea {...field} />
            </Form.Item>
          );
        }}
      />
      <Form.Field
        control={control}
        name={`messages.${index}.quickReplies`}
        render={({ field }) => {
          return (
            <Form.Item>
              <Form.Label className="flex flex-row justify-between">
                Quick replies
                <InputTextCounter count={field.value?.length || 0} limit={13} />
              </Form.Label>
              <Form.Control>
                <FacebookMessageButtonsGenerator
                  limit={13}
                  buttons={field.value || []}
                  setButtons={field.onChange}
                  addButtonText="+ add quick reply"
                  ContentBeforeInput={QuickReplyImageUploader}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          );
        }}
      />
    </>
  );
};

const QuickReplyImageUploader = ({
  button,
  handleChangeButton,
}: {
  button: {
    disableRemoveButton?: boolean;
    image_url?: string;
  } & TBotMessageButton;
  handleChangeButton: (button: TBotMessageButton) => void;
}) => {
  return (
    <div className="p-2 mr-2 rounded-full border border-dashed ">
      <Avatar>
        <Avatar.Image src={button?.image_url} />
        <Avatar.Fallback>
          <IconUpload />
        </Avatar.Fallback>
      </Avatar>
    </div>
  );
};
