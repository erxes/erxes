import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { queries } from '@erxes/ui-logs/src/activityLogs/graphql';
import { IUser } from '@erxes/ui/src/auth/types';
import { ICustomer } from '@erxes/ui/src/customers/types';
import { ActivityLogQueryResponse } from '@erxes/ui-contacts/src/customers/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '@erxes/ui/src/utils';
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
