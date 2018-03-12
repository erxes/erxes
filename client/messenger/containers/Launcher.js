import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { gql, graphql } from 'react-apollo';
import { toggle, openLastConversation } from '../actions/messenger';
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
      notificationCount: this.props.data.totalUnreadCount || 0,
    };

    return <DumbLauncher {...extendedProps} />;
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
    dispatch(openLastConversation());
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
      fetchPolicy: 'network-only',
      variables: connection.data,
    }),
  },
)(Launcher);

export default connect(mapStateToProps, mapDisptachToProps)(LauncherWithData);
