import {
  IconAdjustmentsHorizontal,
  IconLayoutGrid,
  IconList,
} from '@tabler/icons-react';
import { TAutomationsListLayout } from '@/automations/states/automationsListLayoutState';
import { useAutomationsDisplayControl } from '@/automations/hooks/useAutomationsListLayout';
import { Button, Popover, PopoverScoped, ToggleGroup } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export type { TAutomationsListLayout };

const AutomationsLayoutOptions = ({
  value,
  onValueChange,
}: {
  value: TAutomationsListLayout;
  onValueChange: (value: string) => void;
}) => {
  const { t } = useTranslation('automations');

  return (
    <ToggleGroup
      type="single"
      className="grid grid-cols-2 gap-2"
      value={value}
      onValueChange={onValueChange}
    >
      <ToggleGroup.Item value="list" asChild>
        <Button
          variant="secondary"
          size="lg"
          className="h-11 flex-col gap-0 border"
        >
          <IconList className="size-5!" />
          <span className="text-xs font-normal">{t('list-view')}</span>
        </Button>
      </ToggleGroup.Item>
      <ToggleGroup.Item value="grid" asChild>
        <Button
          variant="secondary"
          size="lg"
          className="h-11 flex-col gap-0 border"
        >
          <IconLayoutGrid className="size-5!" />
          <span className="text-xs font-normal">{t('grid-view')}</span>
        </Button>
      </ToggleGroup.Item>
    </ToggleGroup>
  );
};

export const AutomationsDisplayControl = () => {
  const { t } = useTranslation('automations');
  const { isOpen, setIsOpen, layout, handleValueChange } =
    useAutomationsDisplayControl();

  return (
    <PopoverScoped open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button variant="ghost">
          <IconAdjustmentsHorizontal />
          {t('display')}
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <AutomationsLayoutOptions
          value={layout}
          onValueChange={handleValueChange}
        />
      </Popover.Content>
    </PopoverScoped>
  );
};
