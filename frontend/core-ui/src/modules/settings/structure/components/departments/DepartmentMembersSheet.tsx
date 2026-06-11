import { useQuery } from '@apollo/client';
import { Spinner } from 'erxes-ui';
import { Sheet } from 'erxes-ui/components/sheet';
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
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-background">
      {member.details?.avatar ? (
        <img
          src={member.details.avatar}
          alt={name}
          className="w-8 h-8 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
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

export const DepartmentMembersSheet = ({
  departmentId,
  count,
}: {
  departmentId: string;
  count: number;
}) => {
  const [open, setOpen] = useState(false);

  const { data, loading, error } = useQuery(GET_DEPARTMENT_MEMBERS, {
    variables: { id: departmentId },
    skip: !open,
  });

  const members: IMember[] = data?.departmentDetail?.users || [];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <button className="w-full h-full text-sm font-medium hover:underline">
          {count}
        </button>
      </Sheet.Trigger>
      <Sheet.View className="w-80 flex flex-col">
        <Sheet.Header>
          <Sheet.Title>Members ({count})</Sheet.Title>
        </Sheet.Header>
        <Sheet.Content className="flex-1 overflow-y-auto styled-scroll px-4 py-4 space-y-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive px-2 py-4">
              Failed to load members
            </p>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground font-medium">No members</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                No team members in this department
              </p>
            </div>
          ) : (
            members.map((member) => (
              <MemberRow key={member._id} member={member} />
            ))
          )}
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
