import { useChannelMemberRemove } from '@/channels/hooks/useChannelMemberRemove';
import { useChannelMemberUpdate } from '@/channels/hooks/useChannelMemberUpdate';
import { useGetChannelMembers } from '@/channels/hooks/useGetChannelMembers';
import { IChannelMember } from '@/channels/types';
import { IconX } from '@tabler/icons-react';
import { Button, Select, Skeleton, Table } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useParams } from 'react-router-dom';
import { currentUserState, MembersInline } from 'ui-modules';
import { AddMembers } from './AddMembers';

export function Members() {
  const currentUser = useAtomValue(currentUserState);
  const { id: channelId } = useParams<{ id: string }>();
  const { members, loading } = useGetChannelMembers({ channelIds: channelId });
  const { updateChannelMember } = useChannelMemberUpdate();
  const { removeChannelMember } = useChannelMemberRemove();

  const roleHandler = (value: string, id: string) => {
    updateChannelMember({
      variables: {
        id,
        role: value,
      },
    });
  };

  const removeHandler = (channelId: string, memberId: string) => {
    removeChannelMember({
      variables: {
        channelId,
        memberId,
      },
    });
  };
  const renderMemberRemove = (member: IChannelMember) => {
    if (member.role === 'admin' || member.memberId === currentUser?._id) {
      return null;
    }
    if (!channelId) return null;

    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => removeHandler(channelId, member.memberId)}
        className="hidden group-hover:flex "
      >
        <IconX className="size-4" />
      </Button>
    );
  };

  return (
    <div className="overflow-auto h-full px-8">
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
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-8 rounded-full" />
      </Table.Cell>
    </Table.Row>
  );
};
