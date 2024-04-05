import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils';
import Content from './Content';
import { GrowthHacksPriorityQueryResponse } from '../../types';
import { getFilterParams } from '../../utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../../graphql';

type Props = {
  queryParams: any;
};

type FinalProps = {
  growthHacksPriorityMatrixQuery: GrowthHacksPriorityQueryResponse;
} & Props;

class ContentContainer extends React.Component<FinalProps> {
  render() {
    const { growthHacksPriorityMatrixQuery } = this.props;

    const datas =
      growthHacksPriorityMatrixQuery.growthHacksPriorityMatrix || [];

    const extendedProps = {
      ...this.props,
      datas,
      priorityMatrixRefetch: growthHacksPriorityMatrixQuery.refetch
    };

    return <Content {...extendedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.growthHacksPriorityMatrix), {
      name: 'growthHacksPriorityMatrixQuery',
      options: ({ queryParams = {} }) => ({
        variables: getFilterParams(queryParams)
      })
    })
  )(ContentContainer)
);
