import gql from 'graphql-tag';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { queries } from 'modules/settings/integrations/graphql';
import queryString from 'query-string';
import React from 'react';
import { withRouter } from 'react-router-dom';
import EventForm from '../components/EventForm';
import { mutations } from '../graphql';
import { IAccount, IEvent } from '../types';

type Props = {
  startTime?: Date;
  endTime?: Date;
  isPopupVisible: boolean;
  onHideModal: (date?: Date) => void;
  selectedDate?: Date;
  event?: IEvent;
  account?: IAccount;
} & IRouterProps;

class FormContainer extends React.Component<Props> {
  render() {
    const { startTime, endTime, event, location } = this.props;
    const queryParams = queryString.parse(location.search);

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
        ...values
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
          type="submit"
          icon="check-circle"
        />
      );
    };

    const updatedProps = {
      ...this.props,
      renderButton
    };

    return <EventForm {...updatedProps} />;
  }
}

export default withRouter(FormContainer);
