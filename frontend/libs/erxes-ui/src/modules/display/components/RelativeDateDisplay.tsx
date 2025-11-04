import { format } from 'date-fns';
import { Tooltip } from 'erxes-ui/components';
import { isUndefinedOrNull } from 'erxes-ui/utils';
import {
  formatDateISOStringToRelativeDate,
  formatDateISOStringToRelativeDateShort,
} from 'erxes-ui/utils/localization/formatDateISOStringToRelativeDate';
import React from 'react';
import { Except } from 'type-fest';

type RelativeDateDisplayProps = {
  value: string;
  isShort?: boolean;
};

const RelativeDateDisplayTooltip = React.forwardRef<
  React.ElementRef<typeof Tooltip.Trigger>,
  Except<React.ComponentPropsWithoutRef<typeof Tooltip.Trigger>, 'value'> & {
    value: string;
  }
>(({ value, ...props }, ref) => {
  if (isUndefinedOrNull(value)) {
    return null;
  }

  return (
    <Tooltip.Provider delayDuration={100}>
      <Tooltip>
        <Tooltip.Trigger className="truncate" {...props} ref={ref} />
        <Tooltip.Content>{format(value, 'MMM dd, yyyy HH:mm')}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
});

RelativeDateDisplayTooltip.displayName = 'RelativeDateDisplayTooltip';

const RelativeDateDisplayValue = ({
  value,
  isShort,
}: RelativeDateDisplayProps) => {
  if (isUndefinedOrNull(value)) {
    return null;
  }
  const relativeDate = formatDateISOStringToRelativeDate(value);
  const relativeDateShort = formatDateISOStringToRelativeDateShort(value);

  return isShort ? relativeDateShort : relativeDate;
};

export const RelativeDateDisplay = Object.assign(RelativeDateDisplayTooltip, {
  Value: RelativeDateDisplayValue,
});
