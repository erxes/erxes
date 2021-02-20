import dayjs from 'dayjs';
import {
  ActivityDate,
  FlexBody,
  FlexCenterContent
} from 'modules/activityLogs/styles';
import { IActivityLogItemProps } from 'modules/activityLogs/types';
import Tip from 'modules/common/components/Tip';
import { renderUserFullName } from 'modules/common/utils';
import React from 'react';

class ArchiveLog extends React.Component<IActivityLogItemProps> {
  renderContent = () => {
    const { activity } = this.props;
    const { contentType, createdByDetail, content } = activity;

    let userName = 'Unknown';

    if (createdByDetail && createdByDetail.type === 'user') {
      if (createdByDetail.content.details) {
        userName = renderUserFullName(createdByDetail.content);
      }
    }

    return (
      <span>
        <strong>{userName}</strong> {content} this {contentType}
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

export default ArchiveLog;
