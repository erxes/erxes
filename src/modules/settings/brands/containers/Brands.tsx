import gql from 'graphql-tag';
import { router as routerUtils, withProps } from 'modules/common/utils';
import { IntegrationsCountQueryResponse } from 'modules/settings/integrations/types';
import queryString from 'query-string';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../../common/types';
import DumbBrands from '../components/Brands';
import Empty from '../components/Empty';
import { queries } from '../graphql';
import { BrandDetailQueryResponse, BrandsGetLastQueryResponse } from '../types';

type Props = {
  currentBrandId: string;
};

type FinalProps = {
  integrationsCountQuery: IntegrationsCountQueryResponse;
  brandDetailQuery: BrandDetailQueryResponse;
} & Props &
  IRouterProps;

class Brands extends React.Component<FinalProps> {
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

const BrandsContainer = withProps<Props>(
  compose(
    graphql<Props, BrandDetailQueryResponse, { _id: string }>(
      gql(queries.brandDetail),
      {
        name: 'brandDetailQuery',
        options: ({ currentBrandId }: { currentBrandId: string }) => ({
          variables: { _id: currentBrandId },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, IntegrationsCountQueryResponse, { brandId: string }>(
      gql(queries.integrationsCount),
      {
        name: 'integrationsCountQuery',
        options: ({ currentBrandId }: { currentBrandId: string }) => ({
          variables: { brandId: currentBrandId }
        })
      }
    )
  )(Brands)
);

type WithCurrentIdProps = {
  history: any;
  queryParams: any;
};

type WithCurrentIdFinalProps = {
  lastBrandQuery: BrandsGetLastQueryResponse;
} & WithCurrentIdProps;

// tslint:disable-next-line:max-classes-per-file
class WithCurrentId extends React.Component<WithCurrentIdFinalProps> {
  componentWillReceiveProps(nextProps: WithCurrentIdFinalProps) {
    const {
      lastBrandQuery,
      history,
      queryParams: { _id }
    } = nextProps;

    if (
      lastBrandQuery &&
      !_id &&
      lastBrandQuery.brandsGetLast &&
      !lastBrandQuery.loading
    ) {
      routerUtils.setParams(
        history,
        { _id: lastBrandQuery.brandsGetLast._id },
        true
      );
    }
  }

  render() {
    const {
      queryParams: { _id }
    } = this.props;

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

const WithLastBrand = withProps<WithCurrentIdProps>(
  compose(
    graphql<WithCurrentIdProps, BrandsGetLastQueryResponse, { _id: string }>(
      gql(queries.brandsGetLast),
      {
        name: 'lastBrandQuery',
        skip: ({ queryParams }: { queryParams: any }) => queryParams._id,
        options: ({ queryParams }: { queryParams: any }) => ({
          variables: { _id: queryParams._id },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(WithCurrentId)
);

const WithQueryParams = (props: IRouterProps) => {
  const { location } = props;
  const queryParams = queryString.parse(location.search);

  const extendedProps = { ...props, queryParams };

  return <WithLastBrand {...extendedProps} />;
};

export default withRouter<IRouterProps>(WithQueryParams);
