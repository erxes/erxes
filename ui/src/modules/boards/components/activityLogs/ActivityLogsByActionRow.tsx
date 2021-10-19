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
import RoundedBackgroundIcon from '../RoundedBackgroundIcon';

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

  getIcon() {
    const action = this.props.activityLog.action;
    let icon = 'user-check';

    if (action.includes('moved')) {
      icon = 'move';
    }

    if (action.includes('delete')) {
      icon = 'file-minus';
    }

    if (action.includes('addNote')) {
      icon = 'notes';
    }

    if (action.includes('create')) {
      icon = 'file-check';
    }

    if (action.includes('archive')) {
      icon = 'archive-alt';
    }

    return icon;
  }

  render() {
    const { activityLog } = this.props;

    return (
      <ActivityList key={activityLog._id}>
        <AvatarSection>
          <NameCard.Avatar
            user={activityLog.createdUser}
            size={30}
            icon={<RoundedBackgroundIcon icon={this.getIcon()} />}
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
