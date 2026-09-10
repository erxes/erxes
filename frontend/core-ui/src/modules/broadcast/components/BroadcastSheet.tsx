import { Sheet, useQueryState, useRemoveQueryStateByKey } from 'erxes-ui';
import { useState } from 'react';
import { BroadcastMethod } from './BroadcastMethod';
import { BroadcastSteps } from './steps/BroadcastSteps';

export const BroadcastSheet = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [method] = useQueryState('method');

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
        className={method === 'email' ? 'sm:max-w-3xl' : 'sm:max-w-7xl'}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <BroadcastSteps setOpen={setOpen} />
      </Sheet.View>
    </Sheet>
  );
};
