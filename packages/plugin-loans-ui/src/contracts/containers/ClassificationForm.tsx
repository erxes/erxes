import { gql } from '@apollo/client';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import { mutations } from '../graphql';
import { IContract } from '../types';
import { IUser } from '@erxes/ui/src/auth/types';
import { __ } from 'coreui/utils';
import ClassificationForm from '../components/list/ClassificationForm';
import { queries } from '../../contractTypes/graphql';
import { useQuery } from '@apollo/client';

type Props = {
  contracts: IContract[];
  contractTypesMain: any;
  cp?: (contractId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  currentUser: IUser;
} & Props;

const ContractFromContainer = (props: FinalProps) => {
  const constractTypeIds = props.contracts.map((a) => a.contractTypeId);
  const contractTypesMain = useQuery(gql(queries.contractTypesMain), {
    variables: {
      ids: constractTypeIds,
    },
    fetchPolicy: 'network-only',
  });

  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
    disabled,
  }: IButtonMutateProps & { disabled: boolean }) => {
    const { closeModal } = props;

    const afterSave = () => {
      closeModal();
    };

    return (
      <ButtonMutate
        mutation={mutations.changeClassification}
        variables={{ classifications: values }}
        callback={afterSave}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        disabled={disabled}
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      >
        {__('Save')}
      </ButtonMutate>
    );
  };

  if (contractTypesMain?.data?.contractTypesMain?.list?.length > 0) {
    const updatedProps = {
      ...props,
      contractTypes: contractTypesMain?.data?.contractTypesMain?.list,
      renderButton,
    };

    return <ClassificationForm {...updatedProps} />;
  } else return <div />;
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
