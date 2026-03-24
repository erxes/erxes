import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  Avatar,
  Button,
  formatDateISOStringToRelativeDate,
  formatDateISOStringToRelativeDateShort,
  ScrollArea,
  Separator,
} from 'erxes-ui';

import { IMAP_CONVERSATION_DETAIL_QUERY } from '../graphql/queries/imapQueries';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { formatDate } from 'date-fns';
import { IconArrowBackUp, IconMailForward } from '@tabler/icons-react';
import { useSetAtom } from 'jotai';
import {
  isInternalState,
  onlyInternalState,
} from '@/inbox/conversations/conversation-detail/states/isInternalState';

/* =====================
   Types
===================== */

interface EmailAddress {
  name?: string;
  email?: string;
  avatar?: string;
}

interface MailData {
  from?: EmailAddress[];
  to?: EmailAddress[];
  cc?: EmailAddress[];
  subject?: string;
  body?: string;
}

interface Conversation {
  _id: string;
  createdAt: string;
  mailData: MailData;
}

interface ImapConversationDetailResponse {
  imapConversationDetail: Conversation[];
}

/* =====================
   Utils
===================== */

const formatEmails = (emails?: EmailAddress[]) => {
  if (!emails || !emails.length) return '';
  return emails.map((e) => e.email).join(', ');
};

/* =====================
   Components
===================== */

const EmailMetaInfo: React.FC<{ mailData: MailData }> = ({ mailData }) => {
  const from = mailData.from?.[0];
  const to = mailData.to?.[0];
  const cc = mailData.cc?.[0];

  return (
    <div className="flex flex-col">
      <span className="px-3 h-11 w-full flex items-center gap-x-3">
        <strong className="text-muted-foreground font-medium max-w-12 w-full">
          From
        </strong>
        <Avatar size={'lg'}>
          <Avatar.Image src={from?.avatar} />
          <Avatar.Fallback>{from?.name?.[0]}</Avatar.Fallback>
        </Avatar>
        <span className="text-foreground font-semibold">{from?.name}</span>
        <span className="text-muted-foreground font-medium">
          {formatEmails(mailData.from)}
        </span>
      </span>

      <Separator />

      <span className="px-3 h-11 w-full flex items-center gap-x-3">
        <strong className="text-muted-foreground font-medium max-w-12 w-full">
          To
        </strong>
        <Avatar size={'lg'}>
          <Avatar.Fallback>{to?.name?.[0] || 'C'}</Avatar.Fallback>
        </Avatar>
        <span className="text-foreground font-semibold">{to?.name}</span>
        <span className="text-muted-foreground font-medium truncate">
          {formatEmails(mailData.to)}
        </span>
      </span>

      {mailData.cc && mailData.cc.length > 0 && (
        <>
          <Separator />
          <span className="px-3 h-11 w-full flex items-center gap-x-3">
            <strong className="text-muted-foreground font-medium max-w-12 w-full">
              Cc
            </strong>
            <Avatar size={'lg'}>
              <Avatar.Image src={cc?.avatar} />
              <Avatar.Fallback>{cc?.name?.[0] || 'C'}</Avatar.Fallback>
            </Avatar>
            <span className="text-foreground font-semibold">{cc?.name}</span>
            <span className="text-muted-foreground font-medium">
              {formatEmails(mailData.cc)}
            </span>
          </span>
        </>
      )}
    </div>
  );
};

const EmailActionsPanel = ({
  setReply,
}: {
  setReply: (reply: boolean) => void;
}) => (
  <div className="flex gap-x-2 px-3 pb-2">
    <Button
      className="flex-1"
      variant={'secondary'}
      onClick={() => setReply(true)}
    >
      <IconArrowBackUp />
      Reply
    </Button>
    <Button className="flex-1" variant={'secondary'}>
      <IconMailForward />
      Forward
    </Button>
  </div>
);

const ReplySection = ({ setReply }: { setReply: (reply: boolean) => void }) => {
  const [html, setHtml] = useState('');

  const handleSend = () => {
    if (!html.trim()) return;
    setHtml('');
    setReply(false);
  };

  const handleCancel = () => {
    setReply(false);
    setHtml('');
  };

  return (
    <div className="py-2 px-3">
      <div
        className="max-h-[140px] overflow-y-auto p-2.5 px-3 rounded border text-sm leading-relaxed focus:outline-none focus:border-primary [&_em]:italic [&_i]:italic"
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => setHtml(e.currentTarget.innerHTML)}
        role="textbox"
        aria-multiline="true"
      />
      <div className="flex justify-end gap-2.5 mt-2.5">
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleSend}>Send</Button>
      </div>
    </div>
  );
};

/* =====================
   Main
===================== */

export const ImapConversationDetail: React.FC = () => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [reply, setReply] = useState(false);
  const { _id } = useConversationContext();
  const setIsInternalNote = useSetAtom(isInternalState);
  const setOnlyInternal = useSetAtom(onlyInternalState);

  useEffect(() => {
    setIsInternalNote(true);
    setOnlyInternal(true);
  }, []);

  const { data, loading, error } = useQuery<ImapConversationDetailResponse>(
    IMAP_CONVERSATION_DETAIL_QUERY,
    {
      variables: { conversationId: _id },
      skip: !_id,
    },
  );

  if (loading) return <div className="p-10 text-center">Loading email…</div>;
  if (error)
    return <div className="p-10 text-center">Error: {error.message}</div>;

  const conversation = data?.imapConversationDetail?.[0];
  if (!conversation)
    return <div className="p-10 text-center">No email found</div>;

  const { mailData, createdAt } = conversation;

  return (
    <ScrollArea className="h-full max-h-[70vh]">
      <div className="flex flex-col max-w-2xl mx-auto p-6 box-border overflow-y-auto">
        <div className="bg-background rounded-lg shadow-sm">
          <EmailMetaInfo mailData={mailData} />
          <Separator />

          <iframe
            srcDoc={mailData.body}
            className="w-full h-full hide-scroll min-h-96"
            sandbox=""
            title="Email content"
          />
          <Separator />

          <div className="text-xs text-muted-foreground px-3 py-2">
            {formatDateISOStringToRelativeDate(createdAt)}
            {', '}
            {formatDate(createdAt, 'HH:mm')}
          </div>

          <EmailActionsPanel setReply={setReply} />
          {reply && <ReplySection setReply={setReply} />}
        </div>
      </div>
    </ScrollArea>
  );
};
