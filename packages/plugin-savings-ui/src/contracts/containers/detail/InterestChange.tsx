import { ButtonMutate } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';
import { mutations } from '../../graphql';
import { IContract } from '../../types';
import InterestChangeForm from '../../components/detail/InterestChangeForm';

type Props = {
  contract: IContract;
  closeModal: () => void;
  type: string;
};

const InterestChangeContainer = (props: Props) => {
  const [invDate, setInvDate] = useState(new Date());

  const { contract, closeModal } = props;

  const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
    const afterSave = () => {
      closeModal();
    };

    let mutation: any = undefined;

    switch (values.type) {
      case 'interestChange':
        mutation = mutations.interestChange;
        break;
      case 'interestReturn':
        mutation = mutations.interestReturn;
        break;

      default:
        break;
    }

    return (
      <ButtonMutate
        mutation={mutation}
        variables={values}
        callback={afterSave}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={__(`You successfully change interest this contract`)}
      >
        {__('Save')}
      </ButtonMutate>
    );
  };

  const onChangeDate = (date: Date) => {
    setInvDate(date);
  };

  const updatedProps = {
    ...props,
    contract,
    renderButton,
    onChangeDate,
    invDate: invDate,
  };

  return <InterestChangeForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    'contractsMain',
    'contractDetail',
    'contracts',
    'contractCounts',
    'activityLogs',
    'schedules',
  ];
};

export default InterestChangeContainer;
