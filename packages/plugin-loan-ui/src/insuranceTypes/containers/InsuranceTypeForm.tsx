import { ButtonMutate, withProps } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import { UsersQueryResponse } from '@erxes/ui/src/auth/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import * as compose from 'lodash.flowright';
import React from 'react';

import InsuranceTypeForm from '../components/InsuranceTypeForm';
import { mutations } from '../graphql';
import { IInsuranceType } from '../types';

type Props = {
  insuranceType: IInsuranceType;
  getAssociatedInsuranceType?: (insuranceTypeId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
} & Props;

class InsuranceTypeFromContainer extends React.Component<FinalProps> {
  render() {
    const renderButton = ({
      name,
      values,
      isSubmitted,
      object
    }: IButtonMutateProps) => {
      const { closeModal, getAssociatedInsuranceType } = this.props;

      const afterSave = data => {
        closeModal();

        if (getAssociatedInsuranceType) {
          getAssociatedInsuranceType(data.insuranceTypesAdd);
        }
      };

      return (
        <ButtonMutate
          mutation={
            object ? mutations.insuranceTypesEdit : mutations.insuranceTypesAdd
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
      renderButton
    };
    return <InsuranceTypeForm {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return ['insuranceTypesMain', 'insuranceTypeDetail', 'insuranceTypes'];
};

export default withProps<Props>(compose()(InsuranceTypeFromContainer));
