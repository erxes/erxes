import Box from '@erxes/ui/src/components/Box';
import ContractsCustomFields from '../list/ContractsCustomFields';
import DealSection from './DealSection';
import { IContract } from '../../types';
import { List } from '../../styles';
import React from 'react';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { __ } from 'coreui/utils';
import dayjs from 'dayjs';
import { isEnabled } from '@erxes/ui/src/utils/core';
import CustomerSection from './CustomerSection';
import CompanySection from './CompanySection';

type Props = {
  contract: IContract | any;
};

export default function RightSidebar(props: Props) {
  const renderPlan = (contract) => {
    if (!contract.plan) {
      return null;
    }

    return (
      <li>
        <div>{__('Plan')}: </div>
        <span>{contract.plan}</span>
      </li>
    );
  };

  const { contract } = props;

  return (
    <Sidebar>
      <>
        {contract.customerType === 'customer' && contract.customer && (
          <CustomerSection
            contract={contract}
            customers={[contract.customer]}
            title={__('Loan Primary Customers')}
          />
        )}
        {contract.customerType === 'company' && contract.company && (
          <CompanySection
            contract={contract}
            companies={[contract.company]}
            title={__('Loan Primary Companies')}
          />
        )}
      </>

      {isEnabled('sales') && <DealSection contract={contract} />}

      <ContractsCustomFields
        contract={contract}
        collapseCallback={console.log}
        isDetail
      />

      <Box title={__('Other')} name="showOthers">
        <List>
          <li>
            <div>{__('Created at')}: </div>{' '}
            <span>{dayjs(contract.createdAt).format('lll')}</span>
          </li>
          {renderPlan(contract)}
        </List>
      </Box>
    </Sidebar>
  );
}
