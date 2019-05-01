import client from 'apolloClient';
import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import { generatePaginationParams } from 'modules/common/utils/router';
import { KIND_CHOICES } from 'modules/settings/integrations/constants';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { Bulk } from '../../common/components';
import { IRouterProps } from '../../common/types';
import { ListConfigQueryResponse } from '../../companies/types';
import { CustomersList } from '../components';
import { mutations, queries } from '../graphql';
import {
  ListQueryVariables,
  MainQueryResponse,
  MergeMutationResponse,
  MergeMutationVariables,
  RemoveMutationResponse,
  RemoveMutationVariables
} from '../types';
import { handleXlsUpload } from '../utils';

type Props = {
  queryParams: any;
  showImportBar: () => void;
};

type FinalProps = {
  customersMainQuery: MainQueryResponse;
  customersListConfigQuery: ListConfigQueryResponse;
} & Props &
  RemoveMutationResponse &
  MergeMutationResponse &
  IRouterProps;

type State = {
  loading: boolean;
  responseId: string;
  uploadingXls: boolean;
};

class CustomerListContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      uploadingXls: false,
      responseId: ''
    };
  }

  render() {
    const {
      customersMainQuery,
      customersListConfigQuery,
      customersRemove,
      customersMerge,
      history,
      showImportBar
    } = this.props;

    let columnsConfig =
      customersListConfigQuery.fieldsDefaultColumnsConfig || [];

    // load config from local storage
    const localConfig = localStorage.getItem('erxes_customer_columns_config');

    if (localConfig) {
      columnsConfig = JSON.parse(localConfig);
    }

    const removeCustomers = ({ customerIds }, emptyBulk) => {
      customersRemove({
        variables: { customerIds }
      })
        .then(() => {
          emptyBulk();
          Alert.success('You successfully deleted a customer');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const mergeCustomers = ({ ids, data, callback }) =>
      customersMerge({
        variables: {
          customerIds: ids,
          customerFields: data
        }
      })
        .then((result: any) => {
          callback();
          Alert.success('You successfully merged a customer');
          history.push(`/customers/details/${result.data.customersMerge._id}`);
        })
        .catch(e => {
          Alert.error(e.message);
        });

    const exportCustomers = bulk => {
      const { queryParams } = this.props;

      // queryParams page parameter needs convert to int.
      if (queryParams.page) {
        queryParams.page = parseInt(queryParams.page, 10);
      }

      if (bulk.length > 0) {
        queryParams.ids = bulk.map(customer => customer._id);
      }

      this.setState({ loading: true });

      client
        .query({
          query: gql(queries.customersExport),
          variables: { ...queryParams }
        })
        .then(({ data }: any) => {
          this.setState({ loading: false });
          window.open(data.customersExport, '_blank');
        })
        .catch(error => {
          this.setState({ loading: false });
          Alert.error(error.message);
        });
    };

    const uploadXls = e => {
      handleXlsUpload({
        e,
        type: 'customer',
        beforeUploadCallback: () => {
          this.setState({ uploadingXls: true });
        },
        afterUploadCallback: response => {
          this.setState({ uploadingXls: false });

          if (response.status === 'error') {
            return Alert.error(response.message);
          }

          if (response.id) {
            localStorage.setItem('erxes_import_data', response.id);
            showImportBar();
          }
        }
      });
    };

    const searchValue = this.props.queryParams.searchValue || '';

    const { list = [], totalCount = 0 } =
      customersMainQuery.customersMain || {};

    const updatedProps = {
      ...this.props,
      columnsConfig,
      customers: list,
      totalCount,
      exportCustomers,
      uploadingXls: this.state.uploadingXls,
      uploadXls,
      integrations: KIND_CHOICES.ALL_LIST,
      searchValue,
      loading: customersMainQuery.loading || this.state.loading,
      mergeCustomers,
      responseId: this.state.responseId,
      removeCustomers
    };

    const content = props => {
      return <CustomersList {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.customersMainQuery.refetch();
    };

    return <Bulk content={content} refetch={refetch} />;
  }
}

const generateParams = ({ queryParams }) => {
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
    lifecycleState: queryParams.lifecycleState,
    sortField: queryParams.sortField,
    sortDirection: queryParams.sortDirection
      ? parseInt(queryParams.sortDirection, 10)
      : undefined
  };
};

const CustomerListWithProps = withProps<Props>(
  compose(
    graphql<Props, MainQueryResponse, ListQueryVariables>(
      gql(queries.customersMain),
      {
        name: 'customersMainQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams })
        })
      }
    ),
    graphql<Props, ListConfigQueryResponse, {}>(
      gql(queries.customersListConfig),
      {
        name: 'customersListConfigQuery'
      }
    ),

    // mutations
    graphql<Props, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.customersRemove),
      {
        name: 'customersRemove'
      }
    ),
    graphql<Props, MergeMutationResponse, MergeMutationVariables>(
      gql(mutations.customersMerge),
      {
        name: 'customersMerge',
        options: {
          refetchQueries: ['customersMain', 'customerCounts']
        }
      }
    )
  )(withRouter<IRouterProps>(CustomerListContainer))
);

const WithConsumer = props => {
  return (
    <AppConsumer>
      {({ showImportBar }) => (
        <CustomerListWithProps {...props} showImportBar={showImportBar} />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;
