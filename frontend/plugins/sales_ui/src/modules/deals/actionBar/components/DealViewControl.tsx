'use client';

import { Button, cn, Popover, PopoverScoped, ToggleGroup } from 'erxes-ui';
import {
  IconAdjustmentsHorizontal,
  IconCoins,
  IconLayoutKanban,
  IconList,
} from '@tabler/icons-react';
import { Suspense, lazy, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import { dealsViewAtom, TDealsView } from '@/deals/states/dealsViewState';
import { useLoyaltyEnabled } from '@/deals/loyaltyRules/hooks/useLoyaltyEnabled';
import { useTranslation } from 'react-i18next';

const DealsBoard = lazy(() =>
  import('@/deals/boards/components/DealsBoard').then((mod) => ({
    default: mod.DealsBoard,
  })),
);

const DealsRecordTable = lazy(() =>
  import('@/deals/boards/components/list/DealsRecordTable').then((mod) => ({
    default: mod.DealsRecordTable,
  })),
);

const DealScoreLogsTable = lazy(() =>
  import('@/deals/loyaltyRules/components/DealScoreLogsTable').then((mod) => ({
    default: mod.DealScoreLogsTable,
  })),
);

export const DealsViewControl = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useAtom(dealsViewAtom);
  const loyaltyEnabled = useLoyaltyEnabled();
  const { t } = useTranslation('sales');

  return (
    <PopoverScoped open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button variant="ghost">
          <IconAdjustmentsHorizontal />
          {t('display')}
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <ToggleGroup
          type="single"
          defaultValue={view}
          className={cn(
            'grid gap-2',
            loyaltyEnabled ? 'grid-cols-3' : 'grid-cols-2',
          )}
          value={view}
          onValueChange={(value) => {
            if (!value) return;
            setView(value as TDealsView);
            setIsOpen(false);
          }}
        >
          <ToggleGroup.Item value="list" asChild>
            <Button
              variant="secondary"
              size="lg"
              className="h-11 flex-col gap-0 border"
            >
              <IconList className="size-5!" />
              <span className="text-xs font-normal">{t('list')}</span>
            </Button>
          </ToggleGroup.Item>
          <ToggleGroup.Item value="board" asChild>
            <Button
              variant="secondary"
              size="lg"
              className="h-11 flex-col gap-0 border"
            >
              <IconLayoutKanban className="size-5!" />
              <span className="text-xs font-normal">{t('board')}</span>
            </Button>
          </ToggleGroup.Item>
          {loyaltyEnabled && (
            <ToggleGroup.Item value="points" asChild>
              <Button
                variant="secondary"
                size="lg"
                className="h-11 flex-col gap-0 border"
              >
                <IconCoins className="size-5!" />
                <span className="text-xs font-normal">
                  {t('loyalty-points-view', 'Points')}
                </span>
              </Button>
            </ToggleGroup.Item>
          )}
        </ToggleGroup>
      </Popover.Content>
    </PopoverScoped>
  );
};

export const DealsView = () => {
  const view = useAtomValue(dealsViewAtom);
  const loyaltyEnabled = useLoyaltyEnabled();

  if (view === 'points' && loyaltyEnabled) {
    return (
      <Suspense>
        <DealScoreLogsTable />
      </Suspense>
    );
  }

  return (
    <Suspense>
      {view === 'list' ? <DealsRecordTable /> : <DealsBoard />}
    </Suspense>
  );
};
