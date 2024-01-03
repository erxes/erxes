import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Bulk, Alert, withProps, router } from '@erxes/ui/src';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import ContractList from '../components/list/ContractsList';
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
  contractsMainQuery: MainQueryResponse;
} & Props &
  IRouterProps &
  RemoveMutationResponse;

type State = {
  loading: boolean;
};

class ContractListContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  render() {
    const {
      contractsMainQuery,
      contractsRemove
      // contractsMerge,
    } = this.props;

    const removeContracts = ({ contractIds }, emptyBulk) => {
      contractsRemove({
        variables: { contractIds }
      })
        .then(() => {
          emptyBulk();
          Alert.success('You successfully deleted a contract');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    // const mergeContracts = ({ ids, data, callback }) => {
    //   contractsMerge({
    //     variables: {
    //       contractIds: ids,
    //       contractFields: data
    //     }
    //   })
    //     .then(response => {
    //       Alert.success('You successfully merged contracts');
    //       callback();
    //       history.push(`/erxes-plugin-contract/details/${response.data.contractsMerge._id}`);
    //     })
    //     .catch(e => {
    //       Alert.error(e.message);
    //     });
    // };

    const searchValue = this.props.queryParams.searchValue || '';
    const { list = [], totalCount = 0 } =
      contractsMainQuery.contractsMain || {};

    const updatedProps = {
      ...this.props,
      totalCount,
      searchValue,
      contracts: list,
      loading: contractsMainQuery.loading || this.state.loading,
      removeContracts
      // mergeContracts
    };

    const contractsList = props => {
      return <ContractList {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.contractsMainQuery.refetch();
    };

    return <Bulk content={contractsList} refetch={refetch} />;
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
  refetchQueries: ['contractsMain']
});

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }, MainQueryResponse, ListQueryVariables>(
      gql(queries.contractsMain),
      {
        name: 'contractsMainQuery',
        options: { ...generateParams }
      }
    ),
    // mutations
    graphql<{}, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.contractsRemove),
      {
        name: 'contractsRemove',
        options: generateOptions
      }
    )
  )(withRouter<IRouterProps>(ContractListContainer))
);
