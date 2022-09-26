import { AppConsumer } from '@erxes/ui/src/appContext';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Info from '@erxes/ui/src/components/Info';
import Spinner from '@erxes/ui/src/components/Spinner';
import { withProps } from '@erxes/ui/src/utils';
import { IBoard, IGroup } from '../types';
import React from 'react';
import { graphql } from 'react-apollo';
import Wrapper from '../components/Wrapper';
import { queries } from '../graphql';

type Props = {
  currentGroup: IGroup;
  history: any;
  queryParams: any;
  currentBoard?: IBoard;
  boards: IBoard[];
};

type FinalProps = {
  calendarsQuery: any;
} & Props;

class SidebarContainer extends React.Component<FinalProps> {
  render() {
    const { calendarsQuery } = this.props;

    if (calendarsQuery.loading) {
      return <Spinner objective={true} />;
    }

    if (calendarsQuery.error) {
      return <Info>{calendarsQuery.error.message}</Info>;
    }

    const updatedProps = {
      ...this.props,
      accounts: calendarsQuery.calendarAccounts || []
    };

    return (
      <AppConsumer>
        {({ currentUser }) => {
          return <Wrapper {...updatedProps} currentUser={currentUser} />;
        }}
      </AppConsumer>
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, any>(gql(queries.calendars), {
      name: 'calendarsQuery',
      options: ({ currentGroup = { _id: '' } }) => {
        return {
          variables: {
            groupId: currentGroup._id
          }
        };
      }
    })
  )(SidebarContainer)
);
