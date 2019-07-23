import gql from 'graphql-tag';
import { queries } from 'modules/activityLogs/graphql';
import { IUser } from 'modules/auth/types';
import { ActivityLogQueryResponse, ICustomer } from 'modules/customers/types';
import React from 'react';
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
      activityLogsCustomer: customerActivityLogQuery.activityLogs || [],
      currentUser
    };

    return <SidebarActivity {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ActivityLogQueryResponse>(gql(queries.activityLogs), {
      name: 'customerActivityLogQuery',
      options: ({ customer }) => ({
        variables: {
          contentId: customer._id,
          contentType: 'customer'
        }
      })
    })
  )(SidebarActivityContainer)
);
