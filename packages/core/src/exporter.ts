const IMPORT_EXPORT_TYPES = [
  {
    text: 'Team member',
    contentType: 'user',
    icon: 'user-square'
  }
];

export default {
  importExportTypes: IMPORT_EXPORT_TYPES,

  prepareExportData: async ({ subdomain, data }) => {
    console.log(subdomain, data);
  }
};
