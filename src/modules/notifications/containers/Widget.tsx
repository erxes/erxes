import gql from 'graphql-tag';
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { Widget } from '../components';
import { queries } from '../graphql';

type Props = {
  notificationCountQuery: any;
};

class WidgetContainer extends Component<Props> {
  render() {
    const { notificationCountQuery } = this.props;

    const updatedProps = {
      ...this.props,
      unreadCount: notificationCountQuery.notificationCounts
    };

    return <Widget {...updatedProps} />;
  }
}

export default withRouter(
  compose(
    graphql(gql(queries.notificationCounts), {
      name: 'notificationCountQuery',
      options: () => ({
        variables: {
          requireRead: true
        }
      })
    })
  )(WidgetContainer)
);
