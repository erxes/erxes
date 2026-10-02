import { IconCaretRightFilled, IconReport } from '@tabler/icons-react';
import { Collapsible, IconComponent, Sidebar } from 'erxes-ui';
import { useAtom } from 'jotai';
import { activeReportState } from '../states/renderingReportsStates';
import { ReportRuleGroups, ReportRules } from '../types/reportsMap';

export const ReportsList = () => {
  const [activeReport, setActiveReport] = useAtom(activeReportState);

  return (
    <Sidebar.Panel className="w-56 flex-none border-r lg:w-64 2xl:w-[21rem]">
      {ReportRuleGroups.map((group, index) => (
        <Collapsible
          key={group.key}
          defaultOpen={false}
          className="group/report-list"
        >
          <Sidebar.Group className="py-1.5">
            <div className="flex items-center">
              <Sidebar.GroupLabel asChild className="min-w-0 flex-1">
                <Collapsible.Trigger className="flex items-center gap-2">
                  <IconCaretRightFilled className="size-3.5 transition-transform group-data-[state=open]/report-list:rotate-90" />
                  <span>{group.label}</span>
                </Collapsible.Trigger>
              </Sidebar.GroupLabel>
              {index === 0 && <Sidebar.PanelTrigger />}
            </div>
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
                          {ReportRules[repKey].title}
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
