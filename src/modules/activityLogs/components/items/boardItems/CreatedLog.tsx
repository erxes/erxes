import dayjs from 'dayjs';
import {
  ActivityDate,
  FlexBody,
  FlexContent
} from 'modules/activityLogs/styles';
import { IActivityLog } from 'modules/activityLogs/types';
import Tip from 'modules/common/components/Tip';
import React from 'react';

type Props = {
  activity: IActivityLog;
};

class CreatedLog extends React.Component<Props> {
  renderContent = () => {
    const { activity } = this.props;

    const { contentType, createdByDetail } = activity;

    let userName = 'Unknown';

    if (createdByDetail.details) {
      userName = createdByDetail.details.fullName || 'Unknown';
    }

    return (
      <span>
        <strong>{userName}</strong> created {contentType}
      </span>
    );
  };

  render() {
    const { activity } = this.props;
    const { contentType, createdAt } = activity;

    return (
      <>
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
      </>
    );
  }
}

export default CreatedLog;
