import * as compose from 'lodash.flowright';

import React from 'react';
import { SitesTotalCountQueryResponse } from '../types';
import Spinner from '@erxes/ui/src/components/Spinner';
import DigitalIncomeRoom from '../components/DigitalIncomeRoom';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries } from '../graphql';

type Props = {
  queryParams: any;
};

type FinalProps = {
  sitesTotalCountQuery: SitesTotalCountQueryResponse;
} & Props;

function RoomContainer(props: FinalProps) {
  const { sitesTotalCountQuery } = props;

  if (sitesTotalCountQuery.loading) {
    return <Spinner objective={true} />;
  }

  const sitesCount = sitesTotalCountQuery.digitalIncomeRoomSitesTotalCount || 0;

  const updatedProps = {
    ...props,
    loading: sitesTotalCountQuery.loading,
    sitesCount
  };

  return <DigitalIncomeRoom {...updatedProps} />;
}

export default compose(
  graphql<{}, SitesTotalCountQueryResponse>(gql(queries.sitesTotalCount), {
    name: 'sitesTotalCountQuery'
  })
)(RoomContainer);
