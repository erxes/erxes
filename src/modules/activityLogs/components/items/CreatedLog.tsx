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
  renderBoardItemLog() {
    const { activity } = this.props;
    const { contentTypeDetail, contentType, createdByDetail } = activity;

    let userName = 'Unknown';

    if (createdByDetail && createdByDetail.type === 'user') {
      const { content } = createdByDetail;

      if (content.details) {
        userName = createdByDetail.content.details.fullName || 'Unknown';
      }
    }

    const body = (
      <Link
        to={`/${contentType}/board?_id=${activity._id}&itemId=${
          contentTypeDetail._id
        }`}
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
  }

  renderCustomerLog = () => {
    const { activity } = this.props;
    const { createdByDetail } = activity;

    if (createdByDetail && createdByDetail.type === 'user') {
      const { content } = createdByDetail;
      let userName = 'Unknown';

      if (content.details) {
        userName = createdByDetail.content.details.fullName || 'Unknown';
      }
      return (
        <span>
          <strong>{userName}</strong> created&nbsp; this customer
        </span>
      );
    }

    if (createdByDetail && createdByDetail.type === 'brand') {
      const { content } = createdByDetail;

      return (
        <span>
          This customer registered to erxes
          {content ? ` ${content.name}'s integrations` : ''}
        </span>
      );
    }

    return (
      <span>
        This customer <b>registered</b> to erxes
      </span>
    );
  };

  renderContent = () => {
    const { activity } = this.props;
    const { contentType } = activity;

    if (contentType === 'customer') {
      return this.renderCustomerLog();
    }

    return this.renderBoardItemLog();
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
