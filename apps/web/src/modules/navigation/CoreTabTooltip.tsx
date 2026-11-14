import { Tooltip } from 'erxes-ui';
import type { ReactElement } from 'react';

/** The hover label every top bar icon shows. */
export const CoreTabTooltip = ({ label, children }: { label: string; children: ReactElement }) => (
  <Tooltip>
    <Tooltip.Trigger render={children} />
    <Tooltip.Content side="bottom">{label}</Tooltip.Content>
  </Tooltip>
);
