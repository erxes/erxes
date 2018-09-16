import gql from 'graphql-tag';
import { Bulk } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { TAG_TYPES } from 'modules/tags/constants';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { CompaniesList } from '../components';
import { mutations, queries } from '../graphql';

type Props = {
  queryParams?: any,
  companiesMainQuery?: any,
  companyCountsQuery?: any,
  companiesListConfigQuery?: any,
  companiesRemove: (params: { variables: { companyIds: string[] } }) => Promise<any>,
  companiesMerge: (params: {
    variables: {
      companyIds: string[],
      companyFields: any
    }
  }) => Promise<any>,
  tagsQuery?: any,
  loading?: boolean,
  history: any,
};

type State = {
  loading: boolean
};

class CompanyListContainer extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    };
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

    const removeCompanies = ({ companyIds }, emptyBulk) => {
      companiesRemove({
        variables: { companyIds }
      })
        .then(() => {
          emptyBulk();
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
        .then(response => {
          Alert.success('Success');
          callback();
          history.push(
            `/companies/details/${response.data.companiesMerge._id}`
          );
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
      loading: companiesMainQuery.loading || this.state.loading,
      removeCompanies,
      mergeCompanies,
      loadingTags: tagsQuery.loading
    };

    return (
      <Bulk
        content={props => {
          return <CompaniesList {...updatedProps} {...props} />
        }}
        refetch={() => {
          this.props.companiesMainQuery.refetch();
          this.props.companyCountsQuery.refetch();
        }}
      />
    );
  }
}

const generateParams = ({ queryParams }) => ({
  variables: {
    page: queryParams.page,
    perPage: queryParams.perPage || 20,
    segment: queryParams.segment,
    tag: queryParams.tag,
    brand: queryParams.brand,
    ids: queryParams.ids,
    searchValue: queryParams.searchValue,
    leadStatus: queryParams.leadStatus,
    lifecycleState: queryParams.lifecycleState,
    sortField: queryParams.sortField,
    sortDirection: queryParams.sortDirection
  },
  fetchPolicy: 'network-only'
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
    name: 'companiesListConfigQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.tags), {
    name: 'tagsQuery',
    options: () => ({
      variables: {
        type: TAG_TYPES.COMPANY
      },
      fetchPolicy: 'network-only'
    })
  }),
  // mutations
  graphql(gql(mutations.companiesRemove), {
    name: 'companiesRemove'
  }),
  graphql(gql(mutations.companiesMerge), {
    name: 'companiesMerge',
    options: props => ({
      refetchQueries: ['companiesMain', 'companyCounts']
    })
  })
)(withRouter(CompanyListContainer));
