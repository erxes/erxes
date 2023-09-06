import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';
import { MeetingsQueryResponse } from '../../types';
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
} & Props;

const TypesListContainer = (props: FinalProps) => {
  const { meetingQuery } = props;

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
        refetchQueries={[meetingQuery.refetch()]}
        successMessage={`myCalendar - You successfully ${
          object ? 'updated' : 'added'
        } a ${passedName}`}
      />
    );
  };

  const meetings = meetingQuery.meetings || [];

  const updatedProps = {
    ...props,
    meetings: meetings,
    refetchMeetings: meetingQuery.refetch,
    loading: meetingQuery.loading,
    renderButton
  };

  return <SideBar {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql(gql(queries.meetings), {
      name: 'meetingQuery',
      options: {
        variables: {
          perPage: 50
        }
      }
    })
  )(TypesListContainer)
);
