import {
  ActivityDate,
  FlexBody,
  FlexCenterContent,
} from '@erxes/ui-log/src/activityLogs/styles';

import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import dayjs from 'dayjs';

const TaggedLog: React.FC<any> = ({
  activity,
  investments,
  packageId,
  amount,
}: any) => {
  const renderContent = () => {
    const found = investments.find(
      (element) => element.package._id === packageId,
    );

    return (
      <span>
        invested {amount} to {found.package.name}
      </span>
    );
  };

  const { createdAt } = activity;

  return (
    <FlexCenterContent>
      <FlexBody>{renderContent()}</FlexBody>
      <Tip text={dayjs(createdAt).format('llll')}>
        <ActivityDate>{dayjs(createdAt).format('MMM D, h:mm A')}</ActivityDate>
      </Tip>
    </FlexCenterContent>
  );
};

export default TaggedLog;
