// Adapted from AI Elements `conversation` (vercel/ai-elements): erxes-ui
// Button, tabler icon, no markdown download, and no default content padding
// because erxes-ui `cn` does not merge Tailwind classes.
import { IconArrowDown } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import type { ComponentProps } from 'react';
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';

export type ConversationProps = ComponentProps<typeof StickToBottom>;

export const Conversation = ({ className, ...props }: ConversationProps) => (
  <StickToBottom
    className={cn('relative flex-1 overflow-y-hidden', className)}
    initial="smooth"
    resize="smooth"
    role="log"
    {...props}
  />
);

export type ConversationContentProps = ComponentProps<
  typeof StickToBottom.Content
>;

export const ConversationContent = ({
  className,
  ...props
}: ConversationContentProps) => (
  <StickToBottom.Content
    className={cn('flex flex-col', className)}
    {...props}
  />
);

export type ConversationScrollButtonProps = ComponentProps<typeof Button>;

export const ConversationScrollButton = ({
  className,
  ...props
}: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  return (
    !isAtBottom && (
      <Button
        className={cn(
          'absolute bottom-4 left-1/2 size-8 -translate-x-1/2 rounded-full',
          className,
        )}
        onClick={() => scrollToBottom()}
        size="icon"
        type="button"
        variant="outline"
        {...props}
      >
        <IconArrowDown className="size-4" />
      </Button>
    )
  );
};
