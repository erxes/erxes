import dayjs from 'dayjs';
import {
  ActivityDate,
  ActivityIcon,
  ActivityRow,
  FlexBody,
  FlexContent
} from 'modules/activityLogs/styles';
import { IActivityLog } from 'modules/activityLogs/types';
import { getIconAndColor } from 'modules/activityLogs/utils';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import React from 'react';

type Props = {
  activity: IActivityLog;
};

class MovementLog extends React.Component<Props> {
  renderContent = () => {
    const { activity } = this.props;

    const { contentDetail, createdByDetail } = activity;

    let userName = 'Unknown';

    if (createdByDetail.details) {
      userName = createdByDetail.details.fullName || 'Unknown';
    }

    if (contentDetail.item) {
      const { item, destinationStage, oldStage } = contentDetail;

      return (
        <span>
          <strong>{userName}</strong> moved {item.name} deal from
          {destinationStage} to {oldStage}
        </span>
      );
    }

    return (
      <span>
        <strong>{userName}</strong>
      </span>
    );
  };

  render() {
    const { activity } = this.props;

    const { contentType, createdAt } = activity;

    const iconAndColor = getIconAndColor(contentType);

    return (
      <ActivityRow key={Math.random()}>
        <ActivityIcon color={iconAndColor.color}>
          <Icon icon={iconAndColor.icon} />
        </ActivityIcon>
        <React.Fragment>
          <FlexContent>
            <FlexBody>
              <strong>{contentType} activity</strong>
            </FlexBody>
            <Tip text={dayjs(createdAt).format('llll')}>
              <ActivityDate>
                {dayjs(createdAt).format('MMM D, h:mm A')}
              </ActivityDate>
            </Tip>
          </FlexContent>
          {this.renderContent()}
        </React.Fragment>
      </ActivityRow>
    );
  }
}

export default MovementLog;
