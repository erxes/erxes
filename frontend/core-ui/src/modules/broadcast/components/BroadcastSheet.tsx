import { IBroadcastMethodEnum } from '@/broadcast/types';
import { cn, Sheet, useQueryState, useRemoveQueryStateByKey } from 'erxes-ui';
import { useState } from 'react';
import { BroadcastMethod } from './BroadcastMethod';
import { BroadcastSteps } from './steps/BroadcastSteps';

export const BroadcastSheet = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [method] = useQueryState<IBroadcastMethodEnum>('method');

  const removeQueryStateByKey = useRemoveQueryStateByKey();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      removeQueryStateByKey('method');
    }

    setOpen(open);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <BroadcastMethod onSelect={() => setOpen(true)} />

      <Sheet.View
        className={cn(
          'sm:max-w-7xl',
          // The workflow canvas is the campaign's content, so it gets the room
          // a form-based method does not need. Overridden at the same
          // breakpoint as the sheet's own `md:w-3/4`, which a plain `w-*`
          // class would lose to.
          method === IBroadcastMethodEnum.WORKFLOW &&
            'sm:max-w-none md:w-[calc(100vw-1rem)]',
        )}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <BroadcastSteps onClose={() => handleOpenChange(false)} />
      </Sheet.View>
    </Sheet>
  );
};
