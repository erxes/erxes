import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { __ } from 'coreui/utils';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { gql } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import { mutations, queries } from '../../graphql';
import { CloseInfoQueryResponse, IContract } from '../../types';
import InterestChangeForm from '../../components/detail/InterestChangeForm';
import { useQuery } from '@apollo/client';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  contract: IContract;
  closeModal: () => void;
  type: string;
};

const InterestChangeContainer = (props: Props) => {
  const [invDate, setInvDate] = useState(new Date());
  const { contract, closeModal } = props;
  const [date, setDate] = useState(new Date());

  const closeInfoQuery = useQuery<CloseInfoQueryResponse>(
    gql(queries.closeInfo),
    {
      variables: {
        contractId: contract?._id,
        date,
      },
      fetchPolicy: 'network-only',
    },
  );

  useEffect(() => {
    !props.type &&
      closeInfoQuery.refetch({
        invDate,
      });
  }, [invDate]);

  const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
    const afterSave = () => {
      closeModal();
    };

    let mutation: any = undefined;

    switch (values.type) {
      case 'stopInterest':
        mutation = mutations.stopInterest;
        break;
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

  if (closeInfoQuery?.loading) {
    return <Spinner />;
  }

  const closeInfo = closeInfoQuery?.data?.closeInfo || {};

  const updatedProps = {
    ...props,
    contract,
    renderButton,
    closeInfo,
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
