import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { IntegrationStore } from '../components/store';
import { queries } from '../graphql';

const IntegrationStoreContainer = props => {
  const { totalCountQuery } = props;

  if (totalCountQuery.loading) {
    return <Spinner />;
  }

  const totalCount = totalCountQuery.integrationsTotalCount.byKind;

  const updatedProps = {
    ...this.props,
    totalCount
  };

  return <IntegrationStore {...updatedProps} />;
};

IntegrationStoreContainer.propTypes = {
  totalCountQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.integrationTotalCount), { name: 'totalCountQuery' })
)(IntegrationStoreContainer);
