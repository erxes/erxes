import type { User } from '@erxes/core-contract';
import { IconCircleDashed, IconCircleDashedCheck } from '@tabler/icons-react';
import { Badge, Input, Popover, RecordTableInlineCell } from 'erxes-ui';
import { type ChangeEvent, useState } from 'react';
import { useMemberPermissions, useTeamMemberEdit } from '../useTeamMembers';

/** Not verified until the member can sign in. */
export const EmailStatus = ({ status }: { status: User['status'] }) => {
  if (status === 'invited') {
    return <IconCircleDashed size={16} className="text-muted-foreground" />;
  }

  return <IconCircleDashedCheck size={16} className="text-success" />;
};

export const TeamMemberEmailField = ({ user }: { user: User }) => {
  const { email, id, status } = user;
  const [draft, setDraft] = useState(email);
  const [open, setOpen] = useState(false);
  const edit = useTeamMemberEdit();
  const permissions = useMemberPermissions(user);

  const badge = (
    <Badge variant="secondary" className="flex items-center gap-1">
      <EmailStatus status={status} />
      {email}
    </Badge>
  );

  if (!permissions?.canEditEmail) {
    return <RecordTableInlineCell>{badge}</RecordTableInlineCell>;
  }

  const onSave = () => {
    const next = draft.trim();

    if (next && next !== email) {
      edit.mutate({ id, email: next }, { onError: () => setDraft(email) });
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
      <RecordTableInlineCell.Trigger>{badge}</RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Input
          key={id}
          type="email"
          value={draft}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              setOpen(false);
              onSave();
            }
          }}
        />
      </RecordTableInlineCell.Content>
    </Popover>
  );
};
