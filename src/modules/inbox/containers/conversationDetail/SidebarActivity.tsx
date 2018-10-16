import gql from 'graphql-tag';
import { IUser } from 'modules/auth/types';
import { queries } from 'modules/customers/graphql';
import { ICustomer } from 'modules/customers/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import SidebarActivity from '../../components/conversationDetail/sidebar/SidebarActivity';

type Props = {
  customerActivityLogQuery: any;
  currentUser: IUser;
  customer: ICustomer;
  currentSubTab: string;
};

class SidebarActivityContainer extends React.Component<Props> {
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

export default compose(
  graphql(gql(queries.activityLogsCustomer), {
    name: 'customerActivityLogQuery',
    options: ({ customer }: { customer: ICustomer }) => ({
      variables: {
        _id: customer._id
      }
    })
  })
)(SidebarActivityContainer);
