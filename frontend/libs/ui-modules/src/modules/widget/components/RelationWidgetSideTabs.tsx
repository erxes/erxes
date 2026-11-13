import { Icon, IconBuilding, IconUser } from '@tabler/icons-react';
import { FocusSheet, SideMenuContext, Tabs, useFocusSheet } from 'erxes-ui';
import { useCallback, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { EmbeddedRecordPanel } from '../record-side-panel/EmbeddedRecordPanel';
import { useRecordView } from '../record-side-panel/recordView';
import { sidePanelWidthState } from '../record-side-panel/useSidePanel';
import { COMPANY_CONTENT_TYPE, CUSTOMER_CONTENT_TYPE } from '../utils';

export interface IRelationWidgetExtraTab {
  value: string;
  label: string;
  icon: Icon;
  content: React.ReactNode;
}

const noop = () => undefined;

// Widgets written for a SideMenu read their tab from this context and render
// `SideMenu.Content` (a tabs panel), so both are provided: wherever such a
// widget is shown alone (a FocusSheet tab, the side panel), it is its own
// active tab.
export const StaticSideMenuTab = ({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) => {
  const context = useMemo(
    () => ({ activeTab: value, setActiveTab: noop }),
    [value],
  );

  return (
    <SideMenuContext.Provider value={context}>
      {/* `SideMenu.Content` is sized for a side menu (fixed 320px, no
          height). Shown alone (directly, or in one wrapper like the side
          panel's) it fills the space it is given, so its scroll area can
          scroll. Tabs inside a widget are left alone. */}
      <Tabs
        value={value}
        className="contents [&>[role=tabpanel]]:w-full! [&>[role=tabpanel]]:flex-1! [&>[role=tabpanel]]:min-h-0! [&>[role=tabpanel]]:border-l-0! [&>*>[role=tabpanel]]:w-full! [&>*>[role=tabpanel]]:flex-1! [&>*>[role=tabpanel]]:min-h-0! [&>*>[role=tabpanel]]:border-l-0!"
      >
        {children}
      </Tabs>
    </SideMenuContext.Provider>
  );
};

const compactIds = (ids?: (string | null | undefined)[] | null) =>
  [...new Set((ids || []).filter((id): id is string => !!id))];

/**
 * The rail's tab showing the record's customer or company: hosts whose
 * contact fields sit in the same sheet open it with
 * `useFocusSheet().setActiveSideTab(RELATION_CONTACT_SIDE_TABS[kind])`.
 */
export const RELATION_CONTACT_SIDE_TABS = {
  customer: 'customers',
  company: 'companies',
} as const;

const CUSTOMERS_TAB = RELATION_CONTACT_SIDE_TABS.customer;
const COMPANIES_TAB = RELATION_CONTACT_SIDE_TABS.company;

/**
 * A record's side rail in a detail sheet: its customer and its company
 * (given from the record's own fields),
 * each opening the side panel's view of them in the sheet (the app's side
 * panel cannot be reached from a modal sheet). Everything else linked to the
 * record is linked through them, so it is found there. Host tabs, e.g.
 * properties, follow.
 */
export const RelationWidgetSideTabs = ({
  customerId,
  companyId,
  extraTabs = [],
}: {
  // The record's own customer and company.
  customerId?: string | null;
  companyId?: string | null;
  // Host-owned tabs shown after the contacts, e.g. properties.
  extraTabs?: IRelationWidgetExtraTab[];
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { setActiveSideTab } = useFocusSheet();
  const hasRecordView = !!useRecordView();
  const panelWidth = useAtomValue(sidePanelWidthState);
  const close = useCallback(() => setActiveSideTab?.(null), [setActiveSideTab]);

  const contactTabs = hasRecordView
    ? [
        {
          value: CUSTOMERS_TAB,
          label: t('customers', 'Customers'),
          icon: IconUser,
          records: compactIds([customerId]).map((id) => ({
            contentType: CUSTOMER_CONTENT_TYPE,
            contentId: id,
          })),
        },
        {
          value: COMPANIES_TAB,
          label: t('companies', 'Companies'),
          icon: IconBuilding,
          records: compactIds([companyId]).map((id) => ({
            contentType: COMPANY_CONTENT_TYPE,
            contentId: id,
          })),
        },
      ].filter((tab) => tab.records.length > 0)
    : [];

  if (!contactTabs.length && !extraTabs.length) {
    return null;
  }

  return (
    <FocusSheet.SideTabs>
      {contactTabs.map((tab) => (
        <FocusSheet.SideContent
          key={tab.value}
          value={tab.value}
          // As wide as the app's side panel, whatever is loading inside.
          className="flex-none max-w-[50vw]"
          style={{ width: panelWidth }}
        >
          <EmbeddedRecordPanel
            key={tab.records.map((record) => record.contentId).join(',')}
            records={tab.records}
            label={tab.label}
            icon={tab.icon}
            onClose={close}
          />
        </FocusSheet.SideContent>
      ))}
      {extraTabs.map((tab) => (
        <FocusSheet.SideContent key={tab.value} value={tab.value}>
          {tab.content}
        </FocusSheet.SideContent>
      ))}
      <FocusSheet.SideTabsList>
        {[...contactTabs, ...extraTabs].map((tab) => (
          <FocusSheet.SideTabsTrigger
            key={tab.value}
            value={tab.value}
            Icon={tab.icon}
            label={tab.label}
          />
        ))}
      </FocusSheet.SideTabsList>
    </FocusSheet.SideTabs>
  );
};
