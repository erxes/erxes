import gql from 'graphql-tag';
import { IRouterProps } from 'modules/common/types';
import React, { Component } from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { Widget } from '../components';
import { queries } from '../graphql';

interface IProps extends IRouterProps {
  notificationCountQuery: any;
};

class WidgetContainer extends Component<IProps> {
  render() {
    const { notificationCountQuery } = this.props;

    const updatedProps = {
      ...this.props,
      unreadCount: notificationCountQuery.notificationCounts
    };

    return <Widget {...updatedProps} />;
  }
}

export default withRouter<IRouterProps>(
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
