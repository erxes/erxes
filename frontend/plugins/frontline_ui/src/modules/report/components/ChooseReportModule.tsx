import {
  cn,
  IconComponent,
  Sidebar,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import { REPORT_MODULES } from '../constants/modules';

export const ChooseReportModule = () => {
  return (
    <>
      {REPORT_MODULES.map((module) => (
        <ReportModuleItem key={module.module} {...module} />
      ))}
    </>
  );
};

export const ReportModuleItem = ({
  name,
  icon,
  module,
}: {
  name: string;
  icon: string;
  module: string;
}) => {
  const [reportModule, setReportModule] = useQueryState<string>('reportModule');
  const isActive = reportModule === module;
  return (
    <Sidebar.Group className="p-0">
      <div className="w-full relative group/trigger hover:cursor-pointer">
        <div className="w-full flex items-center justify-between">
          <Sidebar.MenuButton
            isActive={isActive}
            onClick={() => {
              setReportModule(module);
            }}
          >
            <div className="flex items-center gap-2">
              <IconComponent
                name={icon}
                className={cn(
                  'text-accent-foreground shrink-0 size-4',
                  isActive && 'text-primary',
                )}
              />
              <TextOverflowTooltip
                className="font-sans font-semibold normal-case flex-1 min-w-0"
                value={name}
              />
            </div>
          </Sidebar.MenuButton>
        </div>
      </div>
    </Sidebar.Group>
  );
};
