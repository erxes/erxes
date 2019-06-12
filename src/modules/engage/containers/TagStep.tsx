import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import { CountQueryResponse } from 'modules/customers/types';
import { TagStep } from 'modules/engage/components/step';
import { mutations } from 'modules/tags/graphql';
import {
  AddMutationResponse,
  MutationVariables,
  TagsQueryResponse
} from 'modules/tags/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { queries } from '../graphql';
import { sumCounts } from '../utils';

type Props = {
  tagIds: string[];
  messageType: string;
  renderContent: (
    {
      actionSelector,
      selectedComponent,
      customerCounts
    }: {
      actionSelector: React.ReactNode;
      selectedComponent: React.ReactNode;
      customerCounts: React.ReactNode;
    }
  ) => React.ReactNode;
  onChange: (name: string, value: string[]) => void;
};

type FinalProps = {
  tagsQuery: TagsQueryResponse;
  customerCountsQuery: CountQueryResponse;
} & Props &
  AddMutationResponse;

const TagStepContianer = (props: FinalProps) => {
  const { tagsQuery, addMutation, customerCountsQuery } = props;

  const tagAdd = ({ doc }) => {
    addMutation({ variables: { ...doc } })
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
  const customersCount = (ids: string[]) => sumCounts(ids, countValues);

  const updatedProps = {
    ...props,
    tags: tagsQuery.tags || [],
    targetCount: countValues,
    customersCount,
    tagAdd
  };

  return <TagStep {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, TagsQueryResponse>(gql(queries.tags), {
      name: 'tagsQuery',
      options: () => ({ variables: { type: 'customer' } })
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
  )(TagStepContianer)
);
