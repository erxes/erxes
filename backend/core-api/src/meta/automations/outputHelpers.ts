import { resolveFromSourceField } from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const resolveUserLabelByIdField = (sourceField: string) =>
  resolveFromSourceField(
    sourceField,
    async ({ subdomain, value, defaultValue }) => {
      if (!value) {
        return defaultValue ?? '';
      }

      const user = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'users',
        action: 'findOne',
        input: { _id: value },
        defaultValue: null,
      });

      return user?.details?.fullName || user?.email || defaultValue || '';
    },
  );
