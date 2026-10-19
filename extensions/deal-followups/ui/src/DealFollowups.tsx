import { IconCalendarClock, IconCheck } from '@tabler/icons-react';
import { useMutation, useQuery } from 'erxes-sdk/react';
import { Badge, Button, Empty, Select, Spinner, Table, toast } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Can } from 'ui-modules';
import {
  api,
  dealUrl,
  errorMessage,
  formatDay,
  PER_PAGE,
  today,
  type StoredFollowUp,
} from './api';

const DUE = 'due';
const ALL = 'all';

const DueBadge = ({ dueDate }: { dueDate: string }) => {
  const now = today();

  if (dueDate < now) {
    return <Badge variant="destructive">Overdue {formatDay(dueDate)}</Badge>;
  }

  if (dueDate === now) {
    return <Badge variant="warning">Today</Badge>;
  }

  return <Badge variant="secondary">{formatDay(dueDate)}</Badge>;
};

export const DealFollowups = () => {
  const [show, setShow] = useState(DUE);
  const [page, setPage] = useState(1);

  const {
    data: list,
    error,
    loading,
    refetch,
  } = useQuery(api.followUps.list, {
    until: show === DUE ? today() : undefined,
    page,
    perPage: PER_PAGE,
  });
  const { mutate: clear } = useMutation(api.followUps.clear);

  const totalCount = list?.totalCount ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / PER_PAGE));

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const markDone = async (followUp: StoredFollowUp) => {
    try {
      await clear({ dealId: followUp.dealId });
      toast({
        title: `Done: ${followUp.dealName ?? 'deal'}`,
        variant: 'success',
      });
    } catch (err) {
      toast({
        title: 'Could not mark follow-up done',
        description: errorMessage(err),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 p-5 overflow-auto h-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Follow-ups</h1>
          <p className="text-sm text-muted-foreground">
            Deals someone means to get back to. Set one from a deal's header.
          </p>
        </div>
        <Select
          value={show}
          onValueChange={(value) => {
            setShow(value);
            setPage(1);
          }}
        >
          <Select.Trigger className="w-48">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value={DUE}>Due today or earlier</Select.Item>
            <Select.Item value={ALL}>All follow-ups</Select.Item>
          </Select.Content>
        </Select>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-2 rounded border border-destructive/30 p-3 text-sm">
          <span className="text-destructive">{error}</span>
          <Button variant="outline" size="sm" onClick={refetch}>
            Try again
          </Button>
        </div>
      )}

      {!list && !error && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {list && list.list.length === 0 && (
        <Empty>
          <Empty.Header>
            <Empty.Media>
              <IconCalendarClock />
            </Empty.Media>
            <Empty.Title>
              {show === DUE ? 'Nothing due' : 'No follow-ups'}
            </Empty.Title>
            <Empty.Description>
              {pageCount > 1
                ? 'None on this page is on a deal you can see.'
                : show === DUE
                ? 'No follow-up is due today or overdue.'
                : 'Open a deal and use Follow up in its header to set one.'}
            </Empty.Description>
          </Empty.Header>
        </Empty>
      )}

      {list && list.list.length > 0 && (
        <div className={loading ? 'opacity-50' : undefined}>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Deal</Table.Head>
                <Table.Head>Due</Table.Head>
                <Table.Head>Note</Table.Head>
                <Table.Head>
                  <span className="sr-only">Actions</span>
                </Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {list.list.map((followUp) => (
                <Table.Row key={followUp._id}>
                  <Table.Cell className="font-medium">
                    <Link className="hover:underline" to={dealUrl(followUp)}>
                      {followUp.dealName ?? 'Untitled deal'}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <DueBadge dueDate={followUp.dueDate} />
                  </Table.Cell>
                  <Table.Cell className="max-w-md truncate text-muted-foreground">
                    {followUp.note}
                  </Table.Cell>
                  <Table.Cell>
                    <Can action="dealFollowups.followUps.manage">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markDone(followUp)}
                        >
                          <IconCheck />
                          Mark done
                        </Button>
                      </div>
                    </Can>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      )}

      {/* Rows on deals the viewer can't see are left out, so a page can be
          empty while later ones aren't. */}
      {list && pageCount > 1 && (
        <div className="flex items-center justify-end text-sm">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span>
              Page {page} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pageCount || loading}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
