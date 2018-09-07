import * as React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Home } from 'modules/settings/integrations/components/store';
import { queries } from 'modules/settings/integrations/graphql';

const Store = props => {
  const { totalCountQuery } = props;

  if (totalCountQuery.loading) {
    return <Spinner />;
  }

  const totalCount = totalCountQuery.integrationsTotalCount.byKind;

  const updatedProps = {
    ...this.props,
    totalCount
  };

  return <Home {...updatedProps} />;
};

Store.propTypes = {
  totalCountQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.integrationTotalCount), { name: 'totalCountQuery' })
)(Store);
