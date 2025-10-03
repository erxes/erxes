import {
  generateFieldsFromSchema,
  USER_EXPORT_EXTENDED_FIELDS,
  USER_EXTENDED_FIELDS,
} from 'erxes-api-shared/core-modules';
import { fetchEs, isElasticsearchUp } from 'erxes-api-shared/utils';
import { generateModels, IModels } from '~/connectionResolvers';
import { fieldsCombinedByContentType } from '../utils';
import { EXTEND_FIELDS } from '../constants';
import { PRODUCT_EXTEND_FIELDS } from '~/modules/products/constants';

export const getFormFields = async (models: IModels, formId: string) => {
  return models.Fields.find({
    contentType: 'form',
    isDefinedByErxes: false,
    contentTypeId: formId,
  });
};

const generateBrandsOptions = async (
  name: string,
  label: string,
  type: string,
  subdomain: string,
) => {
  const models = await generateModels(subdomain);
  const brands = await models.Brands.find({}).lean();

  const options: Array<{ label: string; value: any }> = brands.map((brand) => ({
    value: brand._id,
    label: brand.name || brand._id,
  }));

  return {
    _id: Math.random(),
    name,
    label,
    type,
    selectOptions: options,
  };
};

const generateUsersOptions = async (
  name: string,
  label: string,
  type: string,
  selectionConfig?: any,
) => {
  return {
    _id: Math.random(),
    name,
    label,
    type,
    selectionConfig: {
      ...selectionConfig,
      queryName: 'users',
      labelField: 'email',
    },
  };
};

const generateTestOptions = async (
  name: string,
  label: string,
  type: string,
  selectionConfig?: any,
) => {
  return {
    _id: Math.random(),
    name,
    label,
    type,
    selectionConfig: {
      ...selectionConfig,
      queryName: 'customers',
      labelField: 'primaryEmail',
    },
  };
};

const getTags = async (subdomain: string, type: string) => {
  const models = await generateModels(subdomain);
  const tags = await models.Tags.find({ type });

  const selectOptions: Array<{ label: string; value: any }> = [];

  for (const tag of tags) {
    selectOptions.push({
      value: tag._id,
      label: tag.name,
    });
  }

  return {
    _id: Math.random(),
    name: 'tagIds',
    label: 'Tag',
    type: 'tag',
    selectOptions,
  };
};

const getCategories = async (models: IModels) => {
  const categories = await models.ProductCategories.find({})
    .sort({ order: 1 })
    .lean();

  const selectOptions: Array<{ label: string; value: any }> = [];

  for (const category of categories) {
    let step = (category.order || '/').split('/').length - 2;
    if (step < 0) {
      step = 0;
    }

    selectOptions.push({
      value: category._id,
      label: `${'.'.repeat(step)}${category.code} - ${category.name}`,
    });
  }

  return {
    _id: Math.random(),
    name: 'categoryId',
    label: 'Categories',
    type: 'category',
    selectOptions,
  };
};

const getIntegrations = async (subdomain: string) => {
  // const integrations = await sendInboxMessage({
  //   subdomain,
  //   action: "integrations.find",
  //   data: { query: {} },
  //   isRPC: true,
  //   defaultValue: []
  // });
  const integrations: any = [];

  const selectOptions: Array<{ label: string; value: any }> = [];

  for (const integration of integrations) {
    selectOptions.push({
      value: integration._id,
      label: integration.name,
    });
  }

  return {
    _id: Math.random(),
    name: 'relatedIntegrationIds',
    label: 'Related integration',
    selectOptions,
  };
};

const getFormSubmissionFields = async (subdomain, config) => {
  const models = await generateModels(subdomain);

  const fields = await fieldsCombinedByContentType(models, subdomain, {
    contentType: 'core:form_submission',
    config,
  });

  return fields.map((field) => ({
    ...field,
    label: `form_submission:${field?.label || ''}`,
  }));
};

export const generateFieldsUsers = async ({ subdomain, data }) => {
  const models = await generateModels(subdomain);
  const { usageType } = data;

  const { Users } = models;

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

  schema = Users.schema;

  if (usageType && usageType === 'import') {
    fields = USER_EXTENDED_FIELDS;
  }

  if (usageType && usageType === 'export') {
    fields = USER_EXPORT_EXTENDED_FIELDS;
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
          ...(await generateFieldsFromSchema(path.schema, `${name}.`)),
        ];
      }
    }
  }

  return fields;
};

