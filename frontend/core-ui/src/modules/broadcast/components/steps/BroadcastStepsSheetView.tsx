import { cn, Sheet } from 'erxes-ui';
import { ReactNode } from 'react';
import { IBroadcastMethodEnum } from '../../types';

/** The sheet a campaign is written in, whether it is new or being edited. */
export const BroadcastStepsSheetView = ({
  method,
  children,
}: {
  method?: IBroadcastMethodEnum | null;
  children: ReactNode;
}) => (
  <Sheet.View
    className={cn(
      'sm:max-w-7xl',
      // The workflow canvas is the campaign's content, so it gets the room a
      // form-based method does not need. Overridden at the same breakpoint as
      // the sheet's own `md:w-3/4`, which a plain `w-*` class would lose to.
      method === IBroadcastMethodEnum.WORKFLOW &&
        'sm:max-w-none md:w-[calc(100vw-1rem)]',
    )}
    // Escape would throw away a campaign half written.
    onEscapeKeyDown={(event) => event.preventDefault()}
  >
    {children}
  </Sheet.View>
);
