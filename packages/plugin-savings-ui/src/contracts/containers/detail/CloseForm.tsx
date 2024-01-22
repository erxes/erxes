import { ButtonMutate } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { gql } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import CloseForm from '../../components/detail/CloseForm';
import { mutations, queries } from '../../graphql';
import { CloseInfoQueryResponse, IContract } from '../../types';
import { useQuery } from '@apollo/client';

type Props = {
  contract: IContract;
  closeModal: () => void;
};

const CloseFromContainer = (props: Props) => {
  const [closeDate, setCloseDate] = useState(new Date());
  const { closeModal, contract } = props;

  const closeInfoQuery = useQuery<CloseInfoQueryResponse>(
    gql(queries.closeInfo),
    {
      variables: {
        contractId: contract._id,
        date: new Date(),
      },
      fetchPolicy: 'network-only',
    },
  );

  useEffect(() => {
    closeInfoQuery.refetch({
      closeDate,
    });
  }, [closeDate]);

  const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
    const afterSave = () => {
      closeModal();
    };

    return (
      <ButtonMutate
        mutation={mutations.contractsClose}
        variables={values}
        callback={afterSave}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={__(`You successfully closed this contract`)}
      >
        {__('Save')}
      </ButtonMutate>
    );
  };

  const onChangeDate = (date: Date) => {
    setCloseDate(date);
  };

  if (closeInfoQuery.loading) {
    return null;
  }

  const closeInfo = closeInfoQuery?.data?.closeInfo || {};

  const updatedProps = {
    ...props,
    contract,
    renderButton,
    closeInfo,
    onChangeDate,
    closeDate,
  };

  return <CloseForm {...updatedProps} />;
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

export default CloseFromContainer;
