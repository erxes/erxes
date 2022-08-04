import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Info from '@erxes/ui/src/components/Info';
import Spinner from '@erxes/ui/src/components/Spinner';
import { __, Alert, confirm, withProps } from 'coreui/utils';
import { getWarningMessage } from '@erxes/ui-cards/src/boards/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import Event from '../components/Event';
import { mutations, subscriptions } from '../graphql';
import {queries as integrationsQueries} from '@erxes/ui-settings/src/integrations/graphql'

type Props = {
  type: string;
  currentDate: Date;
  queryParams: any;
  startTime: Date;
  endTime: Date;
  calendarIds: string[];
  onDayClick: (date) => void;
};

type FinalProps = {
  integrationsGetNylasEventsQuery: any;
  removeEventMutation: any;
} & Props;

class EventContainer extends React.Component<FinalProps, {}> {
  private unsubscribe;

  componentDidMount() {
    const { integrationsGetNylasEventsQuery } = this.props;

    this.unsubscribe = integrationsGetNylasEventsQuery.subscribeToMore({
      document: gql(subscriptions.calendarEventUpdated),
      updateQuery: () => {
        this.props.integrationsGetNylasEventsQuery.refetch();
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    this.props.integrationsGetNylasEventsQuery.refetch();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const {
      integrationsGetNylasEventsQuery,
      removeEventMutation,
      startTime,
      endTime,
      queryParams
    } = this.props;

    if (integrationsGetNylasEventsQuery.loading) {
      return <Spinner objective={true} />;
    }

    if (integrationsGetNylasEventsQuery.error) {
      return <Info>{integrationsGetNylasEventsQuery.error.message}</Info>;
    }

    // remove action
    const remove = (_id: string, accountId: string) => {
      confirm(getWarningMessage('Event'), { hasDeleteConfirm: true }).then(
        () => {
          removeEventMutation({
            variables: {
              _id,
              accountId
            }
          })
            .then(() => {
              integrationsGetNylasEventsQuery.refetch({ startTime, endTime, queryParams });

              const msg = `${__(`You successfully deleted a`)} ${__('event')}.`;

              Alert.success(msg);
            })
            .catch(error => {
              Alert.error(error.message);
            });
        }
      );
    };

    const updatedProps = {
      ...this.props,
      remove,
      events: integrationsGetNylasEventsQuery.integrationsGetNylasEvents || []
    };

    return <Event {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, any>(gql(integrationsQueries.integrationsGetNylasEvents), {
      name: 'integrationsGetNylasEventsQuery',
      options: ({ startTime, endTime, calendarIds }) => {
        return {
          variables: {
            calendarIds,
            startTime,
            endTime
          }
        };
      }
    }),
    graphql<Props, any, { _id: string; accountId: string }>(
      gql(mutations.deleteEvent),
      {
        name: 'removeEventMutation'
      }
    )
  )(EventContainer)
);
