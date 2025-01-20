import { generateFieldsFromSchema } from "@erxes/api-utils/src";
import { generateModels, IModels } from "./connectionResolver";
import {
  USER_EXPORT_EXTENDED_FIELDS,
  USER_EXTENDED_FIELDS,
  USER_PROPERTIES_INFO
} from "./constants";
import {
  COMPANY_INFO,
  CUSTOMER_BASIC_INFO,
  DEVICE_PROPERTIES_INFO
} from "./data/modules/coc/constants";
import {
  PRODUCT_EXTEND_FIELDS,
  PRODUCT_INFO
} from "./data/modules/product/constants";
import { escapeRegExp } from "@erxes/api-utils/src/core";
import { sendInboxMessage } from "./messageBroker";
import { fetchEs } from "@erxes/api-utils/src/elasticsearch";
import { fieldsCombinedByContentType } from "./formUtils";

const EXTEND_FIELDS = {
  CUSTOMER: [
    { name: "companiesPrimaryNames", label: "Company Primary Names" },
    { name: "companiesPrimaryEmails", label: "Company Primary Emails" }
  ],
  ALL: [
    { name: "tag", label: "Tag" },
    { name: "ownerEmail", label: "Owner email" }
  ]
};

const generateBrandsOptions = async (
  name: string,
  label: string,
  type: string,
  subdomain: string
) => {
  const models = await generateModels(subdomain);
  const brands = await models.Brands.find({}).lean();

  const options: Array<{ label: string; value: any }> = brands.map(brand => ({
    value: brand._id,
    label: brand.name || brand._id
  }));

  return {
    _id: Math.random(),
    name,
    label,
    type,
    selectOptions: options
  };
};

const generateUsersOptions = async (
  name: string,
  label: string,
  type: string,
  selectionConfig?: any
) => {
  // const models = await generateModels(subdomain);
  // const users = await models.Users.find({}).lean();

  // const options: Array<{ label: string; value: any }> = users.map((user) => ({
  //   value: user._id,
  //   label: user.username || user.email || '',
  // }));

  return {
    _id: Math.random(),
    name,
    label,
    type,
    selectionConfig: {
      ...selectionConfig,
      queryName: "users",
      labelField: "email"
    }
    // selectOptions: options
  };
};

const getFormSubmissionFields = async (subdomain, config) => {
  const models = await generateModels(subdomain);

  const fields = await fieldsCombinedByContentType(models, subdomain, {
    contentType: "core:form_submission",
    config
  });

  return fields.map(field => ({
    ...field,
    label: `form_submission:${field?.label || ""}`
  }));
};

const getIntegrations = async (subdomain: string) => {
  const integrations = await sendInboxMessage({
    subdomain,
    action: "integrations.find",
    data: { query: {} },
    isRPC: true,
    defaultValue: []
  });

  const selectOptions: Array<{ label: string; value: any }> = [];

  for (const integration of integrations) {
    selectOptions.push({
      value: integration._id,
      label: integration.name
    });
  }

  return {
    _id: Math.random(),
    name: "relatedIntegrationIds",
    label: "Related integration",
    selectOptions
  };
};

const getCategories = async (models: IModels) => {
  const categories = await models.ProductCategories.find({})
    .sort({ order: 1 })
    .lean();

  const selectOptions: Array<{ label: string; value: any }> = [];

  for (const category of categories) {
    let step = (category.order || "/").split("/").length - 2;
    if (step < 0) step = 0;

    selectOptions.push({
      value: category._id,
      label: `${".".repeat(step)}${category.code} - ${category.name}`
    });
  }

  return {
    _id: Math.random(),
    name: "categoryId",
    label: "Categories",
    type: "category",
    selectOptions
  };
};

const getTags = async (subdomain: string, type: string) => {
  const models = await generateModels(subdomain);
  const tags = await models.Tags.find({ type });

  const selectOptions: Array<{ label: string; value: any }> = [];

  for (const tag of tags) {
    selectOptions.push({
      value: tag._id,
      label: tag.name
    });
  }

  return {
    _id: Math.random(),
    name: "tagIds",
    label: "Tag",
    type: "tag",
    selectOptions
  };
};

