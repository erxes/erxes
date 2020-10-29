import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { withProps } from 'modules/common/utils';
import { queries } from 'modules/settings/integrations/graphql';
import { IntegrationsQueryResponse } from 'modules/settings/integrations/types';
import React from 'react';
import { graphql } from 'react-apollo';
import Calendar from '../components/Calendar';

type Props = {
  history: any;
  queryParams: any;
};

type FinalProps = {
  integrationsQuery: IntegrationsQueryResponse;
} & Props;

class CalendarContainer extends React.Component<FinalProps> {
  render() {
    const { integrationsQuery } = this.props;

    if (integrationsQuery.loading) {
      return <Spinner objective={true} />;
    }

    const integrations = integrationsQuery.integrations || [];

    const updatedProps = {
      ...this.props,
      integrationId: integrations[0]._id
    };

    return <Calendar {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, IntegrationsQueryResponse>(gql(queries.integrations), {
      name: 'integrationsQuery',
      options: () => {
        return {
          notifyOnNetworkStatusChange: true,
          variables: {
            kind: 'nylas-gmail',
            isAvialable: true
          },
          fetchPolicy: 'network-only'
        };
      }
    })
  )(CalendarContainer)
);
