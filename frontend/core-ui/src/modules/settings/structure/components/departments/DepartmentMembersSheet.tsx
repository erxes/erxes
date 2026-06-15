import { useQuery } from '@apollo/client';
import { Spinner, Table } from 'erxes-ui';
import { Sheet } from 'erxes-ui/components/sheet';
import { GET_DEPARTMENT_MEMBERS } from '../../graphql';
import { useState } from 'react';
import { IUser, MembersInline } from 'ui-modules';

const MemberRow = ({ member }: { member: IUser }) => {
  return (
    <Table.Row className="shadow-xs group">
      <Table.Cell className="font-medium border-none pl-2 w-auto">
        <MembersInline.Provider members={[member]} memberIds={[member._id]}>
          <span className="w-full flex gap-2 items-center">
            <span className="[1lh] flex items-center">
              <MembersInline.Avatar />
            </span>
            <MembersInline.Title />
          </span>
        </MembersInline.Provider>
      </Table.Cell>
      <Table.Cell className="border-none w-8" />
    </Table.Row>
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

  const members: IUser[] = data?.departmentDetail?.users || [];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <button className="w-full h-full font-medium text-sm hover:underline">
          {count}
        </button>
      </Sheet.Trigger>
      <Sheet.View className="flex flex-col w-80">
        <Sheet.Header>
          <Sheet.Title>
            {data?.departmentDetail?.title || 'Department'}
          </Sheet.Title>
        </Sheet.Header>
        <Sheet.Content className="flex-1 px-4 py-4 overflow-y-auto styled-scroll">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : error ? (
            <p className="px-2 py-4 text-destructive text-sm">
              Failed to load members
            </p>
          ) : members.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-16 text-center">
              <p className="font-medium text-muted-foreground">No members</p>
              <p className="mt-1 text-muted-foreground/70 text-sm">
                No team members in this department
              </p>
            </div>
          ) : (
            <div className="bg-sidebar pr-2 pb-2 pl-1 border border-sidebar border-t-4 border-l-4 rounded-lg">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head className="pl-2 w-auto">Member</Table.Head>
                    <Table.Head className="w-8" />
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {members.map((member) => (
                    <MemberRow key={member._id} member={member} />
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
