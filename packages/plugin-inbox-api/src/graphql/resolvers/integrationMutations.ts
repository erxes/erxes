import * as telemetry from "erxes-telemetry";

import { getUniqueValue } from "@erxes/api-utils/src/core";
import { putActivityLog } from "@erxes/api-utils/src/logUtils";

import {
  IIntegration,
  IIntegrationDocument,
  IMessengerData,
  IUiOptions,
  ITicketData
} from "../../models/definitions/integrations";

import { IExternalIntegrationParams } from "../../models/Integrations";

import { debugError, debugInfo } from "@erxes/api-utils/src/debuggers";
import {
  sendIntegrationsMessage,
  sendCoreMessage,
  sendCommonMessage
} from "../../messageBroker";

import { MODULE_NAMES } from "../../constants";
import { putCreateLog, putDeleteLog, putUpdateLog } from "../../logUtils";

import { checkPermission } from "@erxes/api-utils/src/permissions";
import { IContext, IModels } from "../../connectionResolver";
import { isServiceRunning } from "../../utils";

interface IEditIntegration extends IIntegration {
  _id: string;
}

interface IArchiveParams {
  _id: string;
  status: boolean;
}

interface ISmsParams {
  integrationId: string;
  content: string;
  to: string;
}

const createIntegration = async (
  models: IModels,
  subdomain: string,
  doc: IIntegration,
  integration: IIntegrationDocument,
  user: any,
  type: string
) => {
  if (doc.channelIds) {
    await models.Channels.updateMany(
      { _id: { $in: doc.channelIds } },
      { $push: { integrationIds: integration._id } }
    );
  }

  await putCreateLog(
    models,
    subdomain,
    {
      type: MODULE_NAMES.INTEGRATION,
      newData: { ...doc, createdUserId: user._id, isActive: true },
      object: integration
    },
    user
  );

  telemetry.trackCli("integration_created", { type });

  await sendCoreMessage({
    subdomain,
    action: "registerOnboardHistory",
    data: {
      type: `${type}IntegrationCreated`,
      user
    }
  });

  return integration;
};

const editIntegration = async (
  subdomain: string,
  fields: IIntegration,
  integration: IIntegrationDocument,
  user,
  updated: IIntegrationDocument,
  models: IModels
) => {
  await models.Channels.updateMany(
    { integrationIds: integration._id },
    { $pull: { integrationIds: integration._id } }
  );

  if (fields.channelIds) {
    await models.Channels.updateMany(
      { _id: { $in: fields.channelIds } },
      { $push: { integrationIds: integration._id } }
    );
  }

  await putUpdateLog(
    models,
    subdomain,
    {
      type: MODULE_NAMES.INTEGRATION,
      object: integration,
      newData: fields,
      updatedDocument: updated
    },
    user
  );

  return updated;
};

interface IOnboardingPrams {
  brandName: string;
  logo?: string;
  color?: string;
  name: string;
}

interface IOnboardingPramsEdit extends IOnboardingPrams {
  _id: string;
  brandId: string;
}

