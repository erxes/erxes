import { buildSubgraphSchema } from '@apollo/subgraph';
import { graphql, Kind, parse } from 'graphql';
import { Mongoose, Types } from 'mongoose';
import type { ICustomerDocument } from '@/insurance/@types/customer';
import { customerSchema } from '@/insurance/db/definitions/customer';
import { InsuranceCustomer } from '@/insurance/graphql/resolvers/customResolvers/insurance';
import { mutations } from '../apollo/resolvers/mutations';
import { queries } from '../apollo/resolvers/queries';
import {
  mutations as mutationFields,
  queries as queryFields,
  types,
} from '../apollo/schema/schema';

// Keep the real root registries and SDL while isolating unrelated service imports.
jest.mock('erxes-api-shared/utils', () => ({ escapeRegExp: jest.fn() }));
jest.mock('../modules/insurance/services/pdfGenerator', () => ({}));

const declaredFieldNames = (rootType: string, fields: string) => {
  const [definition] = parse(`type ${rootType} { ${fields} }`).definitions;
  return definition.kind === Kind.OBJECT_TYPE_DEFINITION
    ? (definition.fields ?? []).map(({ name }) => name.value).sort()
    : [];
};

it.each([
  ['Query', queryFields, queries],
  ['Mutation', mutationFields, mutations],
] as const)(
  'registers a function for each declared %s field only',
  (rootType, fields, registry) => {
    expect(Object.keys(registry).sort()).toEqual(
      declaredFieldNames(rootType, fields),
    );
    expect(
      Object.entries(registry).filter(([, fn]) => typeof fn !== 'function'),
    ).toEqual([]);
  },
);

// Match the runtime subgraph builder, including its default resolution of an
// SDL field that has no registered resolver. Mock only Mongo driver reads.
const schema = buildSubgraphSchema({
  typeDefs: parse(`
    scalar JSON
    scalar Date
    ${types}
    type Query { ${queryFields} }
    type Mutation { ${mutationFields} }
  `),
  resolvers: { Query: queries, Mutation: mutations, InsuranceCustomer },
});
const mongoose = new Mongoose();
const tenantA = mongoose.createConnection();
const tenantB = mongoose.createConnection();
const CustomerA = tenantA.model<ICustomerDocument>(
  'insurance_customers',
  customerSchema,
);
const CustomerB = tenantB.model<ICustomerDocument>(
  'insurance_customers',
  customerSchema,
);
const customerId = new Types.ObjectId();
const individual = {
  _id: customerId,
  type: 'individual',
  firstName: 'Contract',
  lastName: 'Customer',
  registrationNumber: 'CONTRACT-INDIVIDUAL',
  email: 'contract-customer@example.test',
};
const source = `query InsuranceCustomerResolverContract($id: ID!) {
  insuranceCustomer(id: $id) {
    id type firstName lastName registrationNumber email phone companyName
  }
}`;
const run = (Customer = CustomerA, id: string | null = customerId.toString()) =>
  graphql({
    schema,
    source,
    variableValues: { id },
    contextValue: { models: { Customer } },
  });

beforeEach(() => {
  jest.spyOn(CustomerA.collection, 'findOne').mockResolvedValue(individual);
  jest.spyOn(CustomerB.collection, 'findOne').mockResolvedValue(null);
});
afterEach(() => jest.restoreAllMocks());
afterAll(() => {
  tenantA.deleteModel(/.*/);
  tenantB.deleteModel(/.*/);
});

it.each([
  individual,
  {
    _id: customerId,
    type: 'company',
    companyName: 'Contract Company',
    registrationNumber: 'CONTRACT-COMPANY',
  },
])(
  'returns the stored $type customer through the declared field',
  async (customer) => {
    jest.mocked(CustomerA.collection.findOne).mockResolvedValue(customer);
    const result = await run();
    expect(result.errors).toBeUndefined();
    expect(result.data?.insuranceCustomer).toEqual({
      id: customerId.toString(),
      type: customer.type,
      firstName: 'firstName' in customer ? customer.firstName : null,
      lastName: 'lastName' in customer ? customer.lastName : null,
      registrationNumber: customer.registrationNumber,
      email: 'email' in customer ? customer.email : null,
      phone: null,
      companyName: 'companyName' in customer ? customer.companyName : null,
    });
    expect(CustomerA.collection.findOne).toHaveBeenCalledWith(
      { _id: customerId },
      expect.anything(),
    );
  },
);

it('returns null for a missing customer', async () => {
  jest.mocked(CustomerA.collection.findOne).mockResolvedValue(null);
  const result = await run();
  expect(result.errors).toBeUndefined();
  expect(result.data?.insuranceCustomer).toBeNull();
  expect(CustomerA.collection.findOne).toHaveBeenCalledTimes(1);
});

it('uses only the customer model from the request tenant', async () => {
  const result = await run(CustomerB);
  expect(result.errors).toBeUndefined();
  expect(result.data?.insuranceCustomer).toBeNull();
  expect(CustomerB.collection.findOne).toHaveBeenCalledWith(
    { _id: customerId },
    expect.anything(),
  );
  expect(CustomerA.collection.findOne).not.toHaveBeenCalled();
});

it('propagates a lookup failure instead of hiding it as a missing customer', async () => {
  jest
    .mocked(CustomerA.collection.findOne)
    .mockRejectedValue(new Error('Customer lookup failed'));
  const result = await run();
  expect(result.errors?.map((error) => error.message)).toEqual([
    'Customer lookup failed',
  ]);
  expect(result.data?.insuranceCustomer).toBeNull();
});

it('retains the required ID validation before querying the database', async () => {
  const result = await run(CustomerA, null);
  expect(result.errors).toHaveLength(1);
  expect(CustomerA.collection.findOne).not.toHaveBeenCalled();
});
