type TAiAgentField = {
  fieldName?: string;
  dataType?: string;
  options?: { value?: string }[];
};

type TAiAgentOutputConfig = {
  goalType?: string;
  captureFields?: TAiAgentField[];
  objectFields?: TAiAgentField[];
  topics?: { id?: string; topicName?: string }[];
};

type TSplitOutputVariable = {
  name: string;
  label: string;
  type: string;
  options?: { label: string; value: string }[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const toOutputConfig = (config: unknown): TAiAgentOutputConfig =>
  isRecord(config) ? config : {};

const toVariable = ({
  fieldName,
  dataType,
  options = [],
}: TAiAgentField): TSplitOutputVariable[] => {
  // Objects and lists are not compared as one value.
  if (!fieldName || dataType === 'object' || dataType === 'array') {
    return [];
  }

  const values = options
    .map(({ value }) => value)
    .filter((value): value is string => !!value);

  return [
    {
      name: `attributes.${fieldName}`,
      label: fieldName,
      type:
        dataType === 'number' || dataType === 'boolean' ? dataType : 'string',
      ...(dataType === 'option' && {
        options: values.map((value) => ({ label: value, value })),
      }),
    },
  ];
};

/** What an AI agent outputs that a split can compare, by its goal. */
export const getAiAgentOutputVariables = (
  config: unknown,
): TSplitOutputVariable[] => {
  const { goalType, captureFields, objectFields, topics } =
    toOutputConfig(config);

  if (goalType === 'splitTopic') {
    return [
      {
        name: 'topicId',
        label: 'topic',
        type: 'string',
        options: (topics || [])
          .filter(({ id }) => !!id)
          .map(({ id = '', topicName }) => ({
            label: topicName || id,
            value: id,
          })),
      },
    ];
  }

  return (
    (goalType === 'classification' ? objectFields : captureFields) || []
  ).flatMap(toVariable);
};
