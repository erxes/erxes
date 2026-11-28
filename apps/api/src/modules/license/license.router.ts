import { licenseStatus, refreshLicense } from '~/modules/license/license.service';
import { scoped, unscoped } from '~/orpc';

export const licenseRouter = {
  status: scoped.license.status.handler(() => licenseStatus()),
  // Unscoped: it waits on erxes.io, which no transaction should.
  refresh: unscoped.license.refresh.handler(() => refreshLicense()),
};
