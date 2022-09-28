import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import SideBar from '../components/SideBar';
import {
  EditTypeMutationResponse,
  RemoveTypeMutationResponse,
  TypeQueryResponse
} from '../types';
import { mutations, queries } from '../graphql';
import React from 'react';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  history: any;
  currentTypeId?: string;
};

type FinalProps = {
  listTumentechTypeQuery: TypeQueryResponse;
} & Props &
  RemoveTypeMutationResponse &
  EditTypeMutationResponse;

const TypesListContainer = (props: FinalProps) => {
  const { listTumentechTypeQuery, typesEdit, typesRemove, history } = props;

  if (listTumentechTypeQuery.loading) {
    return <Spinner />;
  }

  //calls gql mutation for edit/add type
  const renderButton = ({
    passedName,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.editType : mutations.addType}
        variables={values}
        callback={callback}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${passedName}`}
        refetchQueries={['listTumentechTypeQuery']}
      />
    );
  };

  const remove = type => {
    confirm('You are about to delete the item. Are you sure? ')
      .then(() => {
        typesRemove({ variables: { _id: type._id } })
          .then(() => {
            Alert.success('Successfully deleted an item');
          })
          .catch(e => Alert.error(e.message));
      })
      .catch(e => Alert.error(e.message));
  };

  const updatedProps = {
    ...props,
    types: listTumentechTypeQuery.tumentechTypes || [],
    loading: listTumentechTypeQuery.loading,
    remove,
    renderButton
  };

  return <SideBar {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql(gql(queries.listTumentechTypes), {
      name: 'listTumentechTypeQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
    graphql(gql(mutations.removeType), {
      name: 'typesRemove',
      options: () => ({
        refetchQueries: ['listTumentechTypeQuery']
      })
    })
  )(TypesListContainer)
);
