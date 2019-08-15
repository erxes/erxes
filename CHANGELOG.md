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

