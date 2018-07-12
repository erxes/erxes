import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { connection } from '../connection';
import { Launcher as DumpLauncher } from '../components';
import graphqlTypes from '../graphql';
import { AppConsumer } from './AppContext';

class Launcher extends React.Component {
  componentWillReceiveProps(nextProps) {
    const { data } = nextProps;

    if (!this.props.data && data) {
      // lister for all conversation changes for this customer
      data.subscribeToMore({
        document: gql(graphqlTypes.conversationsChangedSubscription),
        variables: { customerId: connection.data.customerId },
        updateQuery: () => {
          data.refetch();
        },
      });
    }
  }

  render() {
    const { unreadInfo } = this.props.data || {};
    const { lastUnreadMessage, totalCount } = unreadInfo || {};

    return (
      <DumpLauncher
        {...this.props}
        lastUnreadMessage={lastUnreadMessage}
        unreadCount={totalCount}
      />
    );
  }
}

Launcher.propTypes = {
  data: PropTypes.object,
}

const WithQuery = graphql(
  gql(graphqlTypes.unreadInfo),
  {
    skip: (props) => !props.isBrowserInfoSaved,
    options: () => ({
      variables: connection.data,
      fetchPolicy: 'network-only',
    }),
  },
)(Launcher);

const container = (props) => (
  <AppConsumer>
    {({ isMessengerVisible, isBrowserInfoSaved, toggle }) => {
      return (
        <WithQuery
          {...props}
          isMessengerVisible={isMessengerVisible}
          isBrowserInfoSaved={isBrowserInfoSaved}
          onClick={toggle}
          uiOptions={connection.data.uiOptions || {}}
        />
      );
    }}
  </AppConsumer>
);

export default container;
