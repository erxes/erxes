import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Tab } from '../../../components/deal/editForm';
import { queries } from '../../../graphql';
import { IDeal } from '../../../types';

class TabContainer extends React.Component<{ dealActivityLogQuery: any }> {
  render() {
    const { dealActivityLogQuery } = this.props;

    const extendedProps = {
      ...this.props,
      dealActivityLog: dealActivityLogQuery.activityLogsDeal || [],
      loadingLogs: dealActivityLogQuery.loading
    };

    return <Tab {...extendedProps} />;
  }
}

export default compose(
  graphql(gql(queries.activityLogsDeal), {
    name: 'dealActivityLogQuery',
    options: ({ deal }: { deal: IDeal }) => ({
      variables: {
        _id: deal._id
      }
    })
  })
)(TabContainer);
