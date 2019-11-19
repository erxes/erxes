import dayjs from 'dayjs';
import {
  ActivityDate,
  FlexBody,
  FlexCenterContent
} from 'modules/activityLogs/styles';
import { IActivityLog } from 'modules/activityLogs/types';
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

    return (
      <>
        <FlexCenterContent>
          <FlexBody>
            <strong>{contentType} activity</strong>
          </FlexBody>
          <Tip text={dayjs(createdAt).format('llll')}>
            <ActivityDate>
              {dayjs(createdAt).format('MMM D, h:mm A')}
            </ActivityDate>
          </Tip>
        </FlexCenterContent>
        {this.renderContent()}
      </>
    );
  }
}

export default MovementLog;
