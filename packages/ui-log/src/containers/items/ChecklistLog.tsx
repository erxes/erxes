import * as compose from 'lodash.flowright';

import { ActivityLogQueryResponse } from '@erxes/ui-log/src/activityLogs/types';
import ChecklistLog from '../../components/items/checklist/ChecklistLog';
import { IActivityLog } from '@erxes/ui-log/src/activityLogs/types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../../graphql';
import { withProps } from '@erxes/ui/src/utils';

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
