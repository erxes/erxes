import {
  ActivityDate,
  FlexBody,
  FlexCenterContent
} from '@erxes/ui-log/src/activityLogs/styles';

import { getCPUserName } from '@erxes/ui-log/src/activityLogs/utils';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import { renderUserFullName } from '@erxes/ui/src/utils';
import dayjs from 'dayjs';
import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  activity: any;
  contentDetail: any;
};

class BoardItemCreatedLog extends React.Component<Props> {
  renderContent = () => {
    const { activity, contentDetail } = this.props;
    const { contentType, createdByDetail } = activity;

    let userName = 'Unknown';

    const body = (
      <Link
        to={`/${contentType}/board?_id=${activity._id}&itemId=${contentDetail._id}`}
        target="_blank"
      >
        {contentDetail.name} <Icon icon="arrow-to-right" />
      </Link>
    );

    if (createdByDetail && createdByDetail.type === 'user') {
      const { content } = createdByDetail;

      if (content && content.details) {
        userName = renderUserFullName(createdByDetail.content);
      }
    }

    if (createdByDetail && createdByDetail.type === 'clientPortalUser') {
      userName = getCPUserName(createdByDetail.content);
      const cpUrl = createdByDetail.content.clientPortal.url || '';
      return (
        <span>
          <strong>{userName}</strong> created {body} {contentType} from{' '}
          <a href={cpUrl} target="_blank">
            {createdByDetail.content.clientPortal.name || 'client portal'}
          </a>
        </span>
      );
    }

    return (
      <span>
        <strong>{userName}</strong> created {body} {contentType}
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

export default BoardItemCreatedLog;
