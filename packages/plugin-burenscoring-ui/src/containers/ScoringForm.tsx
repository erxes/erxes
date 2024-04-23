import { ButtonMutate, withProps, __} from '@erxes/ui/src';
import { IUser, UsersQueryResponse } from '@erxes/ui/src/auth/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import * as compose from 'lodash.flowright';
import React from 'react';
import ScoringForm from '../components/ScorinMainForm';
import { mutations } from '../graphql';
type Props = {
  mainTypeId: string;
  closeModal: () => void;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
} & Props;

class ScoringFormContainer extends React.Component<FinalProps> {
  render() {
    const { mainTypeId } = this.props;

    const renderButton = ({
      name,
      values,
      isSubmitted,
      object
    }: IButtonMutateProps) => {
      const { closeModal } = this.props;

      const afterSave = () => {
        closeModal();
      };

      return (
        <ButtonMutate
          
          mutation={mutations.add}
          variables={values}
          callback={afterSave}
          refetchQueries={refetch()}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={'Scoring successfully '}
        >
          {__('Scoring')}
        </ButtonMutate>
      );
    };
    const updatedProps = {
      ...this.props,
      renderButton
    };
    return <ScoringForm {...updatedProps} />;
  }
}

const refetch = () => {
  return ['burenCustomerScoringsMain'];
};

export default withProps<Props>(compose()(ScoringFormContainer));
