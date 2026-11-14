import { Kbd, Tooltip } from 'erxes-ui';
import type { ReactElement } from 'react';

/** The hover label of an icon-only button, with its shortcut when it has one. */
export const IconTip = ({
  label,
  hotkey,
  children,
}: {
  label: string;
  hotkey?: string;
  children: ReactElement;
}) => (
  <Tooltip.Provider delay={300}>
    <Tooltip>
      <Tooltip.Trigger render={children} />
      <Tooltip.Content side="bottom">
        <span className="flex items-center gap-1.5">
          {label}
          {hotkey && <Kbd>{hotkey}</Kbd>}
        </span>
      </Tooltip.Content>
    </Tooltip>
  </Tooltip.Provider>
);
