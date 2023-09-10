import * as compose from 'lodash.flowright';

import { ActivityLogQueryResponse, IActivityLog } from '../types';
import { queries, subscriptions } from '../graphql';

import ActivityLogs from '../components/ActivityLogs';
import { IUser } from '@erxes/ui/src//auth/types';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { withCurrentUser } from '@erxes/ui/src/auth';
import { withProps } from '@erxes/ui/src/utils';

export type ActivityLogsProps = {
  contentId: string;
  contentType: string;
  target?: string;
  extraTabs: Array<{ name: string; label: string }>;
  activityRenderItem?: (
    activity: IActivityLog,
    currentUser?: IUser
  ) => React.ReactNode;
};

type FinalProps = {
  activityLogQuery: ActivityLogQueryResponse;
  currentUser: IUser;
} & WithDataProps;

class Container extends React.Component<FinalProps, {}> {
  private unsubscribe;

  componentDidMount() {
    const { activityLogQuery } = this.props;

    this.unsubscribe = activityLogQuery.subscribeToMore({
      document: gql(subscriptions.activityLogsChanged),
      updateQuery: () => {
        this.props.activityLogQuery.refetch();
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activityType !== this.props.activityType) {
      this.props.activityLogQuery.refetch();
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const {
      target,
      activityLogQuery,
      extraTabs,
      onChangeActivityTab,
      activityRenderItem
    } = this.props;

    const props = {
      ...this.props,
      target,
      loadingLogs: activityLogQuery.loading,
      activityLogs: activityLogQuery.activityLogs || [],
      onTabClick: onChangeActivityTab,
      extraTabs,
      activityRenderItem
    };

    return (
      <ActivityLogs
        {...props}
        activityRenderItem={this.props.activityRenderItem}
      />
    );
  }
}

type WithDataProps = ActivityLogsProps & {
  onChangeActivityTab: (currentTab: string) => void;
  activityType: string;
};

const WithData = withProps<WithDataProps>(
  compose(
    graphql<WithDataProps, ActivityLogQueryResponse>(
      gql(queries.activityLogs),
      {
        name: 'activityLogQuery',
        options: ({ contentId, contentType, activityType }: WithDataProps) => {
          return {
            variables: {
              contentId,
              contentType,
              activityType
            }
          };
        }
      }
    )
  )(withCurrentUser(Container))
);

export default class Wrapper extends React.Component<
  ActivityLogsProps,
  { activityType: string }
> {
  constructor(props) {
    super(props);

    this.state = {
      activityType: ''
    };
  }

  onChangeActivityTab = (currentTab: string) => {
    this.setState({ activityType: currentTab });
  };

  render() {
    const {
      contentId,
      contentType,
      target,
      extraTabs,
      activityRenderItem
    } = this.props;
    const { activityType } = this.state;

    return (
      <WithData
        target={target}
        contentId={contentId}
        contentType={contentType}
        extraTabs={extraTabs}
        activityType={activityType}
        activityRenderItem={activityRenderItem}
        onChangeActivityTab={this.onChangeActivityTab}
      />
    );
  }
}
