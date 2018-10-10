import gql from 'graphql-tag';
import { CountsByTag } from 'modules/common/components';
import { TAG_TYPES } from 'modules/tags/constants';
import { queries as tagQueries } from 'modules/tags/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { queries as customerQueries } from '../../graphql';

const SegmentFilterContainer = (props: {
  customersCountQuery: any;
  tagsQuery: any;
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

export default compose(
  graphql(gql(customerQueries.customerCounts), {
    name: 'customersCountQuery',
    options: {
      variables: { only: 'byTag' }
    }
  }),
  graphql(gql(tagQueries.tags), {
    name: 'tagsQuery',
    options: () => ({
      variables: {
        type: TAG_TYPES.CUSTOMER
      },
      fetchPolicy: 'network-only'
    })
  })
)(SegmentFilterContainer);
