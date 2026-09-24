import {
  IconAdjustmentsHorizontal,
  IconLayoutGrid,
  IconList,
} from '@tabler/icons-react';
import {
  automationsListLayoutState,
  TAutomationsListLayout,
} from '@/automations/states/automationsListLayoutState';
import { Button, Popover, PopoverScoped, ToggleGroup } from 'erxes-ui';
import { useMultiQueryState } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type { TAutomationsListLayout };

const parseLayout = (value?: string | null): TAutomationsListLayout | null =>
  value === 'grid' || value === 'list' ? value : null;

/**
 * A `layout` query param wins so a shared link opens the way it was sent;
 * otherwise the stored preference applies, which is what survives navigating
 * into an automation and back.
 */
export const useAutomationsListLayout = () => {
  const [queryParams, setQueryParams] = useMultiQueryState<{ layout: string }>([
    'layout',
  ]);
  const [storedLayout, setStoredLayout] = useAtom(automationsListLayoutState);

  const paramLayout = parseLayout(queryParams.layout);
  const layout = paramLayout ?? storedLayout;

  // Adopt a link's layout so leaving and coming back keeps showing it.
  useEffect(() => {
    if (paramLayout && paramLayout !== storedLayout) {
      setStoredLayout(paramLayout);
    }
  }, [paramLayout, storedLayout, setStoredLayout]);

  const setLayout = (next: TAutomationsListLayout) => {
    setStoredLayout(next);
    // Keep the default layout out of the URL
    setQueryParams({ layout: next === 'list' ? null : next });
  };

  return { layout, setLayout };
};

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
  const [isOpen, setIsOpen] = useState(false);
  const { layout, setLayout } = useAutomationsListLayout();
  const { t } = useTranslation('automations');

  const handleValueChange = (value: string) => {
    if (value !== 'list' && value !== 'grid') {
      return;
    }

    setLayout(value);
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
        <AutomationsLayoutOptions
          value={layout}
          onValueChange={handleValueChange}
        />
      </Popover.Content>
    </PopoverScoped>
  );
};
