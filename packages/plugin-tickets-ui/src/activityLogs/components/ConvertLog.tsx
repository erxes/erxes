import {
  ActivityDate,
  FlexBody,
  FlexCenterContent
} from '@erxes/ui-log/src/activityLogs/styles';
import { __, renderUserFullName } from '@erxes/ui/src/utils';

import { IActivityLogItemProps } from '@erxes/ui-log/src/activityLogs/types';
import { Link } from 'react-router-dom';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import dayjs from 'dayjs';

type Props = { contentDetail: any } & IActivityLogItemProps;

class ConvertLog extends React.Component<Props> {
  renderContent() {
    const { activity, contentDetail } = this.props;
    const { contentType, content, createdByDetail } = activity;

    let userName = 'Unknown';

    if (createdByDetail && createdByDetail.type === 'user') {
      if (createdByDetail.content && createdByDetail.content.details) {
        userName = renderUserFullName(createdByDetail.content);
      }
    }

    const conversation = (
      <Link to={`/inbox/index?_id=${content}`} target="_blank">
        conversation
      </Link>
    );

    const item = (
      <Link
        to={`${
          contentType === 'ticket' ? '/inbox' : ''
        }/${contentType}/board?_id=${activity._id}&itemId=${contentDetail._id}`}
        target="_blank"
      >
        {contentDetail.name}
      </Link>
    );

    return (
      <span>
        <strong>{userName}</strong> {__('converted')} {item} {contentType}{' '}
        {__('from')} a {conversation}
      </span>
    );
  }

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

export default ConvertLog;
