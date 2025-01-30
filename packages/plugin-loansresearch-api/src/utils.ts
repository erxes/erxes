import { IModels } from './connectionResolver';

export const salaryToResearch = async (subdomain, params, models: IModels) => {
  const salaryData = params.data.find(
    (d) => d.serviceName === 'WS100501_getCitizenSalaryInfo'
  );

  if (salaryData) {
    const salaryInfos = salaryData?.data?.list;
    const totalMonth = salaryInfos.length;

    if (totalMonth) {
      const salarySum = salaryInfos.reduce(
        (accumulator, income) => accumulator + (income.salaryAmount || 0),
        0
      );

      const averageSalary = salarySum / totalMonth;

      await models.LoansResearch.updateOne(
        { dealId: '' },
        {
          $set: {
            customerType: 'Salary',
            averageSalaryIncome: averageSalary,
            totalIncome: averageSalary,
          },
        }
      );
    }
  }
};
