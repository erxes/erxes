import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { Button, DropdownMenu, cn, toast } from 'erxes-ui';

import { useConversationAutomatedReplyControl } from '@/inbox/conversations/hooks/useConversationAutomatedReplyControl';
import { useConversationContext } from '@/inbox/conversations/hooks/useConversationContext';

const useAutomatedReplyAction = () => {
  const { _id, automatedReplyControl } = useConversationContext();
  const { setAutomatedReplyControl, loading } =
    useConversationAutomatedReplyControl();
  const status = automatedReplyControl?.status;
  const isActive = status === 'active';
  const label = isActive
    ? 'Automation active'
    : status === 'human_active' &&
      automatedReplyControl?.reason === 'operator_reply'
    ? 'Automation paused: operator active'
    : 'Automation paused';
  const nextStatus = isActive ? 'human_active' : 'active';
  const actionLabel = isActive ? 'Pause automation' : 'Resume automation';
  const Icon = isActive ? IconPlayerPlay : IconPlayerPause;
  const ActionIcon = isActive ? IconPlayerPause : IconPlayerPlay;

  const handleToggleAutomation = () => {
    setAutomatedReplyControl({
      variables: {
        _id,
        status: nextStatus,
        reason: 'manual',
      },
      onCompleted: () => {
        toast({
          title: isActive ? 'Automation paused' : 'Automation resumed',
        });
      },
    });
  };

  return {
    status,
    isActive,
    label,
    actionLabel,
    Icon,
    ActionIcon,
    loading,
    handleToggleAutomation,
  };
};

export const AutomatedReplyStatusBadge = () => {
  const {
    status,
    isActive,
    label,
    actionLabel,
    Icon,
    ActionIcon,
    loading,
    handleToggleAutomation,
  } = useAutomatedReplyAction();

  if (!status) return null;

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'h-7 flex-none gap-1.5 rounded-md border px-2 text-xs font-medium shadow-none',
            isActive
              ? 'border-border bg-muted/50 text-muted-foreground hover:bg-muted'
              : 'border-primary/20 bg-primary/10 text-primary hover:bg-primary/15',
          )}
          disabled={loading}
        >
          <Icon className="size-3.5 flex-none" />
          <span className="max-w-[280px] truncate">{label}</span>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="start" className="min-w-[220px]">
        <DropdownMenu.Item disabled={loading} onClick={handleToggleAutomation}>
          <ActionIcon className="size-4" />
          {actionLabel}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export const AutomatedReplyMenuItem = () => {
  const { status, actionLabel, ActionIcon, loading, handleToggleAutomation } =
    useAutomatedReplyAction();

  if (!status) return null;

  return (
    <>
      <DropdownMenu.Item
        className="gap-2"
        disabled={loading}
        onSelect={handleToggleAutomation}
      >
        <ActionIcon className="size-4" />
        {actionLabel}
      </DropdownMenu.Item>
      <DropdownMenu.Separator />
    </>
  );
};
