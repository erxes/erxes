import { Alert, Bulk, router, withProps } from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';

import ContractTypesList from '../components/ContractTypesList';
import { mutations, queries } from '../graphql';
import {
  ListQueryVariables,
  MainQueryResponse,
  RemoveMutationResponse,
  RemoveMutationVariables
} from '../types';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  contractTypesMainQuery: MainQueryResponse;
} & Props &
  IRouterProps &
  RemoveMutationResponse;

type State = {
  loading: boolean;
};

class ContractTypeListContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  render() {
    const { contractTypesMainQuery, contractTypesRemove } = this.props;

    const removeContractTypes = ({ contractTypeIds }, emptyBulk) => {
      contractTypesRemove({
        variables: { contractTypeIds }
      })
        .then(() => {
          emptyBulk();
          Alert.success('You successfully deleted a contractType');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const { list = [], totalCount = 0 } =
      contractTypesMainQuery.contractTypesMain || {};

    const updatedProps = {
      ...this.props,
      totalCount,
      searchValue,
      contractTypes: list,
      loading: contractTypesMainQuery.loading || this.state.loading,
      removeContractTypes
    };

    const contractTypesList = props => {
      return <ContractTypesList {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.contractTypesMainQuery.refetch();
    };

    return <Bulk content={contractTypesList} refetch={refetch} />;
  }
}

const generateParams = ({ queryParams }) => ({
  variables: {
    ...router.generatePaginationParams(queryParams || {}),
    ids: queryParams.ids,
    searchValue: queryParams.searchValue,
    sortField: queryParams.sortField,
    sortDirection: queryParams.sortDirection
      ? parseInt(queryParams.sortDirection, 10)
      : undefined
  },
  fetchPolicy: 'network-only'
});

const generateOptions = () => ({
  refetchQueries: ['contractTypesMain']
});

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }, MainQueryResponse, ListQueryVariables>(
      gql(queries.contractTypesMain),
      {
        name: 'contractTypesMainQuery',
        options: { ...generateParams }
      }
    ),
    // mutations
    graphql<{}, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.contractTypesRemove),
      {
        name: 'contractTypesRemove',
        options: generateOptions
      }
    )
  )(withRouter<IRouterProps>(ContractTypeListContainer))
);
