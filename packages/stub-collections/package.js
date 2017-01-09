Package.describe({
  name: 'stub-collections',
  version: '0.0.1',
  summary: 'Stub out all collections with temporary local collections',
  documentation: 'README.md',
  debugOnly: true
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.3-galaxy.0');
  api.use(['ecmascript',
    'mongo',
    'practicalmeteor:sinon@1.14.1_2',
    'underscore'
  ]);
  api.addFiles('stub-collections.js');
  api.export('StubCollections');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use(['stub-collections', 'mongo']);
  api.addFiles('stub-collections-tests.js');
});
