import { IconPencil } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useComposeEmail } from 'ui-modules/modules/contacts/hooks/useComposeEmail';
import type { SendEmailButtonProps } from 'ui-modules/modules/contacts/types/contactEmails';

export const SendEmailButton = ({
  target,
  compact = false,
}: SendEmailButtonProps) => {
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
