import React, { PropTypes } from 'react';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import { changeRoute, toggle, changeConversation } from '../actions/messenger';
import { Launcher as DumbLauncher } from '../components';

class Launcher extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (!this.subscription && !nextProps.data.loading) {
      const { subscribeToMore } = this.props.data;

      this.subscription = [subscribeToMore(
        {
          document: gql`subscription notification {notification}`,
          updateQuery: () => {
            this.props.data.refetch();
          },
        }
      )];
    }
  }

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
  onClick() {
    dispatch(changeConversation(''));
    dispatch(changeRoute('conversationList'));
    dispatch(toggle());
  },
});

const LauncherWithData = graphql(
  gql`query { totalUnreadCount }`
)(Launcher);

export default connect(mapStateToProps, mapDisptachToProps)(LauncherWithData);
