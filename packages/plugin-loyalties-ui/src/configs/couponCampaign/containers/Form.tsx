import { ButtonMutate } from '@erxes/ui/src/components';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import Form from '../components/Form';
import { mutations } from '../graphql';
import { ICouponCampaign } from '../types';

type Props = {
  queryParams: any;
  couponCampaign: ICouponCampaign;
  closeModal: () => void;
};

const FormContainer = (props: Props) => {
  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
  }: IButtonMutateProps) => {
    const { closeModal } = props;

    const afterSave = () => {
      closeModal();
    };

    return (
      <ButtonMutate
        mutation={
          object ? mutations.couponCampaignEdit : mutations.couponCampaignAdd
        }
        variables={values}
        callback={afterSave}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton,
  };

  return <Form {...updatedProps} />;
};

export default FormContainer;
