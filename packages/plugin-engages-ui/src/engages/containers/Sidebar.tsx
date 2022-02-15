import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IRouterProps, Counts } from '@erxes/ui/src/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { withProps } from '@erxes/ui/src/utils';
import Sidebar from '../components/Sidebar';
import { queries } from '../graphql';
import { CountQueryResponse } from '../types';
import { TagsQueryResponse } from '@erxes/ui/src/tags/types';
import { queries as tagQueries } from '@erxes/ui/src/tags/graphql';

type Props = {
  queryParams: any;
};

type FinalProps = {
  kindCountsQuery: CountQueryResponse;
  statusCountsQuery: CountQueryResponse;
  tagsQuery: TagsQueryResponse;
  tagCountsQuery: Counts;
} & IRouterProps;

const SidebarContainer = (props: FinalProps) => {
  const {
    kindCountsQuery,
    statusCountsQuery,
    tagsQuery,
    tagCountsQuery
  } = props;

  const updatedProps = {
    ...props,
    kindCounts: kindCountsQuery.engageMessageCounts || {},
    statusCounts: statusCountsQuery.engageMessageCounts || {},
    tags: tagsQuery.tags || [],
    tagCounts: tagCountsQuery.engageMessageCounts || {}
  };

  return <Sidebar {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, CountQueryResponse>(gql(queries.kindCounts), {
      name: 'kindCountsQuery'
    }),
    graphql<Props, CountQueryResponse, { kind: string }>(
      gql(queries.statusCounts),
      {
        name: 'statusCountsQuery',
        options: ({ queryParams }) => ({
          variables: {
            kind: queryParams.kind || ''
          }
        })
      }
    ),
    graphql<Props, Counts, { type: string }>(
      gql(tagQueries.tags),
      {
        name: 'tagsQuery',
        options: () => ({
          variables: { type: 'engageMessage' }
        })
      }
    ),
    graphql<Props, CountQueryResponse, { kind: string; status: string }>(
      gql(queries.tagCounts),
      {
        name: 'tagCountsQuery',
        options: ({ queryParams }) => ({
          variables: {
            kind: queryParams.kind || '',
            status: queryParams.status || ''
          }
        })
      }
    )
  )(withRouter<FinalProps>(SidebarContainer))
);
