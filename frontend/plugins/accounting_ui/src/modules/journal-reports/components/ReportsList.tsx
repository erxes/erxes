import { Collapsible, IconComponent, Sidebar } from 'erxes-ui';
import { IconChevronRight, IconReport } from '@tabler/icons-react';
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
        <Collapsible
          key={group.key}
          defaultOpen={false}
          className="group/report-list"
        >
          <Sidebar.Group className="py-1.5">
            <Sidebar.GroupLabel asChild>
              <Collapsible.Trigger className="flex items-center gap-2">
                <span className="flex shrink-0 transition-transform duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[state=open]/report-list:rotate-90 motion-reduce:transition-none">
                  <IconChevronRight className="size-3.5" />
                </span>
                <span>{t(group.label || '', { nsSeparator: false })}</span>
              </Collapsible.Trigger>
            </Sidebar.GroupLabel>
            <Collapsible.Content>
              <Sidebar.GroupContent className="pt-0.5">
                <Sidebar.Menu className="gap-0.5">
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
                </Sidebar.Menu>
              </Sidebar.GroupContent>
            </Collapsible.Content>
          </Sidebar.Group>
        </Collapsible>
      ))}
    </Sidebar.Panel>
  );
};
