import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Bulk } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { KIND_CHOICES } from 'modules/settings/integrations/constants';
import { TAG_TYPES } from 'modules/tags/constants';
import { CUSTOMER_BASIC_INFO, CUSTOMER_DATAS } from '../constants';
import { mutations, queries } from '../graphql';
import { CustomersList } from '../components';
import { router } from 'modules/common/utils';

class CustomerListContainer extends Bulk {
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

    const searchValue = this.props.queryParams.searchValue || '';
    const { list = [], totalCount = 0 } =
      customersMainQuery.customersMain || {};

    const counts = customerCountsQuery.customerCounts || {
      byBrand: {},
      byIntegrationType: {},
      bySegment: {},
      byTag: {}
    };

    const updatedProps = {
      ...this.props,
      columnsConfig,
      customers: list,
      counts: {
        all: totalCount,
        ...counts
      },
      brands: brandsQuery.brands || [],
      integrations: KIND_CHOICES.ALL_LIST,
      tags: tagsQuery.tags || [],
      bulk: this.state.bulk || [],
      emptyBulk: this.emptyBulk,
      toggleBulk: this.toggleBulk,
      toggleAll: this.toggleAll,
      searchValue,
      loading: customersMainQuery.loading,
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
          searchValue: queryParams.searchValue
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
        searchValue: queryParams.searchValue
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
