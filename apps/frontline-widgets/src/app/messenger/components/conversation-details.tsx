import { useMemo, useEffect, useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useConversationDetail } from '../hooks/useConversationDetail';
import {
  connectionAtom,
  conversationIdAtom,
  messengerDataAtom,
  operatorStatusAtom,
  setConversationIdAtom,
  widgetReplyToAtom,
} from '../states';
import { useChangeOperatorStatus } from '../hooks/useChangeOperatorStatus';
import { Skeleton, toast } from 'erxes-ui';
import { useMessenger } from '../hooks/useMessenger';
import { useInsertMessage } from '../hooks/useInsertMessage';
import type { IAttachment } from '../types';
import { getMessageText } from '../utils/quotedMessage';
import { isBotMessage } from '../utils/messageGrouping';
import { ConversationDetailsHeader } from './conversation/details-header';
import { ConversationThread } from './conversation/thread';

export const ConversationDetails = () => {
  const conversationId = useAtomValue(conversationIdAtom);
  const messengerConnectData = useAtomValue(messengerDataAtom);
  const connection = useAtomValue(connectionAtom);
  const { goBack } = useMessenger();
  const { widgetsMessengerConnect } = connection || {};
  const { messengerData } = widgetsMessengerConnect || {};
  const {
    botGreetMessage,
    botShowInitialMessage,
    getStarted,
    messages: messagesConfig,
    responseRate,
    isOnline,
    aiAgentLabel,
  } = messengerData || {};

  const { insertMessage } = useInsertMessage();
  const setConversationId = useSetAtom(setConversationIdAtom);
  const setReplyTo = useSetAtom(widgetReplyToAtom);

  const handleReplyMessage = (
    authorName: string,
    content?: string,
    attachments?: IAttachment[],
  ) => {
    setReplyTo({
      authorName,
      content: getMessageText(content, attachments) || 'Attachment',
    });
  };

  const handleCopyMessage = async (
    content?: string,
    attachments?: IAttachment[],
  ) => {
    const text = getMessageText(content, attachments);

    try {
      if (!text) throw new Error('This message has no text to copy.');

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        textarea.remove();
        if (!copied) throw new Error('Clipboard access is unavailable.');
      }

      toast({ description: 'Message copied', variant: 'success' });
    } catch (error) {
      toast({
        title: 'Could not copy message',
        description:
          error instanceof Error
            ? error.message
            : 'Select the message text and copy it manually.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    setReplyTo(null);
  }, [conversationId, setReplyTo]);

  const handleGetStarted = useCallback(() => {
    insertMessage({
      variables: { message: 'Get Started', contentType: 'getStarted' },
      onCompleted: (data) => {
        const newConversationId = data?.widgetsInsertMessage?.conversationId;
        if (newConversationId && !conversationId) {
          setConversationId(newConversationId);
        }
      },
    });
  }, [insertMessage, conversationId, setConversationId]);

  const handleQuickReply = useCallback(
    (title: string) => {
      insertMessage({
        variables: { message: title, contentType: 'quickReply' },
      });
    },
    [insertMessage],
  );

  const handleTicketFormSubmit = useCallback(
    (payload: Record<string, string>) => {
      insertMessage({
        variables: {
          message: 'Ticket form submitted',
          contentType: 'ticketFormSubmission',
          payload: JSON.stringify(payload),
        },
      });
    },
    [insertMessage],
  );
  const { conversationDetail, loading, isBotTyping } = useConversationDetail({
    variables: {
      _id: conversationId,
      integrationId: messengerConnectData?.integrationId ?? '',
    },
    skip: !conversationId || !messengerConnectData?.integrationId,
  });
  const { messages } = conversationDetail || {};

  const [operatorStatus, setOperatorStatus] = useAtom(operatorStatusAtom);
  const { toggle: toggleOperator } = useChangeOperatorStatus();

  useEffect(() => {
    if (conversationDetail?.operatorStatus) {
      setOperatorStatus(conversationDetail.operatorStatus);
    }
  }, [conversationDetail?.operatorStatus, setOperatorStatus]);

  const handleToggleOperator = () => {
    if (!conversationId) return;
    const next = operatorStatus === 'operator' ? 'bot' : 'operator';
    toggleOperator(conversationId, next);
  };

  const lastAgentUser = useMemo(() => {
    if (!messages) return null;
    return (
      [...messages].reverse().find((m) => !m.customerId && !m.fromBot && m.user)
        ?.user ?? null
    );
  }, [messages]);

  const isLastMessageFromBot = useMemo(() => {
    if (!messages || messages.length === 0) return false;
    return isBotMessage(messages[messages.length - 1]);
  }, [messages]);

  const agentName =
    lastAgentUser?.details?.fullName ||
    lastAgentUser?.details?.firstName ||
    'Support';
  const agentAvatar = lastAgentUser?.details?.avatar;
  const subtitle = responseRate
    ? `usually replies in a few ${responseRate}`
    : 'usually replies in a few minutes';

  if (loading) {
    return <Skeleton className="w-full aspect-square" />;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ConversationDetailsHeader
        agentName={agentName}
        agentAvatar={agentAvatar}
        isLastMessageFromBot={isLastMessageFromBot}
        isOnline={isOnline}
        aiAgentLabel={aiAgentLabel}
        subtitle={subtitle}
        onBack={goBack}
      />
      <ConversationThread
        messages={messages}
        isBotTyping={isBotTyping}
        aiAgentLabel={aiAgentLabel}
        operatorStatus={operatorStatus}
        botShowInitialMessage={botShowInitialMessage}
        botGreetMessage={botGreetMessage}
        getStarted={getStarted}
        welcomeMessage={messagesConfig?.welcome}
        onToggleOperator={handleToggleOperator}
        onQuickReply={handleQuickReply}
        onTicketFormSubmit={handleTicketFormSubmit}
        onReply={handleReplyMessage}
        onCopy={handleCopyMessage}
        onGetStarted={handleGetStarted}
      />
    </div>
  );
};
