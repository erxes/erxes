import { debug } from './configs';
import { generateFieldsFromSchema } from '@erxes/api-utils/src/fieldUtils';
import Customers from './models/Customers';
import Companies from './models/Companies';

export const findCustomer = async doc => {
  let customer;

  if (doc.customerPrimaryEmail) {
    customer = await Customers.findOne({
      $or: [
        { emails: { $in: [doc.customerPrimaryEmail] } },
        { primaryEmail: doc.customerPrimaryEmail }
      ]
    });
  }

  if (!customer && doc.customerPrimaryPhone) {
    customer = await Customers.findOne({
      $or: [
        { phones: { $in: [doc.customerPrimaryPhone] } },
        { primaryPhone: doc.customerPrimaryPhone }
      ]
    });
  }

  if (!customer && doc.customerCode) {
    customer = await Customers.findOne({ code: doc.customerCode });
  }

  return customer;
};

export const findCompany = async doc => {
  let company;

  if (doc.companyPrimaryName) {
    company = await Companies.findOne({
      $or: [
        { names: { $in: [doc.companyPrimaryName] } },
        { primaryName: doc.companyPrimaryName }
      ]
    });
  }

  if (!company && doc.name) {
    company = await Companies.findOne({
      $or: [{ names: { $in: [doc.name] } }, { primaryName: doc.name }]
    });
  }

  if (!company && doc.email) {
    company = await Companies.findOne({
      $or: [{ emails: { $in: [doc.email] } }, { primaryEmail: doc.email }]
    });
  }

  if (!company && doc.phone) {
    company = await Companies.findOne({
      $or: [{ phones: { $in: [doc.phone] } }, { primaryPhone: doc.phone }]
    });
  }

  if (!company && doc.companyPrimaryEmail) {
    company = await Companies.findOne({
      $or: [
        { emails: { $in: [doc.companyPrimaryEmail] } },
        { primaryEmail: doc.companyPrimaryEmail }
      ]
    });
  }

  if (!company && doc.companyPrimaryPhone) {
    company = await Companies.findOne({
      $or: [
        { phones: { $in: [doc.companyPrimaryPhone] } },
        { primaryPhone: doc.companyPrimaryPhone }
      ]
    });
  }

  if (!company && doc.companyCode) {
    company = await Companies.findOne({ code: doc.companyCode });
  }

  return company;
};

export const generateFields = async args => {
  const { contentType } = args;

  let schema: any;
  let fields: Array<{
    _id: number;
    name: string;
    group?: string;
    label?: string;
    type?: string;
    validation?: string;
    options?: string[];
    selectOptions?: Array<{ label: string; value: string }>;
  }> = [];

  switch (contentType) {
    case 'customer':
      schema = Customers.schema;
      break;

    case 'company':
      schema = Companies.schema;
      break;
  }

  if (schema) {
    // generate list using customer or company schema
    fields = [...fields, ...(await generateFieldsFromSchema(schema, ''))];

    for (const name of Object.keys(schema.paths)) {
      const path = schema.paths[name];

      // extend fields list using sub schema fields
      if (path.schema) {
        fields = [
          ...fields,
          ...(await generateFieldsFromSchema(path.schema, `${name}.`))
        ];
      }
    }
  }

  return fields;
};


export const getEnv = ({
  name,
  defaultValue
}: {
  name: string;
  defaultValue?: string;
}): string => {
  const value = process.env[name];

  if (!value && typeof defaultValue !== 'undefined') {
    return defaultValue;
  }

  if (!value) {
    debug.info(`Missing environment variable configuration for ${name}`);
  }

  return value || '';
};
