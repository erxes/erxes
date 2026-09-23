import React from 'react';
import { Skeleton } from 'erxes-ui';
import { useMailDrafts } from '../hooks/useMailDrafts';
import { MailDraftCard } from './MailDraftCard';
import { MailMessage } from './MailThread';

interface MailDraftsProps {
  conversationId?: string;
  messages: MailMessage[];
}

export const MailDrafts: React.FC<MailDraftsProps> = ({
  conversationId,
  messages,
}) => {
  const { drafts, loading, error, saveDraft, approveDraft, removeDraft } =
    useMailDrafts(conversationId);

  if (error) {
    return (
      <p className="px-1 text-[12px] text-destructive/80">{error.message}</p>
    );
  }

  if (!drafts.length) {
    return loading ? <Skeleton className="h-32 w-full rounded-2xl" /> : null;
  }

  const sources = new Map(messages.map((message) => [message._id, message]));

  return (
    <div className="space-y-3">
      {drafts.map((draft) => (
        <MailDraftCard
          key={draft._id}
          draft={draft}
          source={
            draft.sourceMessageId
              ? sources.get(draft.sourceMessageId)
              : undefined
          }
          onSave={(edit, onSaved) => saveDraft(draft._id, edit, onSaved)}
          onApprove={() => approveDraft(draft._id)}
          onRemove={() => removeDraft(draft._id)}
        />
      ))}
    </div>
  );
};
