import * as React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import gql from 'graphql-tag';
import { queries as tagQueries } from 'modules/tags/graphql';
import { Sidebar } from '../components';
import { queries } from '../graphql';

const SidebarContainer = props => {
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

SidebarContainer.propTypes = {
  kindCountsQuery: PropTypes.object,
  statusCountsQuery: PropTypes.object,
  tagsQuery: PropTypes.object,
  tagCountsQuery: PropTypes.object
};

export default withRouter(
  compose(
    graphql(gql(queries.kindCounts), {
      name: 'kindCountsQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
    graphql(gql(queries.statusCounts), {
      name: 'statusCountsQuery',
      options: ({ queryParams }) => ({
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
      options: ({ queryParams }) => ({
        variables: {
          kind: queryParams.kind || '',
          status: queryParams.status || ''
        },
        fetchPolicy: 'network-only'
      })
    })
  )(SidebarContainer)
);
