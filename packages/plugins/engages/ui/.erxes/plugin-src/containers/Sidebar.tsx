import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IRouterProps } from 'erxes-ui/lib/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { withProps } from 'erxes-ui/lib/utils';
import Sidebar from '../components/Sidebar';
import { queries } from '../graphql';
import { CountQueryResponse, TagCountQueryResponse } from '../types';

type Props = {
  queryParams: any;
};

type FinalProps = {
  kindCountsQuery: CountQueryResponse;
  statusCountsQuery: CountQueryResponse;
  tagsQuery: any;
  tagCountsQuery: TagCountQueryResponse;
} & IRouterProps;

const SidebarContainer = (props: FinalProps) => {
  const updatedProps = {
    ...props,
    kindCounts: {},
    statusCounts: {},
    tags: [],
    tagCounts: {}
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
