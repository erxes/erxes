// import * as dotenv from 'dotenv';
// dotenv.config();
// import * as Imap from 'node-imap';
// import { simpleParser } from 'mailparser';
// import { IModels, generateModels } from '~/connectionResolvers';
// import {
//   sendCoreMessage,
//   sendImapMessage,
//   sendInboxMessage,
// } from './messageBroker';
// import { IIntegrationImapDocument } from '~/modules/integrations/imap/models';
// import { throttle } from 'lodash';
// import { redlock } from './redlock';
// const { NODE_ENV } = process.env;

// export const toUpper = (thing) => {
//   return thing && thing.toUpperCase ? thing.toUpperCase() : thing;
// };

// export const findAttachmentParts = (struct, attachments?) => {
//   attachments = attachments || [];

//   for (let i = 0, len = struct.length, _r: any; i < len; ++i) {
//     if (Array.isArray(struct[i])) {
//       findAttachmentParts(struct[i], attachments);
//     } else {
//       if (
//         struct[i].disposition &&
//         ['INLINE', 'ATTACHMENT'].indexOf(toUpper(struct[i].disposition.type)) >
//           -1
//       ) {
//         attachments.push(struct[i]);
//       }
//     }
//   }
//   return attachments;
// };

// export const createImap = (integration: IIntegrationImapDocument): Imap => {
//   return new Imap({
//     user: integration.mainUser || integration.user,
//     password: integration.password,
//     host: integration.host,
//     keepalive: { forceNoop: true },
//     port: 993,
//     tls: true,
//   });
// };

// const searchMessages = (imap: Imap, criteria) => {
//   return new Promise((resolve, reject) => {
//     const messages: string[] = [];

//     imap.search(criteria, (err, results) => {
//       if (err) {
//         throw err;
//       }

//       let f: Imap.ImapFetch;

//       try {
//         f = imap.fetch(results, { bodies: '', struct: true });
//         f.on('error', (error: any) => {
//           throw error;
//         });
//       } catch (e) {
//         if (e.message?.includes('Nothing to fetch')) {
//           return resolve([]);
//         }
//         throw e;
//       }

//       f.on('message', (msg) => {
//         msg.on('body', async (stream) => {
//           let buffers: Buffer[] = [];

//           stream.on('data', (buffer) => {
//             buffers.push(buffer);
//           });

//           stream.once('end', async () => {
//             messages.push(Buffer.concat(buffers).toString('utf8'));
//           });
//         });
//       });

//       f.once('end', async () => {
//         const data: any = [];

//         for (const message of messages) {
//           const parsed = await simpleParser(message);
//           data.push(parsed);
//         }

//         resolve(data);
//       });
//     });
//   });
// };

// const saveMessages = async (
//   subdomain: string,
//   imap: Imap,
//   integration: IIntegrationImapDocument,
//   criteria,
//   models: IModels,
// ) => {
//   const msgs: any = await searchMessages(imap, criteria);

//   console.log(`======== found ${msgs.length} messages`);

//   for (const msg of msgs) {
//     if (
//       msg.to &&
//       msg.to.value &&
//       msg.to.value[0] &&
//       msg.to.value[0].address !== integration.user
//     ) {
//       continue;
//     }

//     const message = await models.Messages.findOne({
//       messageId: msg.messageId,
//     });

//     if (message) {
//       continue;
//     }

//     const from = msg.from.value[0].address;
//     const prev = await models.Customers.findOne({ email: from });

//     let customerId;

//     if (!prev) {
//       const customer = await sendCoreMessage({
//         subdomain,
//         action: 'customers.findOne',
//         data: {
//           customerPrimaryEmail: from,
//         },
//         isRPC: true,
//       });

//       if (customer) {
//         customerId = customer._id;
//       } else {
//         const apiCustomerResponse = await sendCoreMessage({
//           subdomain,
//           action: 'customers.createCustomer',
//           data: {
//             integrationId: integration.inboxId,
//             primaryEmail: from,
//           },
//           isRPC: true,
//         });

//         customerId = apiCustomerResponse._id;
//       }

