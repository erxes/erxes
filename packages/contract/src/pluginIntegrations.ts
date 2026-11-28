import { z } from 'zod';
import { Country } from './money';
import { IntegrationCategory, IntegrationKey } from './values';

/**
 * An integration a plugin brings to Settings › Integrations (`facebook`), listed next to core's
 * for members with `integrations.manage` and `permission`, one of the manifest's own
 * permissions. The plugin keeps its keys in core's vault (`secrets.*`), draws the page's tabs
 * in its UI, and reports where it stands with `integrations.report`.
 */
export const PluginIntegration = z.object({
  /** Unique within the plugin; its page is `/settings/integrations/<plugin>.<key>`. */
  key: IntegrationKey,
  name: z.string().trim().min(1).max(80),
  /** One line on its tile and under its name. */
  summary: z.string().trim().min(1).max(300),
  category: IntegrationCategory,
  /** The ISO 3166 countries it serves (`MN`); none: any. */
  countries: z.array(Country).max(250).optional(),
  permission: z.string().trim().min(1).max(100),
  /**
   * The core integration its accounts connect through (`facebook`), one the manifest's
   * `connections` names. It gets no tile of its own: its tabs join that integration's page, which
   * lists it under "Used by".
   */
  connection: IntegrationKey.optional(),
});

/** The manifest's `integrations`, each key once, at most 20. */
export const PluginIntegrations = z
  .array(PluginIntegration)
  .max(20)
  .refine(
    (list) => new Set(list.map((integration) => integration.key)).size === list.length,
    'each key once',
  );
