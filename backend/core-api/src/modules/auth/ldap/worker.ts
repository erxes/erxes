import { Job } from 'bullmq';
import {
  createMQWorkerWithListeners,
  redis,
  sendWorkerQueue,
} from 'erxes-api-shared/utils';
import { generateModels, IModels } from '~/connectionResolvers';

const LDAP_QUEUE = 'ldap-recheck';

const schedulerId = (subdomain: string) => `ldap-recheck-${subdomain}`;

// Interval each tenant was last armed with, so logins don't re-arm on every call
const armed = new Map<string, number>();
let started = false;

const ldapProcessor = async (job: Job<{ subdomain: string }>) => {
  const models = await generateModels(job.data.subdomain);

  return models.AuthIdentities.recheckLdapUsers();
};

export const startLdapWorker = () => {
  if (started) {
    return;
  }

  started = true;

  createMQWorkerWithListeners('core', LDAP_QUEUE, ldapProcessor, redis, () => {
    console.log(`Worker for queue ${LDAP_QUEUE} is ready`);
  });
};

/**
 * Keeps the tenant's recheck schedule in line with its LDAP settings. Called on
 * save and on LDAP login, so a restart re-arms it with the first directory login.
 */
export const armLdapRecheck = async (models: IModels, subdomain: string) => {
  const config = await models.LdapConfigs.getLdapConfig();
  const minutes = config?.enabled ? config.recheckEveryMinutes : 0;

  if (armed.get(subdomain) === minutes) {
    return;
  }

  const queue = sendWorkerQueue('core', LDAP_QUEUE);

  if (minutes) {
    await queue.upsertJobScheduler(
      schedulerId(subdomain),
      { every: minutes * 60 * 1000 },
      {
        name: 'recheck',
        data: { subdomain },
        opts: { removeOnComplete: 24, removeOnFail: 50 },
      },
    );
  } else {
    await queue.removeJobScheduler(schedulerId(subdomain));
  }

  armed.set(subdomain, minutes);
};

export const getNextLdapRecheckAt = async (subdomain: string) => {
  const scheduler = await sendWorkerQueue('core', LDAP_QUEUE).getJobScheduler(
    schedulerId(subdomain),
  );

  return scheduler?.next ? new Date(scheduler.next) : null;
};
