import dayjs from 'dayjs';
import {
  ActivityDate,
  FlexBody,
  FlexCenterContent
} from 'modules/activityLogs/styles';
import { IActivityLogItemProps } from 'modules/activityLogs/types';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { renderUserFullName } from 'modules/common/utils';
import React from 'react';
import { Link } from 'react-router-dom';

class BoardItemCreate extends React.Component<IActivityLogItemProps> {
  renderContent = () => {
    const { activity } = this.props;
    const { contentTypeDetail, contentType, createdByDetail } = activity;

    let userName = 'Unknown';

    if (createdByDetail && createdByDetail.type === 'user') {
      userName = renderUserFullName(createdByDetail.content);
    }

    const body = (
      <Link
        to={`/${contentType}/board?_id=${activity._id}&itemId=${contentTypeDetail._id}`}
        target="_blank"
      >
        {contentTypeDetail.name} <Icon icon="arrow-to-right" />
      </Link>
    );

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

export default BoardItemCreate;
