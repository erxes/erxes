import { Icon, IconBuilding, IconUser } from '@tabler/icons-react';
import { FocusSheet, SideMenuContext, Tabs, useFocusSheet } from 'erxes-ui';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EmbeddedRecordPanel } from '../record-side-panel/EmbeddedRecordPanel';
import { useRecordView } from '../record-side-panel/recordView';
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

const compactIds = (ids?: (string | null)[] | null) =>
  [...new Set((ids || []).filter((id): id is string => !!id))];

const CUSTOMERS_TAB = 'customers';
const COMPANIES_TAB = 'companies';

/**
 * A record's side rail in a detail sheet: its customers and its companies
 * (given from the record's own fields),
 * each opening the side panel's view of them in the sheet (the app's side
 * panel cannot be reached from a modal sheet). Everything else linked to the
 * record is linked through them, so it is found there. Host tabs, e.g.
 * properties, follow.
 */
export const RelationWidgetSideTabs = ({
  customerIds = [],
  companyIds = [],
  extraTabs = [],
}: {
  // The record's own contacts (its customerIds / companyIds).
  customerIds?: (string | null)[] | null;
  companyIds?: (string | null)[] | null;
  // Host-owned tabs shown after the contacts, e.g. properties.
  extraTabs?: IRelationWidgetExtraTab[];
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { setActiveSideTab } = useFocusSheet();
  const hasRecordView = !!useRecordView();
  const close = useCallback(() => setActiveSideTab?.(null), [setActiveSideTab]);

  const contactTabs = hasRecordView
    ? [
        {
          value: CUSTOMERS_TAB,
          label: t('customers', 'Customers'),
          icon: IconUser,
          records: compactIds(customerIds).map((id) => ({
            contentType: CUSTOMER_CONTENT_TYPE,
            contentId: id,
          })),
        },
        {
          value: COMPANIES_TAB,
          label: t('companies', 'Companies'),
          icon: IconBuilding,
          records: compactIds(companyIds).map((id) => ({
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
        <FocusSheet.SideContent key={tab.value} value={tab.value}>
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
