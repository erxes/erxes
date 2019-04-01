import gql from 'graphql-tag';
import { queries } from 'modules/activityLogs/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { Tab } from '../../components/editForm';
import { ActivityLogQueryResponse, IDeal } from '../../types';

type Props = {
  deal: IDeal;
};

class TabContainer extends React.Component<
  Props & { dealActivityLogQuery: ActivityLogQueryResponse }
> {
  render() {
    const { dealActivityLogQuery } = this.props;

    const extendedProps = {
      ...this.props,
      loadingLogs: dealActivityLogQuery.loading,
      dealActivityLog: dealActivityLogQuery.activityLogs || []
    };

    return <Tab {...extendedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ActivityLogQueryResponse>(gql(queries.activityLogs), {
      name: 'dealActivityLogQuery',
      options: ({ deal }: { deal: IDeal }) => ({
        variables: {
          contentId: deal._id,
          contentType: 'deal'
        }
      })
    })
  )(TabContainer)
);
