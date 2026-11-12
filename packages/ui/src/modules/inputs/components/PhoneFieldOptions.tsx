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
import { ValidationStatus } from 'erxes-ui/types/ValidationStatus';
import { usePhoneFields } from '../contexts/PhoneFieldsContext';
import type { IPhoneField } from '../types/phoneField';

/** The menu beside a phone: make primary, edit, verify (primary only) and delete. */
export const PhoneFieldOptions = ({ item }: { item: IPhoneField }) => {
  const { phones, onValueChange, onValidationStatusChange, startEditing } = usePhoneFields();
  const { phone, status, isPrimary } = item;

  const setPrimary = () => {
    if (isPrimary) return;

    onValueChange([
      { phone, status, isPrimary: true },
      ...phones
        .filter((other) => other.phone !== phone)
        .map((other) => ({ ...other, isPrimary: false })),
    ]);
  };

  const setStatus = (next: ValidationStatus) => {
    if (next !== status) onValidationStatusChange?.(next);
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
        <DropdownMenu.Item onClick={setPrimary}>
          {isPrimary ? <IconBookmarkFilled className="text-primary" /> : <IconBookmark />}
          {isPrimary ? 'Primary phone' : 'Set as primary phone'}
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={() => startEditing(phone ?? '')}>
          <IconEdit />
          Edit
        </DropdownMenu.Item>
        {isPrimary && (
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
        <DropdownMenu.Item
          className="text-destructive"
          onClick={() => onValueChange(phones.filter((other) => other.phone !== phone))}
        >
          <IconTrash />
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
