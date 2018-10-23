import gql from 'graphql-tag';
import { CountsByTag } from 'modules/common/components';
import { TAG_TYPES } from 'modules/tags/constants';
import { queries as tagQueries } from 'modules/tags/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { TagQueryResponse } from '../../../companies/containers/filters/TagFilter';
import { queries as customerQueries } from '../../graphql';
import { CountQueryResponse } from './BrandFilter';

const TagFilterContainer = (props: {
  customersCountQuery: CountQueryResponse;
  tagsQuery: TagQueryResponse;
}) => {
  const { customersCountQuery, tagsQuery } = props;

  const counts = customersCountQuery.customerCounts || {};

  return (
    <CountsByTag
      tags={tagsQuery.tags || []}
      counts={counts.byTag || {}}
      manageUrl="tags/customer"
      loading={tagsQuery.loading}
    />
  );
};

export default withProps<{}>(
  compose(
    graphql<{}, CountQueryResponse, { only: string }>(
      gql(customerQueries.customerCounts),
      {
        name: 'customersCountQuery',
        options: {
          variables: { only: 'byTag' }
        }
      }
    ),
    graphql<{}, TagQueryResponse, { type: string }>(gql(tagQueries.tags), {
      name: 'tagsQuery',
      options: () => ({
        variables: {
          type: TAG_TYPES.CUSTOMER
        },
        fetchPolicy: 'network-only'
      })
    })
  )(TagFilterContainer)
);
