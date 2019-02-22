import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Home } from 'modules/settings/integrations/components/store';
import { queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import {
  IntegrationsCountQueryResponse,
  MessengerAppsCountQueryResponse
} from '../types';

type Props = {
  queryParams: any;
};

type FinalProps = {
  totalCountQuery: IntegrationsCountQueryResponse;
  messengerAppsCountQuery: MessengerAppsCountQueryResponse;
} & Props;

const Store = (props: FinalProps) => {
  const { totalCountQuery, messengerAppsCountQuery } = props;

  if (totalCountQuery.loading || messengerAppsCountQuery.loading) {
    return <Spinner />;
  }

  const totalCount = totalCountQuery.integrationsTotalCount.byKind;
  const messengerAppsCount = messengerAppsCountQuery.messengerAppsCount;

  const updatedProps = {
    ...props,
    totalCount,
    messengerAppsCount
  };

  return <Home {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql(gql(queries.integrationTotalCount), { name: 'totalCountQuery' }),
    graphql(gql(queries.messengerAppsCount), {
      name: 'messengerAppsCountQuery',
      options: () => {
        return {
          variables: { kind: 'knowledgebase' },
          fetchPolicy: 'network-only'
        };
      }
    })
  )(Store)
);
