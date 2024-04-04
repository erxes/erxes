import {
  Box,
  EmptyState,
  Icon,
  ModalTrigger,
  MainStyleButtonRelated as ButtonRelated,
  SectionBodyItem,
  Alert
} from '@erxes/ui/src';
import React from 'react';
import { Link } from 'react-router-dom';
import ContractChooser from '../../containers/ContractChooser';
import { mutations, queries } from '../../graphql';
import {
  EditMutationResponse,
  IContract,
  IContractDoc,
  MainQueryResponse
} from '../../types';
import { can, withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';
import withConsumer from '../../../withConsumer';
import { IUser } from '@erxes/ui/src/auth/types';
import { __ } from 'coreui/utils';

type Props = {
  name: string;
  contractsQuery?: MainQueryResponse;
  mainType?: string;
  mainTypeId?: string;
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
    contractsQuery = { savingsContractsMain: { list: [] } } as any,
    mainType = '',
    mainTypeId = '',
    collapseCallback,
    title,
    contractsDealEdit,
    currentUser
  }: Props
) {
  const renderContractChooser = props => {
    return (
      <ContractChooser
        {...props}
        data={{
          name,
          contracts: contractsQuery?.savingsContractsMain?.list,
          mainType,
          mainTypeId
        }}
        onSelect={(contracts: IContractDoc[]) => {
          contractsDealEdit({
            variables: { ...contracts[0], dealId: mainTypeId }
          })
            .then(() => {
              collapseCallback && collapseCallback();
            })
            .catch(e => {
              Alert.error(e.message);
            });
        }}
      />
    );
  };

  const renderRelatedContractChooser = props => {
    return (
      <ContractChooser
        {...props}
        data={{
          name,
          contracts: contractsQuery?.savingsContractsMain?.list,
          mainTypeId,
          mainType,
          isRelated: true
        }}
        onSelect={(contracts: IContractDoc[]) => {
          contractsDealEdit({
            variables: { ...contracts[0], dealId: mainTypeId }
          })
            .then(() => {
              collapseCallback && collapseCallback();
            })
            .catch(e => {
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
      {contractsQuery?.savingsContractsMain?.list.map((contract, index) => (
        <SectionBodyItem key={index}>
          <Link to={`/erxes-plugin-saving/contract-details/${contract._id}`}>
            <Icon icon="arrow-to-right" style={{ marginRight: 5 }} />
            <span>{contract.number || 'Unknown'}</span>
          </Link>
        </SectionBodyItem>
      ))}
      {contractsQuery?.savingsContractsMain?.list.length === 0 && (
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

type IProps = {
  mainType?: string;
  mainTypeId?: string;
  isOpen?: boolean;
  contracts?: IContract[];
  onSelect?: (datas: IContract[]) => void;
  collapseCallback?: () => void;
};

export default withProps<IProps>(
  compose(
    graphql<{ mainTypeId: any; mainType: any }, MainQueryResponse, any>(
      gql(queries.contractsMain),
      {
        name: 'contractsQuery',
        options: ({ mainTypeId, mainType }) => {
          if (mainType === 'customer' || mainType === 'company')
            return {
              fetchPolicy: 'network-only',
              variables: { customerId: mainTypeId }
            };
          return {
            fetchPolicy: 'network-only',
            variables: { dealId: mainTypeId }
          };
        }
      }
    ),
    // mutations
    graphql<{}, EditMutationResponse, any>(gql(mutations.contractsDealEdit), {
      name: 'contractsDealEdit',
      options: { refetchQueries: ['contractsMain'] }
    })
  )(withConsumer(Component))
);
