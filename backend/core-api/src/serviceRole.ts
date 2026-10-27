// all: one process (self-hosted default); api / worker: split into separate deployments
export type TServiceRole = 'all' | 'api' | 'worker';

const SERVICE_ROLES: TServiceRole[] = ['all', 'api', 'worker'];

export type TServiceRoleConfig = {
  role: TServiceRole;
  // serves requests and joins the gateway
  runsApi: boolean;
  // consumes queues only; never reachable through the gateway
  runsWorkers: boolean;
};

// Call after dotenv.config() so SERVICE_ROLE from .env is seen.
export const readServiceRole = (): TServiceRoleConfig => {
  const role = process.env.SERVICE_ROLE || 'all';

  if (!SERVICE_ROLES.includes(role as TServiceRole)) {
    throw new Error(
      `SERVICE_ROLE must be one of ${SERVICE_ROLES.join(', ')}, got "${role}"`,
    );
  }

  return {
    role: role as TServiceRole,
    runsApi: role !== 'worker',
    runsWorkers: role !== 'api',
  };
};
