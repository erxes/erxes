import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Tab } from '../../components/editForm';
import { queries } from '../../graphql';
import { IDeal } from '../../types';

class TabContainer extends React.Component<{ dealActivityLogQuery: any }> {
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
