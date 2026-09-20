import {
  IconAdjustmentsHorizontal,
  IconCalendarMonth,
  IconLayoutGrid,
  IconList,
} from '@tabler/icons-react';
import {
  Button,
  Popover,
  PopoverScoped,
  ToggleGroup,
  useMultiQueryState,
} from 'erxes-ui';
import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import {
  broadcastListLayoutState,
  TBroadcastListLayout,
} from '../../states/broadcastListLayoutState';
import { useTranslation } from 'react-i18next';

export type { TBroadcastListLayout };

const LAYOUTS: TBroadcastListLayout[] = ['list', 'grid', 'calendar'];

const parseLayout = (value?: string | null): TBroadcastListLayout | null =>
  LAYOUTS.includes(value as TBroadcastListLayout)
    ? (value as TBroadcastListLayout)
    : null;

/**
 * A `layout` query param wins so a shared link opens the way it was sent;
 * otherwise the stored preference applies, which is what survives opening a
 * campaign and closing it again.
 */
export const useBroadcastListLayout = () => {
  const [queryParams, setQueryParams] = useMultiQueryState<{ layout: string }>([
    'layout',
  ]);
  const [storedLayout, setStoredLayout] = useAtom(broadcastListLayoutState);

  const paramLayout = parseLayout(queryParams.layout);
  const layout = paramLayout ?? storedLayout;
  const seen = useRef<TBroadcastListLayout | null | undefined>(undefined);

  /**
   * Adopt a link's layout so leaving and coming back keeps showing it.
   *
   * Only a param that has just changed counts as a choice arriving from
   * outside. One that merely differs from the stored layout is the URL still
   * catching up with a switch made here a moment ago — adopting that put the
   * old layout straight back, which is why the first click only ever closed
   * the popover.
   */
  useEffect(() => {
    const isFirstRead = seen.current === undefined;
    const changed = seen.current !== paramLayout;

    seen.current = paramLayout;

    if (paramLayout && (isFirstRead || changed)) {
      setStoredLayout(paramLayout);
    }
  }, [paramLayout, setStoredLayout]);

  const setLayout = (next: TBroadcastListLayout) => {
    setStoredLayout(next);
    // Keep the default layout out of the URL
    setQueryParams({ layout: next === 'list' ? null : next });
  };

  return { layout, setLayout };
};

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
