import { IconPlus, IconRobot } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { Link } from 'react-router';
import { Can } from 'ui-modules';

export const AutomationAiAgentTableEmptyState = ({
  toCreateUrl,
}: {
  toCreateUrl: string;
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <div className="flex flex-col items-center gap-4 max-w-sm">
        <div className="relative">
          <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center">
            <IconRobot className="size-8 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No AI agents found</h3>
          <p className="text-muted-foreground text-sm">
            Create your first AI agent to start automating conversations with
            your customers.
          </p>
        </div>
        <Can action="automationsAiAgentAdd">
          <Button asChild>
            <Link to={toCreateUrl}>
              <IconPlus className="size-4" />
              Create First Agent
            </Link>
          </Button>
        </Can>
      </div>
    </div>
  );
};
