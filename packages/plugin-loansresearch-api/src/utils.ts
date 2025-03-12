import { IModels } from './connectionResolver';
import { randomUUID } from 'crypto';

export const salaryToResearch = async (params, customerId, models: IModels) => {
  const salaryData = params.data.find(
    (d) => d.serviceName === 'WS100501_getCitizenSalaryInfo'
  );

  const findResearch = await models.LoansResearch.findOne({ customerId });

  if (salaryData) {
    const salaryInfos = salaryData?.data?.list;
    const totalMonth = salaryInfos.length;

    const transformedData = salaryInfos.map((item) => ({
      _id: randomUUID(),
      incomeType: 'Salary',
      totalSalaryIncome: item.salaryAmount,
      totalMonth: 1,
    }));

    const salarySum = salaryInfos.reduce(
      (accumulator, income) => accumulator + (income.salaryAmount || 0),
      0
    );

    const averageSalary = salarySum / totalMonth;

    if (findResearch) {
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

    if (!findResearch) {
      await models.LoansResearch.create({
        customerId,
        customerType: 'Salary',
        averageSalaryIncome: averageSalary,
        totalIncome: averageSalary,
        incomes: transformedData,
        createdAt: new Date(),
      });
    }
  }
};

export const scoreToResearch = async (params, customerId, models: IModels) => {
  let ratio;
  let increaseAmount;

  const findResearch = await models.LoansResearch.findOne({ customerId });

  const loanInquiries = params?.restInquiryResponse?.inquiry || [];
  const externalScoringResponse =
    params?.externalScoringResponse?.data?.detail || {};

  const userMonthlyRepayment =
    externalScoringResponse?.creditSummary?.monthlyLoanRepayment
      ?.userMonthlyRepayment ?? 0;

  if (loanInquiries?.length) {
    const transformedData = loanInquiries.map((item) => ({
      _id: randomUUID(),
      loanType: 'Loan',
      loanLocation: item.LOANTYPE,
      startDate: new Date(item.STARTEDDATE),
      closeDate: new Date(item.EXPDATE),
      loanAmount: item.BALANCE,
    }));

    if (findResearch) {
      if (findResearch.totalIncome) {
        ratio =
          userMonthlyRepayment && findResearch.totalIncome
            ? (userMonthlyRepayment / findResearch.totalIncome) * 100
            : 0;
      }
      if (findResearch.customerType === 'Salary') {
        increaseAmount =
          findResearch.averageSalaryIncome * 0.8 - userMonthlyRepayment;
      }

      if (findResearch.customerType === 'Business') {
        increaseAmount =
          findResearch.averageBusinessIncome * 0.7 - userMonthlyRepayment;
      }

      await models.LoansResearch.updateOne(
        { customerId },
        {
          $set: {
            monthlyLoanAmount: userMonthlyRepayment,
            totalPaymentAmount: userMonthlyRepayment,
            loans: transformedData,
            debtIncomeRatio: ratio,
            increaseMonthlyPaymentAmount: increaseAmount,
            modifiedAt: new Date(),
          },
        }
      );
    }

    if (!findResearch) {
      await models.LoansResearch.create({
        customerId,
        monthlyLoanAmount: userMonthlyRepayment,
        totalPaymentAmount: userMonthlyRepayment,
        loans: transformedData,
        createdAt: new Date(),
      });
    }
  }
};
