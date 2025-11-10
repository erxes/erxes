export const salesAutomationContants = {
  triggers: [
    {
      moduleName: 'sales',
      collectionName: 'deal',
      icon: 'IconPigMoney',
      label: 'Sales pipeline',
      description:
        'Start with a blank workflow that enrolls and is triggered off sales pipeline item',
    },
    {
      moduleName: 'sales',
      collectionName: 'deal',
      relationType: 'probability',
      icon: 'IconPigMoney',
      label: 'Sales pipelines stage probability based',
      description:
        'Start with a blank workflow that triggered off sales pipeline item stage probability',
      isCustom: true,
    },
  ],
  actions: [
    {
      moduleName: 'sales',
      collectionName: 'deal',
      method: 'create',
      icon: 'IconPigMoney',
      label: 'Create deal',
      description: 'Create deal',
      isTargetSource: true,
      targetSourceType: 'sales:sales.deal',
      allowTargetFromActions: true,
    },
    {
      moduleName: 'sales',
      collectionName: 'checklist',
      method: 'create',
      icon: 'IconPigMoney',
      label: 'Create sales checklist',
      description: 'Create sales checklist',
      isAvailable: true,
    },
  ],
};
