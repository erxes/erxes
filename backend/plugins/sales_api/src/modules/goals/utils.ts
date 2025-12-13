import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { generateModels, IModels } from '../../connectionResolvers';
import { IUserDocument } from 'erxes-api-shared/src/core-types';
import { IGoalDocument } from './@types/goals';

export const countDocuments = async (
  subdomain: string,
  type: string,
  _ids: string[]
) => {
  const [pluginName, contentType] = type.split(':');

  return sendTRPCMessage({
    subdomain,
    pluginName,
    module: 'goal',
    action: 'count',
    input: {
      type: contentType,
      _ids
    },
    defaultValue: 0
  });
};

export const goalObject = async (
  subdomain: string,
  type: string,
  goalIds: string[],
  targetIds: string[]
) => {
  const [pluginName, contentType] = type.split(':');

  return sendTRPCMessage({
    subdomain,
    pluginName,
    module: 'goal',
    action: 'goalObject',
    input: {
      goalIds,
      targetIds,
      type: contentType
    },
    defaultValue: {}
  });
};

export const fixRelatedItems = async ({
  subdomain,
  type,
  sourceId,
  destId,
  action
}: {
  subdomain: string;
  type: string;
  sourceId: string;
  destId?: string;
  action: string;
}) => {
  const [pluginName, contentType] = type.split(':');

  await sendTRPCMessage({
    subdomain,
    pluginName,
    module: 'goal',
    action: 'fixRelatedItems',
    input: {
      sourceId,
      destId,
      type: contentType,
      action
    }
  });
};
