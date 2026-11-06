import type { IDashboardWidgetProps } from 'ui-modules';
import {
  CycleDashboardConfigForm,
  ProjectDashboardConfigForm,
} from './components/OperationDashboardConfigForms';
import { OPERATION_DASHBOARD_MODULES as MODULES } from './dashboardModules';
import {
  CycleProgressByMemberWidget,
  CycleProgressByProjectWidget,
  CycleProgressWidget,
} from './widgets/CycleProgressWidgets';
import { MyTasksWidget } from './widgets/MyTasksWidget';
import {
  ProjectProgressByMemberWidget,
  ProjectProgressByTeamWidget,
  ProjectProgressWidget,
} from './widgets/ProjectProgressWidgets';

const PROJECT_MODULES = new Set<string>([
  MODULES.projectProgress,
  MODULES.projectProgressByMember,
  MODULES.projectProgressByTeam,
]);

const CYCLE_MODULES = new Set<string>([
  MODULES.cycleProgress,
  MODULES.cycleProgressByMember,
  MODULES.cycleProgressByProject,
]);

const DashboardWidgetView = ({
  module,
  config,
}: Pick<IDashboardWidgetProps, 'module' | 'config'>) => {
  switch (module) {
    case MODULES.projectProgress:
      return <ProjectProgressWidget config={config} />;
    case MODULES.projectProgressByMember:
      return <ProjectProgressByMemberWidget config={config} />;
    case MODULES.projectProgressByTeam:
      return <ProjectProgressByTeamWidget config={config} />;
    case MODULES.cycleProgress:
      return <CycleProgressWidget config={config} />;
    case MODULES.cycleProgressByMember:
      return <CycleProgressByMemberWidget config={config} />;
    case MODULES.cycleProgressByProject:
      return <CycleProgressByProjectWidget config={config} />;
    case MODULES.myTasks:
      return <MyTasksWidget />;
    default:
      return null;
  }
};

// Operation's home dashboard tiles (`widgets.dashboardWidgets`).
export const DashboardWidgets = (props: IDashboardWidgetProps) => {
  if (props.mode === 'view') {
    return <DashboardWidgetView module={props.module} config={props.config} />;
  }

  const formProps = {
    config: props.config,
    onSubmit: props.onConfigSubmit,
    onCancel: props.onConfigCancel,
  };

  if (PROJECT_MODULES.has(props.module)) {
    return <ProjectDashboardConfigForm {...formProps} />;
  }

  if (CYCLE_MODULES.has(props.module)) {
    return <CycleDashboardConfigForm {...formProps} />;
  }

  return null;
};

export default DashboardWidgets;
