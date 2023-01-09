import { getEnv, getSubdomain } from "@erxes/api-utils/src/core";
import { sendContactsMessage, sendInboxMessage } from "./messageBroker";
// import { Customers, Messages } from '../../plugin-zalo-ui/models';
import * as dotenv from "dotenv";
import { generateModels } from "./connectionResolver";
import { getConfig, getMessageOAID, getMessageUserID } from "./commonUtils";
import { sendRequest } from "@erxes/api-utils/src";
import { debug, graphqlPubsub } from "./configs";
import { getOrCreateCustomer } from "./helpers";

dotenv.config();

const searchMessages = (linkedin, criteria) => {
    return new Promise((resolve, reject) => {
        const messages: any = [];
    });
};

// Example for save messages to inbox and create or update customer
const saveMessages = async (linkedin, integration, criteria) => {
    const msgs: any = await searchMessages(linkedin, criteria);

    // for (const msg of msgs) {
    //   const message = await Messages.findOne({
    //     messageId: msg.messageId
    //   });

    //   if (message) {
    //     continue;
    //   }

    //   const from = msg.from.value[0].address;
    //   const prev = await Customers.findOne({ email: from });

    //   let customerId;

    //   if (!prev) {
    //     const customer = await sendContactsMessage({
    //       subdomain: 'os',
    //       action: 'customers.findOne',
    //       data: {
    //         primaryEmail: from
    //       },
    //       isRPC: true
    //     });

    //     if (customer) {
    //       customerId = customer._id;
    //     } else {
    //       const apiCustomerResponse = await sendContactsMessage({
    //         subdomain: 'os',
    //         action: 'customers.createCustomer',
    //         data: {
    //           integrationId: integration.inboxId,
    //           primaryEmail: from
    //         },
    //         isRPC: true
    //       });

    //       customerId = apiCustomerResponse._id;
    //     }

    //     await Customers.create({
    //       inboxIntegrationId: integration.inboxId,
    //       contactsId: customerId,
    //       email: from
    //     });
    //   } else {
    //     customerId = prev.contactsId;
    //   }

    //   let conversationId;

    //   const relatedMessage = await Messages.findOne({
    //     $or: [
    //       { messageId: msg.inReplyTo },
    //       { messageId: { $in: msg.references || [] } },
    //       { references: { $in: [msg.messageId] } },
    //       { references: { $in: [msg.inReplyTo] } }
    //     ]
    //   });

    //   if (relatedMessage) {
    //     conversationId = relatedMessage.inboxConversationId;
    //   } else {
    //     const { _id } = await sendInboxMessage({
    //       subdomain: 'os',
    //       action: 'integrations.receive',
    //       data: {
    //         action: 'create-or-update-conversation',
    //         payload: JSON.stringify({
    //           integrationId: integration.inboxId,
    //           customerId,
    //           createdAt: msg.date,
    //           content: msg.subject
    //         })
    //       },
    //       isRPC: true
    //     });

    //     conversationId = _id;
    //   }

    //   await Messages.create({
    //     inboxIntegrationId: integration.inboxId,
    //     inboxConversationId: conversationId,
    //     createdAt: msg.date,
    //     messageId: msg.messageId,
    //     inReplyTo: msg.inReplyTo,
    //     references: msg.references,
    //     subject: msg.subject,
    //     body: msg.html,
    //     to: msg.to && msg.to.value,
    //     cc: msg.cc && msg.cc.value,
    //     bcc: msg.bcc && msg.bcc.value,
    //     from: msg.from && msg.from.value,
    //   });
    // }
};

