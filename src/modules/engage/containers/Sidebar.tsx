import gql from 'graphql-tag';
import { IRouterProps } from 'modules/common/types';
import { queries as tagQueries } from 'modules/tags/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { Sidebar } from '../components';
import { queries } from '../graphql';

type Props = {
  kindCountsQuery: any;
  statusCountsQuery: any;
  tagsQuery: any;
  tagCountsQuery: any;
};

interface IRouteProps extends IRouterProps {
  queryParams: any;
};

const SidebarContainer = (props : Props & IRouteProps) => {
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

export default withRouter<IRouteProps>(
  compose(
    graphql(gql(queries.kindCounts), {
      name: 'kindCountsQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
    graphql(gql(queries.statusCounts), {
      name: 'statusCountsQuery',
      options: ({ queryParams } : { queryParams: any }) => ({
        variables: {
          kind: queryParams.kind || ''
        },
        fetchPolicy: 'network-only'
      })
    }),
    graphql(gql(tagQueries.tags), {
      name: 'tagsQuery',
      options: () => ({
        variables: { type: 'engageMessage' }
      })
    }),
    graphql(gql(queries.tagCounts), {
      name: 'tagCountsQuery',
      options: ({ queryParams } : { queryParams: any }) => ({
        variables: {
          kind: queryParams.kind || '',
          status: queryParams.status || ''
        },
        fetchPolicy: 'network-only'
      })
    })
  )(SidebarContainer)
);
