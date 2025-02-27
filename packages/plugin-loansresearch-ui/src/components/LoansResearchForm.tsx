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
  queryParams: any;
  customer: any;
};

const LoansResearchForm = (props: Props) => {
  const {
    loansResearch = {} as ILoanResearch,
    closeModal,
    renderButton,
    queryParams,
    customer,
  } = props;

  const [currentTab, setCurrentTab] = useState('Deals');
  const [dealId, setDealId] = useState<string>(loansResearch?.dealId || '');
  const [customerType, setCustomerType] = useState<string>(
    loansResearch?.customerType || ''
  );
  const [customerId, setCustomerId] = useState<string>(
    loansResearch?.customerId || ''
  );
  const [customerData] = useState(loansResearch?.customer || {});
  const [dealData] = useState(loansResearch?.deal || {});

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

  const [monthlyCostAmount, setMonthlyCostAmount] = useState<number>(
    loansResearch?.monthlyCostAmount || 0
  );
  const [monthlyLoanAmount, setMonthlyLoanAmount] = useState<number>(
    loansResearch?.monthlyLoanAmount || 0
  );
  const [totalPaymentAmount, setTotalPaymentAmount] = useState<number>(
    loansResearch?.totalPaymentAmount || 0
  );

  useEffect(() => {
    if (queryParams && queryParams?.itemId) {
      setDealId(queryParams.itemId);
    }
  }, [queryParams]);

  useEffect(() => {
    if (customer) {
      setCustomerId(customer._id);
    }
  }, [customer]);

  useEffect(() => {
    let increaseAmount;

    const ratio = (totalPaymentAmount / totalIncome) * 100;

    if (customerType === 'Salary') {
      increaseAmount = averageSalaryIncome * 0.8 - totalPaymentAmount;
    }

    if (customerType === 'Business') {
      increaseAmount = averageBusinessIncome * 0.7 - totalPaymentAmount;
    }

    if (customerType === 'Salary+Business') {
      increaseAmount = totalIncome * 0.7 - totalPaymentAmount;
    }

    setDebtIncomeRatio(ratio);
    setIncreaseMonthlyPaymentAmount(increaseAmount);
  }, [
    averageSalaryIncome,
    averageBusinessIncome,
    totalIncome,
    totalPaymentAmount,
    customerType,
  ]);

  useEffect(() => {
    if (incomes && incomes.length > 0) {
      // Calculate total salary income amount
      const salarySum = incomes.reduce((accumulator, income) => {
        const monthlyIncome =
          (income.totalSalaryIncome || 0) / (income.totalMonth || 1);
        return accumulator + monthlyIncome;
      }, 0);

      // Calculate total business income amount
      const businessSum = incomes.reduce(
        (accumulator, income) => accumulator + (income.businessIncome || 0),
        0
      );

      const types = incomes.map((income) => income.incomeType);
      if (types.includes('Salary') && types.includes('Business')) {
        setCustomerType('Salary+Business');
      } else if (types.includes('Salary')) {
        setCustomerType('Salary');
      } else if (types.includes('Business')) {
        setCustomerType('Business');
      }

      setAverageSalaryIncome(salarySum / incomes.length);
      setAverageBusinessIncome(businessSum);
    }
  }, [incomes]);

  useEffect(() => {
    const total = averageSalaryIncome + averageBusinessIncome;

    setTotalIncome(total);
  }, [averageSalaryIncome, averageBusinessIncome]);

  useEffect(() => {
    if (loans && loans.length > 0) {
      // Calculate total loan amount
      const loanSum = loans.reduce(
        (accumulator, loan) => accumulator + (loan.loanAmount || 0),
        0
      );

      // Calculate total cost amount
      const costSum = loans.reduce(
        (accumulator, loan) => accumulator + (loan.costAmount || 0),
        0
      );

      setMonthlyLoanAmount(loanSum);
      setMonthlyCostAmount(costSum);
    }
  }, [loans]);

  useEffect(() => {
    const totalPayment = monthlyCostAmount + monthlyLoanAmount;

    setTotalPaymentAmount(totalPayment);
  }, [monthlyCostAmount, monthlyLoanAmount]);

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
          customerData={customerData}
          dealData={dealData}
          customerType={customerType}
          totalIncome={totalIncome}
          totalPaymentAmount={totalPaymentAmount}
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
          totalIncome={totalIncome}
          averageBusinessIncome={averageBusinessIncome}
        />
      );
    }

    if (currentTab === 'Loans') {
      return (
        <LoanForm
          loans={loans}
          setLoans={setLoans}
          monthlyCostAmount={monthlyCostAmount}
          monthlyLoanAmount={monthlyLoanAmount}
          totalPaymentAmount={totalPaymentAmount}
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
