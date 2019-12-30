import dayjs from 'dayjs';
import {
  ActivityDate,
  FlexBody,
  FlexCenterContent
} from 'modules/activityLogs/styles';
import { IActivityLog } from 'modules/activityLogs/types';
import Tip from 'modules/common/components/Tip';
import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  activity: IActivityLog;
};

class MovementLog extends React.Component<Props> {
  renderContent = () => {
    const { activity } = this.props;
    const { contentType, contentDetail, createdByDetail } = activity;

    let userName = 'Unknown';

    if (createdByDetail && createdByDetail.type === 'user') {
      const { content } = createdByDetail;

      if (content.details) {
        userName = createdByDetail.content.details.fullName || 'Unknown';
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
