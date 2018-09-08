import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { MessengerApps } from 'modules/inbox/components/conversationDetail';
import { mutations, queries } from 'modules/inbox/graphql';

class MessengerAppsContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = { loading: false };
  }

  render() {
    const { loading } = this.state;
    const { conversation, messengerAppsQuery, executeAppMutation } = this.props;

    if (loading) {
      return <Spinner />;
    }

    if (messengerAppsQuery.loading) {
      return null;
    }

    const onSelect = app => {
      const variables = {
        _id: app._id,
        conversationId: conversation._id
      };

      this.setState({ loading: true });

      executeAppMutation({ variables }).then(() => {
        this.setState({ loading: false });
        Alert.success('Success');
      });
    };

    const updatedProps = {
      ...this.props,
      onSelect,
      messengerApps: messengerAppsQuery.messengerApps
    };

    return <MessengerApps {...updatedProps} />;
  }
}

MessengerAppsContainer.propTypes = {
  conversation: PropTypes.object,
  messengerAppsQuery: PropTypes.object,
  executeAppMutation: PropTypes.func
};

export default compose(
  graphql(gql(queries.messengerApps), {
    name: 'messengerAppsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(mutations.executeApp), {
    name: 'executeAppMutation'
  })
)(MessengerAppsContainer);
