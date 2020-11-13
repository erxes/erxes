import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import { queries } from 'modules/settings/integrations/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import EventForm from '../components/EventForm';
import { mutations } from '../graphql';
import { IEvent } from '../types';

type Props = {
  accountId: string;
  queryParams: any;
  startTime?: Date;
  endTime?: Date;
  isPopupVisible: boolean;
  onHideModal: (date?: Date) => void;
  selectedDate?: Date;
  event?: IEvent;
};

type FinalProps = {
  fetchApiQuery: any;
} & Props;

class FormContainer extends React.Component<FinalProps, {}> {
  render() {
    const {
      fetchApiQuery,
      queryParams,
      accountId,
      startTime,
      endTime,
      event
    } = this.props;

    if (fetchApiQuery.loading) {
      return <Spinner objective={true} />;
    }

    if (fetchApiQuery.error) {
      return (
        <span style={{ color: 'red' }}>Integrations api is not running</span>
      );
    }

    const refetchQuery =
      startTime && endTime
        ? {
            query: gql(queries.fetchApi),
            variables: {
              path: '/nylas/get-events',
              params: { ...queryParams, startTime, endTime }
            }
          }
        : {};

    const renderButton = ({
      values,
      isSubmitted,
      callback
    }: IButtonMutateProps) => {
      const callBackResponse = () => {
        if (callback) {
          callback();
        }
      };

      const variables = {
        ...values,
        accountId
      };

      if (event) {
        variables._id = event.providerEventId;
      }

      return (
        <ButtonMutate
          mutation={variables._id ? mutations.editEvent : mutations.createEvent}
          variables={variables}
          callback={callBackResponse}
          refetchQueries={[refetchQuery]}
          isSubmitted={isSubmitted}
          btnSize="small"
          type="submit"
          icon="check-1"
        />
      );
    };

    const updatedProps = {
      ...this.props,
      calendars: fetchApiQuery.integrationsFetchApi || [],
      renderButton
    };

    return <EventForm {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, any>(gql(queries.fetchApi), {
      name: 'fetchApiQuery',
      options: ({ accountId }) => {
        return {
          variables: {
            path: '/nylas/get-calendars',
            params: {
              accountId
            }
          }
        };
      }
    })
  )(FormContainer)
);
