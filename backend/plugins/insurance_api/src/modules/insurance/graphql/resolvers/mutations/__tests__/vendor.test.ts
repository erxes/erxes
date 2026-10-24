import { makeExecutableSchema } from '@graphql-tools/schema';
import { graphql } from 'graphql';
import { Mongoose, Types } from 'mongoose';
import type { IVendorDocument } from '@/insurance/@types/vendor';
import { insuranceTypeSchema } from '@/insurance/db/definitions/insuranceType';
import { productSchema } from '@/insurance/db/definitions/product';
import { regionSchema } from '@/insurance/db/definitions/region';
import { riskTypeSchema } from '@/insurance/db/definitions/riskType';
import { vendorSchema } from '@/insurance/db/definitions/vendor';
import {
  inputs,
  mutations,
  types,
} from '@/insurance/graphql/schemas/insurance';
import {
  InsuranceProduct,
  InsuranceRegion,
  InsuranceType,
  InsuranceVendor,
} from '../../customResolvers/insurance';
import { vendorMutations } from '../vendor';

// Use real Mongoose hydration/population and GraphQL completion. Only the Mongo
// driver boundary is mocked, so these tests need no running database or Redis.
const mongoose = new Mongoose();
const Vendor = mongoose.model<IVendorDocument>('vendors', vendorSchema);
const Product = mongoose.model('products', productSchema);
const Region = mongoose.model('insurance_regions', regionSchema);
const Type = mongoose.model('insurance_types', insuranceTypeSchema);
mongoose.model('risk_types', riskTypeSchema);

const schema = makeExecutableSchema({
  typeDefs: `
    scalar JSON
    scalar Date
    ${types}
    ${inputs}
    type Query { unused: Boolean }
    type Mutation { ${mutations} }
  `,
  resolvers: {
    Mutation: vendorMutations,
    InsuranceProduct,
    InsuranceRegion,
    InsuranceType,
    InsuranceVendor,
  },
});

const vendorId = new Types.ObjectId();
const productId = new Types.ObjectId();
const removedProductId = new Types.ObjectId();
const typeId = new Types.ObjectId();
const regionId = new Types.ObjectId();
const date = new Date('2026-10-19T00:00:00.000Z');
const pricingOverride = {
  percentage: '0',
  percentageByDuration: { '12months': '2.50', '24months': 0 },
  customPricingKey: { retained: true },
};
const discountTiers = [{ minTravelers: 3, discountPercent: 10 }];
const region = {
  _id: regionId,
  name: 'Contract test region',
  countries: ['Mongolia'],
  createdAt: date,
  updatedAt: date,
};
const product = {
  _id: productId,
  name: 'Contract test product',
  insuranceType: typeId,
  regions: [regionId],
  coveredRisks: [],
  pricingConfig: { percentage: '1.25' },
};
const vendor = {
  _id: vendorId,
  name: 'Contract test vendor',
  offeredProducts: [{ product: productId, pricingOverride, discountTiers }],
  createdAt: date,
  updatedAt: date,
};

beforeEach(() => {
  jest.spyOn(Vendor.collection, 'findOneAndUpdate').mockResolvedValue(vendor);
  // The real driver returns a cursor; population only consumes toArray().
  jest.spyOn(Product.collection, 'find').mockReturnValue({
    toArray: async () => [product],
  } as unknown as ReturnType<typeof Product.collection.find>);
  jest.spyOn(Region.collection, 'find').mockReturnValue({
    toArray: async () => [region],
  } as unknown as ReturnType<typeof Region.collection.find>);
  jest.spyOn(Type.collection, 'find').mockReturnValue({
    toArray: async () => [{ _id: typeId, name: 'Contract test type' }],
  } as unknown as ReturnType<typeof Type.collection.find>);
});

afterEach(() => jest.restoreAllMocks());
afterAll(() => mongoose.deleteModel(/.*/));

const cases = [
  {
    field: 'updateVendor',
    args: 'id: $vendorId, name: "Contract test vendor"',
    variables: '$vendorId: ID!',
    write: { $set: expect.objectContaining({ name: vendor.name }) },
  },
  {
    field: 'addProductToVendor',
    args: 'vendorId: $vendorId, productId: $productId, pricingOverride: $pricingOverride, discountTiers: $discountTiers',
    variables:
      '$vendorId: ID!, $productId: ID!, $pricingOverride: JSON, $discountTiers: [DiscountTierInput!]',
    write: {
      $push: {
        offeredProducts: expect.objectContaining({
          product: productId,
          pricingOverride,
          discountTiers: expect.arrayContaining([
            expect.objectContaining(discountTiers[0]),
          ]),
        }),
      },
    },
  },
  {
    field: 'removeProductFromVendor',
    args: 'vendorId: $vendorId, productId: $productId',
    variables: '$vendorId: ID!, $productId: ID!',
    write: { $pull: { offeredProducts: { product: removedProductId } } },
  },
];

describe.each(['linked', 'empty', 'deleted'])('%s regions', (regionState) => {
  beforeEach(() => {
    jest.mocked(Product.collection.find).mockReturnValue({
      toArray: async () => [
        { ...product, regions: regionState === 'empty' ? [] : [regionId] },
      ],
    } as unknown as ReturnType<typeof Product.collection.find>);
    jest.mocked(Region.collection.find).mockReturnValue({
      toArray: async () => (regionState === 'deleted' ? [] : [region]),
    } as unknown as ReturnType<typeof Region.collection.find>);
  });

  it.each(cases)(
    '$field returns region details without changing pricing or writes',
    async ({ field, args, variables, write }) => {
      const result = await graphql({
        schema,
        source: `mutation InsuranceVendorRegionContract(${variables}) {
      ${field}(${args}) {
        id name
        offeredProducts {
          pricingOverride
          discountTiers { minTravelers discountPercent }
          product {
            id name
            insuranceType { id name }
            regions { id name countries createdAt updatedAt }
          }
        }
      }
    }`,
        variableValues: {
          vendorId: vendorId.toString(),
          productId: (field === 'removeProductFromVendor'
            ? removedProductId
            : productId
          ).toString(),
          pricingOverride,
          discountTiers,
        },
        contextValue: { models: { Vendor } },
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.[field]).toEqual({
        id: vendorId.toString(),
        name: vendor.name,
        offeredProducts: [
          {
            pricingOverride,
            discountTiers,
            product: {
              id: productId.toString(),
              name: product.name,
              insuranceType: {
                id: typeId.toString(),
                name: 'Contract test type',
              },
              regions:
                regionState === 'linked'
                  ? [
                      {
                        id: regionId.toString(),
                        name: region.name,
                        countries: region.countries,
                        createdAt: date,
                        updatedAt: date,
                      },
                    ]
                  : [],
            },
          },
        ],
      });
      expect(Vendor.collection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: vendorId },
        expect.objectContaining(write),
        expect.objectContaining({ returnDocument: 'after' }),
      );
    },
  );
});
