import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { Alert, confirm, router, withProps } from '@erxes/ui/src/utils';
import List from '../components/List';
import {
  EditMutationResponse,
  RemoveMutationResponse,
  BmQueryResponse,
  TypeQueryResponse
} from '../types';
import { mutations, queries } from '../graphql';
import React from 'react';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  history: any;
  typeId: string;
};

type FinalProps = {
  listQuery: BmQueryResponse;
  listBmTypeQuery: TypeQueryResponse;
} & Props &
  RemoveMutationResponse &
  EditMutationResponse;

const ListContainer = (props: FinalProps) => {
  const {
    listQuery,
    listBmTypeQuery,
    removeMutation,
    editMutation,
    history,
    typeId
  } = props;

  if (listQuery.loading) {
    return <Spinner />;
  }

  const types = listBmTypeQuery.bmTypes || [];

  const renderButton = ({
    passedName,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.edit : mutations.add}
        variables={values}
        callback={callback}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${passedName}`}
        refetchQueries={['listQuery']}
      />
    );
  };

  const remove = bm => {
    confirm('You are about to delete the item. Are you sure? ')
      .then(() => {
        removeMutation({ variables: { _id: bm._id } })
          .then(() => {
            Alert.success('Successfully deleted an item');
          })
          .catch(e => Alert.error(e.message));
      })
      .catch(e => Alert.error(e.message));
  };

  const edit = bm => {
    editMutation({
      variables: {
        _id: bm._id,
        name: bm.name,
        checked: bm.checked,
        expiryDate: bm.expiryDate,
        type: bm.type
      }
    })
      .then(() => {
        Alert.success('Successfully updated an item');
        listQuery.refetch();
      })
      .catch(e => Alert.error(e.message));
  };

  const updatedProps = {
    ...props,
    bms: listQuery.bms || [],
    types: listBmTypeQuery.bmTypes || [],
    typeId,
    loading: listQuery.loading,
    remove,
    edit,
    renderButton
  };
  return <List {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql(gql(queries.listBmTypes), {
      name: 'listBmTypeQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),

    graphql<Props, BmQueryResponse, { typeId: string }>(gql(queries.list), {
      name: 'listQuery',
      options: ({ typeId }) => ({
        variables: { typeId: typeId || '' },
        fetchPolicy: 'network-only'
      })
    }),
    graphql(gql(queries.totalCount), {
      name: 'totalCountQuery'
    }),

    graphql(gql(mutations.remove), {
      name: 'removeMutation',
      options: () => ({
        refetchQueries: ['listQuery']
      })
    }),

    graphql(gql(mutations.edit), {
      name: 'editMutation'
    })
  )(ListContainer)
);
