import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import Status from '../components/Status';
import { queries } from '../graphql';
import { VersionsQueryResponse } from '../types';

type Props = {
  statisticsQuery: VersionsQueryResponse;
};

const StatusContainer = (props: Props) => {
  const { statisticsQuery } = props;

  if (statisticsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const statistics = statisticsQuery.configsStatus || {};

  return <Status statistics={statistics} />;
};

export default withProps<{}>(
  compose(
    graphql<{}, VersionsQueryResponse>(gql(queries.configsStatus), {
      name: 'statisticsQuery'
    })
  )(StatusContainer)
);
