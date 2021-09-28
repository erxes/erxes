import dayjs from 'dayjs';
import Icon from 'modules/common/components/Icon';
import * as React from 'react';
import { IActivityLog } from 'modules/activityLogs/types';
import {
  ActivityList,
  NameCardStyle,
  ActionText,
  DescText
} from 'modules/boards/styles/viewtype';
import NameCard from 'modules/common/components/nameCard/NameCard';

type Props = {
  activityLog: IActivityLog;
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
            user={activityLog.createdByDetail.content}
            singleLine={true}
            avatarSize={30}
          />
        </NameCardStyle>
        <ActionText>{activityLog.action}</ActionText>
        <DescText>{activityLog.contentTypeDetail.searchText}</DescText>
        <span>{dayjs(activityLog.createdAt).format('h:mm A')}</span>
      </ActivityList>
    );
  }
}

export default ActivityLogsByActionRow;
