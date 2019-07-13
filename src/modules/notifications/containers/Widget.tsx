import gql from 'graphql-tag';
import { IRouterProps } from 'modules/common/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { withProps } from '../../common/utils';
import Widget from '../components/Widget';
import { queries } from '../graphql';
import { NotificationsCountQueryResponse } from '../types';

type Props = {
  notificationCountQuery: NotificationsCountQueryResponse;
} & IRouterProps;

class WidgetContainer extends React.Component<Props> {
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
