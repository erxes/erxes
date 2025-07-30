import {
  sendCommonMessage,
  sendCoreMessage,
  sendSegmentsMessage,
} from "../../messageBroker";
import { extractValidEmails } from "./utils";

export class GenerateEmailsByType {
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

  async getTeamMemberEmails(params: any) {
    const users = await sendCoreMessage({
      subdomain: this.subdomain,
      action: "users.find",
      data: { query: { ...params } },
      isRPC: true,
    });

    return extractValidEmails(users, "email");
  }

  async getSegmentEmails(
    serviceName: string,
    contentType: string
  ): Promise<string[]> {
    const { triggerConfig, targetId } = this.execution || {};

    const contentTypeIds = await sendSegmentsMessage({
      subdomain: this.subdomain,
      action: "fetchSegment",
      data: {
        segmentId: triggerConfig.contentId,
        options: {
          defaultMustSelector: [{ match: { _id: targetId } }],
        },
      },
      isRPC: true,
      defaultValue: [],
    });

    if (contentType === "user") {
      return this.getTeamMemberEmails({ _id: { $in: contentTypeIds } });
    }

    return await sendCommonMessage({
      subdomain: this.subdomain,
      serviceName,
      action: "automations.getRecipientsEmails",
      data: {
        type: contentType!,
        config: {
          [`${contentType}Ids`]: contentTypeIds,
        },
      },
      isRPC: true,
    });
  }

  async getAttributionEmails(
    { serviceName, contentType }: { serviceName: string; contentType: string },
    value: string,
    key: string
  ): Promise<string[]> {
    let emails: string[] = [];
    const matches = (value || "").match(/\{\{\s*([^}]+)\s*\}\}/g);
    const attributes =
      matches?.map((match) => match.replace(/\{\{\s*|\s*\}\}/g, "")) || [];

    const relatedValueProps: Record<string, any> = {};

    if (!attributes.length) return [];

    console.log({ attributes });

    for (const attribute of attributes) {
      if (attribute === "triggerExecutors") {
        const executorEmails = await this.getSegmentEmails(
          serviceName,
          contentType
        );
        emails = [...emails, ...executorEmails];
      }

      relatedValueProps[attribute] = {
        key: "email",
        filter: {
          key: "registrationToken",
          value: null,
        },
      };

      if (["customers", "companies"].includes(attribute)) {
        relatedValueProps[attribute] = { key: "primaryEmail" };
        if (this.target) this.target[attribute] = null;
      }
    }

    const replacedContent = await sendCommonMessage({
      subdomain: this.subdomain,
      serviceName,
      action: "automations.replacePlaceHolders",
      data: {
        target: { ...(this.target || {}), type: contentType },
        config: { [key]: value },
        relatedValueProps,
      },
      isRPC: true,
      defaultValue: {},
    });

    const generatedEmails = extractValidEmails(replacedContent[key]);
    return [...emails, ...generatedEmails];
  }
}
