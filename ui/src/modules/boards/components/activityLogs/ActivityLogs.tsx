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
  ListFields,
  NameCardStyle,
  DescText,
  ActionText
} from 'modules/boards/styles/viewtype';

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
    console.log(logs);

    return logs.map((log: any) => (
      <ActivityList>
        <ListFields>
          <span>{dayjs(log.createdAt).format('YYYY-MM-DD HH:mm:ss')}</span>
          <NameCardStyle>
            <NameCard
              user={log.newData.assignedUserId}
              singleLine={true}
              avatarSize={30}
            />
            <p>{log.unicode}</p>
          </NameCardStyle>
          <ActionText>{log.action}</ActionText>
          <DescText>{log.description}</DescText>
        </ListFields>
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
