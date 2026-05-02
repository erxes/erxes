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
        } catch {
          return resolve({ reconnect: false });
        }

        if (lock) {
          try {
            await lock.extend(60000);
          } catch {
            // ignore — lock extension failure is non-fatal
          }
        }

        const updatedIntegration = await models.ImapIntegrations.findById(
          integration._id,
        );

        if (!updatedIntegration) {
          if (lock) {
            try {
              await lock.release();
            } catch {
              // best-effort
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

        imap.once('ready', () => {
          imap.openBox('INBOX', true, async (e) => {
            if (e) {
              error = e;
              reconnect = false;
              closing = true;
              return imap.end();
            }
            mailboxOpen = true;
            await syncEmail();
          });
        });

        imap.on('mail', throttle(syncEmail, 30_000, { leading: true }));
        imap.on('new', throttle(syncEmail, 30_000, { leading: true }));
        imap.on('expunge', throttle(syncEmail, 30_000, { leading: true }));
        imap.on('idle', throttle(syncEmail, 30_000, { leading: true }));

        imap.on('alert', () => {
          // no-op — alerts are informational only
        });

        // Periodic polling as fallback (every 2 minutes)
        const pollingInterval = setInterval(async () => {
          if (!closing && imap.state === 'authenticated') {
            await syncEmail();
          }
        }, 2 * 60 * 1000);

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

        imap.on('close', async () => {
          mailboxOpen = false;
          if (!closing) {
            closing = true;
            clearInterval(pollingInterval);
          }
        });

        imap.on('end', async () => {
          mailboxOpen = false;
          if (!closing) {
            closing = true;
            clearInterval(pollingInterval);
          }
        });

        const lockExtendInterval = setInterval(async () => {
          if (lock) {
            try {
              await lock.extend(60000);
            } catch {
              lock = null;
            }
          }
        }, 30_000);

        const cleanupLock = async () => {
          clearInterval(lockExtendInterval);
          clearInterval(pollingInterval);
          if (lock) {
            try {
              await lock.release();
            } catch {
              // best-effort
            }
            lock = null;
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
