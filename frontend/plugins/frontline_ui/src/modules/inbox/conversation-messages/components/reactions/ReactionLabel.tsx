import type { ReactionLabelProps } from '../../types/MessageItem';
import { InboxImage } from '../attachments/InboxImage';

export const ReactionLabel = ({ label }: ReactionLabelProps) => {
  const customEmoji = /^<(a?):[^:]+:(\d+)>$/.exec(label);
  if (!customEmoji) return label;
  const [, animated, id] = customEmoji;
  return (
    <InboxImage
      src={`https://cdn.discordapp.com/emojis/${id}.${
        animated ? 'gif' : 'png'
      }`}
      alt="Custom emoji"
      className="inline-block size-4 object-contain"
    />
  );
};
