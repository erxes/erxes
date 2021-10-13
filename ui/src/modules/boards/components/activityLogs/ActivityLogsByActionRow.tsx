import dayjs from 'dayjs';
import * as React from 'react';
import {
  ActivityList,
  InfoSection,
  DateType
} from 'modules/boards/styles/viewtype';
import NameCard from 'modules/common/components/nameCard/NameCard';
import { Link } from 'react-router-dom';
import {
  AvatarSection,
  CreatedUser
} from 'modules/notifications/components/styles';
import ActionIcon from './ActionIcon';

type Props = {
  activityLog: any;
};

class ActivityLogsByActionRow extends React.Component<Props> {
  renderDescText() {
    const { activityLog } = this.props;

    if (activityLog.action === 'delete') {
      return activityLog.content;
    }

    return activityLog.content.text;
  }

  renderContentType() {
    const { activityLog } = this.props;

    const { contentTypeDetail, contentType } = activityLog;

    return (
      <Link
        to={`/${contentType}/board?_id=${activityLog._id}&itemId=${contentTypeDetail._id}`}
        target="_blank"
      >
        {activityLog.contentTypeDetail.name}
      </Link>
    );
  }

  renderCreatedUser() {
    const { activityLog } = this.props;
    const { createdUser } = activityLog;

    return (
      <Link
        to={`/settings/team/details/${createdUser._id}`}
        target="_blank"
        key={Math.random()}
      >
        {createdUser.details
          ? createdUser.details.fullName || ''
          : createdUser.username || createdUser.email}
        &nbsp;
      </Link>
    );
  }

  renderAllContent() {
    const { activityLog } = this.props;

    return (
      <CreatedUser>
        {this.renderCreatedUser()}
        <span>
          {activityLog.action}&nbsp;&nbsp;
          {this.renderContentType()}&nbsp;&nbsp;
          {this.renderDescText()}
        </span>
      </CreatedUser>
    );
  }

  render() {
    const { activityLog } = this.props;

    return (
      <ActivityList key={activityLog._id}>
        <AvatarSection>
          <NameCard.Avatar
            user={activityLog.createdUser}
            size={30}
            icon={<ActionIcon queryParams={activityLog.action} />}
          />
        </AvatarSection>
        <InfoSection>{this.renderAllContent()}</InfoSection>
        <DateType>
          {dayjs(activityLog.date).format('DD MMM YYYY, HH:mm')}
        </DateType>
      </ActivityList>
    );
  }
}

export default ActivityLogsByActionRow;
