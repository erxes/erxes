import gql from 'graphql-tag';
import { IUser } from 'modules/auth/types';
import { IRouterProps } from 'modules/common/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { withProps } from '../../common/utils';
import Widget from '../components/Widget';
import { queries, subscriptions } from '../graphql';
import { NotificationsCountQueryResponse } from '../types';

type Props = {
  currentUser: IUser;
};

type FinalProps = {
  notificationCountQuery: NotificationsCountQueryResponse;
} & IRouterProps &
  Props;

const subscription = gql(subscriptions.notificationSubscription);

class WidgetContainer extends React.Component<FinalProps> {
  componentWillMount() {
    const { notificationCountQuery, currentUser } = this.props;

    notificationCountQuery.subscribeToMore({
      document: subscription,
      variables: { userId: currentUser ? currentUser._id : null },
      updateQuery: () => {
        notificationCountQuery.refetch();
      }
    });
  }

  render() {
    const { notificationCountQuery } = this.props;

    const updatedProps = {
      ...this.props,
      unreadCount: notificationCountQuery.notificationCounts
    };

    return <Widget {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, NotificationsCountQueryResponse, { requireRead: boolean }>(
      gql(queries.notificationCounts),
      {
        name: 'notificationCountQuery',
        options: () => ({
          variables: {
            requireRead: true
          },
          notifyOnNetworkStatusChange: true
        })
      }
    )
  )(withRouter<FinalProps>(WidgetContainer))
);
