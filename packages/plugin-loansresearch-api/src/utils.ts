import { IModels } from './connectionResolver';

export const salaryToResearch = async (params, customerId, models: IModels) => {
  const salaryData = params.data.find(
    (d) => d.serviceName === 'WS100501_getCitizenSalaryInfo'
  );

  if (salaryData) {
    const salaryInfos = salaryData?.data?.list;
    const totalMonth = salaryInfos.length;

    const transformedData = salaryInfos.map((item) => ({
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
  const loanInquiries = params?.restInquiryResponse?.inquiry || [];

  if (loanInquiries?.length) {
    const transformedData = loanInquiries.map((item) => ({
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

    await models.LoansResearch.updateOne(
      { customerId },
      {
        $set: {
          monthlyLoanAmount: loanSum,
          totalPaymentAmount: loanSum,
          loans: transformedData,
          modifiedAt: new Date(),
        },
      }
    );
  }
};
