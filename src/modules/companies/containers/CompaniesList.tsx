import gql from 'graphql-tag';
import { Bulk } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { TAG_TYPES } from 'modules/tags/constants';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../common/types';
import { CompaniesList } from '../components';
import { mutations, queries } from '../graphql';

interface IProps extends IRouterProps {
  queryParams?: any;
  companiesMainQuery?: any;
  companyCountsQuery?: any;
  companiesListConfigQuery?: any;
  companiesRemove: (
    params: { variables: { companyIds: string[] } }
  ) => Promise<any>;
  companiesMerge: (
    params: {
      variables: {
        companyIds: string[];
        companyFields: any;
      };
    }
  ) => Promise<any>;
  tagsQuery?: any;
  loading?: boolean;
}

type State = {
  loading: boolean;
};

class CompanyListContainer extends React.Component<IProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
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
          companyFields: data,
          companyIds: ids
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
      byLeadStatus: {},
      byLifecycleState: {},
      bySegment: {},
      byTag: {}
    };

    const updatedProps = {
      ...this.props,
      columnsConfig,
      companies: list,
      counts: {
        all: totalCount,
        ...counts
      },
      loading: companiesMainQuery.loading || this.state.loading,
      loadingTags: tagsQuery.loading,
      mergeCompanies,
      removeCompanies,
      searchValue,
      tags: tagsQuery.tags || []
    };

    return (
      <Bulk
        content={props => {
          return <CompaniesList {...updatedProps} {...props} />;
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
  fetchPolicy: 'network-only',
  variables: {
    brand: queryParams.brand,
    ids: queryParams.ids,
    leadStatus: queryParams.leadStatus,
    lifecycleState: queryParams.lifecycleState,
    page: queryParams.page,
    perPage: queryParams.perPage || 20,
    searchValue: queryParams.searchValue,
    segment: queryParams.segment,
    sortDirection: queryParams.sortDirection,
    sortField: queryParams.sortField,
    tag: queryParams.tag
  }
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
      fetchPolicy: 'network-only',
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
      refetchQueries: ['companiesMain', 'companyCounts']
    })
  })
)(withRouter<IRouterProps>(CompanyListContainer));
