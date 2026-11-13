import { format } from 'date-fns';
import { Tooltip } from 'erxes-ui/components/tooltip';
import { isUndefinedOrNull } from 'erxes-ui/utils/IsUndefinedOrNull';
import {
  formatDateISOStringToRelativeDate,
  formatDateISOStringToRelativeDateShort,
} from 'erxes-ui/utils/localization/formatDateISOStringToRelativeDate';
import React from 'react';
import type { Except } from 'type-fest';

type RelativeDateDisplayProps = {
  value: string;
  isShort?: boolean;
};

const RelativeDateDisplayTooltip = ({
  value,
  ...props
}: Except<React.ComponentProps<typeof Tooltip.Trigger>, 'value'> & { value: string }) => {
  if (isUndefinedOrNull(value)) {
    return null;
  }

  return (
    <Tooltip>
      <Tooltip.Trigger delay={100} className="truncate" {...props} />
      <Tooltip.Content>{format(value, 'MMM dd, yyyy HH:mm')}</Tooltip.Content>
    </Tooltip>
  );
};

const RelativeDateDisplayValue = ({ value, isShort }: RelativeDateDisplayProps) => {
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
