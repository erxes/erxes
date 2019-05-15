import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import { CountQueryResponse } from 'modules/customers/types';
import { TagsStep } from 'modules/engage/components/step';
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
  onChange: (name: 'tagId', value: string) => void;
  tagId: string;
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

  const updatedProps = {
    ...props,
    tags: tagsQuery.tags || [],
    counts: customerCounts.byTag || {},
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
