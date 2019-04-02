import gql from 'graphql-tag';
import { queries } from 'modules/activityLogs/graphql';
import { IRouterProps } from 'modules/common/types';
import queryString from 'query-string';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { withProps } from '../../../common/utils';
import { Tab } from '../../components/editForm';
import { ActivityLogQueryResponse, IDeal } from '../../types';

type Props = {
  deal: IDeal;
} & IRouterProps;

type FinalProps = {
  dealActivityLogQuery: ActivityLogQueryResponse;
} & Props;

class TabContainer extends React.Component<FinalProps> {
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

const WithData = withProps<Props>(
  compose(
    graphql<Props, ActivityLogQueryResponse>(gql(queries.activityLogs), {
      name: 'dealActivityLogQuery',
      options: (props: Props) => {
        const { location } = props;
        const queryParams = queryString.parse(location.search);

        return {
          variables: {
            contentId: props.deal._id,
            contentType: 'deal',
            activityType: queryParams.activityType
          }
        };
      }
    })
  )(TabContainer)
);

export default withRouter<Props>(WithData);
