import { IModels } from '~/connectionResolvers';
import {
  CallOperator,
  ICallIntegrationDocument,
} from '@/integrations/call/@types/integrations';
import {
  ICdrOperatorParams,
  resolveCdrOperator,
} from '@/integrations/call/services/cdrUtils';

export interface IOperatorMatch {
  integration: ICallIntegrationDocument;
  operator: CallOperator;
  extension: string;
}

export const findPeerIntegrations = (
  models: IModels,
  integration: ICallIntegrationDocument,
): Promise<ICallIntegrationDocument[]> =>
  models.CallIntegrations.findPeers(integration);

export const matchOperatorByExtension = (
  peers: ICallIntegrationDocument[],
  extension?: string,
): IOperatorMatch | undefined => {
  if (!extension) return undefined;

  for (const integration of peers) {
    const operator = (integration.operators || []).find(
      (op) => op.gsUsername === extension,
    );
    if (operator) return { integration, operator, extension };
  }

  return undefined;
};

export const matchCdrOperator = (
  peers: ICallIntegrationDocument[],
  params: ICdrOperatorParams,
): { match?: IOperatorMatch; extension?: string } => {
  let extension: string | undefined;

  for (const integration of peers) {
    const resolved = resolveCdrOperator(integration.operators, params);
    extension = extension || resolved.extension;
    if (resolved.operator && resolved.extension) {
      return {
        match: {
          integration,
          operator: resolved.operator,
          extension: resolved.extension,
        },
        extension: resolved.extension,
      };
    }
  }

  return { extension };
};

export const inboxIdForExtension = (
  peers: ICallIntegrationDocument[],
  extension: string | undefined,
  fallbackInboxId: string,
): string =>
  matchOperatorByExtension(peers, extension)?.integration.inboxId ||
  fallbackInboxId;