const integrationMutations = {
  /**
   * Creates a new messenger onboarding
   */
  async integrationsCreateMessengerOnboarding(
    _root,
    doc: IOnboardingPramsEdit,
    { user, models, subdomain }: IContext
  ) {
    const integrationsCount = await models.Integrations.find(
      {}
    ).countDocuments();

    if (integrationsCount > 0) {
      return models.Integrations.findOne();
    }
    const brand = await sendCoreMessage({
      subdomain,
      action: "brands.create",
      data: { name: doc.brandName },
      isRPC: true,
      defaultValue: {}
    });

    let channel = await models.Channels.findOne({
      name: "Default channel"
    });

    if (!channel) {
      channel = await models.Channels.createChannel(
        { name: "Default channel", memberIds: [user._id] },
        user._id
      );
    }

    const integrationDocs = {
      name: "Default brand",
      channelIds: [channel._id],
      brandId: brand._id,
      messengerData: {}
    } as IIntegration;

    const integration = await models.Integrations.createMessengerIntegration(
      integrationDocs,
      user._id
    );

    const uiOptions = { ...doc };

    await models.Integrations.saveMessengerAppearanceData(
      integration._id,
      uiOptions
    );

    return createIntegration(
      models,
      subdomain,
      integrationDocs,
      integration,
      user,
      "messenger"
    );
  },

  async integrationsEditMessengerOnboarding(
    _root,
    { _id, brandId, ...fields }: IOnboardingPramsEdit,
    { user, models, subdomain }: IContext
  ) {
    const brand = await sendCoreMessage({
      subdomain,
      action: "brands.updateOne",
      data: { _id: brandId, fields: { name: fields.brandName } },
      isRPC: true,
      defaultValue: {}
    });

    const integration = await models.Integrations.getIntegration({ _id });
    const channel = await models.Channels.findOne({
      name: "Default channel"
    });

    const integrationDocs = {
      name: "Default brand",
      brandId: brand._id,
      channelIds: [channel?._id]
    } as IIntegration;

    const updated = await models.Integrations.updateMessengerIntegration(
      _id,
      integrationDocs
    );

    const uiOptions = { logo: fields.logo, color: fields.color };

    await models.Integrations.saveMessengerAppearanceData(
      updated._id,
      uiOptions
    );

    return editIntegration(
      subdomain,
      integrationDocs,
      integration,
      user,
      updated,
      models
    );
  },

  /**
   * Creates a new messenger integration
   */

  async integrationsCreateMessengerIntegration(
    _root,
    doc: IIntegration,
    { user, models, subdomain }: IContext
  ) {
    const integration = await models.Integrations.createMessengerIntegration(
      doc,
      user._id
    );

    return createIntegration(
      models,
      subdomain,
      doc,
      integration,
      user,
      "messenger"
    );
  },

  /**
   * Updates a messenger integration
   */
  async integrationsEditMessengerIntegration(
    _root,
    { _id, ...fields }: IEditIntegration,
    { user, models, subdomain }: IContext
  ) {
    const integration = await models.Integrations.getIntegration({ _id });
    const updated = await models.Integrations.updateMessengerIntegration(
      _id,
      fields
    );

    return editIntegration(
      subdomain,
      fields,
      integration,
      user,
      updated,
      models
    );
  },

  /**
   * Update/save messenger appearance data
   */
  async integrationsSaveMessengerAppearanceData(
    _root,
    { _id, uiOptions }: { _id: string; uiOptions: IUiOptions },
    { models }: IContext
  ) {
    return models.Integrations.saveMessengerAppearanceData(_id, uiOptions);
  },

  /**
   * Update/save messenger data
   */
  async integrationsSaveMessengerConfigs(
    _root,
    {
      _id,
      messengerData,
      callData
    }: { _id: string; messengerData: IMessengerData; callData: any },
    { models, subdomain }: IContext
  ) {
    const isEnabledCloudflareCalls = await isServiceRunning("cloudflarecalls");

    if (isEnabledCloudflareCalls) {
      await sendCommonMessage({
        serviceName: "cloudflarecalls",
        subdomain,
        action: "createOrUpdateIntegration",
        data: {
          kind: "cloudflarecalls",
          integrationId: _id,
          doc: {
            kind: "cloudflarecalls",
            integrationId: _id,
            data: { ...callData }
          }
        },
        isRPC: true
      });
    }

    return models.Integrations.saveMessengerConfigs(_id, messengerData);
  },

  /**
   * Create a new messenger integration
   */
  async integrationsCreateLeadIntegration(
    _root,
    doc: IIntegration,
    { user, models, subdomain }: IContext
  ) {
    const integration = await models.Integrations.createLeadIntegration(
      doc,
      user._id
    );

    return createIntegration(models, subdomain, doc, integration, user, "lead");
  },

  /**
   * Edit a lead integration
   */
  async integrationsEditLeadIntegration(
    _root,
    { _id, ...doc }: IEditIntegration,
    { user, models, subdomain }: IContext
  ) {
    const integration = await models.Integrations.getIntegration({ _id });

    const updated = await models.Integrations.updateLeadIntegration(_id, doc);

    return editIntegration(subdomain, doc, integration, user, updated, models);
  },

  /**
   * Create external integrations like twitter, gmail etc ...
   */
  async integrationsCreateExternalIntegration(
    _root,
    { data, ...doc }: IExternalIntegrationParams & { data: object },
    { user, models, subdomain }: IContext
  ) {
    const modifiedDoc: any = { ...doc };

    if (modifiedDoc.kind === "webhook") {
      modifiedDoc.webhookData = { ...data };

      if (
        !modifiedDoc.webhookData.token ||
        modifiedDoc.webhookData.token === ""
      ) {
        modifiedDoc.webhookData.token = await getUniqueValue(
          models.Integrations,
          "token"
        );
      }
    }

    if (doc.channelIds && doc.channelIds.length === 0) {
      throw new Error("Channel must be chosen");
    }

    const integration = await models.Integrations.createExternalIntegration(
      modifiedDoc,
      user._id
    );

    if (doc.channelIds) {
      await models.Channels.updateMany(
        { _id: { $in: doc.channelIds } },
        { $push: { integrationIds: integration._id } }
      );
    }

    const kind = doc.kind.split("-")[0];
    if (kind === "cloudflarecalls") {
      data = { ...data, name: doc.name };
    }

    try {
      if ("webhook" !== kind) {
        await sendCommonMessage({
          serviceName: (await isServiceRunning(kind)) ? kind : "integrations",
          subdomain,
          action: "createIntegration",
          data: {
            kind,
            integrationId: integration._id,
            doc: {
              accountId: doc.accountId,
              kind: doc.kind,
              integrationId: integration._id,
              data: data ? JSON.stringify(data) : ""
            }
          },
          isRPC: true
        });
      }

      telemetry.trackCli("integration_created", { type: doc.kind });

      await putCreateLog(
        models,
        subdomain,
        {
          type: MODULE_NAMES.INTEGRATION,
          newData: { ...doc, createdUserId: user._id, isActive: true },
          object: integration
        },
        user
      );
    } catch (e) {
      await models.Integrations.deleteOne({ _id: integration._id });
      throw new Error(e);
    }

    return integration;
  },

  async integrationsEditCommonFields(
    _root,
    { _id, name, brandId, channelIds, details },
    { user, models, subdomain }: IContext
  ) {
    const integration = await models.Integrations.getIntegration({ _id });

    const doc: any = { name, brandId, details };

    let { kind } = integration;
    if (kind === "facebook-messenger" || kind === "facebook-post") {
      kind = "facebook";
    }
    if (kind === "instagram-messenger" || kind === "instagram-post") {
      kind = "instagram";
    }
    await models.Integrations.updateOne({ _id }, { $set: doc });

    const updated = await models.Integrations.getIntegration({ _id });

    await models.Channels.updateMany(
      { integrationIds: integration._id },
      { $pull: { integrationIds: integration._id } }
    );

    if (channelIds) {
      await models.Channels.updateMany(
        { _id: { $in: channelIds } },
        { $push: { integrationIds: integration._id } }
      );
    }

    await sendCommonMessage({
      serviceName: (await isServiceRunning(kind)) ? kind : "integrations",
      subdomain,
      action: "updateIntegration",
      data: {
        kind,
        integrationId: integration._id,
        doc: {
          accountId: doc.accountId,
          kind: kind,
          integrationId: integration._id,
          data: details ? JSON.stringify(details) : ""
        }
      },
      isRPC: true
    });

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.INTEGRATION,
        object: { name: integration.name, brandId: integration.brandId },
        newData: { name, brandId },
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  /**
   * Deletes an integration
   */
  async integrationsRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const integration = await models.Integrations.getIntegration({ _id });
    const kind = integration.kind.split("-")[0];

    if (!["lead", "messenger"].includes(kind)) {
      try {
        const commonParams = {
          subdomain,
          data: { integrationId: _id },
          isRPC: true,
          action: "removeIntegrations"
        };

        if (await isServiceRunning(kind)) {
          await sendCommonMessage({ serviceName: kind, ...commonParams });
        } else {
          await sendIntegrationsMessage({ ...commonParams });
        }
      } catch (e) {
        if (e.message !== "Integration not found") {
          debugError(e);
          throw e;
        }
      }
    }
    const isEnabledCloudflareCalls = await isServiceRunning('cloudflarecalls');

    if (isEnabledCloudflareCalls) {
      await sendCommonMessage({
        serviceName: 'cloudflarecalls',
        subdomain,
        action: 'removeIntegrations',
        data: {
          kind: 'cloudflarecalls',
          integrationId: _id,
        },
        isRPC: true,
      });
    }

    await putDeleteLog(
      models,
      subdomain,
      { type: MODULE_NAMES.INTEGRATION, object: integration },
      user
    );

    return models.Integrations.removeIntegration(_id);
  },

  /**
   * Delete an account
   */
  async integrationsRemoveAccount(
    _root,
    { _id, kind }: { _id: string; kind?: string },
    { models, subdomain }: IContext
  ) {
    try {
      const { erxesApiIds } = await sendCommonMessage({
        serviceName:
          kind && (await isServiceRunning(kind)) ? kind : "integrations",
        subdomain,
        action: "api_to_integrations",
        data: {
          action: "remove-account",
          _id
        },
        isRPC: true
      });

      for (const id of erxesApiIds) {
        await models.Integrations.removeIntegration(id);
      }

      return "success";
    } catch (e) {
      debugError(e);
      throw e;
    }
  },

  async integrationsRepair(
    _root,
    { _id, kind }: { _id: string; kind: string },
    { subdomain }: IContext
  ) {
    try {
      const response = await sendCommonMessage({
        serviceName:
          kind && (await isServiceRunning(kind))
            ? kind.split("-")[0]
            : "integrations",
        subdomain,
        action: "api_to_integrations",
        data: {
          action: "repair-integrations",
          _id
        },
        isRPC: true
      });

      return response;
    } catch (e) {
      debugError(e);
      throw e;
    }
  },

  async integrationsArchive(
    _root,
    { _id, status }: IArchiveParams,
    { user, models, subdomain }: IContext
  ) {
    const integration = await models.Integrations.getIntegration({ _id });

    await models.Integrations.updateOne(
      { _id },
      { $set: { isActive: !status } }
    );

    const updated = await models.Integrations.findOne({ _id });

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.INTEGRATION,
        object: integration,
        newData: { isActive: !status },
        description: `"${integration.name}" has been ${
          status === true ? "archived" : "unarchived"
        }.`,
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  async integrationsSendSms(
    _root,
    args: ISmsParams,
    { user, subdomain }: IContext
  ) {
    const customer = await sendCoreMessage({
      subdomain,
      action: "customers.findOne",
      data: {
        primaryPhone: args.to
      },
      isRPC: true
    });

    if (!customer) {
      throw new Error(`Customer not found with primary phone "${args.to}"`);
    }
    if (customer.phoneValidationStatus !== "valid") {
      throw new Error(`Customer's primary phone ${args.to} is not valid`);
    }

    try {
      const response = await sendIntegrationsMessage({
        subdomain,
        action: "sendSms",
        data: args,
        isRPC: true
      });

      if (response && response.status === "ok") {
        await putActivityLog(subdomain, {
          action: "add",
          data: {
            action: "send",
            contentType: "sms",
            createdBy: user._id,
            contentId: customer._id,
            content: { to: args.to, text: args.content }
          }
        });
      }

      return response;
    } catch (e) {
      return e;
    }
  },

  async integrationsCopyLeadIntegration(
    _root,
    { _id }: { _id },
    { docModifier, user, models, subdomain }: IContext
  ) {
    const sourceIntegration = await models.Integrations.getIntegration({ _id });

    if (!sourceIntegration.formId) {
      throw new Error("Integration kind is not form");
    }

    const sourceForm = await sendCoreMessage({
      subdomain,
      action: "formsFindOne",
      data: { _id: sourceIntegration.formId },
      isRPC: true
    });

    const sourceFields = await sendCoreMessage({
      subdomain,
      action: "fields.find",
      data: { query: { contentTypeId: sourceForm._id } },
      isRPC: true
    });

    const formDoc = docModifier({
      ...sourceForm,
      title: `${sourceForm.title}-copied`
    });

    delete formDoc._id;
    delete formDoc.code;

    const copiedForm = await sendCoreMessage({
      subdomain,
      action: "createForm",
      data: { formDoc, userId: user._id },
      isRPC: true
    });

    const leadData = sourceIntegration.leadData;

    const doc = docModifier({
      ...sourceIntegration.toObject(),
      name: `${sourceIntegration.name}-copied`,
      formId: copiedForm._id,
      leadData: leadData && {
        ...leadData.toObject(),
        viewCount: 0,
        contactsGathered: 0
      }
    });

    delete doc._id;

    const copiedIntegration = await models.Integrations.createLeadIntegration(
      doc,
      user._id
    );

    const fields = sourceFields.map((e) => ({
      options: e.options,
      isVisible: e.isVisible,
      contentType: e.contentType,
      contentTypeId: copiedForm._id,
      order: e.order,
      type: e.type,
      text: e.text,
      lastUpdatedUserId: user._id,
      isRequired: e.isRequired,
      isDefinedByErxes: false,
      associatedFieldId: e.associatedFieldId,
      pageNumber: e.pageNumber
    }));

    sendCoreMessage({
      subdomain,
      action: "fields.insertMany",
      data: { fields }
    });

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.INTEGRATION,
        newData: { ...doc, createdUserId: user._id, isActive: true },
        object: copiedIntegration
      },
      user
    );

    telemetry.trackCli("integration_created", { type: "lead" });

    await sendCoreMessage({
      subdomain,
      action: "registerOnboardHistory",
      data: {
        type: "leadIntegrationCreate",
        user
      }
    });

    return copiedIntegration;
  },
  async integrationsSaveMessengerTicketData(
    _root,
    { _id, ticketData }: { _id: string; ticketData: ITicketData },
    { models }: IContext
  ) {
    return models.Integrations.integrationsSaveMessengerTicketData(
      _id,
      ticketData
    );
  }
};

checkPermission(
  integrationMutations,
  "integrationsCreateMessengerIntegration",
  "integrationsCreateMessengerIntegration"
);
checkPermission(
  integrationMutations,
  "integrationsSaveMessengerAppearanceData",
  "integrationsSaveMessengerAppearanceData"
);
checkPermission(
  integrationMutations,
  "integrationsSaveMessengerConfigs",
  "integrationsSaveMessengerConfigs"
);
checkPermission(
  integrationMutations,
  "integrationsCreateLeadIntegration",
  "integrationsCreateLeadIntegration"
);
checkPermission(
  integrationMutations,
  "integrationsEditLeadIntegration",
  "integrationsEditLeadIntegration"
);
checkPermission(
  integrationMutations,
  "integrationsRemove",
  "integrationsRemove"
);
checkPermission(
  integrationMutations,
  "integrationsArchive",
  "integrationsArchive"
);
checkPermission(
  integrationMutations,
  "integrationsEditCommonFields",
  "integrationsEdit"
);
checkPermission(
  integrationMutations,
  "integrationsCopyLeadIntegration",
  "integrationsCreateLeadIntegration"
);

export default integrationMutations;
