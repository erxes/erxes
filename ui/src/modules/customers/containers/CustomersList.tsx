import { getEnv } from 'apolloClient';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
import { generatePaginationParams } from 'modules/common/utils/router';
import queryString from 'query-string';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import Bulk from '../../common/components/Bulk';
import { IRouterProps } from '../../common/types';
import { ListConfigQueryResponse } from '../../companies/types';
import CustomersList from '../components/list/CustomersList';
import { mutations, queries } from '../graphql';
import {
  ChangeStatusMutationResponse,
  ChangeStatusMutationVariables,
  ListQueryVariables,
  MainQueryResponse,
  MergeMutationResponse,
  MergeMutationVariables,
  RemoveMutationResponse,
  RemoveMutationVariables,
  VerifyMutationResponse,
  VerifyMutationVariables
} from '../types';

type Props = {
  queryParams: any;
  showImportBar: () => void;
  type?: string;
};

type FinalProps = {
  customersMainQuery: MainQueryResponse;
  customersListConfigQuery: ListConfigQueryResponse;
} & Props &
  RemoveMutationResponse &
  MergeMutationResponse &
  VerifyMutationResponse &
  ChangeStatusMutationResponse &
  IRouterProps;

type State = {
  loading: boolean;
  mergeCustomerLoading: boolean;
  responseId: string;
};

