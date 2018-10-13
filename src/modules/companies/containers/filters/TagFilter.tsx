import gql from 'graphql-tag';
import { CountsByTag } from 'modules/common/components';
import { TAG_TYPES } from 'modules/tags/constants';
import { queries as tagQueries } from 'modules/tags/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { queries as companyQueries } from '../../graphql';

const TagFilterContainer = (props: {
  companyCountsQuery: any;
  tagsQuery: any;
}) => {
  const { companyCountsQuery, tagsQuery } = props;

  const counts = companyCountsQuery.companyCounts || {};

  return (
    <CountsByTag
      tags={tagsQuery.tags || []}
      counts={counts.byTag || {}}
      manageUrl="tags/company"
      loading={tagsQuery.loading}
    />
  );
};

export default compose(
  graphql(gql(companyQueries.companyCounts), {
    name: 'companyCountsQuery',
    options: {
      variables: { only: 'byTag' }
    }
  }),
  graphql(gql(tagQueries.tags), {
    name: 'tagsQuery',
    options: () => ({
      variables: {
        type: TAG_TYPES.COMPANY
      },
      fetchPolicy: 'network-only'
    })
  })
)(TagFilterContainer);
