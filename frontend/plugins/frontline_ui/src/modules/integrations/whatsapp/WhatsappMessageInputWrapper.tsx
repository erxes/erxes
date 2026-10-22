import { useQuery } from '@apollo/client';
import { IconClockExclamation } from '@tabler/icons-react';
import { useQueryState } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { GET_CONVERSATION_MESSAGES } from '@/inbox/conversations/conversation-detail/graphql/queries/getConversationMessages';
import { useWhatsappTranslation } from './translations';

/** WhatsApp accepts free-form replies only this long after the customer's last message. */
const WHATSAPP_SERVICE_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * When the customer last wrote, read from the newest messages page that the
 * conversation view already loads (same query and variables, so it is served
 * from the Apollo cache and kept current by that view's subscriptions).
 * Undefined when the customer's message is not on that page.
 */
const useLastCustomerMessageAt = (conversationId: string) => {
  const { data } = useQuery(GET_CONVERSATION_MESSAGES, {
    variables: { conversationId, limit: 10, skip: 0 },
    fetchPolicy: 'cache-first',
    skip: !conversationId,
  });

  const lastCustomerMessage = [...(data?.conversationMessages || [])]
    .reverse()
    .find((message) => message?.customerId && !message.internal);

  return lastCustomerMessage?.createdAt
    ? new Date(lastCustomerMessage.createdAt).getTime()
    : undefined;
};

/** True once the window has passed; flips on time while the conversation stays open. */
const useWindowClosed = (lastCustomerMessageAt?: number) => {
  const closesAt =
    lastCustomerMessageAt === undefined
      ? undefined
      : lastCustomerMessageAt + WHATSAPP_SERVICE_WINDOW_MS;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());

    if (closesAt === undefined || closesAt <= Date.now()) return;

    const timer = setTimeout(() => setNow(Date.now()), closesAt - Date.now());

    return () => clearTimeout(timer);
  }, [closesAt]);

  return closesAt !== undefined && now >= closesAt;
};

/**
 * Warns above the composer once WhatsApp's 24-hour customer service window
 * has closed. The composer stays usable for internal notes; a reply would be
 * rejected by WhatsApp, which also adds a failure note to the conversation.
 */
export const WhatsappMessageInputWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { t } = useWhatsappTranslation();
  const [conversationId] = useQueryState<string>('conversationId');
  const windowClosed = useWindowClosed(
    useLastCustomerMessageAt(conversationId || ''),
  );

  if (!windowClosed) return children;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <output className="flex items-start gap-2 border-b bg-warning/10 px-4 py-2 text-xs">
        <IconClockExclamation className="mt-0.5 size-4 shrink-0 text-warning" />
        <span className="flex flex-col">
          <span className="font-medium text-foreground">
            {t('windowClosedTitle')}
          </span>
          <span className="text-muted-foreground">
            {t('windowClosedDescription')}
          </span>
        </span>
      </output>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
};
