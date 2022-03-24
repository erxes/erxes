import dayjs from 'dayjs';
import {
  ActivityDate,
  FlexBody,
  FlexCenterContent
} from '@erxes/ui/src/activityLogs/styles';
import { IActivityLogItemProps } from '@erxes/ui/src/activityLogs/types';
import Tip from '@erxes/ui/src/components/Tip';
import { renderUserFullName } from '@erxes/ui/src/utils';
import React from 'react';

class CustomerCreate extends React.Component<IActivityLogItemProps> {
  renderContent = () => {
    const { activity } = this.props;
    const { createdByDetail } = activity;

    if (createdByDetail && createdByDetail.type === 'user') {
      const userName = renderUserFullName(createdByDetail.content);

      return (
        <span>
          <strong>{userName}</strong> created&nbsp; this customer
        </span>
      );
    }

    if (createdByDetail && createdByDetail.type === 'brand') {
      const { content } = createdByDetail;

      return (
        <span>
          This customer registered to erxes by
          {content ? ` ${content.name}'s integrations` : ''}
        </span>
      );
    }

    return (
      <span>
        This customer <b>registered</b> to erxes
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

export default CustomerCreate;
