import { IModels } from './connectionResolver';

export const salaryToResearch = async (params, customerId, models: IModels) => {
  const salaryData = params.data.find(
    (d) => d.serviceName === 'WS100501_getCitizenSalaryInfo'
  );

  if (salaryData) {
    const salaryInfos = salaryData?.data?.list;
    const totalMonth = salaryInfos.length;

    const transformedData = salaryInfos.map((item) => ({
      _id: Math.random().toString(),
      incomeType: 'Salary',
      totalSalaryIncome: item.salaryAmount,
      totalMonth: 1,
    }));

    if (totalMonth) {
      const salarySum = salaryInfos.reduce(
        (accumulator, income) => accumulator + (income.salaryAmount || 0),
        0
      );

      const averageSalary = salarySum / totalMonth;

      await models.LoansResearch.updateOne(
        { customerId },
        {
          $set: {
            customerType: 'Salary',
            averageSalaryIncome: averageSalary,
            totalIncome: averageSalary,
            incomes: transformedData,
            modifiedAt: new Date(),
          },
        }
      );
    }
  }
};

export const scoreToResearch = async (params, customerId, models: IModels) => {
  let ratio;
  let increaseAmount;

  const findResearch = await models.LoansResearch.findOne({ customerId });

  const loanInquiries = params?.restInquiryResponse?.inquiry || [];

  if (loanInquiries?.length) {
    const transformedData = loanInquiries.map((item) => ({
      _id: Math.random().toString(),
      loanType: 'Loan',
      loanLocation: item.LOANTYPE,
      startDate: new Date(item.STARTEDDATE),
      closeDate: new Date(item.EXPDATE),
      loanAmount: item.BALANCE,
    }));

    const loanSum = loanInquiries.reduce(
      (accumulator, loan) => accumulator + (loan.BALANCE || 0),
      0
    );

    if (findResearch) {
      if (findResearch.totalIncome) {
        ratio = (loanSum / findResearch.totalIncome) * 100;
      }
      if (findResearch.customerType === 'Salary') {
        increaseAmount = findResearch.averageSalaryIncome * 0.8 - loanSum;
      }

      if (findResearch.customerType === 'Business') {
        increaseAmount = findResearch.averageBusinessIncome * 0.7 - loanSum;
      }

      await models.LoansResearch.updateOne(
        { customerId },
        {
          $set: {
            monthlyLoanAmount: loanSum,
            totalPaymentAmount: loanSum,
            loans: transformedData,
            debtIncomeRatio: ratio,
            increaseMonthlyPaymentAmount: increaseAmount,
            modifiedAt: new Date(),
          },
        }
      );
    }
  }
};
