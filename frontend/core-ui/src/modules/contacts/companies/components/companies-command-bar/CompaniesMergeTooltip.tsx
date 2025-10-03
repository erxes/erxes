import { Tooltip } from 'erxes-ui';
import { ReactNode } from 'react';

export const CompaniesMergeTooltip = ({
  children,
  disabled,
}: {
  children: ReactNode;
  disabled: boolean;
}) => {
  if (disabled) return children;
  return (
    <Tooltip delayDuration={0}>
      <Tooltip.Trigger asChild>
        <div className="inline-block">{children}</div>
      </Tooltip.Trigger>
      <Tooltip.Content sideOffset={12}>
        <span>You can only merge 2 companies</span>
      </Tooltip.Content>
    </Tooltip>
  );
};
