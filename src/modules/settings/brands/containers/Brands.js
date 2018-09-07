import * as React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import queryString from 'query-string';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { router as routerUtils } from 'modules/common/utils';
import { queries } from '../graphql';
import { Brands as DumbBrands, Empty } from '../components';

class Brands extends React.Component {
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

Brands.propTypes = {
  currentBrandId: PropTypes.string,
  integrationsCountQuery: PropTypes.object,
  brandDetailQuery: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object
};

const BrandsContainer = compose(
  graphql(gql(queries.brandDetail), {
    name: 'brandDetailQuery',
    options: ({ currentBrandId }) => ({
      variables: { _id: currentBrandId },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.integrationsCount), {
    name: 'integrationsCountQuery',
    options: ({ currentBrandId }) => ({
      variables: { brandId: currentBrandId }
    })
  })
)(Brands);

class WithCurrentId extends React.Component {
  componentWillReceiveProps(nextProps) {
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

WithCurrentId.propTypes = {
  lastBrandQuery: PropTypes.object,
  history: PropTypes.object,
  queryParams: PropTypes.object
};

const WithLastBrand = compose(
  graphql(gql(queries.brandsGetLast), {
    name: 'lastBrandQuery',
    skip: ({ queryParams }) => queryParams._id,
    options: ({ queryParams }) => ({
      variables: { _id: queryParams._id },
      fetchPolicy: 'network-only'
    })
  })
)(WithCurrentId);

const WithQueryParams = props => {
  const { location } = props;
  const queryParams = queryString.parse(location.search);

  const extendedProps = { ...props, queryParams };

  return <WithLastBrand {...extendedProps} />;
};

WithQueryParams.propTypes = {
  location: PropTypes.object
};

export default withRouter(WithQueryParams);
