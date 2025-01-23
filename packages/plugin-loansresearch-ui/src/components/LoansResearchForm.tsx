import {
  __,
  Button,
  Form,
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  Tabs,
  TabTitle,
} from '@erxes/ui/src';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState, useEffect } from 'react';

import { IIncome, ILoan, ILoanResearch } from '../types';
import DealForm from './form/Deal';
import IncomeForm from './form/Incomes';
import LoanForm from './form/Loans';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  loansResearch: ILoanResearch;
  closeModal: () => void;
};

const LoansResearchForm = (props: Props) => {
  const {
    loansResearch = {} as ILoanResearch,
    closeModal,
    renderButton,
  } = props;

  const [currentTab, setCurrentTab] = useState('Deals');
  const [dealId, setDealId] = useState<string>(loansResearch?.dealId || '');
  const [customerType, setCustomerType] = useState<string>(
    loansResearch?.customerType || ''
  );
  const [customerId, setCustomerId] = useState<string>(
    loansResearch?.customerId || ''
  );
  const [incomes, setIncomes] = useState<IIncome[]>(
    loansResearch?.incomes || []
  );
  const [loans, setLoans] = useState<ILoan[]>(loansResearch?.loans || []);

  const [totalMonth, setTotalMonth] = useState<number>(
    loansResearch?.totalMonth || 0
  );
  const [totalIncome, setTotalIncome] = useState<number>(
    loansResearch?.totalIncome || 0
  );
  const [monthlyIncome, setMonthlyIncome] = useState<number>(
    loansResearch?.monthlyIncome || 0
  );
  const [totalLoanAmount, setTotalLoanAmount] = useState<number>(
    loansResearch?.totalLoanAmount || 0
  );
  const [monthlyPaymentAmount, setMonthlyPaymentAmount] = useState<number>(
    loansResearch?.monthlyPaymentAmount || 0
  );

  const [debtIncomeRatio, setDebtIncomeRatio] = useState<number>(
    loansResearch?.debtIncomeRatio || 0
  );

  const [increaseMonthlyPaymentAmount, setIncreaseMonthlyPaymentAmount] =
    useState<number>(loansResearch?.increaseMonthlyPaymentAmount || 0);

  useEffect(() => {
    let increaseAmount;
    const ratio = (monthlyPaymentAmount / monthlyIncome) * 100;
    if (customerType === 'Customer') {
      increaseAmount = monthlyIncome * 0.8 - monthlyPaymentAmount;
    }

    if (customerType === 'Company') {
      increaseAmount = monthlyIncome * 0.7 - monthlyPaymentAmount;
    }

    setDebtIncomeRatio(ratio);
    setIncreaseMonthlyPaymentAmount(increaseAmount);
  }, [monthlyIncome, monthlyPaymentAmount, customerType]);

  const generateDoc = (values: { _id: string } & ILoanResearch) => {
    const finalValues = values;

    if (loansResearch) {
      finalValues._id = loansResearch._id;
    }

    return {
      _id: finalValues._id,
      dealId,
      customerType,
      customerId,
      incomes,
      loans,
      totalMonth,
      totalIncome,
      monthlyIncome,
      totalLoanAmount,
      monthlyPaymentAmount,
      debtIncomeRatio,
      increaseMonthlyPaymentAmount,
    };
  };

  const renderTabContent = () => {
    if (currentTab === 'Deals') {
      return (
        <DealForm
          dealId={dealId}
          setDealId={setDealId}
          customerType={customerType}
          setCustomerType={setCustomerType}
          customerId={customerId}
          setCustomerId={setCustomerId}
          debtIncomeRatio={debtIncomeRatio}
          increaseMonthlyPaymentAmount={increaseMonthlyPaymentAmount}
        />
      );
    }

    if (currentTab === 'Incomes') {
      return (
        <IncomeForm
          incomes={incomes}
          setIncomes={setIncomes}
          totalMonth={totalMonth}
          setTotalMonth={setTotalMonth}
          totalIncome={totalIncome}
          setTotalIncome={setTotalIncome}
          monthlyIncome={monthlyIncome}
          setMonthlyIncome={setMonthlyIncome}
        />
      );
    }

    if (currentTab === 'Loans') {
      return (
        <LoanForm
          loans={loans}
          setLoans={setLoans}
          totalLoanAmount={totalLoanAmount}
          setTotalLoanAmount={setTotalLoanAmount}
          monthlyPaymentAmount={monthlyPaymentAmount}
          setMonthlyPaymentAmount={setMonthlyPaymentAmount}
        />
      );
    }
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <Tabs grayBorder={true} full={true}>
              <TabTitle
                className={currentTab === 'Deals' ? 'active' : ''}
                onClick={() => setCurrentTab('Deals')}
              >
                {__('Deals')}
              </TabTitle>
              <TabTitle
                className={currentTab === 'Incomes' ? 'active' : ''}
                onClick={() => setCurrentTab('Incomes')}
              >
                {__('Incomes')}
              </TabTitle>
              <TabTitle
                className={currentTab === 'Loans' ? 'active' : ''}
                onClick={() => setCurrentTab('Loans')}
              >
                {__('Loans')}
              </TabTitle>
            </Tabs>

            {renderTabContent()}
          </FormColumn>
        </FormWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
          </Button>

          {renderButton({
            name: 'loansResearch',
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: props.loansResearch,
          })}
        </ModalFooter>
      </>
    );
  };
  return <Form renderContent={renderContent} />;
};

export default LoansResearchForm;
