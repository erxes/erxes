import { Form } from 'erxes-ui';
import { generateAutomationElementId } from 'ui-modules';
import { useReplyMessageAction } from '~/widgets/automations/modules/facebook/components/action/context/ReplyMessageProvider';
import { TBotMessageAttachment } from '../../states/replyMessageActionForm';
import { FacebookMessageProps } from '../../types/messageActionForm';
import { FileUploadSection } from '../FileUploadSection';

type TMediaMessageType = 'image' | 'audio' | 'video' | 'attachments';

const MEDIA_CONFIG: Record<
  TMediaMessageType,
  {
    fieldLabel: string;
    mimeType: string;
    limit: number;
  }
> = {
  image: {
    fieldLabel: 'Image',
    mimeType: 'image/*',
    limit: 25,
  },
  audio: {
    fieldLabel: 'Audio',
    mimeType: 'audio/*',
    limit: 25,
  },
  video: {
    fieldLabel: 'Video',
    mimeType: 'video/*',
    limit: 25,
  },
  attachments: {
    fieldLabel: 'Attachment',
    mimeType:
      '.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.ppt,.pptx,.zip,.rar,application/*',
    limit: 25,
  },
};

export const FacebookMediaMessage = ({
  index,
  message,
}: FacebookMessageProps<{ type: TMediaMessageType }>) => {
  const { control } = useReplyMessageAction();
  const config = MEDIA_CONFIG[message.type];

  if (message.type === 'attachments') {
    return (
      <Form.Field
        control={control}
        name={`messages.${index}.attachments`}
        render={({ field }) => {
          const attachment = field.value?.[0];

          return (
            <Form.Item>
              <Form.Label>{config.fieldLabel}</Form.Label>
              <Form.Control>
                <FileUploadSection
                  url={attachment?.url}
                  mimeType={config.mimeType}
                  limit={config.limit}
                  onUpload={(fileUrl) =>
                    field.onChange(
                      fileUrl
                        ? [
                            {
                              _id:
                                attachment?._id || generateAutomationElementId(),
                              url: fileUrl,
                              type: 'file',
                            } satisfies TBotMessageAttachment,
                          ]
                        : [],
                    )
                  }
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          );
        }}
      />
    );
  }

  return (
    <Form.Field
      control={control}
      name={`messages.${index}.${message.type}`}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{config.fieldLabel}</Form.Label>
          <Form.Control>
            <FileUploadSection
              url={field.value}
              mimeType={config.mimeType}
              limit={config.limit}
              onUpload={field.onChange}
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
