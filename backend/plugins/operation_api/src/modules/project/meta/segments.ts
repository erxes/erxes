export const projectsSegments = {
  dependentModules: [
    {
      name: 'core',
      types: ['companies', 'customers', 'leads'],
      twoWay: true,
      associated: true,
    },
  ],

  contentTypes: [
    {
      moduleName: 'project',
      type: 'projects',
      description: 'Project',
    },
  ],
};
