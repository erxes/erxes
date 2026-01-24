export const operationAutomationConstants = {
  triggers: [
    {
      moduleName: 'operation',
      collectionName: 'triage',
      icon: 'IconAlertTriangle',
      label: 'Triage ticket',
      description:
        'Start with a blank workflow that enrolls and is triggered off triage tickets',
    },
  ],
  actions: [
    {
      moduleName: 'operation',
      collectionName: 'triage',
      method: 'create',
      icon: 'IconAlertTriangle',
      label: 'Create triage ticket',
      description: 'Create a new triage ticket in the operation module',
      isAvailable: true,
    },
  ],
};
