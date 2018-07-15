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
    if (!this.props.data && nextProps.data) {
      nextProps.data.subscribeToMore({
        document: gql(graphqlTypes.adminMessageInserted),
        variables: { customerId: connection.data.customerId },
        updateQuery: () => {
          nextProps.data.refetch();
        }
      });
    }
  }

  render() {
    const { data={} } = this.props;

    return <DumpLauncher {...this.props} totalUnreadCount={data.totalUnreadCount} />
  }
}

Launcher.propTypes = {
  data: PropTypes.object,
}

const WithQuery = graphql(
  gql(graphqlTypes.totalUnreadCountQuery),
  {
    options: () => ({
      variables: connection.data,
    }),
    skip: (props) => !props.isMessengerVisible
  }
)(Launcher);

const container = (props) => (
  <AppConsumer>
    {({ isMessengerVisible, isBrowserInfoSaved, toggle, lastUnreadMessage }) => {
      return (
        <WithQuery
          {...props}
          isMessengerVisible={isMessengerVisible}
          isBrowserInfoSaved={isBrowserInfoSaved}
          onClick={toggle}
          uiOptions={connection.data.uiOptions || {}}
          lastUnreadMessage={lastUnreadMessage}
        />
      );
    }}
  </AppConsumer>
);

export default container;
