import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import List from '../components/List';
import {
  EditMutationResponse,
  RemoveMutationResponse,
  AdQueryResponse,
  AdTotalCountQueryResponse
} from '../types';
import { mutations, queries } from '../graphql';
import React from 'react';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  queryParams: {
    page: string;
    perPage: string;
  };
  history: any;
  typeId: string;
};

type FinalProps = {
  listQuery: AdQueryResponse;
  totalCountQuery: AdTotalCountQueryResponse;
} & Props &
  RemoveMutationResponse &
  EditMutationResponse;

const ListContainer = (props: FinalProps) => {
  const {
    listQuery,
    totalCountQuery,
    removeMutation,
    editMutation,
    typeId
  } = props;

  if (listQuery.loading || totalCountQuery.loading) {
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
        mutation={object ? mutations.edit : mutations.add}
        variables={values}
        callback={callback}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${passedName}`}
        refetchQueries={['listQuery', 'adsTotalCount']}
      />
    );
  };

  const remove = ad => {
    confirm('You are about to delete the item. Are you sure? ')
      .then(() => {
        removeMutation({ variables: { _id: ad._id } })
          .then(() => {
            Alert.success('Successfully deleted an item');
          })
          .catch(e => Alert.error(e.message));
      })
      .catch(e => Alert.error(e.message));
  };

  const edit = ad => {
    editMutation({
      variables: {
        _id: ad._id,
        name: ad.name,
        checked: ad.checked,
        type: ad.type
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
    ads: listQuery.ads || [],
    totalCount: totalCountQuery.adsTotalCount || 0,
    typeId,
    loading: listQuery.loading || totalCountQuery.loading,
    remove,
    edit,
    renderButton
  };

  return <List {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, AdQueryResponse, { typeId: string }>(gql(queries.list), {
      name: 'listQuery',
      options: ({ queryParams, typeId }) => ({
        variables: {
          typeId: typeId || '',
          page: queryParams?.page ? parseInt(queryParams.page, 10) : 1,
          perPage: queryParams?.perPage ? parseInt(queryParams.perPage, 10) : 20
        },
        fetchPolicy: 'network-only'
      })
    }),

    graphql(gql(queries.totalCount), {
      name: 'totalCountQuery'
    }),

    graphql(gql(mutations.remove), {
      name: 'removeMutation',
      options: () => ({
        refetchQueries: ['listQuery', 'adsTotalCount']
      })
    }),

    graphql(gql(mutations.edit), {
      name: 'editMutation'
    })
  )(ListContainer)
);
