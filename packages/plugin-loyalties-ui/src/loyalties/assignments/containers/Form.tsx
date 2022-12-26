import * as compose from 'lodash.flowright';
import Form from '../components/Form';
import React from 'react';
import { ButtonMutate } from '@erxes/ui/src/components';
import { withProps } from '@erxes/ui/src/utils';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { IAssignment } from '../types';
import { IUser } from '@erxes/ui/src/auth/types';
import { mutations, queries } from '../graphql';
import { UsersQueryResponse } from '@erxes/ui/src/auth/types';

type Props = {
  assignment: IAssignment;
  getAssociatedAssignment?: (assignmentId: string) => void;
  closeModal: () => void;
  queryParams: any;
  history: any;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
} & Props;

class AssignmentFormContainer extends React.Component<FinalProps> {
  render() {
    const { history, queryParams } = this.props;

    const renderButton = ({
      name,
      values,
      isSubmitted,
      object
    }: IButtonMutateProps) => {
      const { closeModal, getAssociatedAssignment } = this.props;

      const afterSave = data => {
        closeModal();

        if (getAssociatedAssignment) {
          getAssociatedAssignment(data.assignmentsAdd);
        }
      };

      return (
        <ButtonMutate
          mutation={
            object ? mutations.assignmentsEdit : mutations.assignmentsAdd
          }
          variables={values}
          callback={afterSave}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    const updatedProps = {
      ...this.props,
      renderButton,
      history,
      queryParams
    };
    return <Form {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return [
    'assignmentsMain',
    'assignmentDetail',
    'assignments',
    'assignmentCounts',
    'assignmentCampaigns',
    'assignmentCampaignsTotalCount'
  ];
};

export default withProps<Props>(compose()(AssignmentFormContainer));