const generateProductsFields = async ({ subdomain, data }) => {
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
  const tags = await getTags(subdomain, "core:product");
  const categories = await getCategories(models);

  fields = [...fields, categories, tags];
  if (schema) {
    fields = [...fields, ...(await generateFieldsFromSchema(schema, ""))];

    for (const name of Object.keys(schema.paths)) {
      const path = schema.paths[name];

      if (path.schema) {
        fields = [
          ...fields,
          ...(await generateFieldsFromSchema(path.schema, `${name}.`))
        ];
      }
    }
  }

  if (usageType === "export") {
    fields = [
      ...fields,
      { _id: Math.random(), name: "subUoms.code", label: "Sub Uom Code" },
      { _id: Math.random(), name: "subUoms.name", label: "Sub Uom Name" },
      {
        _id: Math.random(),
        name: "subUoms.subratio",
        label: "Sub Uoam Ratio"
      }
    ];
  }

  if (["import", "export"].includes(usageType)) {
    fields = [
      ...fields,
      {
        _id: Math.random(),
        name: "categoryName",
        label: "Category Name",
        type: "string"
      }
    ];
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
    case "lead":
      schema = Customers.schema;

    case "customer":
      schema = Customers.schema;
      break;

    case "company":
      schema = Companies.schema;
      break;
  }

  if (schema) {
    // generate list using customer or company schema
    fields = [...fields, ...(await generateFieldsFromSchema(schema, ""))];

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

  if (!usageType || usageType === "export") {
    const aggre = await fetchEs({
      subdomain,
      action: "search",
      index: type === "company" ? "companies" : "customers",
      body: {
        size: 0,
        _source: false,
        aggs: {
          trackedDataKeys: {
            nested: {
              path: "trackedData"
            },
            aggs: {
              fieldKeys: {
                terms: {
                  field: "trackedData.field",
                  size: 10000
                }
              }
            }
          }
        }
      },
      defaultValue: { aggregations: { trackedDataKeys: {} } }
    });

    const aggregations = aggre.aggregations || { trackedDataKeys: {} };
    const buckets = (aggregations.trackedDataKeys.fieldKeys || { buckets: [] })
      .buckets;

    for (const bucket of buckets) {
      fields.push({
        _id: Math.random(),
        name: `trackedData.${bucket.key}`,
        label: bucket.key
      });
    }
  }

  const ownerOptions = await generateUsersOptions("ownerId", "Owner", "user");

  const tags = await getTags(
    subdomain,
    `contacts:${["lead", "visitor"].includes(type) ? "customer" : type}`
  );

  fields = [...fields, tags];

  if (type === "customer" || type === "lead") {
    const { config } = data;

    const integrations = await getIntegrations(subdomain);

    if (config) {
      const formSubmissionFields = await getFormSubmissionFields(
        subdomain,
        config
      );
      fields = [...fields, ...formSubmissionFields];
    }

    fields = [...fields, integrations];

    if (usageType === "import") {
      fields.push({
        _id: Math.random(),
        name: "companiesPrimaryNames",
        label: "Company Primary Names"
      });

      fields.push({
        _id: Math.random(),
        name: "companiesPrimaryEmails",
        label: "Company Primary Emails"
      });
    }
  }

  if (process.env.USE_BRAND_RESTRICTIONS) {
    const brandsOptions = await generateBrandsOptions(
      "scopeBrandIds",
      "Brands",
      "brand",
      subdomain
    );

    fields.push(brandsOptions);
  }

  fields = [...fields, ownerOptions];

  if (usageType === "import") {
    for (const extendField of EXTEND_FIELDS.ALL) {
      fields.push({
        _id: Math.random(),
        ...extendField
      });
    }
  }

  return fields;
};

const relations = type => {
  return [
    {
      name: "customerIds",
      label: "Customers",
      relationType: "core:customer"
    },
    {
      name: "companyIds",
      label: "Companies",
      relationType: "core:company"
    },
    { name: "dealIds", label: "Deals", relationType: "sales:deal" },
    {
      name: "purchaseIds",
      label: "Purchases",
      relationType: "purchases:purchase"
    },
    { name: "taskIds", label: "Tasks", relationType: "tasks:task" },
    { name: "ticketIds", label: "Tickets", relationType: "tickets:ticket" },
    { name: "carIds", label: "Cars", relationType: "cars:car" }
  ].filter(r => r.relationType !== type);
};

export const getFormFields = async (models: IModels, formId: string) => {
  return models.Fields.find({
    contentType: "form",
    isDefinedByErxes: false,
    contentTypeId: formId
  });
};

const generateFieldsUsers = async ({ subdomain, data }) => {
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

  if (usageType && usageType === "import") {
    fields = USER_EXTENDED_FIELDS;
  }

  if (usageType && usageType === "export") {
    fields = USER_EXPORT_EXTENDED_FIELDS;
  }

  if (schema) {
    // generate list using customer or company schema
    fields = [...fields, ...(await generateFieldsFromSchema(schema, ""))];

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

const generateFormFields = async ({ subdomain, data }) => {
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
        group: form ? form.title : "Fields",
        label: formField.text,
        options: formField.options,
        validation: formField.validation,
        type: formField.type
      });
    }
  }

  return fields;
};

