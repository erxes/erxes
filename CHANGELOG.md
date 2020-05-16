# [0.14.0](https://github.com/erxes/erxes-api/compare/0.13.0...0.14.0) (2020-04-25)


### Bug Fixes

* add nylas-exchange type in mail integrations ([4863734](https://github.com/erxes/erxes-api/commit/4863734b5d8e8c17bb5706f3a4fec625b0de3781))
* add userId in upload-file and mail-attachment ([7e86c2d](https://github.com/erxes/erxes-api/commit/7e86c2dc5bd2e934097123ec89da07086539d2ba))
* send userId for middleware in integration ([4be0628](https://github.com/erxes/erxes-api/commit/4be062874665bb4cad0932666dfd9c147abfbfcb)), closes [#751](https://github.com/erxes/erxes-api/issues/751)
* **popups:** resetting stats when update ([0d71b70](https://github.com/erxes/erxes-api/commit/0d71b704c763e8cfd3309e16b6b1148b518010ab)), closes [#763](https://github.com/erxes/erxes-api/issues/763)


### Features

* add nylas exchange provider ([6394f3e](https://github.com/erxes/erxes-api/commit/6394f3ee2c54df47d167ae675b1871bc7659441c))
* **messenger:** tracking all possible customer fields ([1b82095](https://github.com/erxes/erxes-api/commit/1b820952cd938615eb4de4ebf5b8c418a501d179)), closes [#764](https://github.com/erxes/erxes-api/issues/764)


### Performance Improvements

* **engage:** refactor cronjobs ([176e3ca](https://github.com/erxes/erxes-api/commit/176e3ca305482f21d521dde71399968d8129d0fe)), closes [erxes/erxes#1940](https://github.com/erxes/erxes/issues/1940)
* **env:** remove DOMAIN variable ([7da2d8c](https://github.com/erxes/erxes-api/commit/7da2d8cc92d7d70aeca9234f168ae1c3803dca49)), closes [#747](https://github.com/erxes/erxes-api/issues/747)
* **env:** using rabbitmq instead of WORKERS_API_DOMAIN ([5ee39d8](https://github.com/erxes/erxes-api/commit/5ee39d8001291e2b4c39d23700936aedff3813e2)), closes [#767](https://github.com/erxes/erxes-api/issues/767)


### BREAKING CHANGES

* **env:** rabbitmq env is required in workers service.

# [1.0.0](https://github.com/erxes/erxes-api/compare/0.13.0...1.0.0) (2020-04-25)


### Bug Fixes

* add nylas-exchange type in mail integrations ([4863734](https://github.com/erxes/erxes-api/commit/4863734b5d8e8c17bb5706f3a4fec625b0de3781))
* add userId in upload-file and mail-attachment ([7e86c2d](https://github.com/erxes/erxes-api/commit/7e86c2dc5bd2e934097123ec89da07086539d2ba))
* send userId for middleware in integration ([4be0628](https://github.com/erxes/erxes-api/commit/4be062874665bb4cad0932666dfd9c147abfbfcb)), closes [#751](https://github.com/erxes/erxes-api/issues/751)
* **popups:** resetting stats when update ([0d71b70](https://github.com/erxes/erxes-api/commit/0d71b704c763e8cfd3309e16b6b1148b518010ab)), closes [#763](https://github.com/erxes/erxes-api/issues/763)


### Features

* add nylas exchange provider ([6394f3e](https://github.com/erxes/erxes-api/commit/6394f3ee2c54df47d167ae675b1871bc7659441c))
* **messenger:** tracking all possible customer fields ([1b82095](https://github.com/erxes/erxes-api/commit/1b820952cd938615eb4de4ebf5b8c418a501d179)), closes [#764](https://github.com/erxes/erxes-api/issues/764)


### Performance Improvements

* **engage:** refactor cronjobs ([176e3ca](https://github.com/erxes/erxes-api/commit/176e3ca305482f21d521dde71399968d8129d0fe)), closes [erxes/erxes#1940](https://github.com/erxes/erxes/issues/1940)
* **env:** remove DOMAIN variable ([7da2d8c](https://github.com/erxes/erxes-api/commit/7da2d8cc92d7d70aeca9234f168ae1c3803dca49)), closes [#747](https://github.com/erxes/erxes-api/issues/747)
* **env:** using rabbitmq instead of WORKERS_API_DOMAIN ([5ee39d8](https://github.com/erxes/erxes-api/commit/5ee39d8001291e2b4c39d23700936aedff3813e2)), closes [#767](https://github.com/erxes/erxes-api/issues/767)


### BREAKING CHANGES

* **env:** rabbitmq env is required in workers service.

# [0.13.0](https://github.com/erxes/erxes-api/compare/0.12.5...0.13.0) (2020-03-17)


### Bug Fixes

* **activity-log:**  checked empty content ([ce3daea](https://github.com/erxes/erxes-api/commit/ce3daeac23631dceb745ec4be20127b46097f7c9))
* **conversation:** counting left, joined messages in messsageCount field ([9f8201d](https://github.com/erxes/erxes-api/commit/9f8201d9e4e57e07a5b07ea030e929139bd76ddd)), closes [#694](https://github.com/erxes/erxes-api/issues/694)
* **importHistory:** cannot remove contacts if there are too many contacts ([be6ee64](https://github.com/erxes/erxes-api/commit/be6ee64d0602b230b0230de12ce3686a287729fd)), closes [erxes/erxes#1681](https://github.com/erxes/erxes/issues/1681)
* remove account only when there is no integration ([1e33a60](https://github.com/erxes/erxes-api/commit/1e33a60256d2d2ee10534803e57dea7172383281))


### Features

* **board:** add archive functionality ([49e09f7](https://github.com/erxes/erxes-api/commit/49e09f7eb23dde1c5c0211b9b20240d52feecca3)), closes [erxes/erxes#1625](https://github.com/erxes/erxes/issues/1625)
* **email-verification:** added email verification service ([d509e99](https://github.com/erxes/erxes-api/commit/d509e999f04b961ef38e0eb9c98cf64cdf656d3d)), closes [#1662](https://github.com/erxes/erxes-api/issues/1662)
* **users:** filter by brand ([9dca98e](https://github.com/erxes/erxes-api/commit/9dca98e9e4ff369fea01c2a3272b534a077396d3)), closes [#681](https://github.com/erxes/erxes-api/issues/681)
* **videoCall:** add video call integration using daily.co ([bb25bf9](https://github.com/erxes/erxes-api/commit/bb25bf96e70df43b0ee572f4b1e9eef6d490980d)), closes [erxes/erxes#1638](https://github.com/erxes/erxes/issues/1638)


### Performance Improvements

* **customer:** export pop-ups data for customer list when filtering by pop ups ([9fb2574](https://github.com/erxes/erxes-api/commit/9fb25749c0c75b35b5968aa29acbd05bc084a787)), closes [erxes/erxes#1674](https://github.com/erxes/erxes/issues/1674)
* **merge-repos:** merged logger & engage-mail-sender repos ([6d2d8dd](https://github.com/erxes/erxes-api/commit/6d2d8dd85510f475d13ad49ea986fa4d9d89f276)), closes [#736](https://github.com/erxes/erxes-api/issues/736)

## [0.12.5](https://github.com/erxes/erxes-api/compare/0.12.4...0.12.5) (2020-03-06)


### Bug Fixes

* **account:** remove account ([#725](https://github.com/erxes/erxes-api/issues/725)) ([fb477c3](https://github.com/erxes/erxes-api/commit/fb477c33277f74fe09e28d786e310bc72168ab80))

## [0.12.4](https://github.com/erxes/erxes-api/compare/0.12.3...0.12.4) (2020-03-06)

## [0.12.3](https://github.com/erxes/erxes-api/compare/0.12.2...0.12.3) (2020-01-28)

## [0.12.2](https://github.com/erxes/erxes-api/compare/0.12.1...0.12.2) (2020-01-28)


### Bug Fixes

* **jwt:** checked JWT_TOKEN_SECRET config on startup ([30daf11](https://github.com/erxes/erxes-api/commit/30daf11))

## [0.12.1](https://github.com/erxes/erxes-api/compare/0.12.0...0.12.1) (2020-01-28)


### Bug Fixes

* **user:** jwt token secret issue ([76f2474](https://github.com/erxes/erxes-api/commit/76f2474)), closes [#704](https://github.com/erxes/erxes-api/issues/704)

# [0.12.0](https://github.com/erxes/erxes-api/compare/0.11.2...0.12.0) (2020-01-08)


### Bug Fixes

* **deal/ticket/task:** move card labels bug ([35136a1](https://github.com/erxes/erxes-api/commit/35136a1)), closes [#676](https://github.com/erxes/erxes-api/issues/676)
* **mail:** not receiving updates in realtime ([2e4a382](https://github.com/erxes/erxes-api/commit/2e4a382)), closes [#683](https://github.com/erxes/erxes-api/issues/683)


### Performance Improvements

* **integrations:** using rabbitmq for erxes-integrations communication ([6fd595e](https://github.com/erxes/erxes-api/commit/6fd595e)), closes [#690](https://github.com/erxes/erxes-api/issues/690)
* **widgets:** merge erxes-widgets-api with erxes-api ([71e89ba](https://github.com/erxes/erxes-api/commit/71e89ba)), closes [erxes/erxes#1542](https://github.com/erxes/erxes/issues/1542)
* **widgets:** merge erxes-widgets-api with erxes-api ([81e3880](https://github.com/erxes/erxes-api/commit/81e3880)), closes [#1542](https://github.com/erxes/erxes-api/issues/1542)


### BREAKING CHANGES

* **widgets:** erxes-widgets-api is making code duplication difficult to maintain and we decided that it is an unnecessary abstraction.
1. Remove MAIN_API_URL env variable
2. Point API_GRAPHQL_URL env variable to http://localhost:3300/graphql AKA erxes-api
* **widgets:** erxes-widgets-api is making code duplication difficult to maintain and we decided that it is an unnecessary abstraction.
1. Remove MAIN_API_URL env variable
2. Point API_GRAPHQL_URL env variable to http://localhost:3300/graphql AKA erxes-api

## [0.11.2](https://github.com/erxes/erxes-api/compare/0.11.1...0.11.2) (2019-12-15)


### Bug Fixes

* **conversation:** cleaning content ([710d6e7](https://github.com/erxes/erxes-api/commit/710d6e7)), closes [#641](https://github.com/erxes/erxes-api/issues/641)
* **conversation:** read conversation becoming unread sometimes ([a6b1254](https://github.com/erxes/erxes-api/commit/a6b1254)), closes [#664](https://github.com/erxes/erxes-api/issues/664)
* **deal/ticket/task:** copy customer, companies when copy ([50969f0](https://github.com/erxes/erxes-api/commit/50969f0)), closes [#626](https://github.com/erxes/erxes-api/issues/626)
* **integration:** remove related integration when account remove ([72c9cba](https://github.com/erxes/erxes-api/commit/72c9cba)), closes [#617](https://github.com/erxes/erxes-api/issues/617)
* **user:** invalid regex in login ([6cc2dc0](https://github.com/erxes/erxes-api/commit/6cc2dc0)), closes [#634](https://github.com/erxes/erxes-api/issues/634)


### Features

* **activity-log:** reimplement activity log ([dd68af5](https://github.com/erxes/erxes-api/commit/dd68af5)), closes [#665](https://github.com/erxes/erxes-api/issues/665)
* **customer/company:** merge customFieldsData ([b4f3e46](https://github.com/erxes/erxes-api/commit/b4f3e46))
* **customers:** added code field ([7a696d4](https://github.com/erxes/erxes-api/commit/7a696d4)), closes [#631](https://github.com/erxes/erxes-api/issues/631)
* **exports:** add some exporters ([bfd892f](https://github.com/erxes/erxes-api/commit/bfd892f)), closes [#662](https://github.com/erxes/erxes-api/issues/662)
* **integration:** archive ([0f0ae7a](https://github.com/erxes/erxes-api/commit/0f0ae7a)), closes [#624](https://github.com/erxes/erxes-api/issues/624)
* **ticket/task/deal:** add no labels assigned filter ([38e3373](https://github.com/erxes/erxes-api/commit/38e3373)), closes [erxes/erxes#1387](https://github.com/erxes/erxes/issues/1387)
* **user:** now users can unsubscribe from notification emails ([c9896ad](https://github.com/erxes/erxes-api/commit/c9896ad)), closes [#655](https://github.com/erxes/erxes-api/issues/655) [#654](https://github.com/erxes/erxes-api/issues/654)



## [0.11.1](https://github.com/erxes/erxes-api/compare/0.11.0...0.11.1) (2019-11-01)

# [0.11.0](https://github.com/erxes/erxes-api/compare/0.10.1...0.11.0) (2019-11-01)


### Bug Fixes

* **deal:** fixed search ([139ea97](https://github.com/erxes/erxes-api/commit/139ea97)), closes [#1251](https://github.com/erxes/erxes-api/issues/1251)
* **deal/task/ticket/growthHack:** fix next day filter ([1bfcbdc](https://github.com/erxes/erxes-api/commit/1bfcbdc)), closes [#567](https://github.com/erxes/erxes-api/issues/567)
* **inbox:** Updating conversation last content when internal note ([fa421bb](https://github.com/erxes/erxes-api/commit/fa421bb)), closes [#568](https://github.com/erxes/erxes-api/issues/568)
* **permission:** add permission cache empty check ([47bb198](https://github.com/erxes/erxes-api/commit/47bb198)), closes [erxes/erxes#1231](https://github.com/erxes/erxes/issues/1231)

## [0.10.1](https://github.com/erxes/erxes-api/compare/0.10.0...0.10.1) (2019-08-31)


### Bug Fixes

* **board:** show a warning message if stage has a item && remove unused functions ([1ed1727](https://github.com/erxes/erxes-api/commit/1ed1727)), closes [erxes/erxes#1205](https://github.com/erxes/erxes/issues/1205)
* **deepcode:** apply deepcode fixes ([5ade279](https://github.com/erxes/erxes-api/commit/5ade279)), closes [#521](https://github.com/erxes/erxes-api/issues/521)
* **engage:** auto message ([8904a30](https://github.com/erxes/erxes-api/commit/8904a30)), closes [#1197](https://github.com/erxes/erxes-api/issues/1197)
* **notification:** sending notification to current user ([86db029](https://github.com/erxes/erxes-api/commit/86db029)), closes [#1198](https://github.com/erxes/erxes-api/issues/1198)
* **permission:** add permission cache empty check ([cb74519](https://github.com/erxes/erxes-api/commit/cb74519)), closes [#1231](https://github.com/erxes/erxes-api/issues/1231)
* **teambers:** not searchable by username ([69ee5e9](https://github.com/erxes/erxes-api/commit/69ee5e9)), closes [erxes/erxes#1213](https://github.com/erxes/erxes/issues/1213)


### Features

* **notification:** show stage names on notifications ([ed239cc](https://github.com/erxes/erxes-api/commit/ed239cc)), closes [#1124](https://github.com/erxes/erxes-api/issues/1124)

# [0.10.0](https://github.com/erxes/erxes-api/compare/0.9.17...0.10.0) (2019-08-15)


### Bug Fixes

* **customer/company:** creating extra log when merge ([b59575f](https://github.com/erxes/erxes-api/commit/b59575f)), closes [#520](https://github.com/erxes/erxes-api/issues/520)
* **emailTemplate:** Fix notification template link ([#516](https://github.com/erxes/erxes-api/issues/516)) ([46eee51](https://github.com/erxes/erxes-api/commit/46eee51))
* **permission:** bug in permission cache in userEdit ([589cee2](https://github.com/erxes/erxes-api/commit/589cee2)), closes [#1139](https://github.com/erxes/erxes-api/issues/1139)
* **usersQuery:** invalid users query filter ([8e500f1](https://github.com/erxes/erxes-api/commit/8e500f1)), closes [erxes/erxes#1118](https://github.com/erxes/erxes/issues/1118) [erxes/erxes#1077](https://github.com/erxes/erxes/issues/1077)


### Features

* **command:** add loadPermission command ([d2e8ffc](https://github.com/erxes/erxes-api/commit/d2e8ffc)), closes [#505](https://github.com/erxes/erxes-api/issues/505)
* **message-queue:** used rabbitmq ([fdb26ab](https://github.com/erxes/erxes-api/commit/fdb26ab)), closes [#223](https://github.com/erxes/erxes-api/issues/223)
* **permission:** restrict user permissions by brand ([03f785f](https://github.com/erxes/erxes-api/commit/03f785f)), closes [#517](https://github.com/erxes/erxes-api/issues/517)


### Performance Improvements

* **deal/ticket/task:** add attachment field ([df1420e](https://github.com/erxes/erxes-api/commit/df1420e)), closes [erxes/erxes#1029](https://github.com/erxes/erxes/issues/1029)
* **engage:** extract engage email sender logic ([b6f10b3](https://github.com/erxes/erxes-api/commit/b6f10b3)), closes [#510](https://github.com/erxes/erxes-api/issues/510)


### BREAKING CHANGES

* **engage:** https://github.com/erxes/erxes-engages-email-sender is required in order to run engage properly
* **message-queue:** No longer using redis as message broker

## [0.9.17](https://github.com/erxes/erxes-api/compare/0.9.16...0.9.17) (2019-07-09)


### Bug Fixes

* **docker:** fix dockerfile permission error ([1631750](https://github.com/erxes/erxes-api/commit/1631750))


### Features

* **deal/ticket/task:** Add watch option for deal, ticket, task and pipeline ([d6dcabc](https://github.com/erxes/erxes-api/commit/d6dcabc)), closes [erxes/erxes#1013](https://github.com/erxes/erxes/issues/1013)

## [0.9.16](https://github.com/erxes/erxes-api/compare/0.9.15...0.9.16) (2019-07-03)


### Bug Fixes

* **drone:** workaround for wrong version information showing on version.json ([fa91eef](https://github.com/erxes/erxes-api/commit/fa91eef))

