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

const generateFields = async ({ subdomain, data }) => {
  const models = await generateModels(subdomain);
  const { usageType, formId } = data;

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
    }
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

  fields: generateFields,
  systemFields: generateSystemFields,
  systemFieldsAvailable: true
};
