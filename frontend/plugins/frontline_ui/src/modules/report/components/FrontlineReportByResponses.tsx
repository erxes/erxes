import { Skeleton, Table } from 'erxes-ui';
import { FrontlineCard } from './frontline-card/FrontlineCard';
import { GroupSelect } from './frontline-card/GroupSelect';
import { useConversationResponses } from '../hooks/useConversationResponses';

interface FrontlineReportByResponsesProps {
  title: string;
  colSpan?: 1 | 2;
  onColSpanChange?: (span: 1 | 2) => void;
}

export const FrontlineReportByResponses = ({
  title,
  colSpan = 2,
  onColSpanChange,
}: FrontlineReportByResponsesProps) => {
  const id = title.toLowerCase().replace(/\s+/g, '-');
  const { conversationResponses, loading } = useConversationResponses({
    variables: {
      filters: {
        limit: 10,
      },
    },
  });
  if (loading) return <Skeleton className="w-full h-48" />;

  return (
    <FrontlineCard
      id={id}
      title={title}
      description="Total conversations open in the last 30 days"
      colSpan={colSpan}
      onColSpanChange={onColSpanChange}
    >
      <FrontlineCard.Header filter={<GroupSelect />} />
      <FrontlineCard.Content>
        <div className="bg-sidebar w-full rounded-lg">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Response Name</Table.Head>
                <Table.Head className="w-28 text-right">Data</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {/* {conversationResponses?.map((item) => (
                <Table.Row key={item._id}>
                  <Table.Cell className="px-4 text-xs">{item.name}</Table.Cell>
                  <Table.Cell className="px-4 text-xs text-right">
                    {item.count} / {item.percentage}%
                  </Table.Cell>
                </Table.Row>
              ))} */}
            </Table.Body>
          </Table>
        </div>
      </FrontlineCard.Content>
    </FrontlineCard>
  );
};
