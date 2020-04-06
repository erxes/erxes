import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IUser } from 'modules/auth/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../common/utils';
import Robot from '../components/Robot';
import { queries } from '../graphql';
import { EntriesQueryResponse } from '../types';

type Props = {
  entriesQuery: EntriesQueryResponse;
  currentUser: IUser;
};

class RobotContainer extends React.Component<Props> {
  render() {
    const { entriesQuery } = this.props;

    const updatedProps = {
      ...this.props,
      entries: entriesQuery.robotEntries || []
    };

    return (
      <AppConsumer>
        {({ currentUser }) =>
          currentUser && <Robot {...updatedProps} currentUser={currentUser} />
        }
      </AppConsumer>
    );
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
