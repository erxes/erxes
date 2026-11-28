import { BROADCAST_PLACEHOLDERS, type BroadcastPlaceholder } from '@erxes/core-contract';
import { IconBraces } from '@tabler/icons-react';
import { Button, DropdownMenu, Label } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

/** "Insert a field": a customer's value, filled in when the broadcast goes. */
const PlaceholderMenu = ({ onPick }: { onPick: (name: BroadcastPlaceholder) => void }) => {
  const { t } = useTranslation('broadcasts');

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger render={<Button variant="ghost" size="sm" />}>
        <IconBraces />
        {t('insert-placeholder', 'Insert a field')}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        {BROADCAST_PLACEHOLDERS.map((name) => (
          <DropdownMenu.Item key={name} onClick={() => onPick(name)}>
            {t(`placeholder.${name}`, name)}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

/** A field's label, with `children` and Insert a field (when `onPick` is given) at the end. */
export const LabelRow = ({
  id,
  label,
  onPick,
  children,
}: {
  id?: string;
  label: string;
  onPick?: (name: BroadcastPlaceholder) => void;
  children?: ReactNode;
}) => (
  <div className="flex min-h-8 items-center justify-between gap-2">
    <Label htmlFor={id}>{label}</Label>
    <div className="flex items-center">
      {children}
      {onPick && <PlaceholderMenu onPick={onPick} />}
    </div>
  </div>
);
