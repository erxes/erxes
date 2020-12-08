import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { __, Alert, confirm, withProps } from 'modules/common/utils';
import { getWarningMessage } from 'modules/settings/boards/constants';
import { queries } from 'modules/settings/integrations/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import Event from '../components/Event';
import { mutations, subscriptions } from '../graphql';

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
  fetchApiQuery: any;
  removeEventMutation: any;
} & Props;

class EventContainer extends React.Component<FinalProps, {}> {
  private unsubscribe;

  componentDidMount() {
    const { fetchApiQuery } = this.props;

    this.unsubscribe = fetchApiQuery.subscribeToMore({
      document: gql(subscriptions.calendarEventUpdated),
      updateQuery: () => {
        this.props.fetchApiQuery.refetch();
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    this.props.fetchApiQuery.refetch();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const {
      fetchApiQuery,
      removeEventMutation,
      startTime,
      endTime,
      queryParams
    } = this.props;

    if (fetchApiQuery.loading) {
      return <Spinner objective={true} />;
    }

    if (fetchApiQuery.error) {
      return (
        <span style={{ color: 'red' }}>Integrations api is not running</span>
      );
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
              fetchApiQuery.refetch({ startTime, endTime, queryParams });

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
      events: fetchApiQuery.integrationsFetchApi || []
    };

    return <Event {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, any>(gql(queries.fetchApi), {
      name: 'fetchApiQuery',
      options: ({ startTime, endTime, calendarIds }) => {
        return {
          variables: {
            path: '/nylas/get-events',
            params: {
              calendarIds,
              startTime,
              endTime
            }
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
