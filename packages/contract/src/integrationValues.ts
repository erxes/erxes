import { z } from 'zod';

export const IntegrationKey = z
  .string()
  .trim()
  .regex(/^[a-z][a-z0-9_]{0,39}$/, 'lower case letters, digits and _, starting with a letter');

export const IntegrationHost = z
  .string()
  .trim()
  .toLowerCase()
  .max(255)
  .regex(/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?(:\d{1,5})?$/, 'a host name, like api.example.com');
