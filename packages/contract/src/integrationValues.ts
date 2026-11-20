import { z } from 'zod';

export const INTEGRATION_NAMESPACE = 'integrations';

export const INTEGRATION_FIELD_MAX = 50;

export const IntegrationKey = z
  .string()
  .trim()
  .regex(/^[a-z][a-z0-9_]{0,39}$/, 'lower case letters, digits and _, starting with a letter');

export const IntegrationDataKey = z
  .string()
  .regex(/^[A-Za-z]\w{0,59}$/, 'letters, digits and _, starting with a letter');

export const IntegrationHost = z
  .string()
  .trim()
  .toLowerCase()
  .max(255)
  .regex(/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?(:\d{1,5})?$/, 'a host name, like api.example.com');

export const IntegrationHosts = z.array(IntegrationHost).min(1).max(10);

export const integrationType = (integrationKey: string, key: string) =>
  `${INTEGRATION_NAMESPACE}.${integrationKey}.${key}`;

export const isIntegrationType = (type: string) => type.startsWith(`${INTEGRATION_NAMESPACE}.`);
