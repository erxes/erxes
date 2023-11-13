import { generateFieldsFromSchema } from '@erxes/api-utils/src';
import { generateModels } from './connectionResolver';
import { sendContactsMessage } from './messageBroker';

const generateCustomerOptions = async (
  subdomain: string,
  name: string,
  label: string,
  type: string
) => {
  const contacts = await sendContactsMessage({
    subdomain,
    action: `${name}.findActiveCustomers`,
    data: {
      selector: {},
      fields: {
        _id: 1,
        primaryEmail: 1,
        primaryName: 1,
        firstName: 1,
        lastName: 1
      },
      limit: 20
    },
    isRPC: true,
    defaultValue: []
  });

  const options: Array<{ label: string; value: any }> = contacts.map(
    ({ _id, primaryEmail, primaryName, firstName, lastName }) => ({
      value: _id,
      label: `${
        primaryEmail || primaryName || (firstName && lastName)
          ? `${firstName} ${lastName}`
          : ''
      }`
    })
  );

  return {
    _id: Math.random(),
    name,
    label,
    type,
    selectOptions: options
  };
};

const generateFields = async ({ subdomain, data }) => {
  const { type, usageType } = data;

  const models = await generateModels(subdomain);

  const { ConversationMessages, Comments } = models;

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
    case 'messages':
      schema = ConversationMessages.schema;
      break;

    case 'comments':
      schema = Comments.schema;
      break;
  }

  fields = [];

  if (schema) {
    fields = [...fields, ...(await generateFieldsFromSchema(schema, ''))];

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

  fields = [
    ...fields,
    ...[
      { _id: Math.random(), name: 'content', label: 'Content', type: 'String' }
    ]
  ];

  // if (usageType === 'automation') {

  //   fields = [

  //   ]

  // }

  return fields;
};

export default {
  types: [
    { description: 'Facebook Messages', type: 'messages' },
    { description: 'Facebook Comments', type: 'comments' }
  ],
  fields: generateFields
};