export const generateFormFields = async ({ subdomain, data }) => {
  const models = await generateModels(subdomain);
  const { config = {} } = data;
  const { formId } = config;

  const fields: Array<{
    _id: number;
    name: string;
    group?: string;
    label?: string;
    type?: string;
    validation?: string;
    options?: string[];
    selectOptions?: Array<{ label: string; value: string }>;
  }> = [];

  if (formId) {
    const formFieldsValues = await getFormFields(models, formId);
    const form = await models.Forms.findOne({ _id: formId });

    for (const formField of formFieldsValues) {
      fields.push({
        _id: Math.random(),
        name: formField._id,
        group: form ? form.title : 'Fields',
        label: formField.text,
        options: formField.options,
        validation: formField.validation,
        type: formField.type,
      });
    }
  }

  return fields;
};

export const generateContactsFields = async ({ subdomain, data }) => {
  const { type, usageType } = data;

  const models = await generateModels(subdomain);

  const { Customers, Companies } = models;

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

  switch (type) {
    case 'lead':
      schema = Customers.schema;

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
          ...(await generateFieldsFromSchema(path.schema, `${name}.`)),
        ];
      }
    }
  }

  console.time('trackData');

  if ((!usageType || usageType === 'export') && (await isElasticsearchUp())) {
    const aggre = await fetchEs({
      subdomain,
      action: 'search',
      index: type === 'company' ? 'companies' : 'customers',
      body: {
        size: 0,
        _source: false,
        aggs: {
          trackedDataKeys: {
            nested: {
              path: 'trackedData',
            },
            aggs: {
              fieldKeys: {
                terms: {
                  field: 'trackedData.field',
                  size: 10000,
                },
              },
            },
          },
        },
      },
      defaultValue: { aggregations: { trackedDataKeys: {} } },
    });

    const aggregations = aggre.aggregations || { trackedDataKeys: {} };
    const { buckets = [] } = aggregations.trackedDataKeys.fieldKeys || {
      buckets: [],
    };

    for (const bucket of buckets) {
      fields.push({
        _id: Math.random(),
        name: `trackedData.${bucket.key}`,
        label: bucket.key,
      });
    }
  }
  console.timeEnd('trackData');

  const ownerOptions = await generateUsersOptions('ownerId', 'Owner', 'user');

  const tags = await getTags(
    subdomain,
    `contacts:${['lead', 'visitor'].includes(type) ? 'customer' : type}`,
  );

  fields = [...fields, tags];

  if (type === 'customer' || type === 'lead') {
    const { config } = data;

    const integrations = await getIntegrations(subdomain);

    if (config) {
      const formSubmissionFields = await getFormSubmissionFields(
        subdomain,
        config,
      );
      fields = [...fields, ...formSubmissionFields];
    }

    fields = [...fields, integrations];

    if (usageType === 'import') {
      fields.push({
        _id: Math.random(),
        name: 'companiesPrimaryNames',
        label: 'Company Primary Names',
      });

      fields.push({
        _id: Math.random(),
        name: 'companiesPrimaryEmails',
        label: 'Company Primary Emails',
      });
    }
  }

  if (process.env.USE_BRAND_RESTRICTIONS) {
    const brandsOptions = await generateBrandsOptions(
      'scopeBrandIds',
      'Brands',
      'brand',
      subdomain,
    );

    fields.push(brandsOptions);
  }

  const testOptions = await generateTestOptions('testId', 'Test', 'user');

  fields = [...fields, ownerOptions, testOptions];

  if (usageType === 'import') {
    for (const extendField of EXTEND_FIELDS.ALL) {
      fields.push({
        _id: Math.random(),
        ...extendField,
      });
    }
  }

  return fields;
};

export const generateProductsFields = async ({ subdomain, data }) => {
  const { usageType } = data;
  const models = await generateModels(subdomain);

  const schema = models.Products.schema as any;

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

  fields = PRODUCT_EXTEND_FIELDS;
  const tags = await getTags(subdomain, 'core:product');
  const categories = await getCategories(models);

  fields = [...fields, categories, tags];
  if (schema) {
    fields = [...fields, ...(await generateFieldsFromSchema(schema, ''))];

    for (const name of Object.keys(schema.paths)) {
      const path = schema.paths[name];

      if (path.schema) {
        fields = [
          ...fields,
          ...(await generateFieldsFromSchema(path.schema, `${name}.`)),
        ];
      }
    }
  }

  if (usageType === 'export') {
    fields = [
      ...fields,
      { _id: Math.random(), name: 'subUoms.code', label: 'Sub Uom Code' },
      { _id: Math.random(), name: 'subUoms.name', label: 'Sub Uom Name' },
      {
        _id: Math.random(),
        name: 'subUoms.subratio',
        label: 'Sub Uoam Ratio',
      },
    ];
  }

  if (['import', 'export'].includes(usageType)) {
    fields = [
      ...fields,
      {
        _id: Math.random(),
        name: 'categoryName',
        label: 'Category Name',
        type: 'string',
      },
    ];
  }

  return fields;
};
