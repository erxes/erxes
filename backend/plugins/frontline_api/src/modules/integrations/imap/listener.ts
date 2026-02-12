import { IModels } from '~/connectionResolvers';
import { IIntegrationImapDocument } from '@/integrations/imap/models';
import { createImap } from './imapClient';
import { saveMessages } from './messageSaver';
import { throttle } from 'lodash';
import { redlock } from './redlock';
import { ListenResult } from '../../../shared/types';
import { Lock } from 'redlock';

export const listenIntegration = async (
  subdomain: string,
  integration: IIntegrationImapDocument,
  models: IModels,
): Promise<void> => {
  const listen = (): Promise<ListenResult> => {
    return new Promise<ListenResult>((resolve) => {
      (async () => {
        let reconnect = true;
        let closing = false;
        let error: Error | undefined;
        let result: string | undefined;
        let lock: Lock | null | undefined;

        try {
          lock = await redlock.acquire(
            [`${subdomain}:imap:integration:${integration._id}`],
            60000,
          );
        } catch (e) {
          console.log(
            'Could not acquire Redis lock for listener, proceeding without lock:',
            e.message,
          );
          lock = null;
        }

        if (lock) {
          try {
            await lock.extend(60000);
          } catch (e) {
            console.log('Could not extend Redis lock:', e.message);
          }
        }

        const updatedIntegration = await models.ImapIntegrations.findById(
          integration._id,
        );

        if (!updatedIntegration) {
          if (lock) {
            try {
              await lock.release();
            } catch (e) {
              console.log('Error releasing lock:', e.message);
            }
          }
          return resolve({
            reconnect: false,
            error: new Error(`Integration ${integration._id} not found`),
          });
        }

        const lastFetchDate = updatedIntegration.lastFetchDate
          ? new Date(updatedIntegration.lastFetchDate)
          : new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

        const imap = createImap(updatedIntegration);

        let lastSyncTime = lastFetchDate;
        let mailboxOpen = false;

        const syncEmail = async () => {
          if (closing || !mailboxOpen) return;

          try {
            console.log(
              `[IMAP] Starting email sync for integration ${integration._id}`,
            );

            const criteria: any = [
              'UNSEEN',
              ['SINCE', lastSyncTime.toISOString()],
            ];

            const nextLastFetchDate = new Date();
            await saveMessages(
              subdomain,
              imap,
              updatedIntegration,
              criteria,
              models,
            );

            lastSyncTime = nextLastFetchDate;
            console.log(
              `[IMAP] Sync completed for integration ${
                integration._id
              }, next sync from: ${lastSyncTime.toISOString()}`,
            );

            // Update integration's last fetch date
            await models.ImapIntegrations.updateOne(
              { _id: updatedIntegration._id },
              { $set: { lastFetchDate: nextLastFetchDate } },
            );
          } catch (e) {
            console.error(
              `[IMAP] Sync error for integration ${integration._id}:`,
              e,
            );
            error = e;
            reconnect = false;
            imap.end();
          }
        };

        // Initial sync will be called after mailbox is opened in 'ready' event
        // await syncEmail(); // Remove this - it's called after mailbox opens

        imap.once('ready', () => {
          imap.openBox('INBOX', true, async (e) => {
            if (e) {
              error = e;
              reconnect = false;
              closing = true;
              return imap.end();
            }
            mailboxOpen = true;
            console.log(
              `[IMAP] Mailbox opened for integration ${integration._id}`,
            );
            // Now that mailbox is open, do initial sync
            await syncEmail();

            // Enable IDLE for real-time updates (if supported)
            setTimeout(() => {
              if (imap.serverSupports('IDLE') && mailboxOpen) {
                console.log(
                  `[IMAP] Enabling IDLE for integration ${integration._id}`,
                );
                // IDLE is automatically enabled when using node-imap
                // The 'idle' event will fire when new emails arrive
                console.log(
                  `[IMAP] IDLE mode active for integration ${integration._id}`,
                );
              }
            }, 1000);
          });
        });

        // Multiple event listeners for better reliability
        imap.on('mail', throttle(syncEmail, 30_000, { leading: true }));
        imap.on('new', throttle(syncEmail, 30_000, { leading: true }));
        imap.on('expunge', throttle(syncEmail, 30_000, { leading: true }));

        // Enhanced connection monitoring
        imap.on('timeout', () => {
          console.log(
            `[IMAP] Connection timeout for integration ${integration._id}`,
          );
        });

        imap.on('alert', (msg) => {
          console.log(`[IMAP] Alert for integration ${integration._id}:`, msg);
        });

        // Handle IDLE events for real-time updates
        imap.on('idle', () => {
          console.log(
            `[IMAP] IDLE event for integration ${integration._id}, checking for new emails`,
          );
          syncEmail();
        });

        // Periodic polling as fallback (every 2 minutes)
        const pollingInterval = setInterval(async () => {
          if (!closing && imap.state === 'authenticated') {
            console.log(
              `[IMAP] Periodic poll for integration ${integration._id}`,
            );
            await syncEmail();
          }
        }, 2 * 60 * 1000);

        // Connection monitoring
        imap.on('error', async (e) => {
          if (closing) return;

          console.error(
            `[IMAP] Connection error for integration ${integration._id}:`,
            e,
          );
          error = e;
          closing = true;
          clearInterval(pollingInterval);

          if (e.message.includes('Invalid credentials')) {
            reconnect = false;
            await models.ImapIntegrations.updateOne(
              { _id: updatedIntegration._id },
              {
                $set: {
                  healthStatus: 'unHealthy',
                  error: e.message,
                },
              },
            );
          }
          imap.end();
        });

        // Handle connection close
        imap.on('close', async () => {
          console.log(
            `[IMAP] Connection closed for integration ${integration._id}`,
          );
          mailboxOpen = false;
          if (!closing) {
            console.log(`[IMAP] Unexpected close, will reconnect`);
            closing = true;
            clearInterval(pollingInterval);
          }
        });

        // Handle connection end
        imap.on('end', async () => {
          console.log(
            `[IMAP] Connection ended for integration ${integration._id}`,
          );
          mailboxOpen = false;
          if (!closing) {
            console.log(`[IMAP] Unexpected end, will reconnect`);
            closing = true;
            clearInterval(pollingInterval);
          }
        });

        const lockExtendInterval = setInterval(async () => {
          if (lock) {
            try {
              await lock.extend(60000);
            } catch (e) {
              console.log('Lock extension failed:', e.message);
              reconnect = false;
              result = `Integration ${integration._id} lock extension failed`;
              await cleanupLock();
              imap.end();
            }
          }
        }, 30_000);

        const cleanupLock = async () => {
          clearInterval(lockExtendInterval);
          clearInterval(pollingInterval);
          if (lock) {
            try {
              await lock.release();
            } catch (e) {
              console.log('Lock release error:', e.message);
            }
          }
        };

        const closeEndHandler = async () => {
          closing = true;

          try {
            imap.removeAllListeners();
            imap.end();
          } catch {
            throw new Error('Failed to close IMAP connection');
          }

          await cleanupLock();

          resolve({
            reconnect,
            error,
            result,
          });
        };

        imap.once('close', closeEndHandler);
        imap.once('end', closeEndHandler);

        imap.connect();
      })().catch((err) => {
        resolve({
          reconnect: false,
          error: err as Error,
        });
      });
    });
  };

  while (true) {
    try {
      const result = await listen();

      if (result.error) {
        console.error(result.error);
      }

      if (!result.reconnect) {
        break;
      }

      await new Promise((r) => setTimeout(r, 10_000));
    } catch (e) {
      console.error(e);
      break;
    }
  }
};
