import { NavigationMenuGroup, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import {
  relationSettingsModuleKey,
  useRelationSettingsModules,
} from 'ui-modules';

import { getSteps, POS_RELATION_TAB_PREFIX } from '@/pos/constants';
import { usePosDetail } from '@/pos/hooks/usePosDetail';

const POS_SETTINGS_PATH = '/sales/settings/pos';
const DEFAULT_TAB = 'properties';

const PosTabsGroup = ({ posId }: Readonly<{ posId: string }>) => {
  const { t } = useTranslation('sales');
  const { search } = useLocation();
  const relationModules = useRelationSettingsModules();
  const { posDetail } = usePosDetail(posId);
  const activeTab = new URLSearchParams(search).get('activeTab') || DEFAULT_TAB;
  const tabs = [
    ...getSteps().map((step) => ({ value: step.value, label: t(step.title) })),
    ...relationModules.map((module) => ({
      value: `${POS_RELATION_TAB_PREFIX}${relationSettingsModuleKey(module)}`,
      label: module.label || module.name,
    })),
  ];

  // A group of its own at the bottom, like BOARDS; `border-l` draws the
  // vertical guide, as in the settings sidebar.
  return (
    <NavigationMenuGroup name={posDetail?.name || t('pos')}>
      <Sidebar.Sub className="border-l">
        {tabs.map((tab) => (
          <Sidebar.SubItem key={tab.value}>
            <Sidebar.SubButton asChild isActive={activeTab === tab.value}>
              <Link to={`${POS_SETTINGS_PATH}/${posId}?activeTab=${tab.value}`}>
                {tab.label}
              </Link>
            </Sidebar.SubButton>
          </Sidebar.SubItem>
        ))}
      </Sidebar.Sub>
    </NavigationMenuGroup>
  );
};

/**
 * The open POS's tabs (and other plugins' tabs) in the sales settings
 * sidebar, so the POS edit page needs no side panel.
 */
// `/sales/settings/pos/<id>`, with a nonempty id.
const POS_EDIT_PATH = /^\/sales\/settings\/pos\/([^/]+)\/?$/;

export const PosSettingsTabs = () => {
  const { pathname } = useLocation();
  const posId = POS_EDIT_PATH.exec(pathname)?.[1];

  if (!posId) {
    return null;
  }

  return <PosTabsGroup posId={posId} />;
};
