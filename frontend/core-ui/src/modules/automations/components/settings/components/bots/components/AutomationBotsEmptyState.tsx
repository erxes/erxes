import { IconRobot } from '@tabler/icons-react';

export const AutomationBotsEmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center mx-auto max-w-3xl ">
      <div className="flex flex-col items-center gap-4 max-w-sm">
        <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center">
          <IconRobot className="size-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            No automation bots available
          </h3>
          <p className="text-muted-foreground text-sm">
            There are no bot integrations enabled for this workspace yet. Once a
            bot integration is added, it will appear here.
          </p>
        </div>
      </div>
    </div>
  );
};
