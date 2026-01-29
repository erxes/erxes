import { getEnv, getSubdomain } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { routeErrorHandling, findAttachmentParts, toUpper } from './utils';
import { imapListen } from './messageBroker';
import { redlock } from './redlock';
import express from 'express';
import { createImap } from './imapClient';
import * as fs from 'fs';
import { Base64Decode } from 'base64-stream';
import * as dotenv from 'dotenv';

dotenv.config();

const { NODE_ENV } = process.env;

const startDistributingJobs = async (subdomain: string) => {
  const models = await generateModels(subdomain);

  const distributeJob = async () => {
    let lock;

    try {
      lock = await redlock.acquire(
        [`${subdomain}:imap:work_distributor`],
        60000,
      );
    } catch (e) {
      console.log(
        'Could not acquire Redis lock, proceeding without distributed lock:',
        e.message,
      );
      lock = null;
    }

    try {
      const integrations = await models.ImapIntegrations.find({
        healthStatus: 'healthy',
      });

      console.log(
        `Found ${integrations.length} healthy IMAP integrations to process`,
      );

      for (const integration of integrations) {
        console.log(`Starting listener for integration: ${integration._id}`);
        imapListen({
          subdomain,
          data: {
            _id: integration._id,
          },
        });
      }
    } catch (error) {
      console.error('Job distribution error:', error);
    } finally {
      if (lock && typeof lock.unlock === 'function') {
        try {
          await lock.unlock();
        } catch (unlockError) {
          console.error('Lock unlock error:', unlockError);
        }
      }
    }
  };

  if (NODE_ENV === 'production') {
    await new Promise((resolve) => setTimeout(resolve, 60000));
  }

  while (true) {
    try {
      await distributeJob();
      await new Promise((resolve) => setTimeout(resolve, 10 * 60 * 1000));
    } catch (error) {
      console.error('distributeWork error', error);
    }
  }
};

const onServerInitImap = async (app) => {
  console.log('********* IMAP ********');

  app.use(
    express.json({
      limit: '15mb',
    }),
  );

  app.use((_req, _res, next) => {
    next();
  });

  app.get(
    '/read-mail-attachment',
    routeErrorHandling(
      async (req, res, next) => {
        const subdomain = getSubdomain(req);
        const models = await generateModels(subdomain);

        const { messageId, integrationId, filename } = req.query;

        const integration = await models.ImapIntegrations.findOne({
          inboxId: integrationId,
        });

        if (!integration) {
          throw new Error('Integration not found');
        }

        const sentMessage = await models.ImapMessages.findOne({
          messageId,
          inboxIntegrationId: integrationId,
          type: 'SENT',
        });

        let folderType = 'INBOX';

        if (sentMessage) {
          folderType = '[Gmail]/Sent Mail';
        }

        const imap = createImap(integration);

        imap.once('ready', () => {
          imap.openBox(folderType, true, async (err, box) => {
            imap.search(
              [['HEADER', 'MESSAGE-ID', messageId]],
              function (err, results) {
                if (err) {
                  imap.end();
                  console.log('read-mail-attachment =============', err);
                  return next(err);
                }

                let f;

                try {
                  f = imap.fetch(results, { bodies: '', struct: true });
                } catch (e) {
                  imap.end();
                  return next(e);
                }

                f.on('message', function (msg) {
                  msg.once('attributes', function (attrs) {
                    const attachments = findAttachmentParts(attrs.struct);

                    if (attachments.length === 0) {
                      imap.end();
                      return res.status(404).send('Not found');
                    }

                    for (let i = 0, len = attachments.length; i < len; ++i) {
                      const attachment = attachments[i];

                      if (attachment.params.name === filename) {
                        const f = imap.fetch(attrs.uid, {
                          bodies: [attachment.partID],
                          struct: true,
                        });

                        f.on('message', (msg) => {
                          const filename = attachment.params.name;
                          const encoding = attachment.encoding;

                          msg.on('body', function (stream) {
                            const writeStream = fs.createWriteStream(
                              `${__dirname}/${filename}`,
                            );

                            if (toUpper(encoding) === 'BASE64') {
                              stream.pipe(new Base64Decode()).pipe(writeStream);
                            } else {
                              stream.pipe(writeStream);
                            }
                          });

                          msg.once('end', function () {
                            imap.end();
                            return res.download(`${__dirname}/${filename}`);
                          });
                        });
                      }
                    }
                  });
                });
              },
            );
          });
        });

        imap.connect();
      },
      (res) => res.send('ok'),
    ),
  );

  const VERSION = getEnv({ name: 'VERSION' });

  if (VERSION && VERSION === 'saas') {
    console.log(
      'SAAS mode detected, but organization handling not implemented',
    );
    startDistributingJobs('os');
  } else {
    console.log('Starting IMAP job distributor for default subdomain');
    startDistributingJobs('os');
  }
};

export default onServerInitImap;
