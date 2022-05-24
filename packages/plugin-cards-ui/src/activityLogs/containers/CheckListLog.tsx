import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IActivityLog } from '@erxes/ui-logs/src/activityLogs/types';
import Spinner from '@erxes/ui/src/components/Spinner';
import { withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { ActivityLogQueryResponse } from '@erxes/ui-logs/src/activityLogs/types';
import { queries as activityLogsQuery } from '@erxes/ui-logs/src/activityLogs/graphql';
import ChecklistLog from '../components/CheckListLog';
import { queries } from '@erxes/ui-cards/src/checklists/graphql';

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
