import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import ContractForm from '../components/list/ContractForm';
import { mutations, queries } from '../graphql';
import { IContract } from '../types';
import { IUser } from '@erxes/ui/src/auth/types';
import { __ } from 'coreui/utils';

export type RelType = {
  _id: string,
  mainTypeId: string,
  mainType: string,
  relType: string,
}

type Props = {
  contract?: IContract;
  getAssociatedContract?: (contractId: string) => void;
  closeModal: () => void;
  data?: RelType
};

type FinalProps = {
  currentUser: IUser;
} & Props;

const ContractFromContainer = (props: FinalProps) => {
  const { closeModal, getAssociatedContract, data } = props;

  const objectOnContract = useQuery(
    gql(queries.convertToContract),
    {
      variables: {
        contentType: data?.mainType,
        id: data?.mainTypeId
      },
      skip: !data?.mainTypeId,
      fetchPolicy: "network-only",
    }
  );

  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
    disabled,
  }: IButtonMutateProps & { disabled: boolean }) => {

    const afterSave = (data) => {
      closeModal();

      if (getAssociatedContract) {
        getAssociatedContract(data.contractsAdd);
      }
    };

    return (
      <ButtonMutate
        mutation={object?._id ? mutations.contractsEdit : mutations.contractsAdd}
        variables={values}
        callback={afterSave}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        disabled={disabled}
        successMessage={`You successfully ${object ? 'updated' : 'added'
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

  if (data) {
    if (objectOnContract.loading)
      return 'Loading';
    return <ContractForm {...updatedProps} contract={{ ...(objectOnContract.data?.convertToContract || {}), _id: undefined }} />;
  }

  return <ContractForm {...updatedProps} />;
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

export default withCurrentUser(ContractFromContainer);
