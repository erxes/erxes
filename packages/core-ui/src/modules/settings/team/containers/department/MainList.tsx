import React from 'react';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils/core';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';
import { queries, mutations } from '@erxes/ui/src/team/graphql';
import { DepartmentsMainQueryResponse } from '@erxes/ui/src/team/types';
import { EmptyState, Spinner } from '@erxes/ui/src';
import MainListCompoenent from '../../components/department/MainList';
import { Alert, confirm } from '@erxes/ui/src/utils';
import client from '@erxes/ui/src/apolloClient';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  listQuery: DepartmentsMainQueryResponse;
} & Props;

class MainList extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { listQuery } = this.props;

    if (listQuery.loading) {
      return <Spinner />;
    }

    if (listQuery.error) {
      return (
        <EmptyState image="/images/actions/5.svg" text="Something went wrong" />
      );
    }
    const deleteDepartments = (ids: string[], callback: () => void) => {
      confirm().then(() => {
        client
          .mutate({
            mutation: gql(mutations.departmentsRemove),
            variables: { ids },
            refetchQueries: [
              {
                query: gql(queries.departments),
                variables: {
                  withoutUserFilter: true,
                  searchValue: undefined
                }
              }
            ]
          })
          .then(() => {
            callback();
            Alert.success('Successfully deleted');
          })
          .catch(e => {
            Alert.error(e.message);
          });
      });
    };
    return (
      <MainListCompoenent
        {...this.props}
        deleteDepartments={deleteDepartments}
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.departmentsMain), {
      name: 'listQuery',
      options: ({ queryParams }) => ({
        variables: {
          searchValue: queryParams.searchValue,
          withoutUserFilter: true,
          ...generatePaginationParams(queryParams || {})
        }
      })
    })
  )(MainList)
);
