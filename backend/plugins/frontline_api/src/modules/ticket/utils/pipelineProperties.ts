import { sendTRPCMessage } from 'erxes-api-shared/utils';

const TICKET_PROPERTY_CONTENT_TYPE = 'frontline:ticket';

export const validatePipelinePropertyIds = async (
  subdomain: string,
  propertyIds?: string[] | null,
): Promise<string[]> => {
  const uniquePropertyIds = [...new Set(propertyIds || [])].filter(Boolean);

  if (!uniquePropertyIds.length) {
    return [];
  }

  const fields: Array<{ _id: string }> = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'fields',
    action: 'find',
    input: {
      query: {
        _id: { $in: uniquePropertyIds },
        contentType: TICKET_PROPERTY_CONTENT_TYPE,
      },
      projection: { _id: 1 },
    },
    defaultValue: [],
  });

  const validIds = new Set(fields.map(({ _id }) => String(_id)));

  return uniquePropertyIds.filter((id) => validIds.has(id));
};
