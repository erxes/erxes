import {
  getPlugin,
  getPlugins,
  IAfterProcessRule,
  sendWorkerMessage,
  TAfterProcessRule,
} from 'erxes-api-shared/utils';
import { AfterProcessProps } from '~/types';

interface WorkerMessage {
  pluginName: string;
  queueName: string;
  jobName: string;
  subdomain: string;
  data: any;
}

type ProcessHandlerProps = {
  subdomain: string;
  pluginName: string;
  rule: IAfterProcessRule;
  payload: any;
  contentType?: string;
  action: string;
};

function getAllKeys(obj, prefix = '') {
  let keys: string[] = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    keys.push(fullKey);
    if (
      typeof obj[key] === 'object' &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    }
  }
  return keys;
}

const sendProcessMessage = async (message: WorkerMessage): Promise<void> => {
  try {
    sendWorkerMessage(message);
  } catch (error) {
    console.error(
      `Failed to send worker message: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
  }
};

const handleAfterMutation = ({
  subdomain,
  pluginName,
  rule,
  payload,
}: ProcessHandlerProps): void => {
  const { mutationNames = [] } = rule as TAfterProcessRule['AfterMutation'];
  const { mutationName } = payload || {};

  if (mutationNames.includes(mutationName)) {
    sendProcessMessage({
      pluginName,
      queueName: 'afterProcess',
      jobName: 'onAfterMutation',
      subdomain,
      data: payload,
    });
  }
};

const handleUpdatedDocument = ({
  subdomain,
  pluginName,
  rule,
  payload,
  contentType,
}: ProcessHandlerProps): void => {
  const { contentTypes, when } = rule as TAfterProcessRule['UpdatedDocument'];

  if (contentType && contentTypes.includes(contentType)) {
    let shouldSend = true;

    if (when) {
      const { updatedFields = [], removedFields = [] } =
        payload.updateDescription;

      const hasRemovedFieldsExists = getAllKeys(removedFields).some((key) =>
        (when.fieldsRemoved || []).includes(key),
      );
      const hasUpdatedFieldsExists = getAllKeys(updatedFields).some((key) =>
        (when.fieldsUpdated || []).includes(key),
      );

      shouldSend = hasRemovedFieldsExists || hasUpdatedFieldsExists;
    }

    if (shouldSend) {
      sendProcessMessage({
        pluginName,
        queueName: 'afterProcess',
        jobName: 'onDocumentUpdated',
        subdomain,
        data: { ...payload, contentType },
      });
    }
  }
};

const handleCreateDocument = ({
  subdomain,
  pluginName,
  rule,
  payload,
  contentType,
}: ProcessHandlerProps): void => {
  const { when, contentTypes } = rule as TAfterProcessRule['CreateDocument'];
  if (contentTypes.includes(contentType || '')) {
    const document = payload?.fullDocument;
    let shouldSend = true;
    if (when) {
      const { fieldsWith = [] } = when || {};
      const hasFieldsExists = getAllKeys(document).some((key) =>
        fieldsWith.includes(key),
      );
      shouldSend = hasFieldsExists;
    }

    if (shouldSend) {
      sendProcessMessage({
        pluginName,
        queueName: 'afterProcess',
        jobName: 'onDocumentCreated',
        subdomain,
        data: { ...payload, contentType },
      });
    }
  }
};

const handleAfterAPIRequest = ({
  subdomain,
  pluginName,
  rule,
  payload,
}: ProcessHandlerProps): void => {
  const { paths = [] } = rule as TAfterProcessRule['AfterAPIRequest'];
  const { path } = payload || {};
  if (paths.includes(path)) {
    sendProcessMessage({
      pluginName,
      queueName: 'afterProcess',
      jobName: 'onAfterApiRequest',
      subdomain,
      data: payload,
    });
  }
};

const handleAfterAuth = ({
  subdomain,
  pluginName,
  rule,
  payload,
  action,
}: ProcessHandlerProps): void => {
  const { types = [] } = rule as TAfterProcessRule['AfterAuth'];

  if (types.includes(action)) {
    sendProcessMessage({
      pluginName,
      queueName: 'afterProcess',
      jobName: 'onAfterAuth',
      subdomain,
      data: {
        processId: payload.processId,
        userId: payload.userId,
        email: payload.email,
        result: payload.result,
      },
    });
  }
};

export const handleAfterProcess = async (
  subdomain: string,
  { source, action, payload, contentType }: AfterProcessProps,
): Promise<void> => {
  try {
    const pluginNames = await getPlugins();

    for (const pluginName of pluginNames) {
      const plugin = await getPlugin(pluginName);

      if (!plugin?.config?.meta?.afterProcess) {
        continue;
      }

      const { rules = [] } = plugin.config.meta.afterProcess || {};

      const props = {
        subdomain,
        pluginName,
        payload,
        action,
      };
      for (const rule of rules as IAfterProcessRule[]) {
        if (
          rule.type === 'createdDocument' &&
          source === 'mongo' &&
          action === 'create'
        ) {
          handleCreateDocument({ ...props, rule, contentType });
          continue;
        }
        if (
          rule.type === 'updatedDocument' &&
          source === 'mongo' &&
          action === 'update'
        ) {
          handleUpdatedDocument({ ...props, rule, contentType });
          continue;
        }

        if (rule.type === 'afterAPIRequest') {
          handleAfterAPIRequest({ ...props, rule });
          continue;
        }

        if (rule.type === 'afterAuth') {
          handleAfterAuth({ ...props, rule });
          continue;
        }

        if (rule.type === 'afterMutation') {
          handleAfterMutation({ ...props, rule });
          continue;
        }
      }
    }
  } catch (error) {
    console.error(
      `Error in handleAfterProcess: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
    throw error;
  }
};
