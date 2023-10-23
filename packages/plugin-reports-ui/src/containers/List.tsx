import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { Alert, confirm, router, withProps } from '@erxes/ui/src/utils';
import List from '../components/List';
import {
  EditMutationResponse,
  RemoveMutationResponse,
  ReportsQueryResponse,
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
  listQuery: ReportsQueryResponse;
  listReportsTypeQuery: TypeQueryResponse;
} & Props &
  RemoveMutationResponse &
  EditMutationResponse;

const ListContainer = (props: FinalProps) => {
  const {
    listQuery,
    listReportsTypeQuery,
    removeMutation,
    editMutation,
    history,
    typeId
  } = props;

  if (listQuery.loading) {
    return <Spinner />;
  }

  const types = listReportsTypeQuery.reportsTypes || [];

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

  const remove = reports => {
    confirm('You are about to delete the item. Are you sure? ')
      .then(() => {
        removeMutation({ variables: { _id: reports._id } })
          .then(() => {
            Alert.success('Successfully deleted an item');
          })
          .catch(e => Alert.error(e.message));
      })
      .catch(e => Alert.error(e.message));
  };

  const edit = reports => {
    editMutation({
      variables: {
        _id: reports._id,
        name: reports.name,
        checked: reports.checked,
        expiryDate: reports.expiryDate,
        type: reports.type
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
    reportss: listQuery.reportss || [],
    types: listReportsTypeQuery.reportsTypes || [],
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
    graphql(gql(queries.listReportsTypes), {
      name: 'listReportsTypeQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),

    graphql<Props, ReportsQueryResponse, { typeId: string }>(
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
