import * as React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries, mutations } from '../graphql';
import { Spinner } from 'modules/common/components';
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

  if (brandsQuery.loading) {
    return <Spinner objective />;
  }

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

    graphql(gql(mutations.integrationsCreateMessenger), {
      name: 'addMutation'
    }),

    graphql(gql(mutations.integrationsEditMessenger), {
      name: 'editMutation'
    })
  )(ChooseBrandContainer)
);
