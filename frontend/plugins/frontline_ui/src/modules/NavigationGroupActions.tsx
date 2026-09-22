import { ReactNode } from 'react';

/**
 * Wrapper for a `NavigationMenuGroup` `actions` slot. That slot renders inside
 * the group's collapsible trigger, so a click on any control in it also folds
 * the group unless the event is stopped before it reaches the trigger. Keyboard
 * activation dispatches the same click, so this covers it too.
 */
export const NavigationGroupActions = ({
  children,
}: {
  children: ReactNode;
}) => (
  // skipcq: JS-0746
  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
    {children}
  </div>
);
