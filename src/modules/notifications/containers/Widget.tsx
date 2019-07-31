import gql from 'graphql-tag';
import { IRouterProps } from 'modules/common/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { withProps } from '../../common/utils';
import Widget from '../components/Widget';
import { queries, subscriptions } from '../graphql';
import { NotificationsCountQueryResponse } from '../types';

type Props = {
  notificationCountQuery: NotificationsCountQueryResponse;
} & IRouterProps;

const subscription = gql(subscriptions.notificationSubscription);

class WidgetContainer extends React.Component<Props> {
  componentWillMount() {
    const { notificationCountQuery } = this.props;

    notificationCountQuery.subscribeToMore({
      document: subscription,

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

export default withProps<{}>(
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
  )(withRouter<Props>(WidgetContainer))
);
