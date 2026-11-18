import { Spinner, type TRecordContacts, type TRelationTab } from 'erxes-ui';
import { Suspense } from 'react';
import { ContactDetailScroll } from '~/modules/side-panel/details/ContactDetailFields';
import type { IRecordSidePanelTab } from '~/modules/side-panel/RecordSidePanel';
import { useRelationTabOrder } from '~/modules/side-panel/relationTabOrder';
import { PluginBoundary } from './PluginBoundary';
import { usePluginText } from './pluginText';
import { usePlugins } from './usePlugins';

/** Where a relation tab shows when it names no hosts: a customer's and a company's panels. */
const CONTACT_TYPES = ['core:customer', 'core:company'];

/** A relation tab's `hosts` entry for every record type. */
const EVERY_RECORD_TYPE = '*';

/**
 * Whether a plugin's relation tab shows on a record of `contentType`: the record types its
 * `hosts` names (`core:customer` alone, `tasks:task`, `*` for all), else customers and
 * companies. Another plugin's record shows it only when named, so an order doesn't list its
 * customer's deals unless the plugin asks for that.
 */
const showsOn = (tab: TRelationTab, contentType: string) => {
  const hosts = tab.hosts ?? CONTACT_TYPES;

  return hosts.includes(EVERY_RECORD_TYPE) || hosts.includes(contentType);
};

/** One plugin's relation tab: its list, kept apart if it crashes. */
const RelationTabContent = ({
  plugin,
  tab,
  contentType,
  contentId,
  contacts,
}: {
  plugin: string;
  tab: TRelationTab;
  contentType: string;
  contentId: string;
  contacts: TRecordContacts;
}) => {
  const Content = tab.component;

  return (
    <ContactDetailScroll>
      <PluginBoundary name={plugin} compact resetKey={contentId}>
        <Suspense fallback={<Spinner area="lg" />}>
          <Content
            contentType={contentType}
            contentId={contentId}
            customerIds={contacts.customerIds}
            companyIds={contacts.companyIds}
          />
        </Suspense>
      </PluginBoundary>
    </ContactDetailScroll>
  );
};

/**
 * The tabs installed plugins the member may use add to a record (`relationTabs` in their
 * `CONFIG`): a customer's deals, a task's deals. None until the record's contacts are known.
 */
export const usePluginRelationTabs = ({
  contentType,
  contentId,
  contacts,
}: {
  contentType: string;
  contentId: string;
  contacts: TRecordContacts | undefined;
}): IRecordSidePanelTab[] => {
  const { plugins } = usePlugins();
  const text = usePluginText();
  const order = useRelationTabOrder();

  if (!contacts) return [];

  const tabs = plugins.flatMap(({ remote, config }) =>
    config.relationTabs
      .filter((tab) => showsOn(tab, contentType))
      .map((tab) => ({
        value: `${remote}:${tab.name}`,
        label: text(config.name, tab.title),
        icon: tab.icon,
        sortable: true,
        content: (
          <RelationTabContent
            plugin={config.name}
            tab={tab}
            contentType={contentType}
            contentId={contentId}
            contacts={contacts}
          />
        ),
      })),
  );

  return order.sort(tabs, (tab) => tab.value);
};
