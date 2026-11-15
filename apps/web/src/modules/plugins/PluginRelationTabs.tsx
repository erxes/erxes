import { Spinner, type TRecordContacts, type TRelationTab } from 'erxes-ui';
import { Suspense } from 'react';
import { ContactDetailScroll } from '~/modules/side-panel/details/ContactDetailFields';
import type { IRecordSidePanelTab } from '~/modules/side-panel/RecordSidePanel';
import { PluginBoundary } from './PluginBoundary';
import { usePlugins } from './usePlugins';

/**
 * Whether a plugin's relation tab shows on a record of `contentType`: on the hosts it names,
 * or, naming none, on every record but the plugin's own.
 */
const showsOn = (tab: TRelationTab, plugin: string, contentType: string) =>
  tab.hosts
    ? tab.hosts.includes(contentType)
    : !contentType.toLowerCase().startsWith(`${plugin.toLowerCase()}:`);

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

  if (!contacts) return [];

  return plugins.flatMap(({ remote, config }) =>
    config.relationTabs
      .filter((tab) => showsOn(tab, config.name, contentType))
      .map((tab) => ({
        value: `${remote}:${tab.name}`,
        label: tab.title,
        icon: tab.icon,
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
};
