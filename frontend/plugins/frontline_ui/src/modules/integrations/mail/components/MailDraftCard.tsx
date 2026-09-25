import {
  IconAlertTriangle,
  IconPencil,
  IconSend,
  IconSparkles,
  IconTrash,
} from '@tabler/icons-react';
import {
  Button,
  Spinner,
  formatDateISOStringToRelativeDate,
  useConfirm,
} from 'erxes-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MailDraft, MailDraftEdit } from '../hooks/useMailDrafts';
import { EmailBody } from './EmailBody';
import { MailDraftEditForm } from './MailDraftEditForm';
import { MailMessage } from './MailThread';

type TDraftTask = 'save' | 'approve' | 'remove';

interface MailDraftCardProps {
  draft: MailDraft;
  source?: MailMessage;
  onSave: (edit: MailDraftEdit, onSaved: () => void) => Promise<unknown>;
  onApprove: () => Promise<unknown>;
  onRemove: () => Promise<unknown>;
}

const describeSource = (source?: MailMessage) => {
  const sender = source?.mailData.from?.[0];

  return sender?.name || sender?.email || '';
};

export const MailDraftCard: React.FC<MailDraftCardProps> = ({
  draft,
  source,
  onSave,
  onApprove,
  onRemove,
}) => {
  const { t } = useTranslation('frontline');
  const { confirm } = useConfirm();
  const [editing, setEditing] = useState(false);
  const [task, setTask] = useState<TDraftTask | null>(null);

  const sending = draft.status === 'sending' || task === 'approve';
  const busy = Boolean(task) || draft.status === 'sending';

  const run = (next: TDraftTask, action: () => Promise<unknown>) => {
    setTask(next);
    action().finally(() => setTask(null));
  };

  const save = (edit: MailDraftEdit) =>
    run('save', () => onSave(edit, () => setEditing(false)));

  const remove = () =>
    confirm({
      message: t(
        'mail-draft-delete-confirm',
        'Delete this draft? The reply will not be sent.',
      ),
    }).then(() => run('remove', onRemove));

  const sourceName = describeSource(source);
  const sourceTime = source?.createdAt ?? draft.createdAt;

  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/[0.03] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.12)]">
      <div className="flex items-center justify-between gap-2 px-4 h-10 border-b border-primary/20 bg-primary/[0.06]">
        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-primary">
          <IconSparkles size={14} />
          {t('mail-draft-title', 'AI draft')}
        </span>
        <span className="text-[11px] text-muted-foreground truncate">
          {sourceName
            ? t('mail-draft-replying-to', 'Reply to {{name}}', {
                name: sourceName,
              })
            : `${t('to', 'To')}: ${(draft.to ?? []).join(', ')}`}
          {sourceTime && ` · ${formatDateISOStringToRelativeDate(sourceTime)}`}
        </span>
      </div>

      {draft.senderMismatch && (
        <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/5 px-3 py-2 text-[12px] font-medium text-warning">
          <IconAlertTriangle size={14} className="flex-none" />
          {t(
            'mail-draft-unverified-sender',
            'This reply answers an unverified sender. Check the address before sending.',
          )}
        </div>
      )}

      {editing ? (
        <MailDraftEditForm
          subject={draft.subject}
          body={draft.body}
          saving={task === 'save'}
          onSave={save}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <div className="px-4 py-2">
            <p className="text-[13px] font-medium text-foreground pb-1">
              {draft.subject || t('no-subject', '(No subject)')}
            </p>
            <EmailBody body={draft.body} />
          </div>

          <div className="flex items-center gap-2 px-4 h-12 border-t border-primary/20">
            <Button
              size="sm"
              onClick={() => run('approve', onApprove)}
              disabled={busy}
            >
              {sending ? <Spinner size="sm" /> : <IconSend size={14} />}
              {t('mail-draft-send', 'Send')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(true)}
              disabled={busy}
            >
              <IconPencil size={14} />
              {t('edit', 'Edit')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto text-destructive hover:text-destructive"
              onClick={remove}
              disabled={busy}
            >
              {task === 'remove' ? (
                <Spinner size="sm" />
              ) : (
                <IconTrash size={14} />
              )}
              {t('delete', 'Delete')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
