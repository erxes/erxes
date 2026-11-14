import type { User } from '@erxes/core-contract';
import { DatePicker, Popover, RecordTableInlineCell, toIsoDay } from 'erxes-ui';
import { useState } from 'react';
import { useMemberPermissions, useTeamMemberEdit } from '../useTeamMembers';

/** `YYYY-MM-DD` → `yyyy/MM/dd`. */
export const formatMemberDate = (value: string) => value.split('-').join('/');

/** A local date for the calendar (a plain `new Date('YYYY-MM-DD')` is UTC midnight). */
export const ymdToDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);

  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
};

/** Work start date cell: a calendar in a popover, saved when it closes. */
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
          onChange={(date) => setDraft(date instanceof Date ? toIsoDay(date) : null)}
        />
      </RecordTableInlineCell.Content>
    </Popover>
  );
};
