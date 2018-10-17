import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Home } from 'modules/settings/integrations/components/store';
import { queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';

type Props = {
  totalCountQuery: any;
  queryParams: any;
};

const Store = (props: Props) => {
  const { totalCountQuery } = props;

  if (totalCountQuery.loading) {
    return <Spinner />;
  }

  const totalCount = totalCountQuery.integrationsTotalCount.byKind;

  const updatedProps = {
    ...props,
    totalCount
  };

  return <Home {...updatedProps} />;
};

export default compose(
  graphql(gql(queries.integrationTotalCount), { name: 'totalCountQuery' })
)(Store);
