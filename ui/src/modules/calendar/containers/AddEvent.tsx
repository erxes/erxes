import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import { queries } from 'modules/settings/integrations/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import AddForm from '../components/AddForm';
import { mutations } from '../graphql';

type Props = {
  integrationId: string;
  queryParams: any;
  startTime?: Date;
  endTime?: Date;
  isPopupVisible: boolean;
  onHideModal: (date?: Date) => void;
  selectedDate?: Date;
};

type FinalProps = {
  fetchApiQuery: any;
} & Props;

class AddContainer extends React.Component<FinalProps, {}> {
  render() {
    const {
      fetchApiQuery,
      queryParams,
      integrationId,
      startTime,
      endTime
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
        erxesApiId: integrationId
      };

      return (
        <ButtonMutate
          mutation={mutations.createEvent}
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

    return <AddForm {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, any>(gql(queries.fetchApi), {
      name: 'fetchApiQuery',
      options: ({ integrationId }) => {
        return {
          variables: {
            path: '/nylas/get-calendars',
            params: {
              erxesApiId: integrationId
            }
          }
        };
      }
    })
  )(AddContainer)
);
