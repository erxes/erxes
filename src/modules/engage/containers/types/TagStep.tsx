import gql from 'graphql-tag';
import { withProps } from 'modules/common/utils';
import { CountQueryResponse } from 'modules/customers/types';
import { TagStep } from 'modules/engage/components/step';
import { TagsQueryResponse } from 'modules/tags/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { queries } from '../../graphql';

type Props = {
  renderContent: (
    {
      actionSelector,
      content,
      customerCounts
    }: {
      actionSelector: React.ReactNode;
      content: React.ReactNode;
      customerCounts: React.ReactNode;
    }
  ) => React.ReactNode;
  onChange: (name: 'tagId', value: string) => void;
  tagId: string;
};

type FinalProps = {
  tagsQuery: TagsQueryResponse;
  customerCountsQuery: CountQueryResponse;
} & Props;

const TagStepContianer = (props: FinalProps) => {
  const { tagsQuery, customerCountsQuery } = props;

  const customerCounts = customerCountsQuery.customerCounts || {
    byTag: {}
  };

  const updatedProps = {
    ...props,
    tags: tagsQuery.tags || [],
    counts: customerCounts.byTag || {}
  };

  return <TagStep {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, TagsQueryResponse>(gql(queries.tags), {
      name: 'tagsQuery',
      options: () => ({ variables: { type: 'engageMessage' } })
    }),
    graphql<Props, CountQueryResponse, { only: string }>(
      gql(queries.customerCounts),
      {
        name: 'customerCountsQuery',
        options: {
          variables: {
            only: 'byTag'
          }
        }
      }
    )
  )(TagStepContianer)
);
