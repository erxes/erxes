const labelsQuery = `
  query salaryLabels {
    salaryLabels
  }
`;

const symbolsQuery = `
query salarySymbols {
  salarySymbols
}
`;

const salaryFields = `
_id
employee {
  _id
  details {
    firstName
    lastName
    position
  }
  branches {
    _id
    title
  }
}
      employeeId 
      totalWorkHours
      totalWorkedHours
      mainSalary
      adequateSalary
      kpi
      onAddition
      bonus
      vacation
      addition
      totalAddition
      otherAddition
      lateHoursDeduction
      resultDeduction
      totalDeduction
      totalSalary
      preliminarySalary
      endSalary
      kpiDeduction
      onDeduction
      otherDeduction
      bonusDeduction
      vacationDeduction
      ndsh
      hhoat
      mainDeduction
      salaryOnHand
      receivable
      biSan
      toSendBank  
title

`;

const salaryReport = `
query salaryReport($page: Int, $perPage: Int) {
  salaryReport(page: $page, perPage: $perPage) {
    list {
      ${salaryFields}
    }
    totalCount
  }
}
`;

const salaryByEmployee = `
query salaryByEmployee($password: String!) {
  salaryByEmployee(password: $password) {
    list {
      ${salaryFields}
    }
    totalCount
  }
}
`;

export default {
  labelsQuery,
  salaryReport,
  salaryByEmployee,
  symbolsQuery,
};
