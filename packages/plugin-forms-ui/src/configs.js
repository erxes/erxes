module.exports = {
  name: 'forms',
  port: 3005,
  scope: 'forms',
  exposes: {
    './routes': './src/routes.tsx',
    './segmentForm': './src/segmentForm.tsx',
    './importExportUploadForm': './src/components/ColumnChooser',
    './fieldPreview': './src/components/FieldsPreview',
    './formPreview': './src/containers/FieldForm',
    './contactDetailLeftSidebar': './src/containers/CustomFieldsSection',
  },
  routes: {
    url: 'http://localhost:3005/remoteEntry.js',
    scope: 'forms',
    module: './routes'
  },
  segmentForm: './segmentForm',
  formPreview: './formPreview',
  fieldPreview: './fieldPreview',
  importExportUploadForm: './importExportUploadForm',
  contactDetailLeftSidebar: './contactDetailLeftSidebar',
  menus: [
    {
      text: 'Properties',
      to: '/settings/properties',
      image: '/images/icons/erxes-01.svg',
      location: 'settings',
      scope: 'forms',
      action: '',
      permissions: []
    }
  ]
};
