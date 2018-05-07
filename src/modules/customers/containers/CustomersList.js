import React from 'react';
import client from 'apolloClient';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Bulk } from 'modules/common/components';
import { Alert, uploadHandler } from 'modules/common/utils';
import { KIND_CHOICES } from 'modules/settings/integrations/constants';
import { TAG_TYPES } from 'modules/tags/constants';
import { CUSTOMER_BASIC_INFO, CUSTOMER_DATAS } from '../constants';
import { mutations, queries } from '../graphql';
import { CustomersList } from '../components';
import { router } from 'modules/common/utils';

class CustomerListContainer extends Bulk {
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

    const { __ } = this.context;
    const ln = localStorage.getItem('currentLanguage');

    const errorMessages = {
      'You can only import max 600 at a time':
        'Алдаа: Харилцагч оруулах дээд хэмжээ: 600',
      'Invalid import type': 'Буруу төрөл сонгосон байна'
    };

    router.refetchIfUpdated(history, customersMainQuery);

    let columnsConfig =
      customersListConfigQuery.fieldsDefaultColumnsConfig || [];

    // load config from local storage
    const localConfig = localStorage.getItem('erxes_customer_columns_config');

    if (localConfig) {
      columnsConfig = JSON.parse(localConfig);
    }

    const removeCustomers = ({ customerIds }) => {
      customersRemove({
        variables: { customerIds }
      })
        .then(() => {
          this.emptyBulk();
          customersMainQuery.refetch();
          Alert.success('Success');
          // callback();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const mergeCustomers = ({ ids, data, callback }) => {
      customersMerge({
        variables: {
          customerIds: ids,
          customerFields: data
        }
      })
        .then(data => {
          Alert.success('Success');
          customersMainQuery.refetch();
          callback();
          history.push(`/customers/details/${data.data.customersMerge._id}`);
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

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
        .then(({ data }) => {
          this.setState({ loading: false });
          window.open(data.customersExport, '_blank');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const handleXlsUpload = e => {
      const xlsFile = e.target.files[0];

      uploadHandler({
        type: 'import',
        file: xlsFile,
        extraFormData: [{ key: 'type', value: 'customers' }],
        url: `${process.env.REACT_APP_API_URL}/import-file`,
        responseType: 'json',
        beforeUpload: () => {
          this.setState({ loading: true });
        },

        afterUpload: ({ response }) => {
          this.setState({ loading: false });

          if (response.length > 0) {
            if (ln === 'mn') {
              return Alert.error(errorMessages[response]);
            }

            Alert.error(response);
          } else {
            Alert.success(__('All customers imported successfully'));
          }

          customersMainQuery.refetch();
        }
      });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const { list = [], totalCount = 0 } =
      customersMainQuery.customersMain || {};

    const counts = customerCountsQuery.customerCounts || {
      byBrand: {},
      byIntegrationType: {},
      bySegment: {},
      byTag: {},
      byForm: {}
    };

    const updatedProps = {
      ...this.props,
      columnsConfig,
      customers: list,
      counts: {
        all: totalCount,
        ...counts
      },
      exportCustomers,
      handleXlsUpload,
      brands: brandsQuery.brands || [],
      integrations: KIND_CHOICES.ALL_LIST,
      tags: tagsQuery.tags || [],
      bulk: this.state.bulk || [],
      emptyBulk: this.emptyBulk,
      toggleBulk: this.toggleBulk,
      toggleAll: this.toggleAll,
      searchValue,
      loading: customersMainQuery.loading || this.state.loading,
      loadingTags: tagsQuery.loading,
      mergeCustomers,
      removeCustomers,
      basicInfos: Object.assign({}, CUSTOMER_BASIC_INFO, CUSTOMER_DATAS)
    };

    return <CustomersList {...updatedProps} />;
  }
}

CustomerListContainer.propTypes = {
  customersQuery: PropTypes.object,
  tagsQuery: PropTypes.object,
  brandsQuery: PropTypes.object,
  customerCountsQuery: PropTypes.object,
  history: PropTypes.object
};

CustomerListContainer.contextTypes = {
  __: PropTypes.func
};

export default compose(
  graphql(gql(queries.customersMain), {
    name: 'customersMainQuery',
    options: ({ queryParams }) => {
      return {
        variables: {
          page: queryParams.page,
          perPage: queryParams.perPage || 20,
          segment: queryParams.segment,
          tag: queryParams.tag,
          ids: queryParams.ids,
          searchValue: queryParams.searchValue,
          brand: queryParams.brand,
          integration: queryParams.integrationType,
          form: queryParams.form,
          startDate: queryParams.startDate,
          endDate: queryParams.endDate
        },
        notifyOnNetworkStatusChange: true
      };
    }
  }),
  graphql(gql(queries.customerCounts), {
    name: 'customerCountsQuery',
    options: ({ queryParams }) => ({
      variables: {
        page: queryParams.page,
        perPage: queryParams.perPage || 20,
        tag: queryParams.tag,
        segment: queryParams.segment,
        ids: queryParams.ids,
        searchValue: queryParams.searchValue,
        form: queryParams.form,
        startDate: queryParams.startDate,
        endDate: queryParams.endDate
      },
      notifyOnNetworkStatusChange: true
    })
  }),
  graphql(gql(queries.tags), {
    name: 'tagsQuery',
    options: () => ({
      variables: {
        type: TAG_TYPES.CUSTOMER
      },
      notifyOnNetworkStatusChange: true
    })
  }),
  graphql(gql(queries.customersListConfig), {
    name: 'customersListConfigQuery',
    options: () => ({
      notifyOnNetworkStatusChange: true
    })
  }),
  graphql(gql(queries.brands), {
    name: 'brandsQuery',
    options: () => ({
      notifyOnNetworkStatusChange: true
    })
  }),
  // mutations
  graphql(gql(mutations.customersRemove), {
    name: 'customersRemove'
  }),
  graphql(gql(mutations.customersMerge), {
    name: 'customersMerge'
  })
)(withRouter(CustomerListContainer));
