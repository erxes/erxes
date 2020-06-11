import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from 'modules/common/utils';
import Content from 'modules/growthHacks/components/priorityMatrix/Content';
import { GrowthHacksPriorityQueryResponse } from 'modules/growthHacks/types';
import { getFilterParams } from 'modules/growthHacks/utils';
import React from 'react';
import { graphql } from 'react-apollo';
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
