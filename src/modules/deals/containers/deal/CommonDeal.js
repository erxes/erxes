import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { CommonDeal } from '../../components';
import { queries } from '../../graphql';
import { Spinner } from 'modules/common/components';

class CommonDealContainer extends React.Component {
  render() {
    const { dealDetailQuery } = this.props;

    if (dealDetailQuery.loading) {
      return <Spinner objective />;
    }

    const deal = dealDetailQuery.dealDetail;

    const extendedProps = {
      ...this.props,
      deal
    };

    return <CommonDeal {...extendedProps} />;
  }
}

const propTypes = {
  dealDetailQuery: PropTypes.object
};

CommonDealContainer.propTypes = propTypes;

export default compose(
  graphql(gql(queries.dealDetail), {
    name: 'dealDetailQuery',
    options: ({ dealId }) => ({
      variables: {
        _id: dealId
      }
    })
  })
)(CommonDealContainer);
