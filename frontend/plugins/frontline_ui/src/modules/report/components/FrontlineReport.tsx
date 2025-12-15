import { FrontlineCard } from './frontline-card/FrontlineCard';
import { GroupSelect } from './frontline-card/GroupSelect';

export const FrontlineReport = ({ title }: { title: string }) => {
  return (
    <FrontlineCard
      title={title}
      description="Total conversations open in the last 30 days"
    >
      <FrontlineCard.Header filter={<GroupSelect />} />
      <FrontlineCard.Content>
        <div>Chart</div>
      </FrontlineCard.Content>
    </FrontlineCard>
  );
};
