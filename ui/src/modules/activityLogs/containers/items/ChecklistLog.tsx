import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ChecklistLog from 'modules/activityLogs/components/items/checklist/ChecklistLog';
import { IActivityLog } from 'modules/activityLogs/types';
import Spinner from 'modules/common/components/Spinner';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { ActivityLogQueryResponse } from '../../../customers/types';
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
