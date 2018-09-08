import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { mutations } from 'modules/settings/integrations/graphql';
import DumbMeet from 'modules/settings/integrations/components/google/Meet';

const Meet = props => {
  const { history, saveMutation, credentials } = props;

  const save = variables => {
    if (!credentials) {
      return Alert.error('Invalid grant');
    }

    saveMutation({
      variables: {
        ...variables,
        kind: 'googleMeet',
        credentials
      }
    })
      .then(() => {
        Alert.success('Congrats');
        history.push('/settings/integrations');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  return <DumbMeet save={save} />;
};

Meet.propTypes = {
  history: PropTypes.object,
  credentials: PropTypes.object,
  saveMutation: PropTypes.func
};

export default compose(
  graphql(gql(mutations.messengerAppsAdd), { name: 'saveMutation' })
)(Meet);
