import { Organization as OrganizationSchema, type PluginManifest } from '@erxes/core-contract';
import type { CoreClient } from '@erxes/plugin-sdk';
import {
  contactQueries,
  contactSearchQueries,
  memberQueries,
  productQueries,
  productSearchQueries,
  unitQueries,
} from '@erxes/core-contract/client';
import { type Icon, IconBox } from '@tabler/icons-react';
import {
  Button,
  ContactLink,
  DisplayMenu,
  Input,
  ListFilter,
  PanelField,
  PanelFormLayout,
  PanelFormRow,
  PanelSection,
  pluginJson,
  RecordPage,
  type ContactQueries,
  type ContactSearchQueries,
  type IUIConfig,
  type MemberQueries,
  type ProductQueries,
  type ProductSearchQueries,
  type UnitQueries,
  type TRecordDraftProps,
  type TRecordSectionProps,
  type TRecordSlotProps,
  type TRelationTabProps,
  useListFilterParams,
  useOpenRecord,
  usePanelExpanded,
  ViewBar,
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

// A plugin hands the contract's query options to erxes-ui's pickers as they are.
export const pickerQueries = {
  contactQueries,
  contactSearchQueries,
  memberQueries,
  productQueries,
  productSearchQueries,
  unitQueries,
} satisfies {
  contactQueries: ContactQueries;
  contactSearchQueries: ContactSearchQueries;
  memberQueries: MemberQueries;
  productQueries: ProductQueries;
  productSearchQueries: ProductSearchQueries;
  unitQueries: UnitQueries;
};

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

// A record of the plugin's own in core's side panel: its slots. Its list's bar below.
const ThingTitle = ({ contentId }: TRecordSlotProps) => <span>{contentId}</span>;

const ThingDetail = ({ contentId }: TRecordSlotProps) => (
  <PanelSection title={usePanelExpanded() ? 'Thing, full size' : 'Thing'}>
    <PanelField label="Id">{contentId}</PanelField>
  </PanelSection>
);

const TabIcon: Icon = IconBox;

// The things of a record's customers, on every other record's panel.
const ThingsTab = ({ customerIds }: TRelationTabProps) => {
  const { open } = useOpenRecord();

  return (
    <Button onClick={() => open({ contentType: 'consumer:thing', contentId: 't1' })}>
      {customerIds.join()}
    </Button>
  );
};

const ThingNew = ({ onCreated }: TRecordDraftProps) => (
  <PanelFormLayout onCancel={() => onCreated('t1')}>
    <PanelFormRow label="Name">
      <Input name="name" />
    </PanelFormRow>
  </PanelFormLayout>
);

export const Things = () => {
  const { openNew } = useOpenRecord();
  const filter = useListFilterParams();

  return (
    <ViewBar allLabel={`All things ${filter.search ?? ''}`}>
      <ListFilter
        id="consumer-things"
        fields={[{ path: 'subject.name', label: 'Name', type: 'text' }]}
      >
        <DisplayMenu list="consumer-things" />
      </ListFilter>
      <Button onClick={() => openNew('consumer:thing', { stage: 's1' })}>Add</Button>
      <RecordPage contentType="consumer:thing" contentId="t1" />
    </ViewBar>
  );
};

export const CONFIG: IUIConfig = {
  name: 'consumer',
  path: 'consumer',
  recordTypes: [
    {
      contentType: 'consumer:thing',
      title: 'Thing',
      icon: SectionIcon,
      detailPath: (id) => `/consumer/things/${id}`,
      Title: ThingTitle,
      Detail: ThingDetail,
      tabs: [{ value: 'notes', label: 'Notes', icon: TabIcon, component: ThingTitle }],
      New: ThingNew,
      contacts: (id) => ({
        queryKey: ['thing-contacts', id],
        queryFn: async () => ({ customerIds: [], companyIds: [] }),
      }),
      activity: 'consumer.thing',
    },
  ],
  relationTabs: [{ name: 'things', title: 'Things', icon: TabIcon, component: ThingsTab }],
  recordSections: [
    {
      contentType: 'core:customer',
      title: 'Consumer',
      icon: SectionIcon,
      component: CustomerSection,
    },
  ],
  dashboardWidgets: [
    { name: 'load', title: 'Load', icon: SectionIcon, preview: 'kpi', component: Main },
  ],
};

export default Main;
