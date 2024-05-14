import Box from '@erxes/ui/src/components/Box';
import ContractsCustomFields from '../list/ContractsCustomFields';
import DealSection from './DealSection';
import { IContract } from '../../types';
import { List } from '../../styles';
import React from 'react';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { __ } from 'coreui/utils';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import dayjs from 'dayjs';
import { isEnabled } from '@erxes/ui/src/utils/core';

const CompanySection = asyncComponent(
  () =>
    isEnabled('contacts') &&
    import(
      /* webpackChunkName: "CompanySection" */ '@erxes/ui-contacts/src/companies/components/CompanySection'
    ),
);

const CustomerSection = asyncComponent(
  () =>
    isEnabled('contacts') &&
    import(
      /* webpackChunkName: "CustomerSection" */ '@erxes/ui-contacts/src/customers/components/CustomerSection'
    ),
);

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
      {isEnabled('contacts') && (
        <>
          {contract.customerType === 'customer' && contract.customers && (
            <CustomerSection
              customers={[contract.customers]}
              title={__('Loan Primary Customers')}
              name={'Contract'}
            />
          )}
          {contract.customerType === 'company' && contract.companies && (
            <CompanySection
              companies={[contract.companies]}
              title={__('Loan Primary Companies')}
              name={'Contract'}
            />
          )}
          <CustomerSection
            mainType="contractSub"
            mainTypeId={contract._id}
            title={__('Loan Collectively Customers')}
            name={'Contract'}
          />

          <DealSection contract={contract} />
        </>
      )}
      {isEnabled('forms') && (
        <ContractsCustomFields
          contract={contract}
          collapseCallback={console.log}
          isDetail
        />
      )}

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
