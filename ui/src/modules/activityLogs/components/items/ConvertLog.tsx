import dayjs from 'dayjs';
import {
  ActivityDate,
  FlexBody,
  FlexCenterContent
} from 'modules/activityLogs/styles';
import { IActivityLog } from 'modules/activityLogs/types';
import Tip from 'modules/common/components/Tip';
import { __, renderUserFullName } from 'modules/common/utils';
import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  activity: IActivityLog;
};

class ConvertLog extends React.Component<Props> {
  renderContent() {
    const { activity } = this.props;
    const {
      contentTypeDetail,
      contentType,
      content,
      createdByDetail
    } = activity;

    let userName = 'Unknown';

    if (createdByDetail && createdByDetail.type === 'user') {
      userName = renderUserFullName(createdByDetail.content);
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
        }/${contentType}/board?_id=${activity._id}&itemId=${
          contentTypeDetail._id
        }`}
        target="_blank"
      >
        {contentTypeDetail.name}
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
