import gql from 'graphql-tag';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../common/utils';
import Robot from '../components/Robot';
import { queries } from '../graphql';
import { EntriesQueryResponse } from '../types';

type Props = {
  entriesQuery: EntriesQueryResponse;
};

class RobotContainer extends React.Component<Props> {
  render() {
    const { entriesQuery } = this.props;

    const updatedProps = {
      ...this.props,
      entries: entriesQuery.robotEntries || []
    };

    return <Robot {...updatedProps} />;
  }
}

export default withProps<{}>(
  compose(
    graphql<{}>(gql(queries.entries), {
      options: {
        variables: { action: 'customerScoring' }
      },
      name: 'entriesQuery'
    })
  )(RobotContainer)
);
