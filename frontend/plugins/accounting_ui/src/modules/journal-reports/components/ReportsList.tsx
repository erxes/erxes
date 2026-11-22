import { IconComponent, NavigationMenuGroup, Sidebar } from 'erxes-ui';
import { IconReceiptTax, IconReport } from '@tabler/icons-react';
import {
  getTaxReportListKey,
  TAX_REPORT_KINDS,
  TAX_REPORT_TITLES,
} from '@/tax-reports/types';
import { ReportRuleGroups, ReportRules } from '../types/reportsMap';

import { activeReportState } from '../states/renderingReportsStates';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

const MENU_BUTTON_CLASS =
  'h-auto min-h-7 items-start gap-2 overflow-visible py-1.5 font-normal whitespace-normal [&>span:last-child]:overflow-visible [&>span:last-child]:text-clip [&>span:last-child]:whitespace-normal';
const MENU_LABEL_CLASS = 'min-w-0 flex-1 break-words font-normal leading-snug';

export const ReportsList = () => {
  const { t } = useTranslation('accounting');
  const [activeReport, setActiveReport] = useAtom(activeReportState);

  return (
    <Sidebar.Panel
      className="w-56 flex-none border-r lg:w-64 2xl:w-[21rem]"
      label={t('Reports')}
    >
      {ReportRuleGroups.map((group) => (
        <NavigationMenuGroup
          key={group.key}
          name={t(group.label || '', { nsSeparator: false })}
          separate={false}
          defaultOpen={false}
          className="py-1.5"
        >
          {group.reportKeys.map((repKey) => (
            <Sidebar.MenuItem key={repKey} className="flex">
              <Sidebar.MenuButton
                isActive={activeReport === repKey}
                onClick={() => setActiveReport(repKey)}
                className={MENU_BUTTON_CLASS}
              >
                {ReportRules[repKey].icon ? (
                  <IconComponent
                    name={ReportRules[repKey].icon}
                    className="mt-0.5 shrink-0"
                  />
                ) : (
                  <IconReport className="mt-0.5 shrink-0" />
                )}
                <span className={MENU_LABEL_CLASS}>
                  {t(ReportRules[repKey].title || '')}
                </span>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          ))}
        </NavigationMenuGroup>
      ))}
      <NavigationMenuGroup
        name={t('tax-reports')}
        separate={false}
        defaultOpen={false}
        className="py-1.5"
      >
        {TAX_REPORT_KINDS.map((kind) => {
          const key = getTaxReportListKey(kind);
          return (
            <Sidebar.MenuItem key={key} className="flex">
              <Sidebar.MenuButton
                isActive={activeReport === key}
                onClick={() => setActiveReport(key)}
                className={MENU_BUTTON_CLASS}
              >
                <IconReceiptTax className="mt-0.5 shrink-0" />
                <span className={MENU_LABEL_CLASS}>
                  {t(TAX_REPORT_TITLES[kind])}
                </span>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          );
        })}
      </NavigationMenuGroup>
    </Sidebar.Panel>
  );
};
