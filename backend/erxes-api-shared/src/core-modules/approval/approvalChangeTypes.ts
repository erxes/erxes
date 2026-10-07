import { TApprovalConfig } from './types';

/**
 * A change type is `<plugin>:<what>`, so the prefix alone says who carries it
 * out — the same routing the rest of the platform uses for record references.
 */
export const approvalChangePluginName = (changeType: string) =>
  (changeType || '').split(':')[0];

export const normalizeApprovalChangeType = (
  pluginName: string,
  changeType: string,
) => (changeType.includes(':') ? changeType : `${pluginName}:${changeType}`);

export const localApprovalChangeType = (
  pluginName: string,
  changeType: string,
) =>
  changeType.startsWith(`${pluginName}:`)
    ? changeType.slice(pluginName.length + 1)
    : changeType;

export const normalizeApprovalConfig = (
  pluginName: string,
  config: TApprovalConfig,
) => ({
  changeTypes: (config.changeTypes || []).map((changeType) => ({
    ...changeType,
    type: normalizeApprovalChangeType(pluginName, changeType.type),
  })),
});
