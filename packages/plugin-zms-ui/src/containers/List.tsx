import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import List from '../components/List';
import {
  EditMutationResponse,
  RemoveMutationResponse,
  ZmsQueryResponse,
  ParentQueryResponse
} from '../types';
import { mutations, queries } from '../graphql';
import React from 'react';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  history: any;
  parentId: string;
};

type FinalProps = {
  listQuery: ZmsQueryResponse;
  listZmsParentQuery: ParentQueryResponse;
} & Props &
  RemoveMutationResponse &
  EditMutationResponse;

const ListContainer = (props: FinalProps) => {
  const { listQuery, removeMutation, parentId } = props;

  if (listQuery.loading) {
    return <Spinner />;
  }

  const renderButton = ({
    passedName,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.editDictionary : mutations.add}
        variables={values}
        callback={callback}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${passedName}`}
        refetchQueries={['GetDictionaries']}
      />
    );
  };

  const remove = zms => {
    confirm('You are about to delete the item. Are you sure? ')
      .then(() => {
        removeMutation({ variables: { _id: zms._id } })
          .then(() => {
            Alert.success('Successfully deleted an item');
          })
          .catch(e => Alert.error(e.message));
      })
      .catch(e => Alert.error(e.message));
  };

  const updatedProps = {
    ...props,
    dictionaries: listQuery.getDictionaries || [],
    types: [],
    parentId,
    loading: listQuery.loading,
    remove,
    renderButton
  };
  return <List {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql(gql(queries.listZmsParent), {
      name: 'listZmsTypeQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),

    graphql<Props, ZmsQueryResponse, { parentId: string }>(
      gql(queries.listDictionary),
      {
        name: 'listQuery',
        options: ({ parentId }) => ({
          variables: { parentId: parentId || '' },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql(gql(queries.totalCount), {
      name: 'totalCountQuery'
    }),

    graphql(gql(mutations.removeDictionary), {
      name: 'removeMutation',
      options: () => ({
        refetchQueries: ['GetDictionaries']
      })
    }),

    graphql(gql(mutations.editDictionary), {
      name: 'editMutation'
    })
  )(ListContainer)
);
