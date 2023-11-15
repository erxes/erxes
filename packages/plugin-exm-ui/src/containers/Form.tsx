import React from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';

import { Alert } from '@erxes/ui/src/utils';
import Spinner from '@erxes/ui/src/components/Spinner';
import Form from '../components/Form';
import { mutations, queries } from '../graphql';
import { IExm } from '../types';
import { refetchQueries } from './Home';

type Props = {
  _id: string;
  queryParams: any;
  history: any;
  addExmMutations: any;
  editExmMutations: any;
};

function FormContainer(props: Props) {
  const { _id, addExmMutations, editExmMutations } = props;

  const detailQuery = useQuery(gql(queries.exmDetail), {
    variables: { _id },
    skip: !_id
  });

  if (detailQuery.loading) {
    return <Spinner />;
  }

  const exmDetail = (detailQuery && detailQuery?.data?.exmDetail) || {};

  const exmAction = (variables: IExm, id?: string) => {
    if (!id) {
      addExmMutations({
        variables
      })
        .then(() => {
          Alert.success('Successfully added');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    }

    if (id) {
      editExmMutations({
        variables: { _id: id, ...variables }
      })
        .then(() => {
          detailQuery.refetch();
          Alert.success('Successfully edited');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    }
  };

  return <Form actionMutation={exmAction} exm={exmDetail} />;
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(mutations.exmsAdd), {
      name: 'addExmMutations',
      options: queryParams => ({
        refetchQueries: refetchQueries(queryParams)
      })
    }),
    graphql<Props>(gql(mutations.exmsEdit), {
      name: 'editExmMutations',
      options: queryParams => ({
        refetchQueries: refetchQueries(queryParams)
      })
    })
  )(FormContainer)
);
