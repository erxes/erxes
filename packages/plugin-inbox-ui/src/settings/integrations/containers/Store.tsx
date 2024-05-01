import * as compose from 'lodash.flowright';

import {
  ByKindTotalCount,
  IntegrationsCountQueryResponse
} from '@erxes/ui-inbox/src/settings/integrations/types';
import { getEnv, withProps } from '@erxes/ui/src/utils';

import Home from '../components/store/Home';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '@erxes/ui-inbox/src/settings/integrations/graphql';

type Props = {
  queryParams: any;
  history?: any;
};

type FinalProps = { totalCountQuery: IntegrationsCountQueryResponse } & Props;

const Store = (props: FinalProps) => {
  const { totalCountQuery } = props;

  const customLink = (kind: string, addLink: string) => {
    const { REACT_APP_API_URL } = getEnv();
    const url = `${REACT_APP_API_URL}/connect-integration?link=${addLink}&kind=${kind}`;

    window.location.replace(url);
  };

  const totalCount =
    (totalCountQuery.integrationsTotalCount || {}).byKind ||
    ({} as ByKindTotalCount);

  const updatedProps = {
    ...props,
    customLink,
    totalCount,
    loading: totalCountQuery.loading
  };

  return <Home {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql(gql(queries.integrationTotalCount), { name: 'totalCountQuery' })
  )(Store)
);
