import {
  IconAdjustmentsHorizontal,
  IconCalendarMonth,
  IconLayoutGrid,
  IconList,
} from '@tabler/icons-react';
import { Button, Popover, PopoverScoped, ToggleGroup } from 'erxes-ui';
import { useState } from 'react';
import {
  parseLayout,
  useBroadcastListLayout,
} from '../../hooks/useBroadcastListLayout';
import { TBroadcastListLayout } from '../../states/broadcastListLayoutState';
import { useTranslation } from 'react-i18next';

const BroadcastLayoutOptions = ({
  value,
  onValueChange,
}: {
  value: TBroadcastListLayout;
  onValueChange: (value: string) => void;
}) => {
  const { t } = useTranslation('broadcasts');

  return (
    <ToggleGroup
      type="single"
      className="grid grid-cols-3 gap-2"
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
          <span className="text-xs font-normal">{t('layout.list')}</span>
        </Button>
      </ToggleGroup.Item>
      <ToggleGroup.Item value="grid" asChild>
        <Button
          variant="secondary"
          size="lg"
          className="h-11 flex-col gap-0 border"
        >
          <IconLayoutGrid className="size-5!" />
          <span className="text-xs font-normal">{t('layout.grid')}</span>
        </Button>
      </ToggleGroup.Item>
      <ToggleGroup.Item value="calendar" asChild>
        <Button
          variant="secondary"
          size="lg"
          className="h-11 flex-col gap-0 border"
        >
          <IconCalendarMonth className="size-5!" />
          <span className="text-xs font-normal">{t('layout.calendar')}</span>
        </Button>
      </ToggleGroup.Item>
    </ToggleGroup>
  );
};

export const BroadcastDisplayControl = () => {
  const { t } = useTranslation('broadcasts');
  const [isOpen, setIsOpen] = useState(false);
  const { layout, setLayout } = useBroadcastListLayout();

  const handleValueChange = (value: string) => {
    const next = parseLayout(value);

    if (!next) {
      return;
    }

    setLayout(next);
    setIsOpen(false);
  };

  return (
    <PopoverScoped open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button variant="ghost">
          <IconAdjustmentsHorizontal />
          {t('display')}
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <BroadcastLayoutOptions
          value={layout}
          onValueChange={handleValueChange}
        />
      </Popover.Content>
    </PopoverScoped>
  );
};
