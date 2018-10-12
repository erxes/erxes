import client from 'apolloClient';
import gql from 'graphql-tag';
import { __, Alert, uploadHandler } from 'modules/common/utils';
import { KIND_CHOICES } from 'modules/settings/integrations/constants';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { Bulk } from '../../common/components';
import { IRouterProps } from '../../common/types';
import { CustomersList } from '../components';
import { mutations, queries } from '../graphql';

interface IProps extends IRouterProps {
  customersMainQuery: any;
  customersListConfigQuery: any;
  customersRemove: (
    params: { variables: { customerIds: string[] } }
  ) => Promise<void>;
  customersMerge: (
    params: {
      variables: {
        customerIds: string[];
        customerFields: any;
      };
    }
  ) => Promise<void>;
  queryParams: any;
}

type State = {
  loading: boolean;
};

class CustomerListContainer extends React.Component<IProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  render() {
    const {
      customersMainQuery,
      customersListConfigQuery,
      customersRemove,
      customersMerge,
      history
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
          Alert.success('Success');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const mergeCustomers = ({ ids, data, callback }) =>
      customersMerge({
        variables: {
          customerFields: data,
          customerIds: ids
        }
      })
        .then((result: any) => {
          callback();
          Alert.success('Success');
          history.push(`/customers/details/${result.data.customersMerge._id}`);
        })
        .catch(e => {
          Alert.error(e.message);
        });

    const exportCustomers = bulk => {
      const { queryParams } = this.props;

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
          Alert.error(error.message);
        });
    };

    const handleXlsUpload = e => {
      const xlsFile = e.target.files;

      uploadHandler({
        extraFormData: [{ key: 'type', value: 'customers' }],
        files: xlsFile,
        responseType: 'json',
        type: 'import',
        url: `${process.env.REACT_APP_API_URL}/import-file`,

        beforeUpload: () => {
          this.setState({ loading: true });
        },

        afterUpload: ({ response }) => {
          if (response.length === 0) {
            customersMainQuery.refetch();
            Alert.success(__('All customers imported successfully'));
          } else {
            Alert.error(response[0]);
          }

          this.setState({ loading: false });
        }
      });

      e.target.value = null;
    };

    const searchValue = this.props.queryParams.searchValue || '';

    const { list = [], totalCount = 0 } =
      customersMainQuery.customersMain || {};

    const updatedProps = {
      ...this.props,
      columnsConfig,
      customers: list,
      exportCustomers,
      handleXlsUpload,
      integrations: KIND_CHOICES.ALL_LIST,
      loading: customersMainQuery.loading || this.state.loading,
      mergeCustomers,
      removeCustomers,
      searchValue,
      totalCount
    };

    return (
      <Bulk
        content={props => <CustomersList {...updatedProps} {...props} />}
        refetch={() => {
          this.props.customersMainQuery.refetch();
        }}
      />
    );
  }
}

const generateParams = ({ queryParams }) => {
  return {
    brand: queryParams.brand,
    endDate: queryParams.endDate,
    form: queryParams.form,
    ids: queryParams.ids,
    integration: queryParams.integrationType,
    leadStatus: queryParams.leadStatus,
    lifecycleState: queryParams.lifecycleState,
    page: queryParams.page,
    perPage: queryParams.perPage || 20,
    searchValue: queryParams.searchValue,
    segment: queryParams.segment,
    sortDirection: queryParams.sortDirection,
    sortField: queryParams.sortField,
    startDate: queryParams.startDate,
    tag: queryParams.tag
  };
};

export default compose(
  graphql(gql(queries.customersMain), {
    name: 'customersMainQuery',
    options: ({ queryParams }: { queryParams: any }) => ({
      fetchPolicy: 'network-only',
      variables: generateParams({ queryParams })
    })
  }),
  graphql(gql(queries.customersListConfig), {
    name: 'customersListConfigQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),

  // mutations
  graphql(gql(mutations.customersRemove), {
    name: 'customersRemove'
  }),
  graphql(gql(mutations.customersMerge), {
    name: 'customersMerge',
    options: props => ({
      refetchQueries: ['customersMain', 'customerCounts']
    })
  })
)(withRouter<IRouterProps>(CustomerListContainer));