// controller for zalo
const init = async (app) => {
    app.get("/login", async (req, res) => {
        const subdomain = getSubdomain(req);
        const models = await generateModels(subdomain);

        const ZALO_APP_ID = await getConfig(models, "ZALO_APP_ID");
        const ZALO_APP_SECRET_KEY = await getConfig(
            models,
            "ZALO_APP_SECRET_KEY"
        );

        // const DOMAIN = getEnv({ name: 'DOMAIN' });
        const DOMAIN = "http://localhost:4000";

        const conf = {
            app_id: ZALO_APP_ID,
            secret_key: ZALO_APP_SECRET_KEY,
            redirect_uri: `${DOMAIN}/pl:zalo/login`,
        };

        const authUrl = `https://oauth.zaloapp.com/v4/oa/permission?app_id=${
            conf.app_id
        }&redirect_uri=${encodeURIComponent(conf.redirect_uri)}`;

        if (!req.query.code) {
            return res.redirect(authUrl);
        }

        const config = {
            oa_id: req.query.oa_id,
            code: req.query.code,
        };

        const authCodeUrl = `https://oauth.zaloapp.com/v4/oa/access_token`;
        const OAAPIUrl = `https://openapi.zalo.me/v2.0/oa/getoa`;

        try {
            const getAccessTokenFromAuthCode = await sendRequest({
                method: "POST",
                url: authCodeUrl,
                headers: {
                    secret_key: conf.secret_key,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                params: {
                    code: config.code,
                    app_id: conf.app_id,
                    grant_type: "authorization_code",
                },
            });

            // const { responses } = getAccessTokenFromAuthCode;

            const authInfo = JSON.parse(getAccessTokenFromAuthCode);

            const OAInfo = await sendRequest({
                method: "GET",
                url: OAAPIUrl,
                headers: {
                    access_token: authInfo?.access_token,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            // const { responses: OAInfo } = getOAInfo;

            // debug.error(`responses:`, responses, getOAInfo);
            // const OAInfo = JSON.parse(getOAInfo)

            const account = await models.Accounts.findOne({
                oa_id: config.oa_id,
            });

            if (account) {
                await models.Accounts.updateOne(
                    { _id: account._id },
                    {
                        $set: {
                            access_token: authInfo?.access_token,
                            refresh_token: authInfo?.refresh_token,
                            expires_in: authInfo?.expires_in,
                            name: OAInfo?.data?.name,
                            avatar: OAInfo?.data?.avatar,
                        },
                    }
                );
            } else {
                await models.Accounts.create({
                    access_token: authInfo?.access_token,
                    refresh_token: authInfo?.refresh_token,
                    expires_in: authInfo?.expires_in,
                    name: OAInfo?.data?.name,
                    kind: "zalo",
                    avatar: OAInfo?.data?.avatar,
                    oa_id: config.oa_id,
                });
            }
        } catch (e) {
            debug.error(`Failed to connect to ZALO: ${e.message}`);
        }

        res.send({ ...req.query });
    });

    app.post("/receive", async (req, res, next) => {
        const subdomain = getSubdomain(req);
        const models = await generateModels(subdomain);

        const data = req.body;
        debug.error(JSON.stringify(req?.body));

        const oa_id = getMessageOAID(data);
        const userId = getMessageUserID(data);

        try {
			
            // write receive code here
            const integration = await models.Integrations.getIntegration({
                $and: [{ oa_id: { $in: oa_id } }, { kind: "zalo" }],
            });

            // const account = await models.Accounts.getAccount({ _id: integration.accountId });

            // let customer = await models.Customers.findOne({ userId });
            const customer = await getOrCreateCustomer(
                models,
                subdomain,
                oa_id,
                userId
            );

            // get conversation
            let conversation = await models.Conversations.findOne({
                senderId: userId,
                recipientId: oa_id,
            });

            // create conversation
            if (!conversation) {
                // save on integrations db
                try {
                    conversation = await models.Conversations.create({
                        timestamp: data.timestamp,
                        senderId: userId,
                        recipientId: oa_id,
                        content: '',
                        integrationId: integration._id,
                    });
                } catch (e) {
                    throw new Error(
                        e.message.includes("duplicate")
                            ? "Concurrent request: conversation duplication"
                            : e
                    );
                }

                // save on api
                try {
                    const apiConversationResponse = await sendInboxMessage({
                        subdomain,
                        action: "integrations.receive",
                        data: {
                            action: "create-or-update-conversation",
                            payload: JSON.stringify({
                                customerId: customer.erxesApiId,
                                integrationId: integration.erxesApiId,
                                content: "",
                                // attachments: (attachments || [])
                                //     .filter((att) => att.type !== "fallback")
                                //     .map((att) => ({
                                //         type: att.type,
                                //         url: att.payload ? att.payload.url : "",
                                //     })),
                            }),
                        },
                        isRPC: true,
                    });

                    conversation.erxesApiId = apiConversationResponse._id;

                    await conversation.save();
                } catch (e) {
                    await models.Conversations.deleteOne({
                        _id: conversation._id,
                    });
                    throw new Error(e);
                }

            }
			// get conversation message
			const conversationMessage = await models.ConversationMessages.findOne({
				mid: data.message.msg_id
			});
			debug.error('conversationMessage')
			if (!conversationMessage) {
				try {
					debug.error('start create conversationMessage')
				  const created = await models.ConversationMessages.create({
					conversationId: conversation._id,
					mid: data.message.msg_id,
					createdAt: data.timestamp,
					content: data.message.text,
					customerId: customer.erxesApiId
				  });
			
				  graphqlPubsub.publish('conversationClientMessageInserted', {
					conversationClientMessageInserted: {
					  ...created.toObject(),
					  conversationId: conversation.erxesApiId
					}
				  });
			
				  graphqlPubsub.publish('conversationMessageInserted', {
					conversationMessageInserted: {
					  ...created.toObject(),
					  conversationId: conversation.erxesApiId
					}
				  });
				} catch (e) {
				  throw new Error(
					e.message.includes('duplicate')
					  ? 'Concurrent request: conversation message duplication'
					  : e
				  );
				}
			}

            // res.send('Successfully receiving message');
        } catch (e) {
            return next(new Error(e));
        }

        res.sendStatus(200);
    });
};

export default init;
