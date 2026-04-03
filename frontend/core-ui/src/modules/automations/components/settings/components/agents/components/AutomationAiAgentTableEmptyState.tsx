import { IconPlus, IconRobot } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { Link } from 'react-router';

export const AutomationAiAgentTableEmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
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
        <Button asChild>
          <Link to="/settings/automations/agents/create">
            <IconPlus className="size-4" />
            Create First Agent
          </Link>
        </Button>
      </div>
    </div>
  );
};
