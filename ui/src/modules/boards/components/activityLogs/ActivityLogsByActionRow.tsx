import dayjs from 'dayjs';
import Icon from 'modules/common/components/Icon';
import * as React from 'react';
import {
  ActivityList,
  NameCardStyle,
  ActionText,
  DescText
} from 'modules/boards/styles/viewtype';
import NameCard from 'modules/common/components/nameCard/NameCard';

type Props = {
  activityLog: any;
};

class ActivityLogsByActionRow extends React.Component<Props> {
  render() {
    const { activityLog } = this.props;

    return (
      <ActivityList key={activityLog._id}>
        <span>{dayjs(activityLog.createdAt).format('MMM D')}</span>
        <Icon icon="edit-3" size={25} color="#FDA50D" />
        <NameCardStyle>
          <NameCard
            user={activityLog.createdUser}
            singleLine={true}
            avatarSize={30}
          />
        </NameCardStyle>
        <ActionText>{activityLog.action}</ActionText>
        <DescText>
          {typeof activityLog.content === 'object'
            ? activityLog.content.text
            : activityLog.content}
        </DescText>
        <DescText>{activityLog.contentTypeDetail.name}</DescText>
        <span>{dayjs(activityLog.createdAt).format('h:mm A')}</span>
      </ActivityList>
    );
  }
}

export default ActivityLogsByActionRow;
