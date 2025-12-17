import { Table } from 'erxes-ui';
import { FrontlineCard } from './frontline-card/FrontlineCard';
import { GroupSelect } from './frontline-card/GroupSelect';

interface FrontlineReportBySourceProps {
  title: string;
  data?: {
    topPerforming?: {
      _id: string;
      count: number;
    }[];
    topConverting?: {
      _id: string;
      count: number;
    }[];
  };
  colSpan?: 1 | 2;
  onColSpanChange?: (span: 1 | 2) => void;
}

export const FrontlineReportBySource = ({
  title,
  data,
  colSpan = 2,
  onColSpanChange,
}: FrontlineReportBySourceProps) => {
  const id = title.toLowerCase().replace(/\s+/g, '-');

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
                <Table.Head className="w-32">Source</Table.Head>
                <Table.Head>Data</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data?.topPerforming?.map((item) => (
                <Table.Row key={item._id}>
                  <Table.Cell className="px-4 text-xs">{item._id}</Table.Cell>
                  <Table.Cell className="px-4 text-xs">{item.count}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </FrontlineCard.Content>
    </FrontlineCard>
  );
};
