import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IRouterProps } from 'modules/common/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { withProps } from '../../common/utils';
import { TagsQueryResponse } from '../../tags/types';
import Sidebar from '../components/Sidebar';
import { queries } from '../graphql';
import { CountQueryResponse } from '../types';

type Props = {
  queryParams: any;
};

type FinalProps = {
  tagsQuery: TagsQueryResponse;
  tagCountsQuery: CountQueryResponse;
} & IRouterProps;

const SidebarContainer = (props: FinalProps) => {
  const { tagsQuery, tagCountsQuery } = props;
  console.log(tagsQuery.tags);
  const updatedProps = {
    ...props,
    tags: tagsQuery.tags || [],
    tagCounts: tagCountsQuery.integrationsTotalCount || {}
  };

  return <Sidebar {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, CountQueryResponse>(gql(queries.integrationsTotalCount), {
      name: 'integrationsTotalCountQuery'
    }),
    graphql<Props, TagsQueryResponse, { type: string }>(gql(queries.tags), {
      name: 'tagsQuery',
      options: () => ({
        variables: {
          type: 'integration'
        }
      })
    })
  )(withRouter<FinalProps>(SidebarContainer))
);
