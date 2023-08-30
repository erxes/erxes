import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import List from '../components/List';
import {
  EditMutationResponse,
  MeetingsQueryResponse,
  RemoveMutationResponse
} from '../types';
import { mutations, queries } from '../graphql';
import React from 'react';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IUser } from '@erxes/ui/src/auth/types';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';

type Props = {
  history: any;
  searchFilter: string;

  queryParams: any;
  route?: string;
};

type FinalProps = {
  meetingQuery: MeetingsQueryResponse;
  currentUser: IUser;
} & Props &
  RemoveMutationResponse &
  EditMutationResponse;

const ListContainer = (props: FinalProps) => {
  const {
    meetingQuery,
    removeMutation,
    editMutation,
    history,
    currentUser
  } = props;

  if (meetingQuery.loading) {
    return <Spinner />;
  }

  const renderButton = ({
    passedName,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    const updatedCallback = () => {
      if (callback) {
        callback();
      }
      meetingQuery.refetch();
    };
    return (
      <ButtonMutate
        mutation={object ? mutations.editMeeting : mutations.addMeeting}
        variables={values}
        callback={updatedCallback}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${passedName}`}
        refetchQueries={[
          {
            query: gql(queries.meetings)
          }
        ]}
      />
    );
  };

  const remove = meetings => {
    confirm('You are about to delete the item. Are you sure? ')
      .then(() => {
        removeMutation({ variables: { _id: meetings._id } })
          .then(() => {
            Alert.success('Successfully deleted an item');
          })
          .catch(e => Alert.error(e.message));
      })
      .catch(e => Alert.error(e.message));
  };

  const edit = meetings => {
    editMutation({
      variables: {
        _id: meetings._id,
        name: meetings.name,
        checked: meetings.checked,
        expiryDate: meetings.expiryDate,
        type: meetings.type
      }
    })
      .then(() => {
        Alert.success('Successfully updated an item');
        meetingQuery.refetch();
      })
      .catch(e => Alert.error(e.message));
  };

  const updatedProps = {
    ...props,
    meetings: meetingQuery.meetings || [],
    types: [],
    loading: meetingQuery.loading,
    remove,
    edit,
    renderButton,
    refetch: meetingQuery.refetch
  };
  return <List {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql(gql(queries.meetings), {
      name: 'meetingQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
    graphql(gql(mutations.remove), {
      name: 'removeMutation',
      options: () => ({
        refetchQueries: ['listQuery']
      })
    }),

    graphql(gql(mutations.editMeeting), {
      name: 'editMutation'
    })
  )(withCurrentUser(ListContainer))
);
