// `widgets.dashboardWidgets` names, also the `module` the remote is asked
// for. Kept apart from the schemas so `./config` stays small.
export const OPERATION_DASHBOARD_MODULES = {
  projectProgress: 'projectProgress',
  projectProgressByMember: 'projectProgressByMember',
  projectProgressByTeam: 'projectProgressByTeam',
  cycleProgress: 'cycleProgress',
  cycleProgressByMember: 'cycleProgressByMember',
  cycleProgressByProject: 'cycleProgressByProject',
  myTasks: 'myTasks',
} as const;
