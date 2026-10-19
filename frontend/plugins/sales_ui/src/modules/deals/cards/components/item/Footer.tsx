import { SelectAssigneeDeal } from '@/deals/components/deal-selects/SelectAssigneeDeal';
import type { IDeal } from '@/deals/types/deals';
import { IconCalendar, IconNumber } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { CopyText, isDefined } from 'erxes-ui';

type Props = {
  createdAt: IDeal['createdAt'];
  id: string;
  assignedUsers?: IDeal['assignedUsers'];
  number?: IDeal['number'];
};

export const ItemFooter = ({
  number,
  createdAt,
  assignedUsers = [],
  id,
}: Props) => {
  return (
    <div className="flex justify-between items-center p-2">
      <div className="flex items-center gap-1 text-gray-500 text-xs">
        {number ? (
          <CopyText
            value={number}
            className="text-inherit hover:text-foreground"
          >
            <IconNumber className="size-4 shrink-0" />
            <span>{number}</span>
          </CopyText>
        ) : (
          <>
            <IconCalendar className="w-4 h-4" />
            <span>
              {createdAt ? dayjs(createdAt).format('MMM DD, YYYY') : ''}
            </span>
          </>
        )}
      </div>
      <SelectAssigneeDeal
        variant="card"
        mode="multiple"
        value={
          (assignedUsers ?? [])
            .filter(isDefined)
            .map((user) => user._id)
            .filter(isDefined) || ['']
        }
        id={id}
      />
    </div>
  );
};
