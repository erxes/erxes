import {
  IconBookmark,
  IconBookmarkFilled,
  IconCircleDashed,
  IconCircleDashedCheck,
  IconDots,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
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
    tone={isPrimary ? 'primary' : 'default'}
    className={cn(
      'h-8 w-full justify-start flex-auto overflow-hidden px-2 text-left',
      isPrimary && 'bg-primary/10 hover:bg-primary/20',
    )}
  >
    {status === ValidationStatus.Valid ? (
      <IconCircleDashedCheck className="text-success" />
    ) : (
      <IconCircleDashed className="text-muted-foreground" />
    )}
    <TextOverflowTooltip value={text} />
    {isPrimary && <IconBookmarkFilled className="text-primary-text" />}
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
  const { t } = useTranslation('ui', { keyPrefix: 'contact-field' });

  const setStatus = (next: ValidationStatus) => {
    if (next !== status) onStatusChange(next);
  };

  const primary = {
    phone: {
      is: t('primary-phone', 'Primary phone'),
      set: t('set-primary-phone', 'Set as primary phone'),
    },
    email: {
      is: t('primary-email', 'Primary email'),
      set: t('set-primary-email', 'Set as primary email'),
    },
  }[kind];

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger
        render={<Button variant="secondary" className="size-8 shrink-0" size="icon" />}
        aria-label={t('options', 'Options')}
      >
        <IconDots />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        side="right"
        className="min-w-48"
        sideOffset={8}
        alignOffset={-4}
        align="start"
      >
        <DropdownMenu.Item onClick={isPrimary ? undefined : onSetPrimary}>
          {isPrimary ? <IconBookmarkFilled className="text-primary-text" /> : <IconBookmark />}
          {isPrimary ? primary.is : primary.set}
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={onEdit}>
          <IconEdit />
          {t('edit', 'Edit')}
        </DropdownMenu.Item>
        {isPrimary && showVerification && (
          <>
            <DropdownMenu.Separator />
            <DropdownMenu.RadioGroup value={status}>
              <DropdownMenu.RadioItem
                value={ValidationStatus.Valid}
                onClick={() => setStatus(ValidationStatus.Valid)}
              >
                <IconCircleDashedCheck className="text-success" />
                {t('verified', 'Verified')}
              </DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem
                value={ValidationStatus.Invalid}
                onClick={() => setStatus(ValidationStatus.Invalid)}
              >
                <IconCircleDashed className="text-muted-foreground" />
                {t('unverified', 'Unverified')}
              </DropdownMenu.RadioItem>
            </DropdownMenu.RadioGroup>
          </>
        )}
        <DropdownMenu.Separator />
        <DropdownMenu.Item variant="destructive" onClick={onDelete}>
          <IconTrash />
          {t('delete', 'Delete')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
