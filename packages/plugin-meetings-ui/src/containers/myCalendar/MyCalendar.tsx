import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import {
  EditTypeMutationResponse,
  RemoveTypeMutationResponse,
  MeetingsQueryResponse
} from '../../types';
import { mutations, queries } from '../../graphql';
import React from 'react';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import Spinner from '@erxes/ui/src/components/Spinner';
import SideBar from '../../components/myCalendar/SideBar';

type Props = {
  history: any;
  currentTypeId?: string;
  queryParams: any;
};

type FinalProps = {
  meetingQuery: MeetingsQueryResponse;
} & Props &
  RemoveTypeMutationResponse &
  EditTypeMutationResponse;

const TypesListContainer = (props: FinalProps) => {
  const { meetingQuery, typesEdit, typesRemove, history } = props;

  if (meetingQuery.loading) {
    return <Spinner />;
  }

  // calls gql mutation for edit/add type
  const renderButton = ({
    passedName,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.editMeeting : mutations.addMeeting}
        variables={values}
        callback={callback}
        isSubmitted={isSubmitted}
        type="submit"
        refetchQueries={[meetingQuery.refetch]}
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${passedName}`}
      />
    );
  };

  const remove = type => {
    confirm('You are about to delete the item. Are you sure? ')
      .then(() => {
        typesRemove({ variables: { _id: type._id } })
          .then(() => {
            Alert.success('Successfully deleted an item');
          })
          .catch(e => Alert.error(e.message));
      })
      .catch(e => Alert.error(e.message));
  };

  const meetings = meetingQuery.meetings || [];

  const updatedProps = {
    ...props,
    meetings: meetings,
    refetch: meetingQuery.refetch,
    loading: meetingQuery.loading,
    remove,
    renderButton
  };

  return <SideBar {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql(gql(queries.meetings), {
      name: 'meetingQuery'
    })
  )(TypesListContainer)
);
