import { startPayments } from '../common-modules/payment/worker';
import type {
  IPropertyMeta,
  LogsConfigs,
  SegmentConfigs,
  TApprovalConfig,
  TRecordReferencesConfig,
  IAgentPluginMeta,
  AutomationConfigs,
  IContactFieldsMeta,
  ImportExportConfigs,
  TTemplatePartsConfig,
  TTemplate,
} from '../core-modules';
import {
  initApproval,
  initPropertyProducers,
  initRecordReferences,
  initSegmentProducers,
  startAutomations,
  validateAgentPluginMeta,
  startImportExportWorker,
  initTemplateParts,
} from '../core-modules';
import { IPermissionConfig } from '../core-types';
import { startBeforeResolvers } from './apollo';
import { BeforeResolversConfig } from './apollo/beforeResolvers';
import { AfterProcessConfigs, startAfterProcess } from './logs';
import { initializePluginConfig } from './service-discovery';
import { Express } from 'express';

export type IPluginMeta = {
  automations?: AutomationConfigs;
  segments?: SegmentConfigs;
  logs?: LogsConfigs;
  afterProcess?: AfterProcessConfigs;
  payments?: any;
  notifications?: any;
  tags?: any;
  documents?: {
    types: {
      label: string;
      contentType: string;
    }[];
  };
  properties?: IPropertyMeta;
  references?: TRecordReferencesConfig;
  approval?: TApprovalConfig;
  permissions?: IPermissionConfig;
  beforeResolvers?: BeforeResolversConfig;
  importExport?: ImportExportConfigs;
  relations?: {
    subscribedTypes: string[];
  };
  contactFields?: IContactFieldsMeta;
  agent?: IAgentPluginMeta;
  templates?: TTemplate[];
  templateParts?: TTemplatePartsConfig;
};

export const initPluginMeta = async (
  app: Express,
  name: string,
  meta: IPluginMeta,
) => {
  const {
    automations,
    segments,
    afterProcess,
    notifications,
    payments,
    beforeResolvers,
    references,
    importExport,
    approval,
    properties,
    agent,
    templateParts,
  } = meta || {};

  for (const { skill, reason } of validateAgentPluginMeta(agent).rejections) {
    console.warn(
      `[agent] ${name} ${
        skill ? `skill "${skill}"` : 'metadata'
      } ignored: ${reason}`,
    );
  }

  if (beforeResolvers) {
    await startBeforeResolvers(app, name, beforeResolvers);
  }

  if (afterProcess) {
    await startAfterProcess(app, name, afterProcess);
  }

  if (references) {
    await initRecordReferences(app, name, references);
  }

  if (approval) {
    await initApproval(app, name, approval);
  }

  if (templateParts) {
    initTemplateParts(app, name, templateParts);
  }

  if (automations) {
    await startAutomations(app, name, automations);
  }

  if (segments) {
    await initSegmentProducers(app, name, segments);
  }

  if (properties?.valueUsage) {
    initPropertyProducers(app, properties.valueUsage);
  }

  if (notifications) {
    await initializePluginConfig(name, 'notifications', notifications);
  }

  if (importExport) {
    await startImportExportWorker({
      pluginName: name,
      config: importExport,
      app,
    });
  }

  if (payments) {
    await startPayments(name, payments);
  }
};
