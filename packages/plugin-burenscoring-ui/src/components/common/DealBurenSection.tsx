import Box from '@erxes/ui/src/components/Box';
import React, { useState } from 'react';
import { __ } from '@erxes/ui/src';
import DynamicComponentContent from '@erxes/ui/src/components/dynamicComponent/Content';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Table from '@erxes/ui/src/components/table';

import { IBurenScoring } from '../../types';
import {
  DynamicComponentList,
  DynamicTableWrapper,
} from '@erxes/ui/src/styles/main';
import InquiryRow from './InquiryRow';

type Props = {
  burenCustomerScoring?: IBurenScoring;
  showType?: string;
};

function Component(props: Props) {
  const { burenCustomerScoring, showType } = props;
  const [inquiries] = useState(
    burenCustomerScoring?.restInquiryResponse?.inquiry || []
  );
  const [customer] = useState(
    burenCustomerScoring?.restInquiryResponse?.customer || {}
  );
  const [credit] = useState(
    burenCustomerScoring?.externalScoringResponse?.data?.detail || {}
  );

  const renderTable = () => {
    return (
      <Table $striped $bordered $responsive>
        <thead>
          <tr>
            <th>{__('LOAN CLASS')}</th>
            <th>{__('LOAN TYPE')}</th>
            <th>{__('BALANCE')}</th>
            <th>{__('ADVAMOUNT')}</th>
            <th>{__('EXPDATE')}</th>
            <th>{__('ORGNAME')}</th>
          </tr>
        </thead>
        <tbody id="inquiries">
          {inquiries.map((inq) => (
            <InquiryRow inquiry={inq} key={inq._id}></InquiryRow>
          ))}
        </tbody>
      </Table>
    );
  };

  const renderDetail = () => {
    return (
      <Table $striped $bordered $responsive>
        <thead>
          <tr>
            <th>{__('first name')}</th>
            <th>{__('last name')}</th>
            <th>{__('address')}</th>
            <th>{__('registerno')}</th>
          </tr>
        </thead>
        <tbody id="inquiries">
          <tr>
            <td>{customer.firstname}</td>
            <td>{customer.lastname}</td>
            <td>{customer.address}</td>
            <td>{customer.registerno}</td>
          </tr>
        </tbody>
      </Table>
    );
  };

  const renderScore = () => {
    return (
      <Table $striped $bordered $responsive>
        <thead>
          <tr>
            <th>{__('score')}</th>
            <th>{__('bad Ratio')}</th>
          </tr>
        </thead>
        <tbody id="inquiries">
          <tr>
            <td>{credit?.creditScore?.scoringResult || ''}</td>
            <td>{credit?.creditScore?.badRatio || ''}</td>
          </tr>
        </tbody>
      </Table>
    );
  };

  const renderCreditSummary = () => {
    return (
      <Table $striped $bordered $responsive>
        <thead>
          <tr>
            <th>{__('user Monthly Repayment')}</th>
            <th>{__('line Total Base Amount')}</th>
            <th>{__('line Total Remain Amount')}</th>
          </tr>
        </thead>
        <tbody id="inquiries">
          <tr>
            <td>
              {credit?.creditSummary?.monthlyLoanRepayment
                ?.userMonthlyRepayment || ''}
            </td>
            <td>
              {credit?.creditSummary?.monthlyLoanRepayment
                ?.lineTotalBaseAmount || ''}
            </td>
            <td>
              {credit?.creditSummary?.monthlyLoanRepayment
                ?.lineTotalRemainAmount || ''}
            </td>
          </tr>
        </tbody>
      </Table>
    );
  };

  const renderActiveLoan = () => {
    return (
      <Table $striped $bordered $responsive>
        <thead>
          <tr>
            <th>{__('active Loan Remain Percent')}</th>
            <th>{__('active Loan Total Remain Amount')}</th>
          </tr>
        </thead>
        <tbody id="inquiries">
          <tr>
            <td>
              {credit?.creditSummary?.activeLoanInformation
                ?.activeLoanRemainPercent || ''}
            </td>
            <td>
              {credit?.creditSummary?.activeLoanInformation
                ?.activeLoanTotalRemainAmount || ''}
            </td>
          </tr>
        </tbody>
      </Table>
    );
  };

  const renderServiceItem = () => {
    if (!burenCustomerScoring) {
      return <EmptyState icon="building" text="No research" />;
    }

    return (
      <>
        {renderDetail()}
        {renderScore()}
        {renderCreditSummary()}
        {renderActiveLoan()}
        {renderTable()}
      </>
    );
  };

  const content = () => {
    if (!burenCustomerScoring) {
      return <EmptyState icon="building" text="No scoring" />;
    }

    if (showType && showType === 'list') {
      return renderServiceItem();
    }

    return renderDetail();
  };

  if (showType && showType === 'list') {
    return (
      <DynamicComponentContent>
        <DynamicComponentList>
          <h4>{__('Customer Scoring')}</h4>
          <DynamicTableWrapper>{content()}</DynamicTableWrapper>
        </DynamicComponentList>
      </DynamicComponentContent>
    );
  }

  return (
    <Box title={__('Loan scoring')} name="showBurenScoring" isOpen={true}>
      {content()}
    </Box>
  );
}

export default Component;
