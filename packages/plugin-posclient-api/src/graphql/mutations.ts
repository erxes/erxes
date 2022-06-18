import { loyaltiesMutations } from './loyalties';

export const clientPortalCreateCustomer = `
  mutation createCustomer(
    $configId: String!,
    $firstName: String!,
    $lastName: String,
    $email: String!,
  ) {
    clientPortalCreateCustomer(
      configId: $configId,
      firstName: $firstName,
      lastName: $lastName,
      email: $email
    ) {
      _id
    }
  }
`;

export const clientPortalCreateCompany = `
  mutation createCompany(
    $configId: String!,
    $companyName: String!
    $email: String!
  ) {
    clientPortalCreateCompany(
      configId: $configId,
      companyName: $companyName
      email: $email
    ) {
      _id
    }
  }
`;

export default {
  ...loyaltiesMutations
};
