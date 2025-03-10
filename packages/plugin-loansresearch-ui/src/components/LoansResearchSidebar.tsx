import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  ModalTrigger,
  __,
} from '@erxes/ui/src';

import Box from '@erxes/ui/src/components/Box';
import DynamicComponentContent from '@erxes/ui/src/components/dynamicComponent/Content';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import { TabTitle, Tabs } from '@erxes/ui/src/components/tabs';
import { ILoanResearch } from '../types';
import { FlexRow, List } from '../styles';
import LoansResearchFormContainer from '../containers/LoansResearchForm';
import React, { useState } from 'react';
import { DynamicComponentList } from '@erxes/ui/src/styles/main';
import { SidebarContent } from '@erxes/ui-forms/src/settings/properties/styles';
import { renderBody } from '../utils';

type Props = {
  loansResearch: ILoanResearch;
  queryParams: any;
  showType?: string;
};

const LoansResearchSidebar = (props: Props) => {
  const { loansResearch, queryParams, showType } = props;
  const [currentTab, setCurrentTab] = useState('deals');

  const renderForm = ({
    closeModal,
  }: {
    closeModal: () => void;
  }): React.ReactNode => {
    return (
      <LoansResearchFormContainer
        loansResearch={loansResearch}
        queryParams={queryParams}
        closeModal={closeModal}
      />
    );
  };

  const extreBtnTrigger = (
    <Button btnStyle="link">
      <Icon icon="plus-circle" size={16} />
    </Button>
  );

  const extraButtons = (
    <ModalTrigger
      content={({ closeModal }) => renderForm({ closeModal })}
      title={`Add loans research`}
      trigger={extreBtnTrigger}
      size="xl"
    />
  );

  const renderFormGroup = (label, props) => {
    if (!label) return <FormControl {...props} />;
    return (
      <FormGroup>
        <ControlLabel>{__(label)}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };

  const renderDealData = () => {
    return (
      <SidebarContent>
        <FormGroup>
          <ControlLabel>{'Deal'}</ControlLabel>
          {renderBody(loansResearch?.deal || 'Unknown', 'deal')}
        </FormGroup>
        <FormGroup>
          <ControlLabel>{'Customer'}</ControlLabel>
          {renderBody(loansResearch?.customer || 'Unknown')}
        </FormGroup>
        {renderFormGroup('Customer Type', {
          value: loansResearch?.customerType || '',
          disabled: true,
        })}
        {renderFormGroup('Average Salary Income', {
          type: 'number',
          value: loansResearch?.averageSalaryIncome || 0,
          useNumberFormat: true,
          fixed: 2,
          disabled: true,
        })}
        {renderFormGroup('Total Payment Amount', {
          type: 'number',
          value: loansResearch?.totalPaymentAmount || 0,
          useNumberFormat: true,
          fixed: 2,
          disabled: true,
        })}
        {renderFormGroup('Debt Income Ratio', {
          type: 'number',
          value: loansResearch?.debtIncomeRatio || 0,
        })}
        {renderFormGroup('Increase Monthly Payment Amount', {
          type: 'number',
          value: loansResearch?.increaseMonthlyPaymentAmount || 0,
          useNumberFormat: true,
          fixed: 2,
          disabled: true,
        })}
      </SidebarContent>
    );
  };

  const renderIncomesData = () => {
    return (
      <SidebarContent>
        <FlexRow>
          {renderFormGroup('Average Salary Income', {
            type: 'number',
            value: loansResearch?.averageSalaryIncome || 0,
            useNumberFormat: true,
            fixed: 2,
            disabled: true,
          })}
          {renderFormGroup('Average Business Income', {
            type: 'number',
            value: loansResearch?.averageBusinessIncome || 0,
            useNumberFormat: true,
            fixed: 2,
            disabled: true,
          })}
          {renderFormGroup('Total Income', {
            type: 'number',
            value: loansResearch?.totalIncome || '',
            useNumberFormat: true,
            fixed: 2,
            disabled: true,
          })}
        </FlexRow>
      </SidebarContent>
    );
  };

  const renderLoansData = () => {
    return (
      <SidebarContent>
        <FlexRow>
          {renderFormGroup('Monthly Loan Amount', {
            type: 'number',
            value: loansResearch?.monthlyLoanAmount || 0,
            useNumberFormat: true,
            fixed: 2,
            disabled: true,
          })}
          {renderFormGroup('Monthly Cost Amount', {
            type: 'number',
            value: loansResearch?.monthlyCostAmount || 0,
            useNumberFormat: true,
            fixed: 2,
            disabled: true,
          })}
          {renderFormGroup('Total Payment Amount', {
            type: 'number',
            value: loansResearch?.totalPaymentAmount || 0,
            useNumberFormat: true,
            fixed: 2,
            disabled: true,
          })}
        </FlexRow>
      </SidebarContent>
    );
  };

  const renderServiceItem = () => {
    if (!loansResearch) {
      return <EmptyState icon="building" text="No research" />;
    }

    const renderContent = () => {
      if (currentTab === 'deals') {
        return (
          <DynamicComponentList>
            <h4>{__('Deals')}</h4>
            {extraButtons}
            {renderDealData()}
          </DynamicComponentList>
        );
      }

      if (currentTab === 'incomes') {
        return (
          <DynamicComponentList>
            <h4>{__('Incomes')}</h4>
            {renderIncomesData()}
          </DynamicComponentList>
        );
      }

      if (currentTab === 'loans') {
        return (
          <DynamicComponentList>
            <h4>{__('Loans')}</h4>
            {renderLoansData()}
          </DynamicComponentList>
        );
      }
    };

    return (
      <SidebarList className="no-link">
        <Tabs full>
          <TabTitle
            className={currentTab === 'deals' ? 'active' : ''}
            onClick={() => setCurrentTab('deals')}
          >
            {__('Deals')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'incomes' ? 'active' : ''}
            onClick={() => setCurrentTab('incomes')}
          >
            {__('Incomes')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'loans' ? 'active' : ''}
            onClick={() => setCurrentTab('loans')}
          >
            {__('Loans')}
          </TabTitle>
        </Tabs>
        {renderContent()}
      </SidebarList>
    );
  };

  const content = () => {
    if (!loansResearch) {
      return (
        <>
          {extraButtons}
          <EmptyState icon="building" text="No research" />
        </>
      );
    }

    if (showType && showType === 'list') {
      return renderServiceItem();
    }

    return (
      <List>
        <li>
          <div>{__('Customer Type')}: </div>{' '}
          <span>{loansResearch?.customerType || ''}</span>
        </li>
        <li>
          <div>{__('Deal')}: </div> <span>{loansResearch?.dealId || ''}</span>
        </li>
      </List>
    );
  };

  if (showType && showType === 'list') {
    return <DynamicComponentContent>{content()}</DynamicComponentContent>;
  }

  return (
    <Box
      title="Loans Research"
      name="loansResearch"
      isOpen={true}
      extraButtons={extraButtons}
    >
      {content()}
    </Box>
  );
};

export default LoansResearchSidebar;
