import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { Bulk } from 'modules/common/components';
import { TAG_TYPES } from 'modules/tags/constants';
import { mutations, queries } from '../graphql';
import { CompaniesList } from '../components';
import { generateListQueryVariables } from '../utils';

class CompanyListContainer extends Bulk {
  refetch() {
    this.props.companiesMainQuery.refetch();
    this.props.companyCountsQuery.refetch();
  }

  render() {
    const {
      companiesMainQuery,
      companiesListConfigQuery,
      companyCountsQuery,
      tagsQuery,
      companiesRemove,
      companiesMerge,
      history
    } = this.props;

    let columnsConfig =
      companiesListConfigQuery.fieldsDefaultColumnsConfig || [];

    // load config from local storage
    const localConfig = localStorage.getItem('erxes_company_columns_config');

    if (localConfig) {
      columnsConfig = JSON.parse(localConfig);
    }

    const removeCompanies = ({ companyIds }) => {
      companiesRemove({
        variables: { companyIds }
      })
        .then(() => {
          this.emptyBulk();
          Alert.success('Success');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const mergeCompanies = ({ ids, data, callback }) => {
      companiesMerge({
        variables: {
          companyIds: ids,
          companyFields: data
        }
      })
        .then(data => {
          this.emptyBulk();
          Alert.success('Success');
          callback();
          history.push(`/companies/details/${data.data.companiesMerge._id}`);
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';
    const { list = [], totalCount = 0 } =
      companiesMainQuery.companiesMain || {};

    const counts = companyCountsQuery.companyCounts || {
      byBrand: {},
      byIntegrationType: {},
      bySegment: {},
      byTag: {},
      byLeadStatus: {},
      byLifecycleState: {}
    };

    const updatedProps = {
      ...this.props,
      columnsConfig,
      counts: {
        all: totalCount,
        ...counts
      },
      tags: tagsQuery.tags || [],
      searchValue,
      companies: list,
      loading: companiesMainQuery.loading,
      bulk: this.state.bulk || [],
      emptyBulk: this.emptyBulk,
      toggleBulk: this.toggleBulk,
      toggleAll: this.toggleAll,
      removeCompanies,
      mergeCompanies,
      loadingTags: tagsQuery.loading
    };

    return <CompaniesList {...updatedProps} />;
  }
}

CompanyListContainer.propTypes = {
  queryParams: PropTypes.object,
  companiesMainQuery: PropTypes.object,
  companyCountsQuery: PropTypes.object,
  companiesListConfigQuery: PropTypes.object,
  tagsQuery: PropTypes.object,
  loading: PropTypes.bool
};

const generateParams = props => ({
  variables: generateListQueryVariables(props)
});

export default compose(
  graphql(gql(queries.companiesMain), {
    name: 'companiesMainQuery',
    options: generateParams
  }),
  graphql(gql(queries.companyCounts), {
    name: 'companyCountsQuery',
    options: generateParams
  }),
  graphql(gql(queries.companiesListConfig), {
    name: 'companiesListConfigQuery'
  }),
  graphql(gql(queries.tags), {
    name: 'tagsQuery',
    options: () => ({
      variables: {
        type: TAG_TYPES.COMPANY
      }
    })
  }),
  // mutations
  graphql(gql(mutations.companiesRemove), {
    name: 'companiesRemove'
  }),
  graphql(gql(mutations.companiesMerge), {
    name: 'companiesMerge',
    options: props => ({
      refetchQueries: [
        {
          query: gql(queries.companiesMain),
          variables: generateListQueryVariables(props)
        },
        {
          query: gql(queries.companyCounts),
          variables: generateListQueryVariables(props)
        }
      ]
    })
  })
)(withRouter(CompanyListContainer));
