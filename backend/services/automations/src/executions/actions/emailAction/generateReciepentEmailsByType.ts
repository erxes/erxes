import {
  sendCoreModuleProducer,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { extractValidEmails } from './utils';
import { TAutomationProducers } from 'erxes-api-shared/core-modules';

export class EmailResolver {
  private subdomain: string;
  private execution?: any;
  private target?: any;

  constructor({
    subdomain,
    execution,
    target,
  }: {
    subdomain: string;
    serviceName?: string;
    contentType?: string;
    execution?: any;
    target?: any;
  }) {
    this.subdomain = subdomain;
    this.execution = execution;
    this.target = target;
  }

  async resolveTeamMemberEmails(params: any) {
    const users = await sendTRPCMessage({
      method: 'query',
      pluginName: 'core',
      module: 'users',
      action: 'find',
      input: { query: { ...params } },
      defaultValue: [],
    });

    return extractValidEmails(users, 'email');
  }

  async resolveSegmentEmails(
    pluginName: string,
    contentType: string,
  ): Promise<string[]> {
    const { triggerConfig, targetId } = this.execution || {};

    const contentTypeIds = await sendTRPCMessage({
      method: 'query',
      pluginName: 'core',
      module: 'segments',
      action: 'fetchSegment',
      input: {
        segmentId: triggerConfig.contentId,
        options: {
          defaultMustSelector: [{ match: { _id: targetId } }],
        },
      },
      defaultValue: [],
    });

    if (contentType === 'user') {
      return this.resolveTeamMemberEmails({ _id: { $in: contentTypeIds } });
    }

    return await sendCoreModuleProducer({
      moduleName: 'automations',
      pluginName,
      producerName: TAutomationProducers.REPLACE_PLACEHOLDERS,
      input: {
        type: contentType!,
        config: {
          [`${contentType}Ids`]: contentTypeIds,
        },
      },
      defaultValue: {},
    });
  }

  async resolvePlaceholderEmails(
    { pluginName, contentType }: { pluginName: string; contentType: string },
    value: string,
    key: string,
  ): Promise<string[]> {
    let emails: string[] = [];
    const matches = (value || '').match(/\{\{\s*([^}]+)\s*\}\}/g);
    const attributes =
      matches?.map((match) => match.replace(/\{\{\s*|\s*\}\}/g, '')) || [];

    const relatedValueProps: Record<string, any> = {};

    if (!attributes.length) return [];

    for (const attribute of attributes) {
      if (attribute === 'triggerExecutors') {
        const executorEmails = await this.resolveSegmentEmails(
          pluginName,
          contentType,
        );
        emails = [...emails, ...executorEmails];
      }

      relatedValueProps[attribute] = {
        key: 'email',
        filter: {
          key: 'registrationToken',
          value: null,
        },
      };

      if (['customers', 'companies'].includes(attribute)) {
        relatedValueProps[attribute] = { key: 'primaryEmail' };
        if (this.target) this.target[attribute] = null;
      }
    }
    const replacedContent = await sendCoreModuleProducer({
      moduleName: 'automations',
      pluginName,
      producerName: TAutomationProducers.REPLACE_PLACEHOLDERS,
      input: {
        target: { ...(this.target || {}), type: contentType },
        config: { [key]: value },
        relatedValueProps,
      },
      defaultValue: {},
    });

    const generatedEmails = extractValidEmails(replacedContent[key]);
    return [...emails, ...generatedEmails];
  }
}
