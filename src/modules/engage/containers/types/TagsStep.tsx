import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import { CountQueryResponse } from 'modules/customers/types';
import { TagsStep } from 'modules/engage/components/step';
import { sumCounts } from 'modules/engage/components/step/types/utils';
import { mutations } from 'modules/tags/graphql';
import {
  AddMutationResponse,
  MutationVariables,
  TagsQueryResponse
} from 'modules/tags/types';
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
  onChange: (
    name: 'brandIds' | 'tagIds' | 'segmentIds',
    value: string[]
  ) => void;
  tagIds: string[];
};

type FinalProps = {
  tagsQuery: TagsQueryResponse;
  customerCountsQuery: CountQueryResponse;
} & Props &
  AddMutationResponse;

const TagsStepContianer = (props: FinalProps) => {
  const { tagsQuery, addMutation, customerCountsQuery } = props;

  const tagAdd = ({ doc }) => {
    addMutation({ variables: { ...doc, type: 'engageMessage' } })
      .then(() => {
        tagsQuery.refetch();
        customerCountsQuery.refetch();
        Alert.success('You have successfully added a tag');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const customerCounts = customerCountsQuery.customerCounts || {
    byTag: {}
  };

  const countValues = customerCounts.byTag || {};
  const counts = (ids: string[]) => {
    return sumCounts(ids, countValues);
  };

  const updatedProps = {
    ...props,
    tags: tagsQuery.tags || [],
    listCount: countValues,
    counts,
    tagAdd
  };

  return <TagsStep {...updatedProps} />;
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
    ),
    graphql<Props, AddMutationResponse, MutationVariables>(gql(mutations.add), {
      name: 'addMutation'
    })
  )(TagsStepContianer)
);
