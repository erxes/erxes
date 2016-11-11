Package.describe({
  name: 'erxes-notifier',
  version: '0.0.1',
  summary: '',
  git: '',
});

Package.onUse(function (api) {
  api.versionsFrom('1.2.1');

  api.use([
    'ecmascript',

    'aldeed:simple-schema@1.5.3',
    'aldeed:collection2@2.9.0',
  ]);

  api.mainModule('client/main.js', 'client');
});
