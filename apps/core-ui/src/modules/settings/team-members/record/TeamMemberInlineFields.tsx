import type { User } from '@erxes/core-contract';
import { Badge, DatePicker, Input, Popover, RecordTableInlineCell } from 'erxes-ui';
import { useState } from 'react';
import { toYmd } from '~/components/inlineCells';
import { useMemberPermissions, useTeamMemberEdit } from '../useTeamMembers';

/** `YYYY-MM-DD` → old core-ui's `yyyy/MM/dd`. */
export const formatMemberDate = (value: string) => value.split('-').join('/');

/** A local date for the calendar (a plain `new Date('YYYY-MM-DD')` is UTC midnight). */
export const ymdToDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);

  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
};

/** Old employee id cell: a badge, edited in a popover and saved when it closes. */
export const TeamMemberEmployeeIdField = ({ user }: { user: User }) => {
  const { id, employeeId } = user;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(employeeId ?? '');
  const edit = useTeamMemberEdit();
  const permissions = useMemberPermissions(user);
  const value = (employeeId && <Badge variant="secondary">{employeeId}</Badge>) || '-';

  if (!permissions?.canEdit) {
    return <RecordTableInlineCell>{value}</RecordTableInlineCell>;
  }

  const onSave = () => {
    if (draft.trim() !== (employeeId ?? '')) edit.mutate({ id, employeeId: draft.trim() || null });
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);

        if (next) setDraft(employeeId ?? '');
        else onSave();
      }}
    >
      <RecordTableInlineCell.Trigger>{value}</RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Input
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
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

/** Old work started date cell: a calendar in a popover, saved when it closes. */
export const TeamMemberWorkStartedField = ({ user }: { user: User }) => {
  const { id, workStartedDate } = user;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string | null>(workStartedDate);
  const edit = useTeamMemberEdit();
  const permissions = useMemberPermissions(user);
  const value = workStartedDate ? formatMemberDate(workStartedDate) : 'YYYY/MM/DD';

  if (!permissions?.canEdit) {
    return <RecordTableInlineCell>{value}</RecordTableInlineCell>;
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);

        if (next) setDraft(workStartedDate);
        else if (draft !== workStartedDate) edit.mutate({ id, workStartedDate: draft });
      }}
    >
      <RecordTableInlineCell.Trigger>
        <span className={workStartedDate ? undefined : 'text-muted-foreground'}>{value}</span>
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="w-auto">
        <DatePicker
          defaultMonth={draft ? ymdToDate(draft) : undefined}
          value={draft ? ymdToDate(draft) : undefined}
          onChange={(date) => setDraft(date instanceof Date ? toYmd(date) : null)}
        />
      </RecordTableInlineCell.Content>
    </Popover>
  );
};
