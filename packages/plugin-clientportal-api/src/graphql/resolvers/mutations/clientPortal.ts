import { sendCommonMessage, sendCoreMessage } from "../../../messageBroker";

import { checkPermission } from "@erxes/api-utils/src";
import { isEnabled } from "@erxes/api-utils/src/serviceDiscovery";
import { IContext } from "../../../connectionResolver";
import { sendTicketsMessage } from "../../../messageBroker";
import { IClientPortal } from "../../../models/definitions/clientPortal";
import { createCard, participantEditRelation } from "../../../models/utils";
import { sendNotification } from "../../../utils";
export interface IVerificationParams {
  userId: string;
  emailOtp?: string;
  phoneOtp?: string;
}

const clientPortalMutations = {
  async clientPortalTicketAdd(
    _root,
    doc: any & { processId: string; aboveItemId: string },
    { models, subdomain, cpUser, user }: IContext
  ) {
    if (!cpUser) {
      throw new Error("You are not logged in");
    }

    try {
      // Step 1: Attempt to create a ticket via RPC call
      const ticket = await sendTicketsMessage({
        subdomain,
        action: "widgets.createTicket",
        data: { doc },
        isRPC: true,
        defaultValue: [],
      });

      // Step 2: Validate the response
      if (!ticket || !ticket._id) {
        throw new Error("Ticket creation failed: Invalid response");
      }

      const data = {
        contentType: "ticket",
        contentTypeId: ticket._id,
        cpUserId: cpUser._id,
        status: "participating",
        paymentStatus: "unpaid",
        paymentAmount: 0,
        offeredAmount: 0,
        hasVat: false,
      };
      try {
        await models.ClientPortalUserCards.create(data);
        await sendNotification(models, subdomain, {
          receivers: [cpUser._id],
          title: "Ticket Created",
          content: "A new support ticket has been created.",
          notifType: "system", // or "engage"
          link: `ticket/board?id=${ticket.boardId}&pipelineId=${ticket.pipelineId}&itemId=${ticket._id}`,
          createdUser: user,
          isMobile: false,
          eventData: {
            ticketId: ticket._id,
            ticketTitle: ticket.title || ticket.name || doc.name,
            ticketStatus: ticket.status || "new",
            ticketStageId: ticket.stageId || doc.stageId,
            ticketStageName: ticket.stageName || "",
            ticketPriority: ticket.priority || doc.priority || "normal",
          },

          groupId: `ticket-${ticket._id}`,
        });
      } catch (err) {
        console.error("Error creating ClientPortalUserCard:", err);
      }

      // Step 4: Return the created ticket
      return ticket;
    } catch (err: any) {
      // Step 5: Wrap and rethrow error with context
      throw new Error(`Ticket creation process failed: ${err?.message || err}`);
    }
  },
  async clientPortalConfigUpdate(
    _root,
    { config }: { config: IClientPortal },
    { models, subdomain, user }: IContext
  ) {
    try {
      const cpUser = await models.ClientPortalUsers.findOne({
        $or: [
          { email: { $regex: new RegExp(`^${config?.testUserEmail}$`, "i") } },
          { phone: { $regex: new RegExp(`^${config?.testUserPhone}$`, "i") } },
        ],
        clientPortalId: config._id,
      });

      if (!cpUser) {
        if (
          config?.testUserEmail &&
          config?.testUserPhone &&
          config?.testUserPassword &&
          config._id
        ) {
          const args = {
            firstName: "test clientportal user",
            email: config.testUserEmail,
            phone: config.testUserPhone,
            password: config.testUserPassword,
            clientPortalId: config._id,
            isPhoneVerified: true,
            isEmailVerified: true,
            notificationSettings: {
              receiveByEmail: false,
              receiveBySms: false,
              configs: [],
            },
          };

          await models.ClientPortalUsers.createTestUser(subdomain, {
            ...args,
          });
        }
      }
    } catch (e) {
      console.error(e.message);
    }

    const cp = await models.ClientPortals.createOrUpdateConfig(config);

    if (cp) {
      await sendCoreMessage({
        subdomain,
        action: "registerOnboardHistory",
        data: {
          type: "clientPortalSetup",
          user,
        },
      });
    }

    if (
      config.template &&
      isEnabled("cms") &&
      [
        "portfolio",
        "ecommerce",
        "hotel",
        "restaurant",
        "tour",
        "blog",
      ].includes(config.template)
    ) {
      sendCommonMessage({
        subdomain,
        serviceName: "cms",
        action: "addPages",
        data: {
          clientPortalId: cp._id,
          kind: config.template,
          createdUserId: user._id,
        },
      });
    }

    return cp;
  },

  async clientPortalRemove(
    _root,
    { _id }: { _id: string },
    { models, subdomain }: IContext
  ) {
    if (isEnabled("cms")) {
      sendCommonMessage({
        subdomain,
        serviceName: "cms",
        action: "removePages",
        data: {
          clientPortalId: _id,
        },
      });
    }

    return models.ClientPortals.deleteOne({ _id });
  },

  async clientPortalCreateCard(
    _root,
    args,
    { subdomain, cpUser, models }: IContext
  ) {
    if (!cpUser) {
      throw new Error("You are not logged in");
    }

    return createCard(subdomain, models, cpUser, args);
  },
  async clientPortalParticipantRelationEdit(
    _root,
    {
      type,
      cardId,
      cpUserIds,
      oldCpUserIds,
    }: {
      type: string;
      cardId: string;
      cpUserIds: [string];
      oldCpUserIds: [string];
    },
    { subdomain, cpUser, models }: IContext
  ) {
    return participantEditRelation(
      subdomain,
      models,
      type,
      cardId,
      oldCpUserIds,
      cpUserIds
    );
  },

  async clientPortalParticipantEdit(
    _root,
    args: {
      _id: string;
      contentType: string;
      contentTypeId: string;
      cpUserId: string;
      status: string;
      paymentStatus: string;
      paymentAmount: number;
      offeredAmount: number;
      hasVat: Boolean;
    },
    { subdomain, cpUser, models }: IContext
  ) {
    const { _id, ...rest } = args;
    await models.ClientPortalUserCards.updateOne(
      { _id: args._id },
      {
        $set: {
          ...rest,
        },
      }
    );
    return models.ClientPortalUserCards.findOne({ _id: args._id });
  },

  async clientPortalCheckTokiInvoice(
    _root,
    { clientPortalId, transactionId }: { clientPortalId: string; transactionId: string },
    { models }: IContext
  ) {
    const clientPortal = await models.ClientPortals.findOne({ _id: clientPortalId });
    if (!clientPortal) {
      throw new Error("Client portal not found");
    }
    const tokiConfig = clientPortal.tokiConfig;
    if (!tokiConfig) {
      throw new Error("Toki config not found");
    }

    const baseApiUrl = tokiConfig.production ? "ms-api.toki.mn" : "qams-api.toki.mn";
   
    const apiUrl = tokiConfig.production ? baseApiUrl : "qams-api.toki.mn";
    const {username, password, apiKey} = tokiConfig;

    const authString = Buffer.from(`${username}:${password}`).toString("base64");

    const response = await fetch(
      `https://${apiUrl}/third-party-service/v1/auth/token`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          Authorization: `Basic ${authString}`,
        },
      }
    );

    const contentType = response.headers.get("content-type");
  
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Toki API Error (${response.status}): ${errorText}`);
    }
    
    if (contentType && contentType.includes("application/json")) {
      const data: any = await response.json();
      const {accessToken} = data.data;
      const invoiceResponse = await fetch(
        `https://${apiUrl}/third-party-service/v1/payment-request/status?requestId=${transactionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            "api-key": apiKey,
          },
        }
      );

      return await invoiceResponse.json();
    } else {
      const text = await response.text();
      throw new Error(`Expected JSON but received: ${text}`);
    }
  },
};

checkPermission(
  clientPortalMutations,
  "clientPortalConfigUpdate",
  "manageClientPortal"
);

checkPermission(
  clientPortalMutations,
  "clientPortalRemove",
  "removeClientPortal"
);

export default clientPortalMutations;
