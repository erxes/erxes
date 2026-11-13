import { Kbd, Tooltip } from 'erxes-ui';
import type { ReactNode } from 'react';

/** The hover label of an icon-only button, with its shortcut when it has one. */
export const IconTip = ({
  label,
  hotkey,
  children,
}: {
  label: string;
  hotkey?: string;
  children: ReactNode;
}) => (
  <Tooltip.Provider delayDuration={300}>
    <Tooltip>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Content side="bottom" className="flex items-center gap-1.5">
        {label}
        {hotkey && <Kbd>{hotkey}</Kbd>}
      </Tooltip.Content>
    </Tooltip>
  </Tooltip.Provider>
);
