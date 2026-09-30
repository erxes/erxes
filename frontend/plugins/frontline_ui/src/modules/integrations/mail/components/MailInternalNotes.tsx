import {
  BlockEditorReadOnly,
  Button,
  RelativeDateDisplay,
  Spinner,
  toast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconLock } from '@tabler/icons-react';
import { Attachments } from '@/inbox/conversation-messages/components/MessageAttachments';
import type { IMessage } from '@/inbox/types/Conversation';

export const MailInternalNotes = ({
  notes,
  totalCount,
  onLoadMore,
}: {
  notes: IMessage[];
  totalCount: number;
  onLoadMore: () => Promise<unknown>;
}) => {
  const { t } = useTranslation('frontline');
  const [loadingMore, setLoadingMore] = useState(false);
  if (!totalCount) return null;

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      await onLoadMore();
    } catch {
      toast({ title: t('error-loading-data'), variant: 'destructive' });
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-xl border border-warning/25 bg-warning/[0.04]">
      <div className="flex items-center gap-2 border-b border-warning/20 px-4 py-2.5 text-xs font-medium text-warning">
        <IconLock className="size-3.5" />
        Internal notes
        <span className="rounded-full bg-warning/10 px-1.5 py-0.5 text-[10px]">
          {totalCount}
        </span>
      </div>
      {notes.length < totalCount && (
        <div className="border-t border-warning/15 px-4 py-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore && <Spinner size="sm" />}
            {t('show-earlier-messages')}
          </Button>
        </div>
      )}
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
