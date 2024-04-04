import { DefaultColumnsConfigQueryResponse } from '@erxes/ui-forms/src/settings/properties/types';
import Bulk from '@erxes/ui/src/components/Bulk';
import { IRouterProps } from '@erxes/ui/src/types';
import { Alert, getEnv, withProps } from '@erxes/ui/src/utils';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import queryString from 'query-string';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';

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
    let columnsConfig = (companiesListConfigQuery &&
      companiesListConfigQuery.fieldsDefaultColumnsConfig) || [
      { name: 'primaryName', label: 'Primary Name', order: 1 },
      { name: 'size', label: 'Size', order: 2 },
      { name: 'links.website', label: 'Website', order: 3 },
      { name: 'industry', label: 'Industries', order: 4 },
      { name: 'plan', label: 'Plan', order: 5 },
      { name: 'lastSeenAt', label: 'Last seen at', order: 6 },
      { name: 'sessionCount', label: 'Session count', order: 7 },
      { name: 'score', label: 'Score', order: 8 }
    ];

    // load config from local storage
    const localConfig = localStorage.getItem(
      'erxes_contacts:company_columns_config'
    );

    if (localConfig) {
      columnsConfig = JSON.parse(localConfig).filter(conf => {
        return conf && conf.checked;
      });
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
        checkedConfigs.push(checked.name);
      });

      const stringified = queryString.stringify({
        ...queryParams,
        type: 'company',
        configs: JSON.stringify(checkedConfigs)
      });

      window.open(
        `${REACT_APP_API_URL}/pl:contacts/file-export?${stringified}`,
        '_blank'
      );
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
      return (
        <CompaniesList
          {...updatedProps}
          {...props}
          {...generatePaginationParams(this.props.queryParams)}
        />
      );
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
    segmentData: queryParams.segmentData,
    tag: queryParams.tag,
    brand: queryParams.brand,
    ids: queryParams.ids,
    searchValue: queryParams.searchValue,
    sortField: queryParams.sortField,
    dateFilters: queryParams.dateFilters,
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
        name: 'companiesListConfigQuery',
        skip: !isEnabled('forms')
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
