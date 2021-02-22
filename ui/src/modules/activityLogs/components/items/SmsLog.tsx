import dayjs from 'dayjs';
import {
  ActivityDate,
  FlexBody,
  FlexCenterContent
} from 'modules/activityLogs/styles';
import { IActivityLogItemProps } from 'modules/activityLogs/types';
import Tip from 'modules/common/components/Tip';
import React from 'react';

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
