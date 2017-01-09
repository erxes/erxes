Package.describe({
  summary: 'Loads some useful packages for security, but only in production',
  prodOnly: true,
  documentation: null,
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');

  api.use([
    'browser-policy',
    'force-ssl',
  ]);
});
