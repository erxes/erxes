import { useState } from 'react';
import { IconRobot, IconSettings } from '@tabler/icons-react';
import { Button, Skeleton, Tooltip } from 'erxes-ui';
import { IChatAgent } from '~/modules/chat/hooks/useChatAgents';
import {
  useAgentActivity,
  useAgentUnread,
  useAgentWorking,
} from '~/modules/chat/hooks/useChatView';
import { EditAgentDialog } from '~/modules/chat/components/EditAgentDialog';

// One agent row — subscribes to its own working/unread/activity slices so a
// streaming reply only re-renders that row, not the whole rail.
const AgentRailItem = ({
  agent,
  isActive,
  onSelect,
  onEdit,
}: {
  agent: IChatAgent;
  isActive: boolean;
  onSelect: (agentId: string) => void;
  onEdit: (agent: IChatAgent) => void;
}) => {
  const isWorking = useAgentWorking(agent._id);
  const hasUnread = useAgentUnread(agent._id) && !isActive;
  const activity = useAgentActivity(agent._id);
  const showActivity = isWorking ? activity : undefined;

  return (
    <div
      role="button"
      tabIndex={0}
      className={`group relative w-full cursor-pointer rounded-md px-2.5 py-2 text-left transition-colors hover:bg-accent ${
        isActive ? 'bg-accent' : ''
      } ${isWorking ? 'ea-working' : ''}`}
      onClick={() => onSelect(agent._id)}
      onKeyDown={(e) => {
        // Only act on the row's own keys — ignore Enter/Space that bubbled up
        // from the focused gear button (which has its own handler).
        if (
          (e.key === 'Enter' || e.key === ' ') &&
          e.target === e.currentTarget
        ) {
          e.preventDefault();
          onSelect(agent._id);
        }
      }}
    >
      {/* Quick-edit affordance — appears on hover/focus, opens the in-chat
          settings modal without leaving the conversation. */}
      <Tooltip.Provider>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Edit ${agent.name} settings`}
              className="absolute right-1 top-1 z-10 size-6 text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(agent);
              }}
            >
              <IconSettings className="size-3.5" />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>Edit agent settings</Tooltip.Content>
        </Tooltip>
      </Tooltip.Provider>

      <div className="flex items-start gap-2">
        <div className="relative shrink-0">
          <div
            className={`size-7 rounded-lg border flex items-center justify-center transition-colors ${
              isActive || isWorking
                ? 'bg-gradient-to-br from-primary/25 to-primary/5 border-primary/30'
                : 'bg-muted border-border'
            } ${isWorking ? 'ea-avatar-live' : ''}`}
          >
            <IconRobot
              className={`size-4 transition-colors ${
                isActive || isWorking ? 'text-primary' : 'text-muted-foreground'
              }`}
            />
          </div>
          {hasUnread && (
            <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-destructive animate-pulse" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate leading-tight">
            {agent.name}
          </p>
          <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">
            {agent.model}
          </p>
        </div>
      </div>
      {/* Thought cloud — trails out of the avatar while the agent works,
          echoing the live turn's current step. */}
      {showActivity && (
        <div className="ea-pop mt-1 flex items-start gap-1">
          <div className="flex flex-col items-center gap-[3px] pl-2 pt-0.5 shrink-0">
            <span className="ea-thought-dot size-1" />
            <span className="ea-thought-dot size-1.5" />
          </div>
          <div className="ea-thought-bubble min-w-0 flex-1 rounded-lg rounded-tl-sm border border-primary/25 bg-background/85 px-2 py-1">
            <p className="text-[10px] leading-snug break-words line-clamp-2">
              <span className="ea-shimmer-text">{showActivity}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const AgentRail = ({
  agents,
  loading,
  activeAgentId,
  onSelect,
}: {
  agents: IChatAgent[];
  loading: boolean;
  activeAgentId?: string;
  onSelect: (agentId: string) => void;
}) => {
  // A single editor for the whole rail — opened with the row's agent, mounted
  // only while open so its form/mutation/subscriptions don't exist per row.
  const [editingAgent, setEditingAgent] = useState<IChatAgent | null>(null);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Agents
        </p>
      </div>
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="p-3 space-y-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div className="p-4 text-center">
            <IconRobot className="size-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No enabled agents.</p>
          </div>
        ) : (
          <div className="p-1.5 space-y-0.5">
            {agents.map((agent) => (
              <AgentRailItem
                key={agent._id}
                agent={agent}
                isActive={activeAgentId === agent._id}
                onSelect={onSelect}
                onEdit={setEditingAgent}
              />
            ))}
          </div>
        )}
      </div>

      {editingAgent && (
        <EditAgentDialog
          agent={editingAgent}
          open
          onOpenChange={(next) => {
            if (!next) setEditingAgent(null);
          }}
        />
      )}
    </div>
  );
};
