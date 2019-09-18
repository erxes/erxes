import gql from 'graphql-tag';
import { withProps } from 'modules/common/utils';
import Left from 'modules/growthHacks/components/priorityMatrix/Left';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { queries } from '../../graphql';

type Props = {
  queryParams: any;
};

type FinalProps = {
  growthHacksQuery: any;
} & Props;

class LeftContainer extends React.Component<FinalProps> {
  render() {
    const { growthHacksQuery } = this.props;

    const growthHacks = growthHacksQuery.growthHacks || [];

    const extendedProps = {
      ...this.props,
      growthHacks
    };

    return <Left {...extendedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.growthHacks), {
      name: 'growthHacksQuery',
      options: ({ queryParams = {} }) => ({
        variables: {
          pipelineId: queryParams.pipelineId,
          viewType: 'priorityMatrix',
          sortField: queryParams.sortField,
          sortDirection: parseInt(queryParams.sortDirection, 10)
        }
      })
    })
  )(LeftContainer)
);
