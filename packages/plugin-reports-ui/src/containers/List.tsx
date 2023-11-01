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
  reportsListQuery: ReportsQueryResponse;
  listReportsTypeQuery: TypeQueryResponse;
} & Props;

const ListContainer = (props: FinalProps) => {
  const { reportsListQuery, history, typeId } = props;

  if (reportsListQuery.loading) {
    return <Spinner />;
  }

  // const renderButton = ({
  //   passedName,
  //   values,
  //   isSubmitted,
  //   callback,
  //   object
  // }: IButtonMutateProps) => {
  //   return (
  //     <ButtonMutate
  //       mutation={object ? mutations.edit : mutations.add}
  //       variables={values}
  //       callback={callback}
  //       isSubmitted={isSubmitted}
  //       type="submit"
  //       successMessage={`You successfully ${
  //         object ? 'updated' : 'added'
  //       } a ${passedName}`}
  //       refetchQueries={['listQuery']}
  //     />
  //   );
  // };

  // const remove = reports => {
  //   confirm('You are about to delete the item. Are you sure? ')
  //     .then(() => {
  //       removeMutation({ variables: { _id: reports._id } })
  //         .then(() => {
  //           Alert.success('Successfully deleted an item');
  //         })
  //         .catch(e => Alert.error(e.message));
  //     })
  //     .catch(e => Alert.error(e.message));
  // };

  // const edit = reports => {
  //   editMutation({
  //     variables: {
  //       _id: reports._id,
  //       name: reports.name,
  //       checked: reports.checked,
  //       expiryDate: reports.expiryDate,
  //       type: reports.type
  //     }
  //   })
  //     .then(() => {
  //       Alert.success('Successfully updated an item');
  //       listQuery.refetch();
  //     })
  //     .catch(e => Alert.error(e.message));
  // };

  const { list = [], totalCount = 0 } = reportsListQuery;

  const updatedProps = {
    ...props,

    totalCount,
    reports: list,
    loading: reportsListQuery.loading
  };
  return <List {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, ReportsQueryResponse, { typeId: string }>(
      gql(queries.reportsList),
      {
        name: 'reportsListQuery',
        options: ({ typeId }) => ({
          variables: { typeId: typeId || '' },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(ListContainer)
);
