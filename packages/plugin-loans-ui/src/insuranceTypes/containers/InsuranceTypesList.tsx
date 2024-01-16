import * as compose from 'lodash.flowright';

import { Alert, Bulk, router, withProps } from '@erxes/ui/src';
import {
  ListQueryVariables,
  MainQueryResponse,
  RemoveMutationResponse,
  RemoveMutationVariables,
} from '../types';
import { mutations, queries } from '../graphql';

import { IRouterProps } from '@erxes/ui/src/types';
import InsuranceTypesList from '../components/InsuranceTypesList';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
// import { withRouter } from 'react-router-dom';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  insuranceTypesMainQuery: MainQueryResponse;
} & Props &
  IRouterProps &
  RemoveMutationResponse;

type State = {
  loading: boolean;
};

class InsuranceTypeListContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  render() {
    const { insuranceTypesMainQuery, insuranceTypesRemove } = this.props;

    const removeInsuranceTypes = ({ insuranceTypeIds }, emptyBulk) => {
      insuranceTypesRemove({
        variables: { insuranceTypeIds },
      })
        .then(() => {
          emptyBulk();
          Alert.success('You successfully deleted a insuranceType');
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const { list = [], totalCount = 0 } =
      insuranceTypesMainQuery.insuranceTypesMain || {};

    const updatedProps = {
      ...this.props,
      totalCount,
      searchValue,
      insuranceTypes: list,
      loading: insuranceTypesMainQuery.loading || this.state.loading,
      removeInsuranceTypes,
    };

    const insuranceTypesList = (props) => {
      return <InsuranceTypesList {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.insuranceTypesMainQuery.refetch();
    };

    return <Bulk content={insuranceTypesList} refetch={refetch} />;
  }
}

const generateParams = ({ queryParams }) => ({
  variables: {
    ...router.generatePaginationParams(queryParams || {}),
    ids: queryParams.ids,
    companyId: queryParams.companyId,
    searchValue: queryParams.searchValue,
    sortField: queryParams.sortField,
    sortDirection: queryParams.sortDirection
      ? parseInt(queryParams.sortDirection, 10)
      : undefined,
  },
  fetchPolicy: 'network-only',
});

const generateOptions = () => ({
  refetchQueries: ['insuranceTypesMain'],
});

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }, MainQueryResponse, ListQueryVariables>(
      gql(queries.insuranceTypesMain),
      {
        name: 'insuranceTypesMainQuery',
        options: { ...generateParams },
      },
    ),
    // mutations
    graphql<{}, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.insuranceTypesRemove),
      {
        name: 'insuranceTypesRemove',
        options: generateOptions,
      },
    ),
  )(InsuranceTypeListContainer),
);
