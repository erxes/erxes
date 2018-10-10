import client from 'apolloClient';
import gql from 'graphql-tag';
import { __, Alert, uploadHandler } from 'modules/common/utils';
import { queries as brandQueries } from 'modules/settings/brands/graphql';
import { KIND_CHOICES } from 'modules/settings/integrations/constants';
import { TAG_TYPES } from 'modules/tags/constants';
import { queries as tagQueries } from 'modules/tags/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { Bulk } from '../../common/components';
import { IRouterProps } from '../../common/types';
import { CustomersList } from '../components';
import { mutations, queries } from '../graphql';

interface IProps extends IRouterProps {
  customersMainQuery: any;
  customerCountsQuery: any;
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
  tagsQuery: any;
  brandsQuery: any;
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
      brandsQuery,
      tagsQuery,
      customerCountsQuery,
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

    const counts = customerCountsQuery.customerCounts || {
      byBrand: {},
      byForm: {},
      byIntegrationType: {},
      byLeadStatus: {},
      byLifecycleState: {},
      bySegment: {},
      byTag: {}
    };

    const updatedProps = {
      ...this.props,
      brands: brandsQuery.brands || [],
      columnsConfig,
      counts: {
        all: totalCount,
        ...counts
      },
      customers: list,
      exportCustomers,
      handleXlsUpload,
      integrations: KIND_CHOICES.ALL_LIST,
      loading: customersMainQuery.loading || this.state.loading,
      loadingTags: tagsQuery.loading,
      mergeCustomers,
      removeCustomers,
      searchValue,
      tags: tagsQuery.tags || []
    };

    return (
      <Bulk
        content={props => <CustomersList {...updatedProps} {...props} />}
        refetch={() => {
          this.props.customersMainQuery.refetch();
          this.props.customerCountsQuery.refetch();
        }}
      />
    );
  }
}

const generateParams = ({ queryParams }) => {
  return {
    fetchPolicy: 'network-only',
    variables: {
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
    }
  };
};

export default compose(
  graphql(gql(queries.customersMain), {
    name: 'customersMainQuery',
    options: generateParams
  }),
  graphql(gql(queries.customerCounts), {
    name: 'customerCountsQuery',
    options: generateParams
  }),
  graphql(gql(tagQueries.tags), {
    name: 'tagsQuery',
    options: () => ({
      fetchPolicy: 'network-only',
      variables: {
        type: TAG_TYPES.CUSTOMER
      }
    })
  }),
  graphql(gql(queries.customersListConfig), {
    name: 'customersListConfigQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(brandQueries.brands), {
    name: 'brandsQuery',
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
