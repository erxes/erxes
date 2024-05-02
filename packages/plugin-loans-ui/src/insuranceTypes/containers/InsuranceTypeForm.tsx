import { ButtonMutate } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';

import InsuranceTypeForm from '../components/InsuranceTypeForm';
import { mutations } from '../graphql';
import { IInsuranceType } from '../types';
import { __ } from 'coreui/utils';

type Props = {
  insuranceType: IInsuranceType;
  getAssociatedInsuranceType?: (insuranceTypeId: string) => void;
  closeModal: () => void;
};

const InsuranceTypeFromContainer = (props: Props) => {
  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
  }: IButtonMutateProps) => {
    const { closeModal, getAssociatedInsuranceType } = props;

    const afterSave = (data) => {
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
      >
        {__('Save')}
      </ButtonMutate>
    );
  };

  const updatedProps = {
    ...props,
    renderButton,
  };
  return <InsuranceTypeForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return ['insuranceTypesMain', 'insuranceTypeDetail', 'insuranceTypes'];
};

export default InsuranceTypeFromContainer;
