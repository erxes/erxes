import { Sheet } from 'erxes-ui';
import { ReactNode } from 'react';

export const AiAgentDetailSheetShell = ({
  onRequestClose,
  children,
}: {
  onRequestClose: () => void;
  children: ReactNode;
}) => (
  <Sheet open onOpenChange={(open) => !open && onRequestClose()}>
    <Sheet.View className="flex flex-col gap-0 overflow-hidden bg-background p-0 sm:max-w-none md:w-1/2 md:min-w-[min(48rem,calc(100vw-1rem))]">
      {children}
    </Sheet.View>
  </Sheet>
);
