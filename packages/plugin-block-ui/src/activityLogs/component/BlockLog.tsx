import {
  ActivityDate,
  FlexBody,
  FlexCenterContent
} from '@erxes/ui-log/src/activityLogs/styles';

import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import dayjs from 'dayjs';

class TaggedLog extends React.Component<any> {
  renderContent = () => {
    const { activity, investments, packageId, amount } = this.props;

    const found = investments.find(
      element => element.package._id === packageId
    );

    return (
      <span>
        invested {amount} to {found.package.name}
      </span>
    );
  };

  render() {
    const { createdAt } = this.props.activity;

    return (
      <FlexCenterContent>
        <FlexBody>{this.renderContent()}</FlexBody>
        <Tip text={dayjs(createdAt).format('llll')}>
          <ActivityDate>
            {dayjs(createdAt).format('MMM D, h:mm A')}
          </ActivityDate>
        </Tip>
      </FlexCenterContent>
    );
  }
}

export default TaggedLog;
