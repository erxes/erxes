import {
  IconBookmark,
  IconBookmarkFilled,
  IconCircleDashed,
  IconCircleDashedCheck,
  IconDots,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import { Button } from 'erxes-ui/components/button';
import { DropdownMenu } from 'erxes-ui/components/dropdown-menu';
import { TextOverflowTooltip } from 'erxes-ui/components/text-overflow';
import { cn } from 'erxes-ui/lib/utils';
import { ValidationStatus } from 'erxes-ui/types/ValidationStatus';

/*
 * The rows PhoneField and EmailField share: a value with its verification and primary
 * marks, and the menu beside it.
 */

export const ContactFieldValue = ({
  text,
  status,
  isPrimary,
}: {
  text: string;
  status?: ValidationStatus;
  isPrimary?: boolean;
}) => (
  <Button
    variant="secondary"
    className={cn(
      'w-full font-medium text-left justify-start px-2 flex-auto overflow-hidden',
      isPrimary && 'text-primary bg-primary/10 hover:bg-primary/20',
    )}
    size="lg"
  >
    {status === ValidationStatus.Valid ? (
      <IconCircleDashedCheck className="text-success" />
    ) : (
      <IconCircleDashed className="text-muted-foreground" />
    )}
    <TextOverflowTooltip value={text} />
    {isPrimary && <IconBookmarkFilled className="text-primary" />}
  </Button>
);

type ContactFieldOptionsProps = {
  /** Names the value in the menu: "Set as primary phone". */
  kind: 'phone' | 'email';
  isPrimary?: boolean;
  status?: ValidationStatus;
  /** The verified/unverified choice, offered on the primary value only. */
  showVerification: boolean;
  onSetPrimary: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: ValidationStatus) => void;
};

export const ContactFieldOptions = ({
  kind,
  isPrimary,
  status,
  showVerification,
  onSetPrimary,
  onEdit,
  onDelete,
  onStatusChange,
}: ContactFieldOptionsProps) => {
  const setStatus = (next: ValidationStatus) => {
    if (next !== status) onStatusChange(next);
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary" className="w-full font-medium size-8 shrink-0" size="icon">
          <IconDots />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        side="right"
        className="min-w-48 text-sm"
        sideOffset={8}
        alignOffset={-4}
        align="start"
      >
        <DropdownMenu.Item onClick={isPrimary ? undefined : onSetPrimary}>
          {isPrimary ? <IconBookmarkFilled className="text-primary" /> : <IconBookmark />}
          {isPrimary ? `Primary ${kind}` : `Set as primary ${kind}`}
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={onEdit}>
          <IconEdit />
          Edit
        </DropdownMenu.Item>
        {isPrimary && showVerification && (
          <>
            <DropdownMenu.Separator />
            <DropdownMenu.RadioGroup value={status}>
              <DropdownMenu.RadioItem
                value={ValidationStatus.Valid}
                onSelect={() => setStatus(ValidationStatus.Valid)}
              >
                <IconCircleDashedCheck className="text-success" />
                Verified
              </DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem
                value={ValidationStatus.Invalid}
                onSelect={() => setStatus(ValidationStatus.Invalid)}
              >
                <IconCircleDashed className="text-muted-foreground" />
                Unverified
              </DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
          </>
        )}
        <DropdownMenu.Separator />
        <DropdownMenu.Item className="text-destructive" onClick={onDelete}>
          <IconTrash />
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
