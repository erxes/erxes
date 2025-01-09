import { generateFieldsFromSchema } from "@erxes/api-utils/src";
import { generateModels, IModels } from "./connectionResolver";
import { CONVERSATION_INFO } from "./constants";
import { sendCoreMessage } from "./messageBroker";
import { getIntegrationsKinds } from "./utils";

const getTags = async (subdomain: string) => {
  const tags = await sendCoreMessage({
    subdomain,
    action: "tagFind",
    data: {
      type: `inbox:conversation`
    },
    isRPC: true,
    defaultValue: []
  });

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

const getIntegrations = async (models: IModels) => {
  const selectOptions = await models.Integrations.aggregate([
    {
      $project: {
        _id: 0,
        label: "$name",
        value: "$_id"
      }
    }
  ]);

  return {
    _id: Math.random(),
    name: "integrationId",
    label: "Integration",
    selectOptions
  };
};

const getBrands = async (subdomain: string) => {

  const brands = await sendCoreMessage({
    subdomain,
    action: "brands.find",
    data: { query: {} },
    isRPC: true,
    defaultValue: []
  });

  const selectOptions: Array<{ label: string; value: any }> = [];

  for (const brand of brands) {
    selectOptions.push({
      value: brand._id,
      label: brand.name
    });
  }

  return {
    _id: Math.random(),
    name: "brandId",
    label: "Brand",
    selectOptions
  };
};

const getIntegrationsKind = async (models: IModels) => {
  const integrations = await models.Integrations.aggregate([
    {
      $group: {
        _id: "$kind"
      }
    },
    {
      $project: {
        _id: 0,
        kind: "$_id"
      }
    }
  ]);

  const kindsMap = await getIntegrationsKinds()

  const selectOptions = integrations.map(integration => {

    if (kindsMap[integration.kind]) {
      return { label: kindsMap[integration.kind], value: integration.kind }
    }

    return false
  }).filter(Boolean)

  return {
    _id: Math.random(),
    name: "integrationKind",
    label: "Integration Kind",
    selectOptions
  };
};

const generateUsersOptions = async (
  name: string,
  label: string,
  type: string,
  selectionConfig: any
) => {
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
  };
};

const generateContactsOptions = async (
  name: string,
  label: string,
  type: string,
  selectionConfig?: any
) => {
  return {
    _id: Math.random(),
    name,
    label,
    type,
    selectionConfig: {
      ...selectionConfig,
      labelField: "primaryEmail",
      multi: true,
    },
  };
};

const generateFields = async ({ subdomain }) => {
  const models = await generateModels(subdomain);

  const schema: any = models.Conversations.schema;

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

  const tags = await getTags(subdomain);
  const brands = await getBrands(subdomain);
  const integrations = await getIntegrations(models);
  const integrationsKind = await getIntegrationsKind(models);

  fields = [...fields, tags, brands, integrations, integrationsKind];

  const assignedUserOptions = await generateUsersOptions(
    "assignedUserId",
    "Assigned to",
    "user",
    { multi: false }
  );

  const participatedUserOptions = await generateUsersOptions(
    "participatedUserIds",
    "Participating team member",
    "user",
    { multi: true }
  );

  const closedUserOptions = await generateUsersOptions(
    "closedUserId",
    "Resolved by",
    "user",
    { multi: false }
  );

  const customersOptions = await generateContactsOptions(
    "customerId",
    "Customers",
    "contact",
    {
      queryName: "customers",
    }
  );

  fields = [
    ...fields,
    ...[participatedUserOptions, assignedUserOptions, closedUserOptions, customersOptions]
  ];

  return fields;
};

export default {
  types: [
    {
      description: "Conversation details",
      type: "conversation"
    }
  ],
  fields: generateFields,
  systemFields: ({ data: { groupId } }) =>
    CONVERSATION_INFO.ALL.map(e => ({
      text: e.label,
      type: e.field,
      groupId,
      contentType: `inbox:conversation`,
      isDefinedByErxes: true
    }))
};
