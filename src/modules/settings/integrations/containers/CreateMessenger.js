import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { Spinner } from 'modules/common/components';
import { CreateMessenger } from '../components';

const CreateMessengerContainer = props => {
  return <CreateMessenger />;
};

CreateMessengerContainer.propTypes = {
  integrationDetailQuery: PropTypes.object,
  saveMutation: PropTypes.func
};

export default CreateMessengerContainer;
