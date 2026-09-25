import { differenceInHours } from 'date-fns';
import { useEffect } from 'react';
import { useFacebookConversationMessages } from '@/integrations/facebook/hooks/useFacebookConversationMessages';
import { Button, Skeleton, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue } from 'jotai';
import { messageExtraInfoState } from '@/inbox/conversations/conversation-detail/states/messageExtraInfoState';
import { messageReplyState } from '@/inbox/conversations/conversation-detail/states/messageReplyState';
import { EnumFacebookTag } from '@/integrations/facebook/types/FacebookTypes';
import {
  FACEBOOK_HUMAN_AGENT_WINDOW_HOURS,
  FACEBOOK_MESSAGE_WINDOW_HOURS,
} from '@/integrations/facebook/constants/FbMessageWindow';

export const FacebookMessageInputWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { t } = useTranslation('frontline');
  const [conversationId] = useQueryState<string>('conversationId');
  const { facebookConversationMessages, loading } =
    useFacebookConversationMessages();

  const [extraInfo, setExtraInfo] = useAtom(messageExtraInfoState);
  const replyTo = useAtomValue(messageReplyState);

  // A tag chosen for one conversation must not leak into another one
  useEffect(() => {
    setExtraInfo(undefined);
    return () => setExtraInfo(undefined);
  }, [conversationId, setExtraInfo]);

  // Facebook measures both windows from the customer's last message.
  const lastCustomerMessage = [...(facebookConversationMessages || [])]
    .reverse()
    .find(
      (message) => message.customerId && !message.internal && !message.botData,
    );
  const lastMessage =
    facebookConversationMessages?.[facebookConversationMessages.length - 1];
  const referenceDate =
    lastCustomerMessage?.createdAt || lastMessage?.createdAt;
  const hoursSinceCustomerMessage = referenceDate
    ? differenceInHours(new Date(), new Date(referenceDate))
    : 0;

  useEffect(() => {
    if (
      !replyTo ||
      !referenceDate ||
      hoursSinceCustomerMessage < FACEBOOK_MESSAGE_WINDOW_HOURS ||
      hoursSinceCustomerMessage >= FACEBOOK_HUMAN_AGENT_WINDOW_HOURS ||
      extraInfo?.tag === EnumFacebookTag.HUMAN_AGENT
    ) {
      return;
    }

    setExtraInfo((prev) => ({ ...prev, tag: EnumFacebookTag.HUMAN_AGENT }));
  }, [
    replyTo,
    referenceDate,
    hoursSinceCustomerMessage,
    extraInfo?.tag,
    setExtraInfo,
  ]);

  if (loading) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center p-4">
        <Skeleton className="h-24 w-full max-w-lg rounded-lg" />
      </div>
    );
  }

  if (!referenceDate) {
    return children;
  }

  if (hoursSinceCustomerMessage >= FACEBOOK_HUMAN_AGENT_WINDOW_HOURS) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center overflow-hidden p-4">
        <div className="flex max-w-lg flex-col items-center gap-2 text-center">
          <p className="text-sm font-medium text-foreground">
            {t('fb-window-expired-title')}
          </p>
          <p className="text-xs leading-5 text-muted-foreground">
            {t('fb-window-expired-description')}
          </p>
        </div>
      </div>
    );
  }

  if (
    hoursSinceCustomerMessage >= FACEBOOK_MESSAGE_WINDOW_HOURS &&
    extraInfo?.tag !== EnumFacebookTag.HUMAN_AGENT
  ) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center overflow-hidden p-4">
        <div className="flex max-w-lg flex-col items-center gap-2 text-center">
          <p className="text-sm font-medium text-foreground">
            {t('fb-24h-window-title')}
          </p>
          <p className="text-xs leading-5 text-muted-foreground">
            {t('fb-24h-window-description')}
          </p>
          <div className="pt-1">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() =>
                setExtraInfo((prev) => ({
                  ...prev,
                  tag: EnumFacebookTag.HUMAN_AGENT,
                }))
              }
            >
              {t('fb-reply-as-human-agent')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};
