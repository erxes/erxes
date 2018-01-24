import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import queryString from 'query-string';
import { compose, gql, graphql } from 'react-apollo';
import { router as routerUtils } from 'modules/common/utils';
import { queries } from '../graphql';
import { Brands } from '../components';

class CurrentBrands extends Component {
  componentWillReceiveProps() {
    const { history, currentBrandId } = this.props;

    if (!routerUtils.getParam(history, 'id') && currentBrandId) {
      routerUtils.setParams(history, { id: currentBrandId });
    }
  }

  render() {
    const {
      brandDetailQuery,
      location,
      totalIntegrationsCountQuery,
      brandsQuery
    } = this.props;

    const extendedProps = {
      ...this.props,
      queryParams: queryString.parse(location.search),
      currentBrand: brandDetailQuery.brandDetail || {},
      brands: brandsQuery.brands || [],
      loading: brandDetailQuery.loading,
      totalIntegrationsCount:
        totalIntegrationsCountQuery.integrationsTotalCount || 0
    };

    return <Brands {...extendedProps} />;
  }
}

CurrentBrands.propTypes = {
  currentBrandId: PropTypes.string,
  totalIntegrationsCountQuery: PropTypes.object,
  brandDetailQuery: PropTypes.object,
  brandsQuery: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object
};

//When there is currentBrand id
const BrandsDetailContainer = compose(
  graphql(gql(queries.brandDetail), {
    name: 'brandDetailQuery',
    options: ({ currentBrandId }) => ({
      variables: { _id: currentBrandId || '' },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.brands), {
    name: 'brandsQuery'
  }),
  graphql(gql(queries.integrationsCount), {
    name: 'totalIntegrationsCountQuery',
    options: ({ currentBrandId }) => ({
      variables: { brandId: currentBrandId || '' }
    })
  })
)(CurrentBrands);

//Getting lastBrand id to currentBrand
const LastBrands = props => {
  const { lastBrandQuery } = props;
  const lastBrand = lastBrandQuery.brandsGetLast || {};
  const extendedProps = { ...props, currentBrandId: lastBrand._id };

  return <BrandsDetailContainer {...extendedProps} />;
};

LastBrands.propTypes = {
  lastBrandQuery: PropTypes.object
};

const BrandsLastContainer = compose(
  graphql(gql(queries.brandsGetLast), {
    name: 'lastBrandQuery'
  })
)(LastBrands);

//Main Brand component
const MainContainer = props => {
  const { history } = props;
  const currentBrandId = routerUtils.getParam(history, 'id');

  if (currentBrandId) {
    const extendedProps = { ...props, currentBrandId };

    return <BrandsDetailContainer {...extendedProps} />;
  }

  return <BrandsLastContainer {...props} />;
};

MainContainer.propTypes = {
  history: PropTypes.object
};

export default withRouter(MainContainer);
