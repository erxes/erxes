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

  const [debtIncomeRatio, setDebtIncomeRatio] = useState<number>(
    loansResearch?.debtIncomeRatio || 0
  );

  const [increaseMonthlyPaymentAmount, setIncreaseMonthlyPaymentAmount] =
    useState<number>(loansResearch?.increaseMonthlyPaymentAmount || 0);

  // income state
  const [incomes, setIncomes] = useState<IIncome[]>(
    loansResearch?.incomes || []
  );
  const [averageSalaryIncome, setAverageSalaryIncome] = useState<number>(
    loansResearch?.averageSalaryIncome || 0
  );
  const [averageBusinessIncome, setAverageBusinessIncome] = useState<number>(
    loansResearch?.averageBusinessIncome || 0
  );
  const [totalIncome, setTotalIncome] = useState<number>(
    loansResearch?.totalIncome || 0
  );

  // loan state
  const [loans, setLoans] = useState<ILoan[]>(loansResearch?.loans || []);

  const [monthlyCostAmount, setTotalLoanAmount] = useState<number>(
    loansResearch?.monthlyCostAmount || 0
  );
  const [monthlyLoanAmount, setMonthlyPaymentAmount] = useState<number>(
    loansResearch?.monthlyLoanAmount || 0
  );
  const [totalPaymentAmount, setTotalPaymentAmount] = useState<number>(
    loansResearch?.totalPaymentAmount || 0
  );

  useEffect(() => {
    let increaseAmount;
    const ratio = (monthlyLoanAmount / averageBusinessIncome) * 100;
    if (customerType === 'Customer') {
      increaseAmount = averageBusinessIncome * 0.8 - monthlyLoanAmount;
    }

    if (customerType === 'Company') {
      increaseAmount = averageBusinessIncome * 0.7 - monthlyLoanAmount;
    }

    setDebtIncomeRatio(ratio);
    setIncreaseMonthlyPaymentAmount(increaseAmount);
  }, [averageBusinessIncome, monthlyLoanAmount, customerType]);

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
      averageSalaryIncome,
      totalIncome,
      averageBusinessIncome,
      monthlyCostAmount,
      monthlyLoanAmount,
      totalPaymentAmount,
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
          averageSalaryIncome={averageSalaryIncome}
          setAverageSalaryIncome={setAverageSalaryIncome}
          totalIncome={totalIncome}
          setTotalIncome={setTotalIncome}
          averageBusinessIncome={averageBusinessIncome}
          setAverageBusinessIncome={setAverageBusinessIncome}
        />
      );
    }

    if (currentTab === 'Loans') {
      return (
        <LoanForm
          loans={loans}
          setLoans={setLoans}
          monthlyCostAmount={monthlyCostAmount}
          setTotalLoanAmount={setTotalLoanAmount}
          monthlyLoanAmount={monthlyLoanAmount}
          setMonthlyPaymentAmount={setMonthlyPaymentAmount}
          totalPaymentAmount={totalPaymentAmount}
          setTotalPaymentAmount={setTotalPaymentAmount}
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
