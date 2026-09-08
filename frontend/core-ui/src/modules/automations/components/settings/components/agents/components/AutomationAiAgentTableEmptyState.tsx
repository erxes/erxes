import { IconPlus, IconRobot } from '@tabler/icons-react';
import { Button, Empty } from 'erxes-ui';
import { Link } from 'react-router';
import { Can } from 'ui-modules';

export const AutomationAiAgentTableEmptyState = ({
  toCreateUrl,
}: {
  toCreateUrl: string;
}) => {
  return (
    <Empty className="my-8">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconRobot />
        </Empty.Media>
        <Empty.Title>No AI agents found</Empty.Title>
        <Empty.Description>
          Create your first AI agent to start automating conversations with your
          customers.
        </Empty.Description>
      </Empty.Header>
      <Can action="automationsAiAgentAdd">
        <Empty.Content>
          <Button asChild>
            <Link to={toCreateUrl}>
              <IconPlus className="size-4" />
              Create First Agent
            </Link>
          </Button>
        </Empty.Content>
      </Can>
    </Empty>
  );
};
