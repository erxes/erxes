import { BROADCAST_SELECTABLE_METHODS } from '@/broadcast/constants';
import { IconPlus } from '@tabler/icons-react';
import {
  Button,
  ButtonProps,
  DropdownMenu,
  Label,
  useSetQueryStateByKey,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/**
 * Starts a campaign by picking its method, which is what opens the creation
 * sheet. `onSelect` runs first, so whatever the campaign is started with is
 * in place before the sheet reads it.
 */
export const BroadcastMethod = ({
  onSelect,
  label,
  variant,
}: {
  onSelect?: () => void;
  label?: string;
  variant?: ButtonProps['variant'];
}) => {
  const { t } = useTranslation('broadcasts');
  const setQueryStateByKey = useSetQueryStateByKey();

  const handleSelect = (method: string) => {
    onSelect?.();
    setQueryStateByKey('method', method);
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant={variant}>
          <IconPlus />
          {label || t('actions.new')}
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content side="bottom" align="end" className="w-72 min-w-0">
        <DropdownMenu.RadioGroup onValueChange={handleSelect}>
          {BROADCAST_SELECTABLE_METHODS.map(
            ({ value, labelKey, descriptionKey }) => (
              <DropdownMenu.RadioItem
                key={value}
                value={value}
                className="cursor-pointer"
              >
                <div className="flex flex-col gap-1 p-2">
                  <Label variant="peer">{t(labelKey)}</Label>
                  <div className="text-xs text-accent-foreground">
                    {t(descriptionKey)}
                  </div>
                </div>
              </DropdownMenu.RadioItem>
            ),
          )}
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
