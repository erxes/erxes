import DataWithLoader from 'modules/common/components/DataWithLoader';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import Sidebar from './Sidebar';
import Pagination from 'modules/common/components/pagination/Pagination';
import { IActivityLog } from 'modules/activityLogs/types';
import ActivityLogsByActionRow from './ActivityLogsByActionRow';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from 'modules/common/types';

type Props = {
  queryParams: any;
  isLoading: boolean;
  errorMessage: string;
} & commonProps;

type commonProps = {
  activityLogsByAction: IActivityLog[];
  count: number;
  refetchQueries: any;
} & IRouterProps;

type State = {
  action?: string;
};

class ActivityLogs extends React.Component<Props, State> {
  renderObjects() {
    const { activityLogsByAction } = this.props;
    const rows: JSX.Element[] = [];

    if (!activityLogsByAction) {
      return rows;
    }

    for (const activityLog of activityLogsByAction) {
      rows.push(
        <ActivityLogsByActionRow
          key={activityLog._id}
          activityLog={activityLog}
        />
      );
    }

    return rows;
  }

  render() {
    const { count, queryParams } = this.props;

    return (
      <Wrapper
        footer={<Pagination count={count} />}
        content={<DataWithLoader loading={false} data={this.renderObjects()} />}
        leftSidebar={<Sidebar queryParams={queryParams} />}
      />
    );
  }
}

export default withRouter(ActivityLogs);
