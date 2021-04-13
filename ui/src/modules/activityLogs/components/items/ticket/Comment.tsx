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

class TicketCommentCreate extends React.Component<IActivityLogItemProps> {
  renderContent = () => {
    const { activity } = this.props;
    const { content, createdByDetail } = activity;

    let userName = 'Unknown';

    if (createdByDetail) {
      const { type } = createdByDetail;

      if (type === 'user') {
        userName = renderUserFullName(createdByDetail.content);
      }

      if (type === 'customer') {
        const customer = createdByDetail.content || {};

        userName = `${customer.firstName} ${customer.lastName}`;
      }
    }

    return (
      <span>
        <strong>{userName}</strong>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </span>
    );
  };

  render() {
    const { activity } = this.props;
    const { createdAt } = activity;

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

export default TicketCommentCreate;
