import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IUser } from 'modules/auth/types';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { ActivityLogQueryResponse } from '../../customers/types';
import ActivityLogs from '../components/ActivityLogs';
import { queries, subscriptions } from '../graphql';

type Props = {
  contentId: string;
  contentType: string;
  target?: string;
  extraTabs: Array<{ name: string; label: string }>;
};

type FinalProps = {
  activityLogQuery: ActivityLogQueryResponse;
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
      onChangeActivityTab
    } = this.props;

    const props = {
      target,
      loadingLogs: activityLogQuery.loading,
      activityLogs: activityLogQuery.activityLogs || [],
      onTabClick: onChangeActivityTab,
      extraTabs
    };

    return (
      <AppConsumer>
        {({ currentUser }) => (
          <ActivityLogs {...props} currentUser={currentUser || ({} as IUser)} />
        )}
      </AppConsumer>
    );
  }
}

type WithDataProps = Props & {
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
  )(Container)
);

export default class Wrapper extends React.Component<
  Props,
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
    const { contentId, contentType, target, extraTabs } = this.props;
    const { activityType } = this.state;

    return (
      <WithData
        target={target}
        contentId={contentId}
        contentType={contentType}
        extraTabs={extraTabs}
        activityType={activityType}
        onChangeActivityTab={this.onChangeActivityTab}
      />
    );
  }
}
