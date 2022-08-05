import {
  ActivityDate,
  FlexBody,
  FlexCenterContent
} from '@erxes/ui-log/src/activityLogs/styles';

import { IActivityLogItemProps } from '@erxes/ui-log/src/activityLogs/types';
import { Link } from 'react-router-dom';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import dayjs from 'dayjs';

export default function CampaignLog({ activity }: IActivityLogItemProps) {
  const { createdAt, content } = activity;

  const renderContent = () => {
    return (
      <span>
        Campaign{' '}
        <Link to={`/campaigns/show/${content.campaignId}`} target="_blank">
          <strong>"{content && content.title}"</strong>
        </Link>{' '}
        has been sent to <strong>{content && content.to}</strong>
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
