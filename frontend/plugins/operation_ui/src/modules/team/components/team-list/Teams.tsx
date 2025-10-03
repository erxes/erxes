import { Skeleton, Table, TextOverflowTooltip } from 'erxes-ui';
import { IconComponent } from 'erxes-ui';
import { useGetTeams } from '@/team/hooks/useGetTeams';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
export function Teams() {
  const { teams, loading } = useGetTeams();
  const navigate = useNavigate();

  const onClick = (teamId: string) => {
    navigate(`/settings/operation/team/details/${teamId}`);
  };
  return (
    <div className="overflow-auto h-full px-8">
      <div className="bg-sidebar border border-sidebar pl-1 border-t-4 border-l-4 pb-2 pr-2 rounded-lg">
        <Table>
          <Table.Header>
            <Table.Row className="rounded-t-md">
              <Table.Head className="w-auto rounded-tl-md pl-2">
                Title
              </Table.Head>
              <Table.Head className="w-20">Members</Table.Head>
              <Table.Head className="w-20">Tasks</Table.Head>
              <Table.Head className="w-32">Created At</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body className="">
            {loading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <TableRowSkeleton key={index} />
                ))
              : teams?.map((team) => (
                  <Table.Row
                    key={team._id}
                    onClick={() => onClick(team._id)}
                    className="hover:cursor-pointer shadow-xs "
                  >
                    <Table.Cell className="font-medium border-none pl-2 w-auto ">
                      <span className="w-full flex gap-2 text-base font-medium">
                        <span className="[1lh] flex items-center">
                          <IconComponent name={team.icon} className="size-4" />
                        </span>
                        <TextOverflowTooltip value={team.name} />
                      </span>
                    </Table.Cell>
                    <Table.Cell className="border-none px-2 w-20">
                      {team.memberCount}
                    </Table.Cell>
                    <Table.Cell className="border-none px-2 w-20">
                      {team.taskCount}
                    </Table.Cell>
                    <Table.Cell className="border-none px-2 w-32 text-muted-foreground">
                      {format(team.createdAt, 'MMM d, yyyy')}
                    </Table.Cell>
                  </Table.Row>
                ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}

const TableRowSkeleton = () => {
  return (
    <Table.Row className="shadow-xs">
      <Table.Cell className="w-auto pl-8 border-none">
        <Skeleton className="h-4 w-10" />
      </Table.Cell>
      <Table.Cell className="w-20 border-none">
        <Skeleton className="h-4 w-5" />
      </Table.Cell>
      <Table.Cell className="w-20 border-none">
        <Skeleton className="h-4 w-5" />
      </Table.Cell>
      <Table.Cell className="w-32 pr-8 border-none">
        <Skeleton className="h-4 w-16" />
      </Table.Cell>
    </Table.Row>
  );
};
