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

class MovementLog extends React.Component<Props> {
  renderContent = () => {
    const { activity, contentDetail } = this.props;
    const { contentType, createdByDetail } = activity;

    let userName = 'Unknown';

    if (createdByDetail && createdByDetail.type === 'user') {
      const { content } = createdByDetail;

      if (content && content.details) {
        userName = renderUserFullName(createdByDetail.content);
      }
    }

    if (contentDetail.item) {
      const { item, destinationStage, oldStage } = contentDetail;

      return (
        <span>
          <strong>{userName}</strong> moved&nbsp;
          <Link
            to={`/${contentType}/board?_id=${activity._id}&itemId=${item._id}`}
            target="blank"
          >
            {item.name}
          </Link>
          &nbsp;
          {contentType} from&nbsp;
          <q>{oldStage}</q> to <q>{destinationStage}</q>
        </span>
      );
    }

    return (
      <span>
        <strong>
          {userName} {contentDetail.text || ''}
        </strong>
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

export default MovementLog;
