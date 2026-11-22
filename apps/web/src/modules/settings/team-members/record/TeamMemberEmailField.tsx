import type { User } from '@erxes/core-contract';
import { IconCircleDashed, IconCircleDashedCheck } from '@tabler/icons-react';
import { Badge, Input, Popover, RecordTableInlineCell } from 'erxes-ui';
import { type ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMemberPermissions, useTeamMemberEdit } from '../useTeamMembers';

/** Not verified until the member can sign in; nothing to verify for one who doesn't. */
const EmailStatus = ({ user }: { user: User }) => {
  if (!user.canSignIn) return null;

  if (user.status === 'invited') {
    return <IconCircleDashed size={16} className="text-muted-foreground" />;
  }

  return <IconCircleDashedCheck size={16} className="text-success" />;
};

export const TeamMemberEmailField = ({ user }: { user: User }) => {
  const { t } = useTranslation('workspace', { keyPrefix: 'team-member' });
  const { id } = user;
  const email = user.email ?? '';
  const [draft, setDraft] = useState(email);
  const [open, setOpen] = useState(false);
  const edit = useTeamMemberEdit();
  const permissions = useMemberPermissions(user);

  // A member who doesn't sign in may have no email at all.
  const shown = email ? (
    <Badge variant="secondary" className="flex">
      <EmailStatus user={user} />
      {email}
    </Badge>
  ) : (
    <span className="text-muted-foreground">{t('no-email', 'No email')}</span>
  );

  if (!permissions?.canEditEmail) {
    return <RecordTableInlineCell>{shown}</RecordTableInlineCell>;
  }

  const onSave = () => {
    const next = draft.trim();

    // Whoever signs in keeps an email; a member who doesn't may clear theirs.
    if ((next || !user.canSignIn) && next !== email) {
      edit.mutate({ id, email: next || null }, { onError: () => setDraft(email) });
    } else {
      setDraft(email);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);

        if (next) setDraft(email);
        else onSave();
      }}
    >
      <RecordTableInlineCell.Trigger>{shown}</RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Input
          key={id}
          type="email"
          value={draft}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft(event.currentTarget.value)}
          onKeyDown={(event) => {
            // Enter while an IME composes picks a candidate.
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
              setOpen(false);
              onSave();
            }
          }}
        />
      </RecordTableInlineCell.Content>
    </Popover>
  );
};
