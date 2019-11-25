import dayjs from 'dayjs';
import {
  ActivityDate,
  FlexBody,
  FlexCenterContent
} from 'modules/activityLogs/styles';
import { IActivityLog } from 'modules/activityLogs/types';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  activity: IActivityLog;
};

class CreatedLog extends React.Component<Props> {
  renderContent = () => {
    const { activity } = this.props;
    // tslint:disable-next-line:no-console
    console.log(activity);
    const { contentType, contentTypeDetail, createdByDetail } = activity;

    let userName = 'Unknown';

    if (createdByDetail.details) {
      userName = createdByDetail.details.fullName || 'Unknown';
    }

    return (
      <span>
        <strong>{userName}</strong> created {contentType}&nbsp;
        <Link
          to={`/${contentType}/board?_id=${activity._id}&itemId=${
            contentTypeDetail._id
          }`}
        >
          {contentTypeDetail && contentTypeDetail.name}&nbsp;
          <Icon icon="arrow-to-right" />
        </Link>
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

export default CreatedLog;
