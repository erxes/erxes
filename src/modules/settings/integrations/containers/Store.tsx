import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Home } from 'modules/settings/integrations/components/store';
import { queries } from 'modules/settings/integrations/graphql';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { IntegrationsCountQueryResponse } from '../types';

type Props = {
  queryParams: any;
  history?: any;
};

type FinalProps = { totalCountQuery: IntegrationsCountQueryResponse } & Props;

const Store = (props: FinalProps) => {
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

export default withProps<Props>(
  compose(
    graphql(gql(queries.integrationTotalCount), { name: 'totalCountQuery' })
  )(Store)
);
