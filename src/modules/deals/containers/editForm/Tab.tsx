import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { Tab } from '../../components/editForm';
import { queries } from '../../graphql';
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
      dealActivityLog: dealActivityLogQuery.activityLogsDeal || []
    };

    return <Tab {...extendedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ActivityLogQueryResponse, { _id: string }>(
      gql(queries.activityLogsDeal),
      {
        name: 'dealActivityLogQuery',
        options: ({ deal }: { deal: IDeal }) => ({
          variables: {
            _id: deal._id
          }
        })
      }
    )
  )(TabContainer)
);
