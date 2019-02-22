import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { queries as kbqueries } from 'modules/knowledgeBase/graphql';
import { TopicsTotalCountQueryResponse } from 'modules/knowledgeBase/types';
import { Home } from 'modules/settings/integrations/components/store';
import { queries } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { IntegrationsCountQueryResponse } from '../types';

type Props = {
  queryParams: any;
};

type FinalProps = {
  totalCountQuery: IntegrationsCountQueryResponse;
  topicsCountQuery: TopicsTotalCountQueryResponse;
} & Props;

const Store = (props: FinalProps) => {
  const { totalCountQuery, topicsCountQuery } = props;

  if (totalCountQuery.loading || topicsCountQuery.loading) {
    return <Spinner />;
  }

  const totalCount = totalCountQuery.integrationsTotalCount.byKind;
  const topicsCount = topicsCountQuery.knowledgeBaseTopicsTotalCount;

  const updatedProps = {
    ...props,
    totalCount,
    topicsCount
  };

  return <Home {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql(gql(queries.integrationTotalCount), { name: 'totalCountQuery' }),
    graphql(gql(kbqueries.knowledgeBaseTopicsTotalCount), {
      name: 'topicsCountQuery'
    })
  )(Store)
);
