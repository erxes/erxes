import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';

import { ReactNode } from 'react';

export const AiAgentDetailSheetShell = ({
  onRequestClose,
  children,
}: {
  onRequestClose: () => void;
  children: ReactNode;
}) => (
  <CoreModulePanel
    maxWidth={1000}
    defaultWidth={720}
    name={'automations/settings/agents/AiAgentDetailSheetShell'}
    open
    onOpenChange={(open) => !open && onRequestClose()}
  >
    <CoreModulePanel.View className="flex flex-col gap-0 overflow-hidden bg-background p-0 sm:max-w-none md:w-1/2 md:min-w-[min(48rem,calc(100vw-1rem))]">
      {children}
    </CoreModulePanel.View>
  </CoreModulePanel>
);
