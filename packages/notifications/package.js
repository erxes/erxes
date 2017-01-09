Package.describe({
  name: 'erxes-notifications',
  summary: 'Erxes notification',
  version: '0.0.1',
  git: '',
});

Package.onUse(function (api) {
  api.use(
    [
      'ecmascript',
      'underscore',
      'aldeed:collection2@2.3.1',
      'tmeasday:publish-counts',
    ],
    ['client', 'server']
  );

  api.mainModule('client/main.js', ['client']);
  api.mainModule('server/main.js', ['server']);
});
