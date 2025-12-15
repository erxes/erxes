import { FrontlineReport } from './FrontlineReport';
import { InfoCard } from 'erxes-ui';

export const FrontlineReportsList = () => {
  return (
    <div className="flex flex-col overflow-hidden h-full relative m-3 gap-3">
      <div className="grid grid-cols-4 gap-4">
        <InfoCard title="Open">
          <InfoCard.Content className="text-center">
            <div>3 / 5%</div>
          </InfoCard.Content>
        </InfoCard>
        <InfoCard title="Close">
          <InfoCard.Content className="text-center">
            <div>300 / 95%</div>
          </InfoCard.Content>
        </InfoCard>
        <InfoCard title="Top Perporming Source">
          <InfoCard.Content className="text-center">
            <div>200 / 70%</div>
          </InfoCard.Content>
        </InfoCard>
        <InfoCard title="Top converting Source">
          <InfoCard.Content className="text-center">
            <div>100 / 30%</div>
          </InfoCard.Content>
        </InfoCard>
      </div>
      <FrontlineReport title="Conversation Open" />
      <FrontlineReport title="Conversation Resolved" />
      <FrontlineReport title="Conversation Source" />
      <FrontlineReport title="Conversation Tag" />
      <FrontlineReport title="Conversation Responses" />
      <FrontlineReport title="Conversation List" />
    </div>
  );
};
