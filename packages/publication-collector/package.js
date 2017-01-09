Package.describe({
  name: 'publication-collector',
  version: '0.0.1',
  summary: "Test a publication by collecting it's output",
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use(['ecmascript', 'underscore', 'check']);
  api.addFiles('publication-collector.js', 'server');
  api.export('PublicationCollector', 'server');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('publication-collector');
  api.addFiles('publication-collector-tests.js');
});
