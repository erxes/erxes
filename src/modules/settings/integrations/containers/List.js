import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { List } from '../components';
import { queries } from '../graphql';

const ListContainer = props => {
  const { totalCountQuery, queryParams } = props;

  if (totalCountQuery.loading) {
    return <Spinner />;
  }

  let totalCount = totalCountQuery.integrationsTotalCount.total;

  if (queryParams.kind) {
    totalCount =
      totalCountQuery.integrationsTotalCount.byKind[queryParams.kind];
  }

  const updatedProps = {
    ...this.props,
    queryParams,
    totalCount,
    loading: totalCountQuery.loading
  };

  return <List {...updatedProps} />;
};

ListContainer.propTypes = {
  totalCountQuery: PropTypes.object,
  removeMutation: PropTypes.func,
  queryParams: PropTypes.object
};

export default compose(
  graphql(gql(queries.integrationTotalCount), { name: 'totalCountQuery' })
)(ListContainer);
