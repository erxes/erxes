import { useUserEdit } from '@/settings/team-member/hooks/useUserEdit';
import { IUser } from '@/settings/team-member/types';
import { IconCircleDashed, IconCircleDashedCheck } from '@tabler/icons-react';
import { Cell } from '@tanstack/table-core';
import { Badge, Input, RecordTableInlineCell, Popover } from 'erxes-ui';
import React, { useState } from 'react';

export const TeamMemberEmailField = ({
  cell,
}: {
  cell: Cell<IUser, unknown>;
}) => {
  const { email, _id, status } = cell.row.original;
  const [_email, setEmail] = useState(email);
  const [open, setOpen] = useState<boolean>(false);
  const { usersEdit } = useUserEdit();

  const onSave = () => {
    if (_email !== email) {
      usersEdit({
        variables: { _id, email: _email },
      });
    }
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const editingValue = event.currentTarget?.value || '';
    if (editingValue === email) return;
    setEmail(editingValue);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          onSave();
        }
      }}
    >
      <RecordTableInlineCell.Trigger>
        <Badge variant={'secondary'} className="flex items-center gap-1">
          <EmailStatus status={status} />
          {_email}
        </Badge>
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Input key={_id} value={_email} onChange={onChange} />
      </RecordTableInlineCell.Content>
    </Popover>
  );
};

const EmailStatus = ({ status }: { status: string }) => {
  if (!status || status === 'Not verified') {
    return <IconCircleDashed size={16} className="text-muted-foreground" />;
  }
  return <IconCircleDashedCheck size={16} className="text-success" />;
};
