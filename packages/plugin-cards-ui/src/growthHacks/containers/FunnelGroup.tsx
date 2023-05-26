import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import FunnelGroup from '../components/funnelImpact/FunnelGroup';
import { queries } from '../graphql';
import {
  GrowthHacksCountQueryResponse,
  GrowthHacksQueryResponse,
  IGrowthHack
} from '../types';
import { getFilterParams } from '../utils';

type Props = {
  queryParams: any;
  isOpen: boolean;
  hackStage: string;
  toggle(hackStage: string, isOpen: boolean): void;
};

type FinalProps = {
  growthHacksQuery?: GrowthHacksQueryResponse;
  growthHacksTotalCountQuery: GrowthHacksCountQueryResponse;
} & Props;

class FunnelGroupContainer extends React.Component<FinalProps> {
  render() {
    const { growthHacksQuery, growthHacksTotalCountQuery } = this.props;

    const growthHacks: IGrowthHack[] = growthHacksQuery
      ? growthHacksQuery.growthHacks || []
      : [];

    const props = {
      ...this.props,
      growthHacks,
      totalCount: growthHacksTotalCountQuery.growthHacksTotalCount || 0
    };

    return <FunnelGroup {...props} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.growthHacks), {
      name: 'growthHacksQuery',
      skip: ({ isOpen }) => !isOpen,
      options: ({ queryParams = {}, hackStage }) => ({
        variables: {
          ...getFilterParams(queryParams),
          hackStage,
          sortField: queryParams.sortField,
          sortDirection: parseInt(queryParams.sortDirection, 10)
        }
      })
    }),
    graphql<Props>(gql(queries.growthHacksTotalCount), {
      name: 'growthHacksTotalCountQuery',
      options: ({ queryParams = {}, hackStage }) => ({
        variables: {
          ...getFilterParams(queryParams),
          hackStage
        }
      })
    })
  )(FunnelGroupContainer)
);
