import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';

import { withProps } from '@erxes/ui/src/utils';
import { queries } from '@erxes/ui-cards/src/boards/graphql';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import Spinner from '@erxes/ui/src/components/Spinner';
import MovementLog from '../components/MovementLog';

type Props = {
  activity: any;
};

type FinalProps = {
  boardLogsQuery: any;
} & Props;

class MovementLogContainer extends React.Component<FinalProps> {
  render() {
    const { boardLogsQuery } = this.props;

    if (boardLogsQuery.loading) {
      return <Spinner />;
    }

    const contentDetail = boardLogsQuery.boardLogs || {};

    const updatedProps = {
      ...this.props,
      contentDetail
    };

    return <MovementLog {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, any>(gql(queries.boardLogs), {
      name: 'boardLogsQuery',
      options: ({ activity }) => ({
        variables: {
          action: activity.action,
          content: activity.content,
          contentType: activity.contentType,
          contentId: activity._id
        }
      })
    })
  )(MovementLogContainer)
);
