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
import { renderUserFullName } from '@erxes/ui/src/utils';

type Props = { contentDetail: any } & IActivityLogItemProps;

class AssigneeLog extends React.Component<Props> {
  renderContent = () => {
    const { activity, contentDetail } = this.props;
    const { createdByDetail } = activity;

    let userName = 'Unknown';

    if (createdByDetail && createdByDetail.type === 'user') {
      const { content } = createdByDetail;

      if (content && content.details) {
        userName = renderUserFullName(createdByDetail.content);
      }
    }

    const { addedUsers = [], removedUsers = [] } = contentDetail;

    const addedUserNames = addedUsers.map(user => {
      return (
        <Link
          to={`/settings/team/details/${user._id}`}
          target="_blank"
          key={Math.random()}
        >
          &nbsp;{user.details.fullName || user.email}&nbsp;
        </Link>
      );
    });

    const removedUserNames = removedUsers.map(user => {
      return (
        <Link
          to={`/settings/team/details/${user._id}`}
          target="_blank"
          key={Math.random()}
        >
          &nbsp;{user.details.fullName || user.email}&nbsp;
        </Link>
      );
    });

    if (addedUserNames.length > 0 && removedUserNames.length === 0) {
      return (
        <span>
          {userName} assigned
          {addedUserNames}
        </span>
      );
    }

    if (removedUserNames && !addedUserNames) {
      return (
        <span>
          {userName} removed assignee of
          {removedUserNames}
        </span>
      );
    }

    return (
      <span>
        {userName} removed assignee of
        {removedUserNames}
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

export default AssigneeLog;
