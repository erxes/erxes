import HelpPopover from '@erxes/ui/src/components/HelpPopover';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import s from 'underscore.string';
import {
  AWS_EMAIL_DELIVERY_STATUSES,
  METHODS,
  SMS_DELIVERY_STATUSES,
  NOTIFICATION_DELIVERY_STATUSES,
} from '@erxes/ui-engage/src/constants';
import {
  Box,
  BoxContent,
  BoxHeader,
  IconContainer,
} from '@erxes/ui-engage/src/styles';

type Props = {
  count: number;
  method: string;
  totalCount?: number;
  kind?: string;
};

export default function EngageStatItem({
  count,
  kind,
  method,
  totalCount,
}: Props) {
  let percent = 0;

  if (count && totalCount) {
    percent = (count * 100) / totalCount;

    if (count > totalCount) {
      percent = 100;
    }
  }

  let options: any[] = [];

  if (method === METHODS.EMAIL) {
    options = AWS_EMAIL_DELIVERY_STATUSES.OPTIONS;
  }
  if (method === METHODS.SMS) {
    options = SMS_DELIVERY_STATUSES.OPTIONS;
  }
  if (method === METHODS.NOTIFICATION) {
    options = NOTIFICATION_DELIVERY_STATUSES.OPTIONS;
  }

  const option = options.find((opt) => opt.value === kind);
  let icon = 'cube-2';
  let label = 'Total';
  let description = 'Total count';

  if (option) {
    icon = option.icon;
    label = option.label;
    description = option.description;
  }

  return (
    <Box>
      <BoxHeader>
        <IconContainer>
          <Icon icon={icon} />
        </IconContainer>
      </BoxHeader>
      <BoxContent>
        <h5>
          {label}
          <HelpPopover title={label}>{description}</HelpPopover>
        </h5>
        <strong>
          {s.numberFormat(count)}{' '}
          {percent ? <span>({s.numberFormat(percent, 2)}%)</span> : null}
        </strong>
      </BoxContent>
    </Box>
  );
}
