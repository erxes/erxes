import { Tooltip } from 'erxes-ui';
import type { ReactNode } from 'react';

/** The hover label every top bar icon shows. */
export const CoreTabTooltip = ({ label, children }: { label: string; children: ReactNode }) => (
  <Tooltip>
    <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
    <Tooltip.Content side="bottom">{label}</Tooltip.Content>
  </Tooltip>
);
