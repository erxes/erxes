const removeSalary = `
mutation removeSalaryReport($_id: String!) {
  removeSalaryReport(_id: $_id)
}
`;

export default {
  removeSalary,
};
