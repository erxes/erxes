import {
  ActivityDate,
  FlexBody,
  FlexCenterContent
} from '@erxes/ui-log/src/activityLogs/styles';

import { IActivityLogItemProps } from '@erxes/ui-log/src/activityLogs/types';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import dayjs from 'dayjs';

class SegmentLog extends React.Component<IActivityLogItemProps> {
  renderContent = () => {
    const { activity } = this.props;
    const { contentType, content } = activity;

    return (
      <span>
        This {contentType} joined a <strong> {content.content}</strong> segment
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

export default SegmentLog;
