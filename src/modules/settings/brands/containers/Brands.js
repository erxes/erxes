import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import queryString from 'query-string';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
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
      integrationsCountQuery,
      currentBrandId
    } = this.props;

    if (integrationsCountQuery.loading) {
      return <Spinner />;
    }

    const extendedProps = {
      ...this.props,
      queryParams: queryString.parse(location.search),
      currentBrand: brandDetailQuery.brandDetail || {},
      loading: brandDetailQuery.loading,
      integrationsCount:
        integrationsCountQuery.integrationsTotalCount.byBrand[currentBrandId] ||
        0
    };

    return <Brands {...extendedProps} />;
  }
}

CurrentBrands.propTypes = {
  currentBrandId: PropTypes.string,
  integrationsCountQuery: PropTypes.object,
  brandDetailQuery: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object
};

const BrandsDetailContainer = compose(
  graphql(gql(queries.brandDetail), {
    name: 'brandDetailQuery',
    options: ({ currentBrandId }) => ({
      variables: { _id: currentBrandId || '' },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.integrationsCount), {
    name: 'integrationsCountQuery'
  })
)(CurrentBrands);

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
