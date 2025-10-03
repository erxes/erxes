import { AddMembers } from '@/team/components/members/AddMembers';
import { useGetTeamMembers } from '@/team/hooks/useGetTeamMembers';
import { useTeamMemberRemove } from '@/team/hooks/useTeamMemberRemove';
import { useTeamMemberUpdate } from '@/team/hooks/useTeamMemberUpdate';
import { ITeamMember } from '@/team/types';
import { IconX } from '@tabler/icons-react';
import { Button, Select, Skeleton, Table } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useParams } from 'react-router';
import { currentUserState, MembersInline } from 'ui-modules';

export function Members() {
  const currentUser = useAtomValue(currentUserState);
  const { id: teamId } = useParams();
  const { members, loading } = useGetTeamMembers({ teamIds: teamId });
  const { updateTeamMember } = useTeamMemberUpdate();
  const { removeTeamMember } = useTeamMemberRemove();

  const roleHandler = (value: string, _id: string) => {
    updateTeamMember({
      variables: {
        _id,
        role: value,
      },
    });
  };

  const removeHandler = (teamId: string, memberId: string) => {
    removeTeamMember({
      variables: {
        teamId,
        memberId,
      },
    });
  };

  const renderMemberRemove = (member: ITeamMember) => {
    if (member.role === 'admin' || member.memberId === currentUser?._id) {
      return null;
    }

    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => removeHandler(member.teamId, member.memberId)}
        className="hidden group-hover:flex "
      >
        <IconX className="size-4" />
      </Button>
    );
  };

  return (
    <div className="px-8">
      <div className="ml-auto flex justify-between py-6">
        <h1 className="text-xl font-semibold">Members</h1>
        <AddMembers />
      </div>
      <div className="bg-sidebar border border-sidebar pl-1 border-t-4 border-l-4 pb-2 pr-2 rounded-lg">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head className="pl-2 w-auto">Member</Table.Head>
              <Table.Head className="w-52">Role</Table.Head>
              <Table.Head className="w-8" />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <MemberRowSkeleton key={index} />
                ))
              : members?.map((member) => (
                  <Table.Row key={member._id} className="shadow-xs group ">
                    <Table.Cell className="font-medium border-none pl-2 w-auto">
                      <MembersInline.Provider memberIds={[member.memberId]}>
                        <span className="w-full flex gap-2 items-center">
                          <span className="[1lh] flex items-center">
                            <MembersInline.Avatar />
                          </span>
                          <MembersInline.Title />
                        </span>
                      </MembersInline.Provider>
                    </Table.Cell>
                    <Table.Cell className="border-none px-2 w-52 ">
                      <Select
                        value={member.role}
                        onValueChange={(value) =>
                          roleHandler(value, member._id)
                        }
                      >
                        <Select.Trigger className="w-full h-7 hover:bg-accent-foreground/10 shadow-none">
                          <Select.Value placeholder="Select role" />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="admin">
                            <p className="text-xs">Admin</p>
                          </Select.Item>
                          <Select.Item value="lead">
                            <p className="text-xs">Lead</p>
                          </Select.Item>
                          <Select.Item value="member">
                            <p className="text-xs">Member</p>
                          </Select.Item>
                        </Select.Content>
                      </Select>
                    </Table.Cell>
                    <Table.Cell className="border-none w-8 ">
                      {renderMemberRemove(member)}
                    </Table.Cell>
                  </Table.Row>
                ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}

const MemberRowSkeleton = () => {
  return (
    <Table.Row className="shadow-xs">
      <Table.Cell className="font-medium border-none pl-2 w-auto">
        <div className="flex gap-2 items-center">
          <Skeleton className="h-6 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </Table.Cell>
      <Table.Cell className="border-none px-2 w-52">
        <Skeleton className="h-7 w-full" />
      </Table.Cell>
      <Table.Cell className="border-none w-8">
        <Skeleton className="size-6" />
      </Table.Cell>
    </Table.Row>
  );
};
