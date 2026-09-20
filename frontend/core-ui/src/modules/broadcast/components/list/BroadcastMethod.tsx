import { BROADCAST_SELECTABLE_METHODS } from '@/broadcast/constants';
import { IconPlus } from '@tabler/icons-react';
import { Button, DropdownMenu, Label, useSetQueryStateByKey } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const BroadcastMethod = ({ onSelect }: { onSelect: () => void }) => {
  const { t } = useTranslation('broadcasts');
  const setQueryStateByKey = useSetQueryStateByKey();

  const handleSelect = (method: string) => {
    setQueryStateByKey('method', method);
    onSelect();
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button>
          <IconPlus />
          {t('actions.new')}
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content side="bottom" align="end" className="w-72 min-w-0">
        <DropdownMenu.RadioGroup onValueChange={handleSelect}>
          {BROADCAST_SELECTABLE_METHODS.map(({ value, labelKey, descriptionKey }) => (
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
          ))}
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
