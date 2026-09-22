import { IconRobot } from '@tabler/icons-react';
import { Empty } from 'erxes-ui';

export const AutomationBotsEmptyState = () => {
  return (
    <Empty className="my-8">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconRobot />
        </Empty.Media>
        <Empty.Title>No automation bots available</Empty.Title>
        <Empty.Description>
          There are no bot integrations enabled for this workspace yet. Once a
          bot integration is added, it will appear here.
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};
