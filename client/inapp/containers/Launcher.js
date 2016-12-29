import React, { PropTypes } from 'react';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import { changeRoute, toggle, changeConversation } from '../actions/messenger';
import { Launcher as DumbLauncher } from '../components';
import { connection } from '../connection';
import NotificationSubscriber from './NotificationSubscriber';

class Launcher extends NotificationSubscriber {
  render() {
    if (this.props.data.loading) {
      return null;
    }

    const extendedProps = {
      ...this.props,
      notificationCount: this.props.data.totalUnreadCount,
    };

    return <DumbLauncher { ...extendedProps } />;
  }
}

Launcher.propTypes = {
  data: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  isMessengerVisible: state.isVisible,
});

const mapDisptachToProps = dispatch => ({
  onClick(isVisible) {
    dispatch(changeConversation(''));
    dispatch(changeRoute('conversationList'));
    dispatch(toggle(isVisible));
  },
});

const LauncherWithData = graphql(
  gql`
    query totalUnreadCount(${connection.queryVariables}) {
      totalUnreadCount(${connection.queryParams})
    }
  `,

  {
    options: () => ({
      forceFetch: true,
      variables: connection.data,
    }),
  }
)(Launcher);

export default connect(mapStateToProps, mapDisptachToProps)(LauncherWithData);
