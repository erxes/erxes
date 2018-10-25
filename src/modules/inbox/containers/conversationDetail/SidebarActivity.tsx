import gql from 'graphql-tag';
import { IUser } from 'modules/auth/types';
import { queries } from 'modules/customers/graphql';
import { ActivityLogQueryResponse, ICustomer } from 'modules/customers/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import SidebarActivity from '../../components/conversationDetail/sidebar/SidebarActivity';

type Props = {
  customer: ICustomer;
  currentSubTab: string;
};

type FinalProps = {
  customerActivityLogQuery: ActivityLogQueryResponse;
  currentUser: IUser;
} & Props;

class SidebarActivityContainer extends React.Component<FinalProps> {
  render() {
    const { customerActivityLogQuery, currentUser, customer } = this.props;

    const updatedProps = {
      ...this.props,
      customer,
      loadingLogs: customerActivityLogQuery.loading,
      activityLogsCustomer: customerActivityLogQuery.activityLogsCustomer || [],
      currentUser
    };

    return <SidebarActivity {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ActivityLogQueryResponse, { _id: string }>(
      gql(queries.activityLogsCustomer),
      {
        name: 'customerActivityLogQuery',
        options: ({ customer }) => ({
          variables: {
            _id: customer._id
          }
        })
      }
    )
  )(SidebarActivityContainer)
);
