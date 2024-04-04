import {
  ActivityDate,
  FlexBody,
  FlexCenterContent
} from '@erxes/ui-log/src/activityLogs/styles';

import { IActivityLogItemProps } from '@erxes/ui-log/src/activityLogs/types';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import dayjs from 'dayjs';
import { renderUserFullName } from '@erxes/ui/src/utils';

class ArchiveLog extends React.Component<IActivityLogItemProps> {
  renderContent = () => {
    const { activity } = this.props;
    const { contentType, createdByDetail, content } = activity;

    const type = contentType ? contentType.split(':')[1] : '';

    let userName = 'system';

    if (createdByDetail && createdByDetail.type === 'user') {
      const createdByDetailContent = createdByDetail.content;

      if (createdByDetailContent && createdByDetailContent.details) {
        userName = renderUserFullName(createdByDetailContent);
      }
    }

    return (
      <span>
        <strong>{userName}</strong> {content} this {type}
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
