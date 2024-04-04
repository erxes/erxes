import { ActivityDate, FlexBody, FlexCenterContent } from '../../styles';

import { IActivityLogItemProps } from '../../types';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import dayjs from 'dayjs';

export default function SmsLog({ activity }: IActivityLogItemProps) {
  const { createdAt, content } = activity;

  const renderContent = () => {
    return (
      <span>
        SMS <strong>"{content && content.text}"</strong> has been sent to{' '}
        <strong>{content && content.to}</strong>
      </span>
    );
  };

  return (
    <FlexCenterContent>
      <FlexBody>{renderContent()}</FlexBody>
      <Tip text={dayjs(createdAt).format('llll')}>
        <ActivityDate>{dayjs(createdAt).format('MMM D, h:mm A')}</ActivityDate>
      </Tip>
    </FlexCenterContent>
  );
}
