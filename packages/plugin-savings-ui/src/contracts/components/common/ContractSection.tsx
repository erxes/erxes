import {
  Box,
  EmptyState,
  Icon,
  ModalTrigger,
  MainStyleButtonRelated as ButtonRelated,
  SectionBodyItem,
  Alert,
} from '@erxes/ui/src';
import React from 'react';
import { Link } from 'react-router-dom';
import ContractChooser from '../../containers/ContractChooser';
import { mutations, queries } from '../../graphql';
import {
  EditMutationResponse,
  IContract,
  IContractDoc,
  MainQueryResponse,
} from '../../types';
import { can } from '@erxes/ui/src/utils/core';
import { gql } from '@apollo/client';
import withConsumer from '../../../withConsumer';
import { IUser } from '@erxes/ui/src/auth/types';
import { __ } from 'coreui/utils';
import { useQuery, useMutation } from '@apollo/client';

type Props = {
  name: string;
  mainType?: string;
  mainTypeId?: string;
  id?: string;
  onSelect?: (contract: IContract[]) => void;
  collapseCallback?: () => void;
  contractsDealEdit: any;
  title?: string;
  currentUser: IUser;
};

function Component(
  this: any,
  {
    name,
    mainType = '',
    mainTypeId = '',
    id = '',
    collapseCallback,
    title,
    currentUser,
  }: Props,
) {
  const contractsQuery = useQuery<MainQueryResponse>(
    gql(queries.contractsMain),
    {
      fetchPolicy: 'network-only',
      variables:
        mainType === 'customer' || mainType === 'company'
          ? { customerId: mainTypeId || id }
          : { dealId: mainTypeId },
    },
  );

  const [contractsDealEdit] = useMutation<EditMutationResponse>(
    gql(mutations.contractsDealEdit),
    { refetchQueries: ['contractsMain'] },
  );

  const renderContractChooser = (props) => {
    return (
      <ContractChooser
        {...props}
        data={{
          name,
          contracts: contractsQuery?.data?.savingsContractsMain?.list,
          mainType,
          mainTypeId,
        }}
        onSelect={(contracts: IContractDoc[]) => {
          contractsDealEdit({
            variables: { ...contracts[0], dealId: mainTypeId },
          })
            .then(() => {
              collapseCallback && collapseCallback();
            })
            .catch((e) => {
              Alert.error(e.message);
            });
        }}
      />
    );
  };

  const renderRelatedContractChooser = (props) => {
    return (
      <ContractChooser
        {...props}
        data={{
          name,
          contracts: contractsQuery?.data?.savingsContractsMain?.list,
          mainTypeId,
          mainType,
          isRelated: true,
        }}
        onSelect={(contracts: IContractDoc[]) => {
          contractsDealEdit({
            variables: { ...contracts[0], dealId: mainTypeId },
          })
            .then(() => {
              collapseCallback && collapseCallback();
            })
            .catch((e) => {
              Alert.error(e.message);
            });
        }}
      />
    );
  };

  const contractTrigger = (
    <button>
      <Icon icon="plus-circle" />
    </button>
  );

  const relContractTrigger = (
    <ButtonRelated>
      <span>{__('See related contracts..')}</span>
    </ButtonRelated>
  );

  const quickButtons = can('contractsDealEdit', currentUser) && (
    <ModalTrigger
      title="Associate"
      trigger={contractTrigger}
      size="lg"
      content={renderContractChooser}
    />
  );

  const relQuickButtons = (
    <ModalTrigger
      title="Related Associate"
      trigger={relContractTrigger}
      size="lg"
      content={renderRelatedContractChooser}
    />
  );

  const content = (
    <>
      {contractsQuery?.data?.savingsContractsMain?.list.map(
        (contract, index) => (
          <SectionBodyItem key={index}>
            <Link to={`/erxes-plugin-saving/contract-details/${contract._id}`}>
              <Icon icon="arrow-to-right" style={{ marginRight: 5 }} />
              <span>{contract.number || 'Unknown'}</span>
            </Link>
          </SectionBodyItem>
        ),
      )}
      {contractsQuery?.data?.savingsContractsMain?.list.length === 0 && (
        <EmptyState icon="building" text="No contract" />
      )}
      {mainTypeId && mainType && relQuickButtons}
    </>
  );

  return (
    <Box
      title={__('Saving contracts')}
      name="showContracts"
      extraButtons={quickButtons}
      isOpen={true}
      callback={collapseCallback}
    >
      {content}
    </Box>
  );
}

export default withConsumer(Component);
