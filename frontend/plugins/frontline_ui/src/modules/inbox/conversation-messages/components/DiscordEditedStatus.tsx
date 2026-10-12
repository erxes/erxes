import type { DiscordEditedStatusProps } from '../types/MessageItem';
export const DiscordEditedStatus = ({ edited }: DiscordEditedStatusProps) => {
  if (!edited) {
    return null;
  }

  return <span className="text-muted-foreground/70">(edited)</span>;
};
