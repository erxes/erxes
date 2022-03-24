import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import Spinner from '../../../components/Spinner';
import { withProps } from '../../../utils';
import ChecklistLog from '../../components/items/checklist/ChecklistLog';
import { queries } from '../../graphql';
import { ActivityLogQueryResponse, IActivityLog } from '../../types';

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
