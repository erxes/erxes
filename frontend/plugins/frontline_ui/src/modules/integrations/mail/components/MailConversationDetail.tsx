import { useQuery, useSubscription } from '@apollo/client';
import {
  BlockEditorReadOnly,
  Button,
  RelativeDateDisplay,
  ScrollArea,
} from 'erxes-ui';
import { IconLock, IconMailPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';

import {
  MAIL_CONVERSATION_DETAIL_QUERY,
  MAIL_MESSAGE_INSERTED_SUBSCRIPTION,
} from '@/integrations/mail/graphql/queries/mailQueries';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { hideMessageInputState } from '@/inbox/conversations/conversation-detail/states/isInternalState';
import { useMailSendMail } from '@/integrations/mail/hooks/useMailConversationDetail';
import { MailThread } from '@/integrations/mail/components/MailThread';
import type {
  MailComposePayload,
  MailMessage,
} from '@/integrations/mail/components/MailThread';
import { Attachments } from '@/inbox/conversation-messages/components/MessageAttachments';
import type { IMessage } from '@/inbox/types/Conversation';

const PAGE_SIZE = 20;

interface MailConversationDetailResponse {
  mailConversationDetail: {
    messages: MailMessage[];
    hasMore: boolean;
  } | null;
  conversationMessages: IMessage[];
}

const InternalNotes = ({ notes }: { notes: IMessage[] }) => {
  if (!notes.length) return null;

  return (
    <section className="overflow-hidden rounded-xl border border-warning/25 bg-warning/[0.04]">
      <div className="flex items-center gap-2 border-b border-warning/20 px-4 py-2.5 text-xs font-medium text-warning">
        <IconLock className="size-3.5" />
        Internal notes
        <span className="rounded-full bg-warning/10 px-1.5 py-0.5 text-[10px]">
          {notes.length}
        </span>
      </div>
      <div className="divide-y divide-warning/15">
        {notes.map((note) => (
          <article key={note._id} className="px-4 py-3">
            <BlockEditorReadOnly
              content={note.content}
              className="read-only internal-note text-sm leading-6"
            />
            <Attachments attachments={note.attachments} />
            <div className="mt-2 text-[11px] text-muted-foreground">
              <RelativeDateDisplay value={note.createdAt}>
                <RelativeDateDisplay.Value value={note.createdAt} />
              </RelativeDateDisplay>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const deriveContactEmail = (msgs: MailMessage[]) => {
  for (let index = msgs.length - 1; index >= 0; index -= 1) {
    const message = msgs[index];

    if (message.mailData.type === 'INBOX') {
      const email = message.mailData.from?.[0]?.email;
      if (email) return email;
    }
  }

  return '';
};

export const MailConversationDetail = () => {
  const {
    _id: conversationId,
    integration,
    customerId,
  } = useConversationContext();
  const setHideInput = useSetAtom(hideMessageInputState);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const { mailSendMail, loading: sending } = useMailSendMail();

  useEffect(() => {
    setHideInput(true);
    return () => setHideInput(false);
  }, [setHideInput]);

  const { data, previousData, loading, error, refetch } =
    useQuery<MailConversationDetailResponse>(MAIL_CONVERSATION_DETAIL_QUERY, {
      variables: { conversationId, limit },
      skip: !conversationId,
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    });

  useSubscription(MAIL_MESSAGE_INSERTED_SUBSCRIPTION, {
    variables: { _id: conversationId },
    skip: !conversationId,
    onData: () => refetch(),
  });

  const detail =
    data?.mailConversationDetail ?? previousData?.mailConversationDetail;
  const messages = detail?.messages ?? [];
  const internalNotes = (
    data?.conversationMessages ??
    previousData?.conversationMessages ??
    []
  ).filter((message) => message.internal);
  const contactEmail = deriveContactEmail(messages);

  const onSend = (payload: MailComposePayload, onSent: () => void) =>
    mailSendMail(
      {
        ...payload,
        integrationId: integration?._id ?? '',
        conversationId: conversationId ?? '',
      },
      onSent,
    );

  const startNewEmail = (email: string) => {
    if (!customerId) return;

    window.dispatchEvent(
      new CustomEvent('erxes:compose-email', {
        detail: { customerId, email, emails: [email] },
      }),
    );
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 p-4 pb-8">
        <MailThread
          messages={messages}
          hasMore={detail?.hasMore}
          loading={loading}
          sending={sending}
          error={error?.message}
          onLoadMore={() => setLimit((value) => value + PAGE_SIZE)}
          onSend={onSend}
          onNewEmail={startNewEmail}
        />
        {contactEmail && (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!customerId}
              onClick={() => startNewEmail(contactEmail)}
            >
              <IconMailPlus className="size-4" />
              New email
            </Button>
          </div>
        )}
        <InternalNotes notes={internalNotes} />
      </div>
    </ScrollArea>
  );
};
