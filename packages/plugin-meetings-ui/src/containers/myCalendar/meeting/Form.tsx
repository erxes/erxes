import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils';
import { IMeeting, RemoveMutationResponse } from '../../../types';
import { mutations, queries } from '../../../graphql';
import React from 'react';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IUser } from '@erxes/ui/src/auth/types';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { MeetingForm } from '../../../components/myCalendar/meeting/Form';

type Props = {
  history: any;
  closeModal: () => void;
  queryParams: any;
  meeting: IMeeting;
};

type FinalProps = {
  currentUser: IUser;
} & Props &
  RemoveMutationResponse;

const MeetingFormContainer = (props: FinalProps) => {
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

  const updatedProps = {
    ...props,
    renderButton
  };
  return <MeetingForm {...updatedProps} />;
};

export default withProps<Props>(
  compose()(withCurrentUser(MeetingFormContainer))
);
