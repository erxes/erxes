import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { List } from '../components';

const ListContainer = props => {
  const { totalCountQuery, removeMutation, queryParams } = props;

  if (totalCountQuery.loading) {
    return <Spinner />;
  }

  let totalCount = totalCountQuery.integrationsTotalCount.total;

  if (queryParams.kind) {
    totalCount =
      totalCountQuery.integrationsTotalCount.byKind[queryParams.kind];
  }

  const removeIntegration = (_id, callback) => {
    removeMutation({
      variables: { _id }
    }).then(() => {
      // refresh queries
      totalCountQuery.refetch();

      callback();
    });
  };

  const updatedProps = {
    ...this.props,
    queryParams,
    totalCount,
    loading: totalCountQuery.loading,
    removeIntegration
  };

  return <List {...updatedProps} />;
};

ListContainer.propTypes = {
  totalCountQuery: PropTypes.object,
  removeMutation: PropTypes.func,
  queryParams: PropTypes.object
};

export default compose(
  graphql(
    gql`
      query totalIntegrationsCount {
        integrationsTotalCount {
          total
          byKind
        }
      }
    `,
    {
      name: 'totalCountQuery'
    }
  ),
  graphql(
    gql`
      mutation integrationsRemove($_id: String!) {
        integrationsRemove(_id: $_id)
      }
    `,
    {
      name: 'removeMutation'
    }
  )
)(ListContainer);
