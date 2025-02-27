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
import Select from 'react-select';

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

  const renderFormGroup = (label, value, select?) => {
    if (select) {
      return (
        <FormGroup>
          <ControlLabel>{__(label)}</ControlLabel>
          <Select value={value} />
        </FormGroup>
      );
    }

    return (
      <FormGroup>
        <ControlLabel>{__(label)}</ControlLabel>
        <FormControl defaultValue={value} disabled={true} />
      </FormGroup>
    );
  };

  const renderDealData = () => {
    return (
      <SidebarContent>
        {renderFormGroup('Deal', loansResearch?.dealId || '')}
        {renderFormGroup('CustomerId', loansResearch?.customerId || '')}
        {renderFormGroup('Customer Type', loansResearch?.customerType || '')}
        {renderFormGroup(
          'Average Salary Income',
          loansResearch?.averageSalaryIncome || 0
        )}
        {renderFormGroup(
          'Total Payment Amount',
          loansResearch?.totalPaymentAmount || 0
        )}
        {renderFormGroup(
          'Debt Income Ratio',
          loansResearch?.debtIncomeRatio || 0
        )}
        {renderFormGroup(
          'Increase Monthly Payment Amount',
          loansResearch?.increaseMonthlyPaymentAmount || 0
        )}
      </SidebarContent>
    );
  };

  const renderIncomesData = () => {
    return (
      <SidebarContent>
        <FlexRow>
          {renderFormGroup(
            'Average Salary Income',
            loansResearch?.averageSalaryIncome || 0
          )}
          {renderFormGroup(
            'Average Business Income',
            loansResearch?.averageBusinessIncome || 0
          )}
          {renderFormGroup('Total Income', loansResearch?.totalIncome || '')}
        </FlexRow>
      </SidebarContent>
    );
  };

  const renderLoansData = () => {
    return (
      <SidebarContent>
        <FlexRow>
          {renderFormGroup(
            'Monthly Loan Amount',
            loansResearch?.monthlyLoanAmount || 0
          )}
          {renderFormGroup(
            'Monthly Cost Amount',
            loansResearch?.monthlyCostAmount || 0
          )}
          {renderFormGroup(
            'Total Payment Amount',
            loansResearch?.totalPaymentAmount || 0
          )}
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
