import {
  IconCashRegister,
  IconHistory,
  IconInfoCircle,
  IconPlug,
} from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  PageContainer,
  Separator,
  useQueryState,
} from 'erxes-ui';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  type IRecordSidePanelTab,
  type ISidePanelNavigator,
  PageHeader,
  RecordSidePanel,
  relationSettingsModuleKey,
  SidePanelNavigatorContext,
  useRelationSettingsModules,
  useSidePanel,
} from 'ui-modules';
import PosDelete from '@/pos/components/pos-delete/PosDelete';
import {
  PosSettingsTabContent,
  PosSettingsTitle,
} from '@/pos/components/pos-edit/PosSettingsPanel';
import {
  POS_GENERAL_TAB,
  POS_RELATION_TAB_PREFIX,
  POS_SETTINGS_TABS,
} from '@/pos/constants';
import { POS_CONTENT_TYPE } from '@/pos/constants/posPanel';
import { posPanelTabAtom } from '@/pos/states/posPanelTab';
import { PosPanelActivity } from '~/widgets/record-panel/PosPanelShared';

const POS_SETTINGS_LIST_PATH = '/sales/settings/pos';
const ACTIVITY_TAB = 'activity';
const POS_PAGE_DEFAULT_TAB = 'permission';

const PosSettingsBreadcrumb = ({ posId }: { posId: string }) => {
  const { t } = useTranslation('sales');

  return (
    <Breadcrumb className="min-w-0">
      <Breadcrumb.List className="gap-1 flex-nowrap min-w-0">
        <Breadcrumb.Item className="shrink-0">
          <Button variant="ghost" asChild>
            <Link to={POS_SETTINGS_LIST_PATH}>
              <IconCashRegister />
              {t('pos')}
            </Link>
          </Button>
        </Breadcrumb.Item>
        <Separator.Inline />
        <Breadcrumb.Item className="min-w-0">
          <Breadcrumb.Page className="block min-w-0 max-w-md truncate px-2 text-sm">
            <PosSettingsTitle posId={posId} />
          </Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb>
  );
};

const PosGeneralHeader = () => {
  const { t } = useTranslation('sales');

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
      <IconInfoCircle className="size-4 shrink-0" />
      <span className="truncate">{t('general-information')}</span>
    </div>
  );
};

const usePosSettingsPageTabs = (posId: string): IRecordSidePanelTab[] => {
  const { t } = useTranslation('sales');
  const { t: tPanel } = useTranslation('common', { keyPrefix: 'side-panel' });
  const relationModules = useRelationSettingsModules();

  return [
    ...POS_SETTINGS_TABS.map((tab) => ({
      value: tab.value,
      label: t(tab.labelKey),
      icon: tab.icon,
      content: (
        <PosSettingsTabContent
          posId={posId}
          tab={tab.value}
          compact={tab.value === POS_GENERAL_TAB}
        />
      ),
    })),
    ...relationModules.map((module) => {
      const value = `${POS_RELATION_TAB_PREFIX}${relationSettingsModuleKey(
        module,
      )}`;

      return {
        value,
        label: module.label || module.name,
        icon: module.icon || IconPlug,
        content: <PosSettingsTabContent posId={posId} tab={value} />,
      };
    }),
    {
      value: ACTIVITY_TAB,
      label: tPanel('activity'),
      icon: IconHistory,
      content: <PosPanelActivity contentId={posId} />,
    },
  ];
};

const PLUGIN_TAB_PREFIX = 'plugin:';

const usePanelTabOnExpand = (posId: string, tabs: IRecordSidePanelTab[]) => {
  const [panelTab, setPanelTab] = useAtom(posPanelTabAtom);
  const [expandedTab] = useState(() => {
    if (panelTab?.posId !== posId) {
      return null;
    }

    const value = panelTab.tab.startsWith(PLUGIN_TAB_PREFIX)
      ? panelTab.tab.slice(PLUGIN_TAB_PREFIX.length)
      : panelTab.tab;

    return tabs.some((entry) => entry.value === value) ? value : null;
  });

  useEffect(() => {
    setPanelTab(null);
  }, [setPanelTab]);

  return expandedTab;
};

const PosSettingsPage = ({ posId }: { posId: string }) => {
  const [queryTab, setTab] = useQueryState<string>('tab');
  const navigate = useNavigate();
  const { openRecord } = useSidePanel();
  const tabs = usePosSettingsPageTabs(posId);
  const expandedTab = usePanelTabOnExpand(posId, tabs);
  const tab = queryTab ?? expandedTab;
  const record = useMemo(
    () => ({ contentType: POS_CONTENT_TYPE, contentId: posId }),
    [posId],
  );

  const backToList = useCallback(
    () => navigate(POS_SETTINGS_LIST_PATH, { replace: true }),
    [navigate],
  );

  const navigator = useMemo<ISidePanelNavigator>(
    () => ({
      record,
      tab: tab ?? '',
      setTab,
      openRecord,
      back: backToList,
      canGoBack: false,
      close: backToList,
      listPath: POS_SETTINGS_LIST_PATH,
    }),
    [record, tab, setTab, openRecord, backToList],
  );

  return (
    <SidePanelNavigatorContext.Provider value={navigator}>
      <PageContainer>
        <RecordSidePanel expanded expandedMode="page" expandable={false}>
          <PageHeader>
            <PageHeader.Start className="flex-auto min-w-0">
              <PosSettingsBreadcrumb posId={posId} />
            </PageHeader.Start>
            <PageHeader.End>
              <PosDelete posId={posId} />
            </PageHeader.End>
          </PageHeader>
          <RecordSidePanel.Tabs
            key={posId}
            value={tab ?? POS_PAGE_DEFAULT_TAB}
            onValueChange={setTab}
            visibleCount={tabs.length}
            overviewTab={POS_GENERAL_TAB}
            expandedDefaultTab={POS_PAGE_DEFAULT_TAB}
            overviewHeader={<PosGeneralHeader />}
            tabs={tabs}
          />
        </RecordSidePanel>
      </PageContainer>
    </SidePanelNavigatorContext.Provider>
  );
};

export const PosEditPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return null;
  }

  return <PosSettingsPage posId={id} />;
};
