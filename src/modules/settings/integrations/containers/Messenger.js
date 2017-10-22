import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Spinner } from 'modules/common/components';
import { Messenger } from '../components';
import { save } from './utils';

const MessengerContainer = props => {
  const {
    brandsQuery,
    integration,
    addMutation,
    editMutation,
    refetch
  } = props;

  if (brandsQuery.loading) {
    return <Spinner />;
  }

  const updatedProps = {
    ...props,
    save: doc => save(doc, addMutation, editMutation, integration, refetch),
    brands: brandsQuery.brands
  };

  return <Messenger {...updatedProps} />;
};

MessengerContainer.propTypes = {
  integration: PropTypes.object,
  brandsQuery: PropTypes.object,
  addMutation: PropTypes.func,
  editMutation: PropTypes.func,
  refetch: PropTypes.func
};

export default compose(
  graphql(
    gql`
      query brands {
        brands {
          _id
          name
          code
        }
      }
    `,
    {
      name: 'brandsQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }
  ),

  graphql(
    gql`
      mutation add($name: String!, $brandId: String!) {
        integrationsCreateMessengerIntegration(name: $name, brandId: $brandId) {
          _id
        }
      }
    `,
    {
      name: 'addMutation'
    }
  ),

  graphql(
    gql`
      mutation edit($_id: String!, $name: String!, $brandId: String!) {
        integrationsEditMessengerIntegration(
          _id: $_id
          name: $name
          brandId: $brandId
        ) {
          _id
        }
      }
    `,
    {
      name: 'editMutation'
    }
  )
)(MessengerContainer);
