import Box from '@erxes/ui/src/components/Box';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { MainStyleButtonRelated as ButtonRelated } from '@erxes/ui/src/styles/eindex';
import { SectionBodyItem } from '@erxes/ui/src/layout/styles';
import Alert from '@erxes/ui/src/utils/Alert';

import React from 'react';
import { Link } from 'react-router-dom';
import ContractChooser from '../../containers/ContractChooser';
import { mutations, queries } from '../../graphql';
import { __ } from 'coreui/utils';
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
import { useMutation, useQuery } from '@apollo/client';

type Props = {
  name: string;
  mainType?: string;
  mainTypeId?: string;
  onSelect?: (contract: IContract[]) => void;
  collapseCallback?: () => void;
  title?: string;
  currentUser: IUser;
};

function Component(
  this: any,
  {
    name,
    mainType = '',
    mainTypeId = '',
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
          ? { customerId: mainTypeId }
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
          contracts: contractsQuery?.data?.contractsMain?.list,
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
          contracts: contractsQuery?.data?.contractsMain?.list,
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
      {contractsQuery?.data?.contractsMain?.list.map((contract, index) => (
        <SectionBodyItem key={index}>
          <Link to={`/erxes-plugin-loan/contract-details/${contract._id}`}>
            <Icon icon="arrow-to-right" style={{ marginRight: 5 }} />
            <span>{contract.number || 'Unknown'}</span>
          </Link>
        </SectionBodyItem>
      ))}
      {contractsQuery?.data?.contractsMain?.list.length === 0 && (
        <EmptyState icon="building" text="No contract" />
      )}
      {mainTypeId && mainType && relQuickButtons}
    </>
  );

  return (
    <Box
      title={__(`${title || 'Loan Contracts'}`)}
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
