import { Tooltip } from 'erxes-ui/components/tooltip';
import { useFormat } from 'erxes-ui/lib/format';
import { isUndefinedOrNull } from 'erxes-ui/utils/IsUndefinedOrNull';
import React from 'react';
import type { Except } from 'type-fest';

/** A date as how long ago it was, with the date and time on hover. */
const RelativeDateDisplayTooltip = ({
  value,
  ...props
}: Except<React.ComponentProps<typeof Tooltip.Trigger>, 'value'> & { value: string }) => {
  const fmt = useFormat();

  if (isUndefinedOrNull(value)) {
    return null;
  }

  return (
    <Tooltip>
      <Tooltip.Trigger delay={100} className="truncate" {...props} />
      <Tooltip.Content>{fmt.dateTime(value)}</Tooltip.Content>
    </Tooltip>
  );
};

const RelativeDateDisplayValue = ({ value }: { value: string }) => {
  const fmt = useFormat();

  return isUndefinedOrNull(value) ? null : fmt.relative(value);
};

export const RelativeDateDisplay = Object.assign(RelativeDateDisplayTooltip, {
  Value: RelativeDateDisplayValue,
});
