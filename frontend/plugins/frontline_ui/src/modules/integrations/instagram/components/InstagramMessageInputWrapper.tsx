import { differenceInHours } from 'date-fns';
import { useInstagramConversationMessages } from '../hooks/useInstagramConversationMessages';
import { Alert, Button, Form, ToggleGroup } from 'erxes-ui';
import { IconExclamationCircle } from '@tabler/icons-react';
import { useAtomValue, useSetAtom } from 'jotai';
import { messageExtraInfoState } from '@/inbox/conversations/conversation-detail/states/messageExtraInfoState';
import { EnumInstagramTag } from '@/integrations/instagram/types/InstagramTypes';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { INSTAGRAM_TAG_FORM_SCHEMA } from '../constants/IgTagSchema';
import { z } from 'zod';
import { INSTAGRAM_MESSAGE_WINDOW_HOURS } from '@/integrations/instagram/constants/IgMessageWindow';

export const InstagramTaggingForm = () => {
  const setExtraInfo = useSetAtom(messageExtraInfoState);
  const form = useForm<z.infer<typeof INSTAGRAM_TAG_FORM_SCHEMA>>({
    resolver: zodResolver(INSTAGRAM_TAG_FORM_SCHEMA),
    defaultValues: {
      tag: EnumInstagramTag.CONFIRMED_EVENT_UPDATE,
    },
  });

  const onSubmit = (data: z.infer<typeof INSTAGRAM_TAG_FORM_SCHEMA>) => {
    setExtraInfo((prev) => ({ ...prev, tag: data.tag }));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
        <Form.Field
          name="tag"
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={field.value}
                  onValueChange={field.onChange}
                  className="gap-2"
                >
                  <ToggleGroup.Item
                    value={EnumInstagramTag.CONFIRMED_EVENT_UPDATE}
                  >
                    Confirmed event update
                  </ToggleGroup.Item>
                  <ToggleGroup.Item
                    value={EnumInstagramTag.POST_PURCHASE_UPDATE}
                  >
                    Post purchase update
                  </ToggleGroup.Item>
                  <ToggleGroup.Item value={EnumInstagramTag.ACCOUNT_UPDATE}>
                    Account update
                  </ToggleGroup.Item>
                </ToggleGroup>
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Button variant="secondary" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
};

export const InstagramMessageInputWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { instagramConversationMessages, loading } =
    useInstagramConversationMessages();

  const extraInfo = useAtomValue(messageExtraInfoState);

  const { createdAt: lastMessageDate } =
    instagramConversationMessages?.[instagramConversationMessages?.length - 1] ||
    {};

  if (loading) {
    return (
      <div className="flex-auto h-full px-6">
        <div className="rounded-lg bg-sidebar h-full mx-auto max-w-2xl" />
      </div>
    );
  }

  const isNotIn24Hours =
    differenceInHours(new Date(), new Date(lastMessageDate || '')) >
    INSTAGRAM_MESSAGE_WINDOW_HOURS;

  if (lastMessageDate && isNotIn24Hours && !extraInfo?.tag) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert className="">
          <IconExclamationCircle />
          <Alert.Title>
            Your last interaction with this contact was more than 24 hours ago.
          </Alert.Title>
          <Alert.Description>
            Only Tagged Messages are allowed outside the standard messaging
            window
            <InstagramTaggingForm />
          </Alert.Description>
        </Alert>
      </div>
    );
  }

  return children;
};