//       await models.Customers.create({
//         inboxIntegrationId: integration.inboxId,
//         contactsId: customerId,
//         email: from,
//       });
//     } else {
//       customerId = prev.contactsId;
//     }

//     let conversationId;

//     const $or: any[] = [
//       { references: { $in: [msg.messageId] } },
//       { messageId: { $in: msg.references || [] } },
//     ];

//     if (msg.inReplyTo) {
//       $or.push({ messageId: msg.inReplyTo });
//       $or.push({ references: { $in: [msg.inReplyTo] } });
//     }

//     const relatedMessage = await models.Messages.findOne({
//       $or,
//     });

//     if (relatedMessage) {
//       conversationId = relatedMessage.inboxConversationId;
//     } else {
//       const { _id } = await sendInboxMessage({
//         subdomain,
//         action: 'integrations.receive',
//         data: {
//           action: 'create-or-update-conversation',
//           payload: JSON.stringify({
//             integrationId: integration.inboxId,
//             customerId,
//             createdAt: msg.date,
//             content: msg.subject,
//           }),
//         },
//         isRPC: true,
//       });

//       conversationId = _id;
//     }

//     const conversationMessage = await models.Messages.create({
//       inboxIntegrationId: integration.inboxId,
//       inboxConversationId: conversationId,
//       createdAt: msg.date,
//       messageId: msg.messageId,
//       inReplyTo: msg.inReplyTo,
//       references: msg.references,
//       subject: msg.subject,
//       body: msg.html,
//       to: msg.to && msg.to.value,
//       cc: msg.cc && msg.cc.value,
//       bcc: msg.bcc && msg.bcc.value,
//       from: msg.from && msg.from.value,
//       attachments: msg.attachments.map(({ filename, contentType, size }) => ({
//         filename,
//         type: contentType,
//         size,
//       })),
//       type: 'INBOX',
//     });

//     await sendInboxMessage({
//       subdomain,
//       action: 'conversationClientMessageInserted',
//       data: {
//         _id: conversationMessage._id,
//         content: msg.html,
//         conversationId,
//       },
//     });
//   }
// };

// export const listenIntegration = async (
//   subdomain: string,
//   integration: IIntegrationImapDocument,
//   models: IModels,
// ) => {
//   interface ListenResult {
//     reconnect: boolean;
//     error?: Error;
//     result?: any;
//   }

//   const listen = async (): Promise<ListenResult> => {
//     return new Promise<ListenResult>(async (resolve) => {
//       let lock;
//       let reconnect = true;
//       let closing = false;
//       let error: Error | undefined;
//       let result: string | undefined;

//       try {
//         lock = await redlock.lock(
//           `${subdomain}:imap:integration:${integration._id}`,
//           60000,
//         );
//       } catch (e) {
//         // 1 other pod or container is already listening on it
//         return resolve({
//           reconnect: false,
//           result: `Integration ${integration._id} is already being listened to`,
//         });
//       }

//       await lock.extend(60000);

//       const updatedIntegration = await models.Integrations.findById(
//         integration._id,
//       );

//       if (!updatedIntegration) {
//         return resolve({
//           reconnect: false,
//           error: new Error(`Integration ${integration._id} not found`),
//         });
//       }

//       let lastFetchDate = updatedIntegration.lastFetchDate
//         ? new Date(updatedIntegration.lastFetchDate)
//         : new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

//       const imap = createImap(updatedIntegration);

//       const syncEmail = async () => {
//         if (closing) {
//           return;
//         }
//         try {
//           const criteria: any = [
//             'UNSEEN',
//             ['SINCE', lastFetchDate.toISOString()],
//           ];
//           const nextLastFetchDate = new Date();
//           await saveMessages(
//             subdomain,
//             imap,
//             updatedIntegration,
//             criteria,
//             models,
//           );
//           lastFetchDate = nextLastFetchDate;

//           await models.Integrations.updateOne(
//             { _id: updatedIntegration._id },
//             { $set: { lastFetchDate } },
//           );
//         } catch (e) {
//           error = e;
//           reconnect = false;
//           await models.Logs.createLog({
//             type: 'error',
//             message: 'syncEmail error:' + e.message,
//             errorStack: e.stack,
//           });
//           imap.end();
//         }
//       };

