import type { PluginManifest } from '@erxes/core-contract';
import type { CoreClient } from '@erxes/plugin-sdk';
import { Button, pluginJson, type IUIConfig } from 'erxes-ui';
import { cn } from 'erxes-ui/lib/utils';

// Types from all three packages, the root export and a `./*` subpath of erxes-ui.
export const manifest = {
  title: 'Consumer',
  version: '1.0.0',
  scopes: ['customers:read'],
} satisfies PluginManifest;

export type Organization = Awaited<ReturnType<CoreClient['organizations']['current']>>;

// skipLibCheck hides a .d.ts import that does not resolve, and the type turns into
// `any`. These fail the type check in that case.
// @ts-expect-error a currency is a string
export const wrongOrganization: Organization = { currency: 1 };
// @ts-expect-error Button has no such prop
export const wrongButton = <Button nope />;
// @ts-expect-error a manifest has a title
export const wrongManifest: PluginManifest = { version: '1.0.0' };

const Main = () => (
  <Button className={cn('w-full')} onClick={() => pluginJson<Organization>('consumer', '/org')}>
    Load
  </Button>
);

export const CONFIG: IUIConfig = {
  name: 'consumer',
  path: 'consumer',
};

export default Main;
