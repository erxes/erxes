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
import Groups from '../components/Groups';
import { mutations, queries } from '../graphql';
import {
  BoardDetailQueryResponse,
  GroupsQueryResponse,
  ICalendar,
  IGroup,
  RemoveCalendarMutationResponse,
  RemoveCalendarMutationVariables,
  RemoveGroupMutationResponse,
  RemoveGroupMutationVariables
} from '../types';

type Props = {
  boardId: string;
  queryParams: any;
  history: any;
};

type FinalProps = {
  groupsQuery: GroupsQueryResponse;
  boardDetailQuery: BoardDetailQueryResponse;
} & Props &
  RemoveGroupMutationResponse &
  RemoveCalendarMutationResponse;

class GroupsContainer extends React.Component<FinalProps> {
  render() {
    const {
      boardId,
      groupsQuery,
      removeMutation,
      boardDetailQuery,
      queryParams,
      removeCalendarMutation
    } = this.props;

    if (groupsQuery.loading || boardDetailQuery.loading) {
      return <Spinner />;
    }

    // remove action
    const remove = (calendar: IGroup) => {
      confirm(getWarningMessage('Group'), { hasDeleteConfirm: true }).then(
        () => {
          removeMutation({
            variables: {
              _id: calendar._id
            }
          })
            .then(() => {
              groupsQuery.refetch({ boardId });

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
        groupsQuery.refetch({ boardId });

        if (callback) {
          return callback();
        }
      };

      return (
        <ButtonMutate
          mutation={object ? mutations.groupEdit : mutations.groupAdd}
          variables={values}
          callback={callBackResponse}
          confirmationUpdate={object ? confirmationUpdate : false}
          refetchQueries={getRefetchQueries(boardId)}
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

    const groups = groupsQuery.calendarGroups;

    // remove action
    const removeCalendar = (calendar: ICalendar) => {
      confirm(getWarningMessage('Calendar'), { hasDeleteConfirm: true }).then(
        () => {
          removeCalendarMutation({
            variables: {
              _id: calendar._id,
              accountId: calendar.accountId
            },
            refetchQueries: getRefetchQueries(boardId)
          })
            .then(() => {
              getRefetchQueries(boardId);

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

    const renderCalendarButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object,
      confirmationUpdate
    }: IButtonMutateProps) => {
      const callBackResponse = () => {
        getRefetchQueries(boardId);

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
          refetchQueries={getRefetchQueries(boardId)}
          isSubmitted={isSubmitted}
          type="submit"
          uppercase={false}
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    const extendedProps = {
      ...this.props,
      groups,
      refetch: groupsQuery.refetch,
      loading: groupsQuery.loading,
      remove,
      renderButton,
      currentBoard: boardDetailQuery
        ? boardDetailQuery.calendarBoardDetail
        : undefined,
      customLink,
      removeCalendar,
      renderCalendarButton
    };

    return <Groups {...extendedProps} />;
  }
}

const getRefetchQueries = boardId => {
  return [
    {
      query: gql(queries.groups),
      variables: { boardId }
    },
    {
      query: gql(queries.boardDetail),
      variables: { _id: boardId }
    }
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, GroupsQueryResponse>(gql(queries.groups), {
      name: 'groupsQuery',
      options: ({ boardId = '' }: { boardId: string }) => ({
        variables: { boardId },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, BoardDetailQueryResponse>(gql(queries.boardDetail), {
      name: 'boardDetailQuery',
      options: ({ boardId }: { boardId: string }) => ({
        variables: { _id: boardId },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, RemoveGroupMutationResponse, RemoveGroupMutationVariables>(
      gql(mutations.groupRemove),
      {
        name: 'removeMutation'
      }
    ),
    graphql<
      Props,
      RemoveCalendarMutationResponse,
      RemoveCalendarMutationVariables
    >(gql(mutations.calendarRemove), {
      name: 'removeCalendarMutation'
    })
  )(GroupsContainer)
);
