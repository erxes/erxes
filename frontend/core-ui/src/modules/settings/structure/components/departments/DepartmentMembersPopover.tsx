import { useQuery } from '@apollo/client';
import { Popover, Spinner } from 'erxes-ui';
import { GET_DEPARTMENT_MEMBERS } from '../../graphql';
import { useState } from 'react';

interface IMember {
  _id: string;
  email: string;
  details?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

const MemberRow = ({ member }: { member: IMember }) => {
  const name =
    [member.details?.firstName, member.details?.lastName]
      .filter(Boolean)
      .join(' ') || member.email;

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      {member.details?.avatar ? (
        <img
          src={member.details.avatar}
          alt={name}
          className="w-7 h-7 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
          <span className="text-xs font-medium text-muted-foreground">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
        {name !== member.email && (
          <p className="text-xs text-muted-foreground truncate">
            {member.email}
          </p>
        )}
      </div>
    </div>
  );
};

export const DepartmentMembersPopover = ({
  departmentId,
  count,
}: {
  departmentId: string;
  count: number;
}) => {
  const [open, setOpen] = useState(false);

  const { data, loading } = useQuery(GET_DEPARTMENT_MEMBERS, {
    variables: { id: departmentId },
    skip: !open,
  });

  const members: IMember[] = data?.departmentDetail?.users || [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="w-full h-full text-sm font-medium hover:underline">
          {count}
        </button>
      </Popover.Trigger>
      <Popover.Content className="w-64 p-0" align="start">
        <div className="px-3 py-2 border-b">
          <p className="text-sm font-medium">Members ({count})</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : members.length === 0 ? (
          <p className="text-sm text-muted-foreground px-3 py-4">No members</p>
        ) : (
          <div className="max-h-64 overflow-y-auto styled-scroll">
            {members.map((member) => (
              <MemberRow key={member._id} member={member} />
            ))}
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
};
