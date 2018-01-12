import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Alert } from 'modules/common/utils';
import { Bulk } from 'modules/common/components';
import { mutations, queries } from '../graphql';
import { TAG_TYPES } from 'modules/tags/constants';
import { CompaniesList } from '../components';

class CompanyListContainer extends Bulk {
  render() {
    const {
      companiesQuery,
      companiesListConfigQuery,
      companyCountsQuery,
      companiesAdd,
      tagsQuery
    } = this.props;

    let columnsConfig =
      companiesListConfigQuery.fieldsDefaultColumnsConfig || [];

    // load config from local storage
    const localConfig = localStorage.getItem('erxes_company_columns_config');

    if (localConfig) {
      columnsConfig = JSON.parse(localConfig);
    }

    // add customer
    const addCompany = ({ doc, callback }) => {
      companiesAdd({
        variables: doc
      })
        .then(() => {
          companiesQuery.refetch();
          Alert.success('Success');
          callback();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };
    const searchValue = this.props.queryParams.searchValue || '';

    const updatedProps = {
      ...this.props,
      columnsConfig,

      counts: companyCountsQuery.companyCounts || {
        all: 0,
        byBrand: {},
        byIntegrationType: {},
        bySegment: {},
        byTag: {}
      },
      tags: tagsQuery.tags || [],
      searchValue,
      companies: companiesQuery.companies || [],
      addCompany,
      loading: companiesQuery.loading,
      bulk: this.state.bulk || [],
      emptyBulk: this.emptyBulk,
      toggleBulk: this.toggleBulk,
      toggleAll: this.toggleAll,
      loadingTags: tagsQuery.loading
    };

    return <CompaniesList {...updatedProps} />;
  }
}

CompanyListContainer.propTypes = {
  queryParams: PropTypes.object,
  companiesQuery: PropTypes.object,
  companyCountsQuery: PropTypes.object,
  companiesListConfigQuery: PropTypes.object,
  tagsQuery: PropTypes.object,
  companiesAdd: PropTypes.func,
  loading: PropTypes.bool
};

export default compose(
  graphql(gql(queries.companies), {
    name: 'companiesQuery',
    options: ({ queryParams }) => ({
      variables: {
        page: queryParams.page,
        perPage: queryParams.perPage || 20,
        segment: queryParams.segment,
        tag: queryParams.tag,
        ids: queryParams.ids,
        searchValue: queryParams.searchValue
      },
      notifyOnNetworkStatusChange: true
    })
  }),
  graphql(gql(queries.companyCounts), {
    name: 'companyCountsQuery',
    options: ({ queryParams }) => ({
      variables: {
        page: queryParams.page,
        perPage: queryParams.perPage || 20,
        segment: queryParams.segment,
        tag: queryParams.tag,
        ids: queryParams.ids,
        searchValue: queryParams.searchValue
      },
      notifyOnNetworkStatusChange: true
    })
  }),
  graphql(gql(queries.companiesListConfig), {
    name: 'companiesListConfigQuery',
    options: () => ({
      notifyOnNetworkStatusChange: true
    })
  }),
  graphql(gql(queries.tags), {
    name: 'tagsQuery',
    options: () => ({
      variables: {
        type: TAG_TYPES.COMPANY
      },
      notifyOnNetworkStatusChange: true
    })
  }),
  // mutations
  graphql(gql(mutations.companiesAdd), {
    name: 'companiesAdd'
  })
)(CompanyListContainer);
