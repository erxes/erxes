import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Widget } from '../components';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries, subscriptions } from '../graphql';

class WidgetContainer extends Component {
  componentWillMount() {
    this.props.notificationCountQuery.subscribeToMore({
      // listen for all notifications changes
      document: gql(subscriptions.notificationsChanged),
      updateQuery: () => {
        this.props.notificationCountQuery.refetch();
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

WidgetContainer.propTypes = {
  notificationCountQuery: PropTypes.object
};

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
