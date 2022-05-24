import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ChecklistLog from '../../components/items/checklist/ChecklistLog';
import { IActivityLog } from '@erxes/ui/src/activityLogs/types';
import Spinner from '@erxes/ui/src/components/Spinner';
import { withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { ActivityLogQueryResponse } from '@erxes/ui/src/activityLogs/types';
import { queries } from '../../graphql';

type Props = {
  activity: IActivityLog;
};

type FinalProps = {
  activityLogQuery: ActivityLogQueryResponse;
} & Props;

class ChecklisLogContainer extends React.Component<FinalProps> {
  render() {
    const { activityLogQuery } = this.props;

    if (activityLogQuery.loading) {
      return <Spinner />;
    }

    const checklistItemActivity = activityLogQuery.activityLogs || [];

    const updatedProps = {
      ...this.props,
      checklistItemActivity
    };

    return <ChecklistLog {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ActivityLogQueryResponse>(gql(queries.activityLogs), {
      name: 'activityLogQuery',
      options: ({ activity }) => ({
        variables: {
          contentId: activity.contentTypeDetail._id || activity.content._id,
          contentType: 'activity'
        }
      })
    })
  )(ChecklisLogContainer)
);
