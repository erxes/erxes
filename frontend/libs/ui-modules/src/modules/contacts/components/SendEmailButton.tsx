import { IconPencil } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useComposeEmail } from '../hooks/useComposeEmail';
import type { ComposeEmailRequest } from '../hooks/useComposeEmail';

export const SendEmailButton = ({
  target,
  compact = false,
}: {
  target?: ComposeEmailRequest;
  compact?: boolean;
}) => {
  const { canComposeEmail, composeEmail } = useComposeEmail();
  if (!canComposeEmail) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size={compact ? 'icon' : 'sm'}
      className={compact ? 'size-8 shrink-0' : undefined}
      aria-label="Send email"
      title="Send email"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        composeEmail(target);
      }}
    >
      <IconPencil className="size-4" />
      {!compact && 'Send email'}
    </Button>
  );
};
