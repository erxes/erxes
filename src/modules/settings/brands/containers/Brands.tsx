import gql from 'graphql-tag';
import { router as routerUtils } from 'modules/common/utils';
import queryString from 'query-string';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../../common/types';
import { Brands as DumbBrands, Empty } from '../components';
import { queries } from '../graphql';

type Props = {
  currentBrandId: string;
  history: any;
  location: any;
  integrationsCountQuery: any;
  brandDetailQuery: any;
};

class Brands extends React.Component<Props> {
  render() {
    const {
      brandDetailQuery,
      location,
      integrationsCountQuery,
      currentBrandId
    } = this.props;

    let integrationsCount = 0;

    if (!integrationsCountQuery.loading) {
      const byBrand = integrationsCountQuery.integrationsTotalCount.byBrand;
      integrationsCount = byBrand[currentBrandId];
    }

    const extendedProps = {
      ...this.props,
      queryParams: queryString.parse(location.search),
      currentBrand: brandDetailQuery.brandDetail || {},
      loading: brandDetailQuery.loading,
      integrationsCount
    };

    return <DumbBrands {...extendedProps} />;
  }
}

const BrandsContainer = compose(
  graphql(gql(queries.brandDetail), {
    name: 'brandDetailQuery',
    options: ({ currentBrandId } : { currentBrandId: string }) => ({
      variables: { _id: currentBrandId },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.integrationsCount), {
    name: 'integrationsCountQuery',
    options: ({ currentBrandId } : { currentBrandId: string }) => ({
      variables: { brandId: currentBrandId }
    })
  })
)(Brands);

// tslint:disable-next-line:max-classes-per-file
class WithCurrentId extends React.Component<WithCurrentIdProps> {
  componentWillReceiveProps(nextProps: WithCurrentIdProps) {
    const { lastBrandQuery = {}, history, queryParams: { _id } } = nextProps;

    const { brandsGetLast, loading } = lastBrandQuery;

    if (!_id && brandsGetLast && !loading) {
      routerUtils.setParams(history, { _id: brandsGetLast._id });
    }
  }

  render() {
    const { queryParams: { _id } } = this.props;

    if (!_id) {
      return <Empty {...this.props} />;
    }

    const updatedProps = {
      ...this.props,
      currentBrandId: _id
    };

    return <BrandsContainer {...updatedProps} />;
  }
}

type WithCurrentIdProps = {
  lastBrandQuery: any,
  history: any,
  queryParams: any
};

const WithLastBrand = compose(
  graphql(gql(queries.brandsGetLast), {
    name: 'lastBrandQuery',
    skip: ({ queryParams } : { queryParams: any }) => queryParams._id,
    options: ({ queryParams } : { queryParams: any }) => ({
      variables: { _id: queryParams._id },
      fetchPolicy: 'network-only'
    })
  })
)(WithCurrentId);

const WithQueryParams = (props: IRouterProps) => {
  const { location } = props;
  const queryParams = queryString.parse(location.search);

  const extendedProps = { ...props, queryParams };

  return <WithLastBrand {...extendedProps} />;
};

export default withRouter<IRouterProps>(WithQueryParams);
