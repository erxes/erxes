import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import List from '../components/List';
import { queries } from '../graphql';
import { RemaindersQueryResponse } from '../types';
import Spinner from '@erxes/ui/src/components/Spinner';
import { router } from '@erxes/ui/src/utils';

type Props = {
  history: any;
  type: string;
};

type FinalProps = {
  remaindersQuery: RemaindersQueryResponse;
  tagsGetTypes: any;
} & Props;

const ListContainer = (props: FinalProps) => {
  const { remaindersQuery } = props;

  const updatedProps = {
    ...props,
    remainders: remaindersQuery.remainders || [],
    loading: remaindersQuery.loading
  };

  return <List {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, RemaindersQueryResponse, { type: string }>(
      gql(queries.remainders),
      {
        name: 'remaindersQuery',
        options: ({ type }) => ({
          variables: { type },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(ListContainer)
);
