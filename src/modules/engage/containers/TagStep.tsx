import gql from 'graphql-tag';
import { ButtonMutate } from 'modules/common/components';
import { IButtonMutateProps } from 'modules/common/types';
import { __, Alert, withProps } from 'modules/common/utils';
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

  const customerCounts = customerCountsQuery.customerCounts || {
    byTag: {}
  };

  const countValues = customerCounts.byTag || {};
  const customersCount = (ids: string[]) => sumCounts(ids, countValues);

  const renderButton = ({
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.add}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        icon="checked-1"
        successMessage={`You successfully added a tag`}
      >
        {__('Save')}
      </ButtonMutate>
    );
  };

  const updatedProps = {
    ...props,
    tags: tagsQuery.tags || [],
    targetCount: countValues,
    customersCount,
    renderButton
  };

  return <TagStep {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.customerCounts),
      variables: { only: 'byTag' }
    },
    {
      query: gql(queries.tags),
      variables: { type: 'customer' }
    }
  ];
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
