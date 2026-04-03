import { IconRobot } from '@tabler/icons-react';

export const AutomationAiAgentsEmptyState = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      <div className="flex flex-col items-center gap-6 max-w-md">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-3xl scale-150"></div>
          <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 rounded-full p-8 border border-primary/10">
            <IconRobot className="size-24 text-primary/60" />
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-foreground">
            Select an AI Agent Type
          </h3>
          <p className="text-muted-foreground text-base leading-relaxed">
            Choose from the available AI agent types on the left to view and
            manage your automation agents.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="size-2 rounded-full bg-primary/40"></div>
          <span>Click on any agent type to get started</span>
        </div>
      </div>
    </div>
  );
};
