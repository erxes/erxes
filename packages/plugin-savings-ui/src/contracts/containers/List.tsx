import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Bulk, Alert, withProps, router } from '@erxes/ui/src';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import ContractList from '../components/list/ContractsList';
import { mutations, queries } from '../graphql';
import queryString from 'query-string';
import {
  ListQueryVariables,
  MainQueryResponse,
  RemoveMutationResponse,
  RemoveMutationVariables
} from '../types';
import { FILTER_PARAMS_CONTRACT } from '../../constants';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  contractsMainQuery: MainQueryResponse;
  savingsContractsAlertQuery: any;
} & Props &
  IRouterProps &
  RemoveMutationResponse;

type SavingAlert = { name: string; count: number; filter: any };

type State = {
  loading: boolean;
};

const generateQueryParams = ({ location }) => {
  return queryString.parse(location.search);
};

class ContractListContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  onSearch = (searchValue: string) => {
    if (!searchValue) {
      return router.removeParams(this.props.history, 'searchValue');
    }

    router.setParams(this.props.history, { searchValue });
  };

  onSelect = (values: string[] | string, key: string) => {
    const params = generateQueryParams(this.props.history);

    if (params[key] === values) {
      return router.removeParams(this.props.history, key);
    }

    return router.setParams(this.props.history, { [key]: values });
  };

  isFiltered = (): boolean => {
    const params = generateQueryParams(this.props.history);

    for (const param in params) {
      if (FILTER_PARAMS_CONTRACT.includes(param)) {
        return true;
      }
    }

    return false;
  };

  clearFilter = () => {
    const params = generateQueryParams(this.props.history);
    router.removeParams(this.props.history, ...Object.keys(params));
  };

  render() {
    const {
      contractsMainQuery,
      contractsRemove,
      savingsContractsAlertQuery
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

    const searchValue = this.props.queryParams.searchValue || '';
    const { list = [], totalCount = 0 } =
      contractsMainQuery.savingsContractsMain || {};
    const alerts: SavingAlert[] =
      savingsContractsAlertQuery?.savingsContractsAlert || [];

    const updatedProps = {
      ...this.props,
      totalCount,
      searchValue,
      contracts: list,
      alerts,
      loading: contractsMainQuery.loading || this.state.loading,
      queryParams: this.props.queryParams,
      removeContracts,
      onSelect: this.onSelect,
      onSearch: this.onSearch,
      isFiltered: this.isFiltered(),
      clearFilter: this.clearFilter
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

const generateOptions = () => ({
  refetchQueries: ['contractsMain']
});

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }, MainQueryResponse, ListQueryVariables>(
      gql(queries.contractsMain),
      {
        name: 'contractsMainQuery',
        options: ({ queryParams }) => {
          return {
            variables: {
              ...router.generatePaginationParams(queryParams || {}),
              ids: queryParams.ids,
              searchValue: queryParams.searchValue,
              isExpired: queryParams.isExpired,
              closeDateType: queryParams.closeDateType,
              startStartDate: queryParams.startStartDate,
              endStartDate: queryParams.endStartDate,
              startCloseDate: queryParams.startCloseDate,
              contractTypeId: queryParams.contractTypeId,
              endCloseDate: queryParams.endCloseDate,
              customerId: queryParams.customerId,
              branchId: queryParams.branchId,

              savingAmount: !!queryParams.savingAmount
                ? parseFloat(queryParams.savingAmount)
                : undefined,
              interestRate: !!queryParams.interestRate
                ? parseFloat(queryParams.interestRate)
                : undefined,
              tenor: !!queryParams.tenor
                ? parseInt(queryParams.tenor)
                : undefined,

              sortField: queryParams.sortField,
              sortDirection: queryParams.sortDirection
                ? parseInt(queryParams.sortDirection, 10)
                : undefined
            },
            fetchPolicy: 'network-only'
          };
        }
      }
    ),
    graphql<{ queryParams: any }, any, any>(
      gql(queries.savingsContractsAlert),
      {
        name: 'savingsContractsAlertQuery',
        options: () => {
          return {
            variables: {
              date: new Date()
            },
            fetchPolicy: 'network-only'
          };
        }
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
