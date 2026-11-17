import { BROADCAST_PLACEHOLDERS, type BroadcastPlaceholder } from '@erxes/core-contract';
import { IconBraces } from '@tabler/icons-react';
import { Button, DropdownMenu, Label } from 'erxes-ui';
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

/** A field's label, with Insert a field at the end when `onPick` is given. */
export const LabelRow = ({
  id,
  label,
  onPick,
}: {
  id?: string;
  label: string;
  onPick?: (name: BroadcastPlaceholder) => void;
}) => (
  <div className="flex min-h-8 items-center justify-between">
    <Label htmlFor={id}>{label}</Label>
    {onPick && <PlaceholderMenu onPick={onPick} />}
  </div>
);
