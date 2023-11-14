import React from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client';
import { useQuery } from '@apollo/client';

import { Alert } from '@erxes/ui/src/utils';
import Spinner from '@erxes/ui/src/components/Spinner';
import Form from '../components/Form';
import { mutations, queries } from '../graphql';
import { IExm } from '../types';

type Props = {
  _id: string;
  queryParams: any;
  history: any;
};

function FormContainer(props: Props) {
  const { _id } = props;

  const [addMutation] = useMutation(gql(mutations.exmsAdd));
  const [editMutation] = useMutation(gql(mutations.exmsEdit));

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
      addMutation({ variables })
        .then(() => {
          Alert.success('Successfully added');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    }

    if (id) {
      editMutation({ variables: { _id: id, ...variables } })
        .then(() => {
          Alert.success('Successfully edited');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    }
  };

  return <Form actionMutation={exmAction} exm={exmDetail} />;
}

export default FormContainer;
