import DataWithLoader from 'modules/common/components/DataWithLoader';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import Sidebar from './Sidebar';
import Pagination from 'modules/common/components/pagination/Pagination';
import { IActivityLog } from 'modules/activityLogs/types';
import ActivityLogsByActionRow from './ActivityLogsByActionRow';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from 'modules/common/types';
import EmptyState from 'modules/common/components/EmptyState';

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

class ActivityLogs extends React.Component<Props> {
  renderObjects() {
    const { activityLogsByAction } = this.props;
    const rows: JSX.Element[] = [];

    if (activityLogsByAction.length === 0) {
      return (
        <EmptyState
          image="/images/actions/26.svg"
          size="large"
          text="There is no activity at the moment!"
        />
      );
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
        leftSidebar={<Sidebar queryParams={queryParams} />}
        content={<DataWithLoader loading={false} data={this.renderObjects()} />}
      />
    );
  }
}

export default withRouter(ActivityLogs);
