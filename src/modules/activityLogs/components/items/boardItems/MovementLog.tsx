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

    const { contentDetail } = activity;

    return { contentDetail };
  };

  render() {
    const { activity } = this.props;

    const { contentType, contentDetail, createdAt } = activity;

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
          {contentDetail}
        </React.Fragment>
      </ActivityRow>
    );
  }
}

export default MovementLog;
