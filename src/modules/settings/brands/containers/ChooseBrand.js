import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { queries } from '../graphql';
import { ChooseBrand } from '../components';
import { save } from '../../integrations/containers/utils';

const ChooseBrandContainer = props => {
  const {
    history,
    brandsQuery,
    integration,
    addMutation,
    editMutation,
    onSave,
    refetch
  } = props;

  const updatedProps = {
    ...props,

    save: variables =>
      save({
        history,
        variables,
        addMutation,
        editMutation,
        integration,
        onSave,
        refetch
      }),

    brands: brandsQuery.brands || []
  };

  return <ChooseBrand {...updatedProps} />;
};

ChooseBrandContainer.propTypes = {
  history: PropTypes.object,
  integration: PropTypes.object,
  brandsQuery: PropTypes.object,
  addMutation: PropTypes.func,
  editMutation: PropTypes.func,
  onSave: PropTypes.func,
  refetch: PropTypes.func
};

export default withRouter(
  compose(
    graphql(gql(queries.brands), {
      name: 'brandsQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),

    graphql(
      gql`
        mutation add($name: String!, $brandId: String!) {
          integrationsCreateMessengerIntegration(
            name: $name
            brandId: $brandId
          ) {
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
  )(ChooseBrandContainer)
);
