import { FrontlineCard } from './frontline-card/FrontlineCard';
import { GroupSelect } from './frontline-card/GroupSelect';

interface FrontlineReportProps {
  title: string;
  data?: any;
  colSpan?: 1 | 2;
  onColSpanChange?: (span: 1 | 2) => void;
}

export const FrontlineReport = ({ title, data, colSpan = 2, onColSpanChange }: FrontlineReportProps) => {
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
        <div>Chart</div>
      </FrontlineCard.Content>
    </FrontlineCard>
  );
};
