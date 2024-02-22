import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../graphql';
import { getCreditsInfoQueryResponse } from '../types';

type Props = {
  getCreditsInfoQuery: getCreditsInfoQueryResponse;
};

const withChargeItems = (Component) => {
  const Container = (props: Props) => {
    const { getCreditsInfoQuery } = props;

    if (getCreditsInfoQuery.loading) {
      return <Spinner />;
    }

    const extendedProps = {
      ...props,
      chargeItems: getCreditsInfoQuery.getCreditsInfo || [],
    };

    return <Component {...extendedProps} />;
  };

  return compose(
    graphql<{}, getCreditsInfoQueryResponse>(gql(queries.getCreditsInfo), {
      name: 'getCreditsInfoQuery',
    }),
  )(Container);
};

export default withChargeItems;
