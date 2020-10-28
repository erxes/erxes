import { getEnv } from 'apolloClient';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Bulk from 'modules/common/components/Bulk';
import { Alert, withProps } from 'modules/common/utils';
import { generatePaginationParams } from 'modules/common/utils/router';
import queryString from 'query-string';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '../../common/types';
import { DefaultColumnsConfigQueryResponse } from '../../settings/properties/types';
import CompaniesList from '../components/list/CompaniesList';
import { mutations, queries } from '../graphql';
import {
  ListConfigQueryResponse,
  ListQueryVariables,
  MainQueryResponse,
  MergeMutationResponse,
  MergeMutationVariables,
  RemoveMutationResponse,
  RemoveMutationVariables
} from '../types';

type Props = {
  queryParams?: any;
};

type FinalProps = {
  companiesMainQuery: MainQueryResponse;
  companiesListConfigQuery: DefaultColumnsConfigQueryResponse;
} & Props &
  IRouterProps &
  RemoveMutationResponse &
  MergeMutationResponse;

type State = {
  loading: boolean;
};

class CompanyListContainer extends React.Component<FinalProps, State> {
  private timer?: NodeJS.Timer;

  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  refetchWithDelay = () => {
    this.timer = setTimeout(() => {
      this.props.companiesMainQuery.refetch();
    }, 5500);
  };

  render() {
    const {
      companiesMainQuery,
      companiesListConfigQuery,
      companiesRemove,
      companiesMerge,
      history
    } = this.props;
    let columnsConfig =
      companiesListConfigQuery.fieldsDefaultColumnsConfig || [];

    // load config from local storage
    const localConfig = localStorage.getItem('erxes_company_columns_config');

    if (localConfig) {
      columnsConfig = JSON.parse(localConfig).filter(conf => conf.checked);
    }

    const removeCompanies = ({ companyIds }, emptyBulk) => {
      companiesRemove({
        variables: { companyIds }
      })
        .then(() => {
          emptyBulk();
          Alert.success(
            'You successfully deleted a company. The changes will take a few seconds',
            4500
          );

          this.refetchWithDelay();
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
          Alert.success('You successfully merged companies');
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

    const exportCompanies = bulk => {
      const { REACT_APP_API_URL } = getEnv();
      const { queryParams } = this.props;
      const checkedConfigs: any[] = [];

      // queryParams page parameter needs convert to int.
      if (queryParams.page) {
        queryParams.page = parseInt(queryParams.page, 10);
      }

      if (bulk.length > 0) {
        queryParams.ids = bulk.map(company => company._id);
      }

      columnsConfig.forEach(checked => {
        checkedConfigs.push(checked);
      });

      const stringified = queryString.stringify({
        ...queryParams,
        type: 'company',
        configs: JSON.stringify(columnsConfig)
      });

      window.open(`${REACT_APP_API_URL}/file-export?${stringified}`, '_blank');
    };

    const updatedProps = {
      ...this.props,
      columnsConfig,
      totalCount,
      searchValue,
      companies: list,
      loading: companiesMainQuery.loading || this.state.loading,
      exportCompanies,
      removeCompanies,
      mergeCompanies,
      refetch: this.refetchWithDelay
    };

    const companiesList = props => {
      return <CompaniesList {...updatedProps} {...props} />;
    };

    return (
      <Bulk
        content={companiesList}
        refetch={this.props.companiesMainQuery.refetch}
      />
    );
  }
}

const generateParams = ({ queryParams }) => {
  return {
    ...generatePaginationParams(queryParams),
    segment: queryParams.segment,
    tag: queryParams.tag,
    brand: queryParams.brand,
    ids: queryParams.ids,
    searchValue: queryParams.searchValue,
    sortField: queryParams.sortField,
    sortDirection: queryParams.sortDirection
      ? parseInt(queryParams.sortDirection, 10)
      : undefined
  };
};

const getRefetchQueries = (queryParams?: any) => {
  return [
    {
      query: gql(queries.companiesMain),
      variables: { ...generateParams({ queryParams }) }
    },
    {
      query: gql(queries.companyCounts),
      variables: { only: 'byTag' }
    },
    {
      query: gql(queries.companyCounts),
      variables: { only: 'bySegment' }
    },
    {
      query: gql(queries.companyCounts),
      variables: { only: 'byBrand' }
    }
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, MainQueryResponse, ListQueryVariables>(
      gql(queries.companiesMain),
      {
        name: 'companiesMainQuery',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams })
        })
      }
    ),
    graphql<Props, ListConfigQueryResponse, {}>(
      gql(queries.companiesListConfig),
      {
        name: 'companiesListConfigQuery'
      }
    ),
    // mutations
    graphql<Props, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.companiesRemove),
      {
        name: 'companiesRemove',
        options: ({ queryParams }) => ({
          refetchQueries: getRefetchQueries(queryParams)
        })
      }
    ),
    graphql<Props, MergeMutationResponse, MergeMutationVariables>(
      gql(mutations.companiesMerge),
      {
        name: 'companiesMerge',
        options: ({ queryParams }) => ({
          refetchQueries: getRefetchQueries(queryParams)
        })
      }
    )
  )(withRouter<IRouterProps>(CompanyListContainer))
);
