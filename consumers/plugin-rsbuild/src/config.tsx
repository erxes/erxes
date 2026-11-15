import { Organization as OrganizationSchema, type PluginManifest } from '@erxes/core-contract';
import type { CoreClient } from '@erxes/plugin-sdk';
import { contactQueries } from '@erxes/core-contract/client';
import {
  Button,
  ContactLink,
  pluginJson,
  type IUIConfig,
  type TRecordSectionProps,
} from 'erxes-ui';
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
export const wrongCurrency: Organization['currency'] = 1;
// @ts-expect-error Button has no such prop
export const wrongButton = <Button nope />;
// @ts-expect-error a title is a string
export const wrongTitle: PluginManifest['title'] = 1;

const Main = () => (
  <Button
    className={cn('w-full')}
    onClick={() => pluginJson('consumer', '/org', OrganizationSchema)}
  >
    Load
  </Button>
);

// A section on core's customer panel, linking back to the customer.
const CustomerSection = ({ contentType, contentId }: TRecordSectionProps) => (
  <ContactLink contentType={contentType} contentId={contentId} contacts={contactQueries} />
);

const SectionIcon = ({ className }: { className?: string }) => <svg className={className} />;

export const CONFIG: IUIConfig = {
  name: 'consumer',
  path: 'consumer',
  recordSections: [
    {
      contentType: 'core:customer',
      title: 'Consumer',
      icon: SectionIcon,
      component: CustomerSection,
    },
  ],
};

export default Main;
