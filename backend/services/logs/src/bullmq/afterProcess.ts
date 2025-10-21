import { TAfterProcessProducers } from 'erxes-api-shared/core-modules';
import {
  getPlugin,
  getPlugins,
  IAfterProcessRule,
  sendCoreModuleProducer,
  TAfterProcessRule,
} from 'erxes-api-shared/utils';
import { AfterProcessProps } from '~/types';

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

const handleAfterMutation = ({
  subdomain,
  pluginName,
  rule,
  payload,
}: ProcessHandlerProps): void => {
  const { mutationNames = [] } = rule as TAfterProcessRule['AfterMutation'];
  const { mutationName } = payload || {};

  if (mutationNames.includes(mutationName)) {
    sendCoreModuleProducer({
      pluginName,
      moduleName: 'afterProcess',
      producerName: TAfterProcessProducers.AFTER_MUTATION,
      input: payload,
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
      sendCoreModuleProducer({
        pluginName,
        moduleName: 'afterProcess',
        producerName: TAfterProcessProducers.AFTER_DOCUMENT_UPDATED,
        input: { ...payload, contentType },
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
      sendCoreModuleProducer({
        pluginName,
        moduleName: 'afterProcess',
        producerName: TAfterProcessProducers.AFTER_DOCUMENT_CREATED,
        input: { ...payload, contentType },
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
    sendCoreModuleProducer({
      pluginName,
      moduleName: 'afterProcess',
      producerName: TAfterProcessProducers.AFTER_API_REQUEST,
      input: payload,
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
    sendCoreModuleProducer({
      pluginName,
      moduleName: 'afterProcess',
      producerName: TAfterProcessProducers.AFTER_AUTH,
      input: {
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
