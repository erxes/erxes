import { IconComponent, NavigationMenuGroup, Sidebar } from 'erxes-ui';
import { IconReport } from '@tabler/icons-react';
import { ReportRuleGroups, ReportRules } from '../types/reportsMap';

import { activeReportState } from '../states/renderingReportsStates';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

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
                className="h-auto min-h-7 items-start gap-2 overflow-visible py-1.5 font-normal whitespace-normal [&>span:last-child]:overflow-visible [&>span:last-child]:text-clip [&>span:last-child]:whitespace-normal"
              >
                {ReportRules[repKey].icon ? (
                  <IconComponent
                    name={ReportRules[repKey].icon}
                    className="mt-0.5 shrink-0"
                  />
                ) : (
                  <IconReport className="mt-0.5 shrink-0" />
                )}
                <span className="min-w-0 flex-1 break-words font-normal leading-snug">
                  {t(ReportRules[repKey].title || '')}
                </span>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          ))}
        </NavigationMenuGroup>
      ))}
    </Sidebar.Panel>
  );
};
