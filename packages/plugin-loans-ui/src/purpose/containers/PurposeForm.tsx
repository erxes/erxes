import { ButtonMutate } from '@erxes/ui/src';

import PurposeForm from '../components/PurposeForm';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { IPurpose } from '../types';
import React from 'react';
import { __ } from 'coreui/utils';
import { mutations } from '../graphql';

type Props = {
  purpose: IPurpose;
  purposes: IPurpose[];
  getAssociatedContractType?: (contractTypeId: string) => void;
  closeModal: () => void;
};

type FinalProps = {} & Props;

const PurposeFromContainer = (props: FinalProps) => {
  const { closeModal, getAssociatedContractType } = props;
  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
  }: IButtonMutateProps) => {
    const afterSave = (data) => {
      closeModal();

      if (getAssociatedContractType) {
        getAssociatedContractType(data.contractTypesAdd);
      }
    };

    return (
      <ButtonMutate
        mutation={object ? mutations.purposeEdit : mutations.purposeAdd}
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
  return <PurposeForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return ['purposesMain'];
};

export default PurposeFromContainer;
