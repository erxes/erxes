import { IconPlus, IconUpload } from '@tabler/icons-react';
import { Avatar, Form, Textarea } from 'erxes-ui';
import { useReplyMessageAction } from '~/widgets/automations/modules/instagram/components/action/context/ReplyMessageProvider';
import { TBotMessageButton } from '~/widgets/automations/modules/instagram/components/action/states/replyMessageActionForm';
import { InstagramMessageProps } from '../../types/messageActionForm';
import { InstagramMessageButtonsGenerator } from '../InstagramMessageButtonsGenerator';
import { InputTextCounter } from '../InputTextCounter';

export const InstagramQuickRepliesMessage = ({
  index,
}: InstagramMessageProps<{ type: 'quickReplies' }>) => {
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
                <InstagramMessageButtonsGenerator
                  limit={13}
                  buttons={field.value || []}
                  setButtons={field.onChange}
                  addButtonContent={
                    <>
                      <IconPlus />
                      add quick reply
                    </>
                  }
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
