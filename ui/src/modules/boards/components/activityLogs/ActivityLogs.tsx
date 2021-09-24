import DataWithLoader from 'modules/common/components/DataWithLoader';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import Sidebar from './Sidebar';
import { IOptions } from 'modules/boards/types';
import { ILog } from 'modules/settings/logs/types';
import dayjs from 'dayjs';
import Pagination from 'modules/common/components/pagination/Pagination';
import NameCard from 'modules/common/components/nameCard/NameCard';
import {
  ActivityList,
  NameCardStyle,
  DescText,
  ActionText
} from 'modules/boards/styles/viewtype';
import Icon from 'modules/common/components/Icon';

type Props = {
  queryParams: any;
  isLoading: boolean;
  errorMessage: string;
  options: IOptions;
} & commonProps;

type commonProps = {
  logs: ILog[];
  count: number;
  refetchQueries: any;
};

class ActivityLogs extends React.Component<Props> {
  renderContent() {
    const { logs } = this.props;

    return logs.map((log: any) => (
      <ActivityList>
        <span>{dayjs(log.createdAt).format('MMM D')}</span>
        <Icon icon="edit-3" size={25} color="#FDA50D" />
        <NameCardStyle>
          <NameCard
            user={log.newData.assignedUserId}
            singleLine={true}
            avatarSize={30}
          />
          <span>{log.unicode}</span>
        </NameCardStyle>
        <ActionText>{log.action}</ActionText>
        <DescText>{log.description}</DescText>
        <span>{dayjs(log.createdAt).format('h:mm A')}</span>
      </ActivityList>
    ));
  }

  render() {
    const { count } = this.props;
    return (
      <Wrapper
        footer={<Pagination count={count} />}
        content={<DataWithLoader data={this.renderContent()} />}
        leftSidebar={<Sidebar />}
      />
    );
  }
}

export default ActivityLogs;
