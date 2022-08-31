import ActivityLogsByActionRow from './ActivityLogsByActionRow';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { IActivityLog } from '@erxes/ui-log/src/activityLogs/types';
import { IRouterProps } from '@erxes/ui/src/types';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import React from 'react';
import Sidebar from './Sidebar';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { withRouter } from 'react-router-dom';

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
    const { count, queryParams, isLoading } = this.props;

    return (
      <Wrapper
        footer={<Pagination count={count} />}
        leftSidebar={<Sidebar queryParams={queryParams} />}
        content={
          <DataWithLoader loading={isLoading} data={this.renderObjects()} />
        }
      />
    );
  }
}

export default withRouter(ActivityLogs);
