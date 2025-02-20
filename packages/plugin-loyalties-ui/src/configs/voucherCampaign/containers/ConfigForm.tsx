import { ButtonMutate } from '@erxes/ui/src/components';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import Form from '../components/ConfigForm';
import { mutations } from '../graphql';

type Props = {
  campaignId: string;
  closeModal: () => void;
};

const ConfigForm = (props: Props) => {
  const { campaignId, closeModal } = props;

  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
  }: IButtonMutateProps) => {
    values['campaignId'] = campaignId;

    const afterSave = () => {
      closeModal();
    };

    return (
      <ButtonMutate
        mutation={mutations.voucherGenerateCodes}
        variables={values}
        callback={afterSave}
        isSubmitted={isSubmitted}
        refetchQueries={['voucherCampaigns']}
        type="submit"
        uppercase={false}
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

export default ConfigForm;
