import type { KeyedIntegration } from './define';
import { INTEGRATIONS } from './registry';

type Triggers = NonNullable<KeyedIntegration['triggers']>;

export type AppTriggerOf = Triggers[number];

export type App = KeyedIntegration & { triggers: Triggers };

const isApp = (integration: (typeof INTEGRATIONS)[number]): integration is App =>
  Boolean(integration.keys && integration.triggers?.length);

export const APPS: readonly App[] = INTEGRATIONS.filter(isApp);

const BY_KEY = new Map(APPS.map((app) => [app.key, app]));

export const appOf = (key: string) => BY_KEY.get(key) ?? null;

export const triggerOf = (app: string, trigger: string) =>
  appOf(app)?.triggers.find((item) => item.key === trigger) ?? null;

export const HOOK_CHANNEL = 'hook';

export const channelOf = (trigger: AppTriggerOf) =>
  trigger.via === 'hook' ? HOOK_CHANNEL : trigger.key;

export const paramsSchema = (app: App, trigger: AppTriggerOf) =>
  trigger.via === 'hook' ? (app.hooks?.scope ?? null) : trigger.params;
