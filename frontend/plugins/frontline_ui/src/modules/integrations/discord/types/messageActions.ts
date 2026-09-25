import { type ReactNode } from 'react';

export type DiscordConversationChannel = {
  channelId?: string;
  guildId?: string;
};

export type MessageActionButtonProps = {
  label: string;
  tooltip: string;
  icon: ReactNode;
  onClick: () => void;
  destructive?: boolean;
};

export type OwnMessageActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
};

export type EditMessageDialogActionsProps = {
  editing: boolean;
  saveDisabled: boolean;
  onSave: () => void;
};

export type EditMessageDialogProps = {
  open: boolean;
  draft: string;
  editing: boolean;
  onOpenChange: (open: boolean) => void;
  onDraftChange: (draft: string) => void;
  onSave: () => void;
};
