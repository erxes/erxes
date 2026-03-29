'use client';

import { Tooltip } from 'erxes-ui';
import { IconUser, IconClipboardList } from '@tabler/icons-react';
import { TourOrdersPanel } from './TourOrdersPanel';
import { TourCustomersPanel } from './TourCustomersPanel';

const TABS = [
  { name: 'orders', label: 'Orders', Icon: IconClipboardList },
  { name: 'customers', label: 'Customers', Icon: IconUser },
] as const;

export type TourSideTab = (typeof TABS)[number]['name'];

interface Props {
  tourId: string;
  activeTab: TourSideTab | null;
  onTabChange: (tab: TourSideTab | null) => void;
}

export const TourOrdersSidePanel = ({
  tourId,
  activeTab,
  onTabChange,
}: Props) => {
  return (
    <div className="flex self-stretch">
      {activeTab === 'orders' && (
        <div className="overflow-y-auto w-[340px] border-l">
          <TourOrdersPanel tourId={tourId} />
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="overflow-y-auto w-[340px] border-l">
          <TourCustomersPanel />
        </div>
      )}

      <div className="flex flex-col items-center w-16 gap-3 py-3 border-l bg-sidebar shrink-0">
        <Tooltip.Provider>
          {TABS.map(({ name, label, Icon }) => {
            const isActive = activeTab === name;
            return (
              <Tooltip key={name}>
                <Tooltip.Trigger asChild>
                  <button
                    type="button"
                    onClick={() => onTabChange(isActive ? null : name)}
                    className={`size-10 rounded flex items-center justify-center transition group/tab
                      ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-primary hover:bg-primary/10'
                      }`}
                  >
                    <Icon className="size-5" />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Content side="left">{label}</Tooltip.Content>
              </Tooltip>
            );
          })}
        </Tooltip.Provider>
      </div>
    </div>
  );
};
