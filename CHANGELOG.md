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

