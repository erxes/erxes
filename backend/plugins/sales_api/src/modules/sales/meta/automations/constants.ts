export const salesAutomationContants = {
  triggers: [
    {
      type: 'sales:deal',
      icon: 'IconPigMoney',
      label: 'Sales pipeline',
      description:
        'Start with a blank workflow that enrolls and is triggered off sales pipeline item',
    },
    {
      type: 'sales:deal.probability',
      icon: 'IconPigMoney',
      label: 'Sales pipelines stage probability based',
      description:
        'Start with a blank workflow that triggered off sales pipeline item stage probability',
      isCustom: true,
    },
  ],
  actions: [
    {
      type: 'sales:deal.create',
      icon: 'IconPigMoney',
      label: 'Create deal',
      description: 'Create deal',
      isAvailable: true,
      isAvailableOptionalConnect: true,
    },
    {
      type: 'sales:checklist.create',
      icon: 'IconPigMoney',
      label: 'Create sales checklist',
      description: 'Create sales checklist',
      isAvailable: true,
    },
  ],
};
