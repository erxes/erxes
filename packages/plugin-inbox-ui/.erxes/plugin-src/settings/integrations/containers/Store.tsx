import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from '@erxes/ui/src/components/Spinner';
import Home from '../components/store/Home';
import { queries } from '@erxes/ui-settings/src/integrations/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import { getEnv, withProps } from '@erxes/ui/src/utils';
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

  const customLink = (kind: string, addLink: string) => {
    const { REACT_APP_API_URL } = getEnv();
    const url = `${REACT_APP_API_URL}/connect-integration?link=${addLink}&kind=${kind}`;

    window.location.replace(url);
  };

  const totalCount = totalCountQuery.integrationsTotalCount.byKind;

  const updatedProps = {
    ...props,
    customLink,
    totalCount
  };

  return <Home {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql(gql(queries.integrationTotalCount), { name: 'totalCountQuery' })
  )(Store)
);
