import { Kbd, Tooltip } from 'erxes-ui';
import { createContext, useContext } from 'react';

// Which way top bar overlays open: down from the top bar, right of the sidebar.
export const CoreTabSideContext = createContext<'bottom' | 'right'>('bottom');

export const useCoreTabSide = () => useContext(CoreTabSideContext);

// The hover label every top bar icon shows, with its shortcut when it has one.
export const CoreTabTooltip = ({
  label,
  shortcut,
  children,
}: {
  label: string;
  shortcut?: string;
  children: React.ReactNode;
}) => {
  const side = useCoreTabSide();

  return (
    <Tooltip>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Content side={side} className="flex items-center gap-2">
        {label}
        {shortcut && <Kbd>{shortcut}</Kbd>}
      </Tooltip.Content>
    </Tooltip>
  );
};
