import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { Alert, confirm, router, withProps } from '@erxes/ui/src/utils';
import List from '../components/List';
import {
  EditMutationResponse,
  RemoveMutationResponse,
  MobinetQueryResponse,
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
  listQuery: MobinetQueryResponse;
  listMobinetTypeQuery: TypeQueryResponse;
} & Props &
  RemoveMutationResponse &
  EditMutationResponse;

const ListContainer = (props: FinalProps) => {
  const {
    listQuery,
    listMobinetTypeQuery,
    removeMutation,
    editMutation,
    history,
    typeId
  } = props;

  if (listQuery.loading) {
    return <Spinner />;
  }

  const types = listMobinetTypeQuery.mobinetTypes || [];

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

  const remove = mobinet => {
    confirm('You are about to delete the item. Are you sure? ')
      .then(() => {
        removeMutation({ variables: { _id: mobinet._id } })
          .then(() => {
            Alert.success('Successfully deleted an item');
          })
          .catch(e => Alert.error(e.message));
      })
      .catch(e => Alert.error(e.message));
  };

  const edit = mobinet => {
    editMutation({
      variables: {
        _id: mobinet._id,
        name: mobinet.name,
        checked: mobinet.checked,
        expiryDate: mobinet.expiryDate,
        type: mobinet.type
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
    mobinets: listQuery.mobinets || [],
    types: listMobinetTypeQuery.mobinetTypes || [],
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
    graphql(gql(queries.listMobinetTypes), {
      name: 'listMobinetTypeQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),

    graphql<Props, MobinetQueryResponse, { typeId: string }>(
      gql(queries.list),
      {
        name: 'listQuery',
        options: ({ typeId }) => ({
          variables: { typeId: typeId || '' },
          fetchPolicy: 'network-only'
        })
      }
    ),
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
