import { Sheet, useQueryState, useRemoveQueryStateByKey } from 'erxes-ui';
import { BroadcastMethod } from './BroadcastMethod';
import { BroadcastSteps } from './steps/BroadcastSteps';

export const BroadcastSheet = ({
  showTrigger = true,
}: {
  showTrigger?: boolean;
}) => {
  const [method] = useQueryState('method');

  const removeQueryStateByKey = useRemoveQueryStateByKey();

  const open = !!method;

  const setOpen = (nextOpen: boolean) => {
    if (!nextOpen) {
      removeQueryStateByKey('method');
      removeQueryStateByKey('broadcastContactId');
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {showTrigger && <BroadcastMethod />}

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
