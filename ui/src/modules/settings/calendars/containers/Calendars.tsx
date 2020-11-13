import { getEnv } from 'apolloClient';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps } from 'modules/common/types';
import { __, Alert, confirm, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { getWarningMessage } from '../../boards/constants';
import { INTEGRATIONS } from '../../integrations/constants';
import Calendars from '../components/Calendars';
import { mutations, queries } from '../graphql';
import {
  CalendarsQueryResponse,
  GroupDetailQueryResponse,
  ICalendar,
  RemoveCalendarMutationResponse,
  RemoveCalendarMutationVariables
} from '../types';

type Props = {
  groupId: string;
  queryParams: any;
  history: any;
};

type FinalProps = {
  calendarsQuery: CalendarsQueryResponse;
  groupDetailQuery: GroupDetailQueryResponse;
} & Props &
  RemoveCalendarMutationResponse;

class CalendarsContainer extends React.Component<FinalProps> {
  render() {
    const {
      groupId,
      calendarsQuery,
      removeCalendarMutation,
      groupDetailQuery,
      queryParams
    } = this.props;

    if (calendarsQuery.loading) {
      return <Spinner />;
    }

    // remove action
    const remove = (calendar: ICalendar) => {
      confirm(getWarningMessage('Calendar'), { hasDeleteConfirm: true }).then(
        () => {
          removeCalendarMutation({
            variables: {
              _id: calendar._id,
              accountId: calendar.accountId
            },
            refetchQueries: getRefetchQueries(groupId)
          })
            .then(() => {
              calendarsQuery.refetch({ groupId });

              const msg = `${__(`You successfully deleted a`)} ${__(
                'calendar'
              )}.`;

              Alert.success(msg);
            })
            .catch(error => {
              Alert.error(error.message);
            });
        }
      );
    };

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object,
      confirmationUpdate
    }: IButtonMutateProps) => {
      const callBackResponse = () => {
        calendarsQuery.refetch({ groupId });

        if (!object) {
          return this.props.history.push('/settings/calendars');
        }

        if (callback) {
          return callback();
        }
      };
      const { uid } = queryParams;

      return (
        <ButtonMutate
          mutation={object ? mutations.calendarEdit : mutations.calendarAdd}
          variables={{ uid, ...values }}
          callback={callBackResponse}
          confirmationUpdate={object ? confirmationUpdate : false}
          refetchQueries={getRefetchQueries(groupId)}
          isSubmitted={isSubmitted}
          type="submit"
          uppercase={false}
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    const customLink = (kind: string) => {
      const { REACT_APP_API_URL } = getEnv();
      const integration = INTEGRATIONS.find(i => i.kind === kind);

      const url = `${REACT_APP_API_URL}/connect-integration?link=${integration &&
        integration.createUrl}&kind=${kind}&type=calendar`;

      window.location.replace(url);
    };

    const calendars = calendarsQuery.calendars;

    const extendedProps = {
      ...this.props,
      calendars,
      refetch: calendarsQuery.refetch,
      loading: calendarsQuery.loading,
      remove,
      renderButton,
      currentGroup: groupDetailQuery
        ? groupDetailQuery.calendarGroupDetail
        : undefined,
      customLink
    };

    return <Calendars {...extendedProps} />;
  }
}

const getRefetchQueries = groupId => {
  return [
    'calendarsQuery',
    {
      query: gql(queries.groupDetail),
      variables: { _id: groupId }
    }
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, CalendarsQueryResponse, { groupId: string }>(
      gql(queries.calendars),
      {
        name: 'calendarsQuery',
        options: ({ groupId = '' }: { groupId: string }) => ({
          variables: { groupId },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, GroupDetailQueryResponse>(gql(queries.groupDetail), {
      name: 'groupDetailQuery',
      skip: ({ groupId }: { groupId?: string }) => !groupId,
      options: ({ groupId }: { groupId?: string }) => ({
        variables: { _id: groupId },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<
      Props,
      RemoveCalendarMutationResponse,
      RemoveCalendarMutationVariables
    >(gql(mutations.calendarRemove), {
      name: 'removeCalendarMutation'
    })
  )(CalendarsContainer)
);
