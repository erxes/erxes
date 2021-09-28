import DataWithLoader from 'modules/common/components/DataWithLoader';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import Sidebar from './Sidebar';
import Pagination from 'modules/common/components/pagination/Pagination';
import { IActivityLog } from 'modules/activityLogs/types';
import ActivityLogsByActionRow from './ActivityLogsByActionRow';

type Props = {
  queryParams: any;
  isLoading: boolean;
  errorMessage: string;
} & commonProps;

type commonProps = {
  activityLogsByAction: IActivityLog[];
  count: number;
  refetchQueries: any;
};

type State = {
  action?: string;
  contentType?: string;
  page?: string;
  perPage?: string;
};

class ActivityLogs extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const qp = props.queryParams || {
      action: '',
      contentType: ''
    };

    this.state = {
      action: qp.action,
      contentType: qp.contentType
    };
  }

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
    const { count } = this.props;
    return (
      <Wrapper
        footer={<Pagination count={count} />}
        content={<DataWithLoader loading={false} data={this.renderObjects()} />}
        leftSidebar={<Sidebar />}
      />
    );
  }
}

export default ActivityLogs;
