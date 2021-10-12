import dayjs from 'dayjs';
import Icon from 'modules/common/components/Icon';
import * as React from 'react';
import {
  ActivityList,
  NameCardStyle,
  ActionText,
  DescText,
  ObjectText,
  DateType
} from 'modules/boards/styles/viewtype';
import NameCard from 'modules/common/components/nameCard/NameCard';
import { getIconAndColor } from 'modules/boards/utils';
import { Link } from 'react-router-dom';

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

  render() {
    const { activityLog } = this.props;

    const { contentTypeDetail, contentType } = activityLog;

    const iconAndColor = getIconAndColor(activityLog.action) || {};

    const contentTypeName = (
      <Link
        to={`/${contentType}/board?_id=${activityLog._id}&itemId=${contentTypeDetail._id}`}
        target="_blank"
      >
        {activityLog.contentTypeDetail.name}
      </Link>
    );

    return (
      <ActivityList key={activityLog._id}>
        <DateType>
          <span>{dayjs(activityLog.createdAt).format('MMM D')}</span>
        </DateType>
        <Icon icon={iconAndColor.icon} size={20} color={iconAndColor.color} />
        <NameCardStyle>
          <NameCard
            user={activityLog.createdUser}
            singleLine={true}
            avatarSize={30}
          />
        </NameCardStyle>
        <ActionText>{activityLog.action}</ActionText>
        <ObjectText>{contentTypeName}</ObjectText>
        <DescText>{this.renderDescText()}</DescText>
        <span>{dayjs(activityLog.createdAt).format('h:mm A')}</span>
      </ActivityList>
    );
  }
}

export default ActivityLogsByActionRow;