export const generateSystemFields = ({ data: { groupId } }) => {
  const coreFields: any = [];

  const serviceName = "core";

  CUSTOMER_BASIC_INFO.ALL.map(e => {
    coreFields.push({
      text: e.label,
      type: e.field,
      canHide: e.canHide,
      validation: e.validation,
      groupId,
      contentType: `${serviceName}:customer`,
      isDefinedByErxes: true
    });
  });

  COMPANY_INFO.ALL.map(e => {
    coreFields.push({
      text: e.label,
      type: e.field,
      canHide: e.canHide,
      validation: e.validation,
      groupId,
      contentType: `${serviceName}:company`,
      isDefinedByErxes: true
    });
  });

  DEVICE_PROPERTIES_INFO.ALL.map(e => {
    coreFields.push({
      text: e.label,
      type: e.field,
      groupId,
      contentType: `${serviceName}:device`,
      isDefinedByErxes: true
    });
  });

  USER_PROPERTIES_INFO.ALL.map(e => {
    coreFields.push({
      text: e.label,
      type: e.field,
      groupId,
      contentType: `${serviceName}:user`,
      isDefinedByErxes: true
    });
  });

  PRODUCT_INFO.ALL.map(e => {
    coreFields.push({
      text: e.label,
      type: e.field,
      groupId,
      contentType: `${serviceName}:product`,
      canHide: false,
      isDefinedByErxes: true
    });
  });

  return coreFields;
};

export default {
  types: [
    {
      description: "Customers",
      type: "customer",
      relations: relations("core:customer")
    },
    {
      description: "Companies",
      type: "company",
      relations: relations("core:company")
    },
    {
      description: "Device properties",
      type: "device"
    },
    {
      description: "Team member",
      type: "user"
    },
    { description: "Products & services", type: "product" }
  ],

  defaultColumnsConfig: {
    customer: [
      { name: "location.country", label: "Country", order: 0 },
      { name: "firstName", label: "First name", order: 1 },
      { name: "lastName", label: "Last name", order: 2 },
      { name: "primaryEmail", label: "Primary email", order: 3 },
      { name: "lastSeenAt", label: "Last seen at", order: 4 },
      { name: "sessionCount", label: "Session count", order: 5 },
      { name: "profileScore", label: "Profile score", order: 6 },
      { name: "middleName", label: "Middle name", order: 7 },
      { name: "score", label: "Score", order: 8 }
    ],
    company: [
      { name: "primaryName", label: "Primary Name", order: 1 },
      { name: "size", label: "Size", order: 2 },
      { name: "links.website", label: "Website", order: 3 },
      { name: "industry", label: "Industries", order: 4 },
      { name: "plan", label: "Plan", order: 5 },
      { name: "lastSeenAt", label: "Last seen at", order: 6 },
      { name: "sessionCount", label: "Session count", order: 7 },
      { name: "score", label: "Score", order: 8 }
    ]
  },
  groupsFilter: async ({ subdomain, data: { config } }) => {
    const { categoryId, isChosen } = config;
    if (!categoryId) {
      return { contentType: "core:product" };
    }

    const models = await generateModels(subdomain);
    const category = await models.ProductCategories.findOne({
      _id: categoryId
    }).lean();
    if (!category) {
      throw new Error(`ProductCategory ${categoryId} not found`);
    }
    const categories = await models.ProductCategories.find({
      order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) }
    }).lean();

    // TODO: get recurcive parent

    return {
      $and: [
        { contentType: "core:product" },
        {
          $or: [
            {
              $and: [
                { "config.categories": { $exists: true } },
                {
                  "config.categories": {
                    $in: categories.map(c => c._id)
                  }
                }
              ]
            },
            { "config.categories": { $exists: false } },
            {
              "config.categories": {
                $size: 0
              }
            }
          ]
        }
      ]
    };
  },

  fields: ({ subdomain, data }) => {
    const { type } = data;

    switch (type) {
      case "lead":
        return generateContactsFields({ subdomain, data });
      case "customer":
        return generateContactsFields({ subdomain, data });

      case "company":
        return generateContactsFields({ subdomain, data });

      case "product":
        return generateProductsFields({ subdomain, data });

      case "form_submission":
        return generateFormFields({ subdomain, data });

      default:
        return generateFieldsUsers({ subdomain, data });
    }
  },

  systemFields: generateSystemFields,
  systemFieldsAvailable: true
};
