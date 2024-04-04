import * as compose from 'lodash.flowright';

import { ActivityLogQueryResponse } from '@erxes/ui-log/src/activityLogs/types';
import ChecklistLog from '../components/CheckListLog';
import { IActivityLog } from '@erxes/ui-log/src/activityLogs/types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { queries as activityLogsQuery } from '@erxes/ui-log/src/activityLogs/graphql';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '@erxes/ui-cards/src/checklists/graphql';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  activity: IActivityLog;
};

type FinalProps = {
  activityLogQuery: ActivityLogQueryResponse;
  checkListDetailQuery: any;
} & Props;

class ChecklisLogContainer extends React.Component<FinalProps> {
  render() {
    const { activityLogQuery, checkListDetailQuery, activity } = this.props;

    if (activityLogQuery.loading || checkListDetailQuery.loading) {
      return <Spinner />;
    }

    const checklistItemActivity = activityLogQuery.activityLogs || [];
    const checkListDetail = checkListDetailQuery.checklistDetail || {};

    const updatedProps = {
      ...this.props,
      checkListDetail,
      checklistItemActivity
    };

    return <ChecklistLog {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ActivityLogQueryResponse>(
      gql(activityLogsQuery.activityLogs),
      {
        name: 'activityLogQuery',
        options: ({ activity }) => ({
          variables: {
            contentId: activity.content._id,
            contentType: 'activity'
          }
        })
      }
    ),
    graphql<Props, any>(gql(queries.checklistDetail), {
      name: 'checkListDetailQuery',
      options: ({ activity }) => ({
        variables: {
          _id: activity.content._id
        }
      })
    })
  )(ChecklisLogContainer)
);