//       imap.once('ready', (_response) => {
//         imap.openBox('INBOX', true, async (e, box) => {
//           if (e) {
//             // if we can't open the inbox, we can't sync emails
//             error = e;
//             reconnect = false;
//             closing = true;
//             await models.Logs.createLog({
//               type: 'error',
//               message: 'openBox error:' + e.message,
//               errorStack: e.stack,
//             });
//             return imap.end();
//           }
//           return syncEmail();
//         });
//       });

//       imap.on('mail', throttle(syncEmail, 30000, { leading: true }));

//       imap.on('error', async (e) => {
//         if (closing) {
//           return;
//         }
//         error = e;
//         closing = true;
//         if (e.message.includes('Invalid credentials')) {
//           // We shouldn't try to reconnect, since it's impossible to reconnect when the credentials are wrong.
//           reconnect = false;
//           await models.Integrations.updateOne(
//             { _id: updatedIntegration._id },
//             {
//               $set: {
//                 healthStatus: 'unHealthy',
//                 error: `${e.message}`,
//               },
//             },
//           );
//         }
//         await models.Logs.createLog({
//           type: 'error',
//           message: 'error event: ' + e.message,
//           errorStack: e.stack,
//         });
//         imap.end();
//       });

//       const closeEndHandler = async () => {
//         closing = true;

//         try {
//           await imap.end();
//         } catch (e) {}

//         try {
//           imap.removeAllListeners();
//         } catch (e) {}

//         await cleanupLock();

//         return resolve({
//           reconnect,
//           error,
//           result,
//         });
//       };

//       imap.once('close', closeEndHandler);
//       imap.once('end', closeEndHandler);

//       imap.connect();

//       let lockExtendInterval = setInterval(async () => {
//         try {
//           await lock.extend(60000);
//         } catch (e) {
//           reconnect = false;
//           result = `Integration ${integration._id} is already being listened to`;
//           await cleanupLock();
//           imap.end();
//         }
//       }, 30_000);

//       const cleanupLock = async () => {
//         try {
//           clearInterval(lockExtendInterval);
//         } catch (e) {}
//         try {
//           await lock.unlock();
//         } catch (e) {}
//       };
//     });
//   };

//   while (true) {
//     try {
//       const result = await listen();
//       result.error && console.error(result.error);

//       if (!result.reconnect) {
//         break;
//       }
//       await new Promise((resolve) => setTimeout(resolve, 10_000));
//     } catch (e) {
//       console.error(e);
//       break;
//     }
//   }
// };

// const startDistributingJobs = async (subdomain: string) => {
//   const models = await generateModels(subdomain);

//   const distributeJob = async () => {
//     let lock;
//     try {
//       lock = await redlock.lock(`${subdomain}:imap:work_distributor`, 60000);
//     } catch (e) {
//       // 1 other pod or container is already working on job distribution
//       return;
//     }

//     try {
//       await models.Logs.createLog({
//         type: 'info',
//         message: `Distributing imap sync jobs`,
//       });

//       const integrations = await models.Integrations.find({
//         healthStatus: 'healthy',
//       });

//       for (const integration of integrations) {
//         sendImapMessage({
//           subdomain,
//           action: 'listen',
//           data: {
//             _id: integration._id,
//           },
//         });
//       }
//     } catch (e) {
//       await lock.unlock();
//     }
//   };
//   // wait for other containers to start up
//   NODE_ENV === 'production' &&
//     (await new Promise((resolve) => setTimeout(resolve, 60000)));

//   while (true) {
//     try {
//       await distributeJob();
//       // try doing it every 10 minutes
//       await new Promise((resolve) => setTimeout(resolve, 10 * 60 * 1000));
//     } catch (e) {
//       console.log('distributeWork error', e);
//     }
//   }
// };

// export default startDistributingJobs;

// export const routeErrorHandling = (fn, callback?: any) => {
//   return async (req, res, next) => {
//     try {
//       await fn(req, res, next);
//     } catch (e) {
//       console.log(e.message);

//       if (callback) {
//         return callback(res, e, next);
//       }

//       return next(e);
//     }
//   };
// };
