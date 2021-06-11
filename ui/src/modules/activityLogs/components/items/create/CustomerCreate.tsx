import {
  ActivityDate,
  FlexBody,
  FlexCenterContent
} from 'modules/activityLogs/styles';
import { IActivityLog } from 'modules/activityLogs/types';
import React from 'react';
import Tip from 'modules/common/components/Tip';

import dayjs from 'dayjs';
import { renderUserFullName, __ } from 'modules/common/utils';

type Props = {
  activity: IActivityLog;
};

class CustomerCreate extends React.Component<Props> {
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

    if (createdByDetail && createdByDetail.type === __('brand')) {
      const { content } = createdByDetail;

      return (
        <span>
          This customer registered to erxes by
          {content ? ` ${content.name}{__("'s Integrations")}` : ''}
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
