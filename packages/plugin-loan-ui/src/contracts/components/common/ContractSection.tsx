import {
  Box,
  EmptyState,
  Icon,
  ModalTrigger,
  MainStyleButtonRelated as ButtonRelated,
  __,
  SectionBodyItem
} from '@erxes/ui/src';
import GetConformity from '@erxes/ui-cards/src/conformity/containers/GetConformity';
import React from 'react';
import { Link } from 'react-router-dom';
import ContractChooser from '../../containers/ContractChooser';
import { queries } from '../../graphql';
import { IContract } from '../../types';

type Props = {
  name: string;
  items?: IContract[];
  mainType?: string;
  mainTypeId?: string;
  onSelect?: (contracts: IContract[]) => void;
  collapseCallback?: () => void;
  title?: string;
};

function Component(
  this: any,
  {
    name,
    items = [],
    mainType = '',
    mainTypeId = '',
    onSelect,
    collapseCallback,
    title
  }: Props
) {
  const renderContractChooser = props => {
    return (
      <ContractChooser
        {...props}
        data={{ name, contracts: items, mainType, mainTypeId }}
        onSelect={onSelect}
      />
    );
  };

  const renderRelatedContractChooser = props => {
    return (
      <ContractChooser
        {...props}
        data={{ name, contracts: items, mainTypeId, mainType, isRelated: true }}
        onSelect={onSelect}
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

  const quickButtons = (
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
      {items.map((contract, index) => (
        <SectionBodyItem key={index}>
          <Link to={`/erxes-plugin-loan/contract-details/${contract._id}`}>
            <Icon icon="arrow-to-right" />
          </Link>
          <span>{contract.number || 'Unknown'}</span>
        </SectionBodyItem>
      ))}
      {items.length === 0 && <EmptyState icon="building" text="No contract" />}
      {mainTypeId && mainType && relQuickButtons}
    </>
  );

  return (
    <Box
      title={__(`${title || 'Contracts'}`)}
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

export default (props: IProps) => {
  return (
    <GetConformity
      {...props}
      relType="contract"
      component={Component}
      queryName="contracts"
      itemsQuery={queries.contracts}
      alreadyItems={props.contracts}
    />
  );
};