class CustomerListContainer extends React.Component<FinalProps, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      mergeCustomerLoading: false,
      responseId: '',
    };
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.queryParams.page !== prevProps.queryParams.page) {
      this.props.customersMainQuery.refetch();
    }
  }

  refetchWithDelay = () => {
    this.timer = setTimeout(() => {
      this.props.customersMainQuery.refetch();
    }, 5500);
  }

  render() {
    const {
      customersMainQuery,
      customersListConfigQuery,
      customersRemove,
      customersMerge,
      customersVerify,
      customersChangeVerificationStatus,
      type,
      history,
    } = this.props;

    let columnsConfig =
      customersListConfigQuery.fieldsDefaultColumnsConfig || [];

    // load config from local storage
    const localConfig = localStorage.getItem(`erxes_${type}_columns_config`);

    if (localConfig) {
      columnsConfig = JSON.parse(localConfig).filter((conf) => conf.checked);
    }

    const removeCustomers = ({ customerIds }, emptyBulk) => {
      customersRemove({
        variables: { customerIds },
      })
        .then(() => {
          emptyBulk();
          Alert.success('You successfully deleted a customer. The changes will take a few seconds', 4500);

          this.refetchWithDelay();
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    };

    const mergeCustomers = ({ ids, data, callback }) => {
      this.setState({ mergeCustomerLoading: true });

      customersMerge({
        variables: {
          customerIds: ids,
          customerFields: data,
        },
      })
        .then((result: any) => {
          callback();
          this.setState({ mergeCustomerLoading: false });
          Alert.success('You successfully merged a customer');
          history.push(`/contacts/details/${result.data.customersMerge._id}`);
          customersMainQuery.refetch();
        })
        .catch((e) => {
          Alert.error(e.message);
          this.setState({ mergeCustomerLoading: false });
        });
    };

    const verifyCustomers = ({ verificationType }) => {
      this.setState({ mergeCustomerLoading: true });

      customersVerify({
        variables: {
          verificationType,
        },
      })
        .then(() => {
          Alert.success(
            'Your request has been successfully sent. Your contacts will be verified after a while'
          );
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    };

    const changeVerificationStatus = ({ customerIds, verificationType, status }) => {


      customersChangeVerificationStatus({
        variables: {
          customerIds,
          type: verificationType,
          status
        }
      })
        .then((result: any) => {
          Alert.success('You successfully changed a status');

          customersMainQuery.refetch();
        })
        .catch((e) => {
          Alert.error(e.message);

        });
    }

    const exportData = (bulk: Array<{ _id: string }>) => {
      const { REACT_APP_API_URL } = getEnv();
      const { queryParams } = this.props;
      const checkedConfigs: any[] = [];

      // queryParams page parameter needs convert to int.
      if (queryParams.page) {
        queryParams.page = parseInt(queryParams.page, 10);
      }

      if (bulk.length > 0) {
        queryParams.ids = bulk.map((customer) => customer._id);
      }

      columnsConfig.forEach((checked) => {
        checkedConfigs.push(checked);
      });

      const exportQuery = {
        ...queryParams,
        type,
        configs: JSON.stringify(columnsConfig),
      };

      const stringified = queryString.stringify(exportQuery);

      window.open(`${REACT_APP_API_URL}/file-export?${stringified}`, '_blank');
    };

    const searchValue = this.props.queryParams.searchValue || '';

    const { list = [], totalCount = 0 } =
      customersMainQuery.customersMain || {};

    const updatedProps = {
      ...this.props,
      columnsConfig,
      customers: list,
      totalCount,
      exportData,
      searchValue,
      loading: customersMainQuery.loading || this.state.loading,
      mergeCustomers,
      responseId: this.state.responseId,
      removeCustomers,
      verifyCustomers,
      changeVerificationStatus,
      mergeCustomerLoading: this.state.mergeCustomerLoading,
      refetch: this.refetchWithDelay
    };

    const content = (props) => {
      return <CustomersList {...updatedProps} {...props} />;
    };

    return <Bulk content={content} refetch={this.props.customersMainQuery.refetch} />;
  }
}

const generateParams = ({ queryParams, type }) => {
  return {
    ...generatePaginationParams(queryParams),
    segment: queryParams.segment,
    tag: queryParams.tag,
    ids: queryParams.ids,
    searchValue: queryParams.searchValue,
    brand: queryParams.brand,
    integration: queryParams.integrationType,
    form: queryParams.form,
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    leadStatus: queryParams.leadStatus,
    sortField: queryParams.sortField,
    type,
    sortDirection: queryParams.sortDirection
      ? parseInt(queryParams.sortDirection, 10)
      : undefined,
  };
};

const getRefetchQueries = (queryParams?: any, type?: string) => {
  return [
    {
      query: gql(queries.customersMain),
      variables: { ...generateParams({ queryParams, type }) }
    },
    {
      query: gql(queries.customerCounts),
      variables: { type, only: 'byTag' }
    },
    {
      query: gql(queries.customerCounts),
      variables: { type, only: 'byForm' }
    },
    {
      query: gql(queries.customerCounts),
      variables: { type, only: 'byIntegrationType' }
    },
    {
      query: gql(queries.customerCounts),
      variables: { type, only: 'byLeadStatus' }
    },
    {
      query: gql(queries.customerCounts),
      variables: { type, only: 'bySegment' }
    },
    {
      query: gql(queries.customerCounts),
      variables: { type, only: 'byBrand' }
    }
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, MainQueryResponse, ListQueryVariables>(
      gql(queries.customersMain),
      {
        name: 'customersMainQuery',
        options: ({ queryParams, type }) => ({
          variables: generateParams({ queryParams, type }),
        }),
      }
    ),
    graphql<Props, ListConfigQueryResponse, {}>(
      gql(queries.customersListConfig),
      {
        name: 'customersListConfigQuery',
      }
    ),
    // mutations
    graphql<Props, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.customersRemove),
      {
        name: 'customersRemove',
        options: ({ queryParams, type }) => ({
          refetchQueries: getRefetchQueries(queryParams, type)
        })
      }
    ),
    graphql<Props, MergeMutationResponse, MergeMutationVariables>(
      gql(mutations.customersMerge),
      {
        name: 'customersMerge',
        options: ({ queryParams, type }) => ({
          refetchQueries: getRefetchQueries(queryParams, type)
        })
      }
    ),
    graphql<Props, VerifyMutationResponse, VerifyMutationVariables>(
      gql(mutations.customersVerify),
      {
        name: 'customersVerify',
      }
    ),
    graphql<Props, ChangeStatusMutationResponse, ChangeStatusMutationVariables>(
      gql(mutations.customersChangeVerificationStatus),
      {
        name: 'customersChangeVerificationStatus',
      }
    )
  )(withRouter<IRouterProps>(CustomerListContainer))
);
