import * as compose from 'lodash.flowright';

import { mutations, queries as tagQueries } from '@erxes/ui-tags/src/graphql';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { CountQueryResponse } from '@erxes/ui-contacts/src/customers/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import TagStep from '../components/step/TagStep';
import { TagsQueryResponse } from '@erxes/ui-tags/src/types';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '@erxes/ui-engage/src/graphql';
import { sumCounts } from '@erxes/ui-engage/src/utils';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  tagIds: string[];
  messageType: string;
  renderContent: ({
    actionSelector,
    selectedComponent,
    customerCounts
  }: {
    actionSelector: React.ReactNode;
    selectedComponent: React.ReactNode;
    customerCounts: React.ReactNode;
  }) => React.ReactNode;
  onChange: (name: string, value: string[]) => void;
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
        successMessage={`You successfully added a tag`}
      />
    );
  };

  const updatedProps = {
    ...props,
    tags: tagsQuery.tags || [],
    targetCount: countValues,
    customersCount,
    renderButton,
    loadingCount: customerCountsQuery.loading
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
      query: gql(tagQueries.tags),
      variables: { type: 'contacts:customer' }
    }
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, TagsQueryResponse>(gql(tagQueries.tags), {
      name: 'tagsQuery',
      options: () => ({ variables: { type: 'contacts:customer' } })
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
