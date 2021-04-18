import dayjs from 'dayjs';
import {
  ActivityDate,
  FlexBody,
  FlexCenterContent
} from 'modules/activityLogs/styles';
import { IActivityLogItemProps } from 'modules/activityLogs/types';
import Tip from 'modules/common/components/Tip';
import React from 'react';

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
