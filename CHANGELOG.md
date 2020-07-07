## [0.15.2](https://github.com/erxes/erxes-integrations/compare/0.15.1...0.15.2) (2020-07-07)

## [0.15.1](https://github.com/erxes/erxes-integrations/compare/0.15.0...0.15.1) (2020-07-07)

# [0.15.0](https://github.com/erxes/erxes-integrations/compare/0.14.1...0.15.0) (2020-07-07)


### Performance Improvements

* **ci:** upload compiled version to github release assets ([2b9b47e](https://github.com/erxes/erxes-integrations/commit/2b9b47ebc7d08c3a0598c4c9e011361a466272e2))
* **node:** update package.json for node v12 ([0256c10](https://github.com/erxes/erxes-integrations/commit/0256c10139e41489e3800526881f961e2cae16d5))
* **nylas:** refactor and remove account ([5d65c81](https://github.com/erxes/erxes-integrations/commit/5d65c81b1279bb5d01c7764758afbaaac99751c7)), closes [erxes/erxes#2072](https://github.com/erxes/erxes/issues/2072)

## [0.14.1](https://github.com/erxes/erxes-integrations/compare/0.14.0...0.14.1) (2020-05-19)

# [0.14.0](https://github.com/erxes/erxes-integrations/compare/0.13.0...0.14.0) (2020-04-25)


### Bug Fixes

* add try catch in third party request and check env ([b89e39a](https://github.com/erxes/erxes-integrations/commit/b89e39af2ec0261c49534aff0e4b0ffc26b5ed4d))
* add user middleware ([71d7a4d](https://github.com/erxes/erxes-integrations/commit/71d7a4dafdee6c51a1f79f952c120782ea0de346))
* test in nylas and remove unused field in loginMiddleware ([6f87472](https://github.com/erxes/erxes-integrations/commit/6f87472079dd31e3abcb2f66a575c584c2aa4cbd))
* **test:** add env to drone.yml for nylas test ([9139a6c](https://github.com/erxes/erxes-integrations/commit/9139a6cd0a6ff862d3c8fa5787ce63622aed0558))
* **test:** remove colon in drone.yml for nylas test ([6a131a2](https://github.com/erxes/erxes-integrations/commit/6a131a2c6591938dc848260f8080ab5b9da0be3e))


### Features

* **integration:** integrated Viber, Telegram, Line, Twilio Sms using Sunshine Conversation API ([4e56584](https://github.com/erxes/erxes-integrations/commit/4e5658425590c3e9353f1563766366766140f170)), closes [#102](https://github.com/erxes/erxes-integrations/issues/102)
* **whatsapp:** added whatspp integration ([d0c66b6](https://github.com/erxes/erxes-integrations/commit/d0c66b67c17bc0922f120720eb29cb2e7dcbf245)), closes [#77](https://github.com/erxes/erxes-integrations/issues/77)
* nylas exchange provider ([a51db14](https://github.com/erxes/erxes-integrations/commit/a51db14bd6a0319623db985ffde5249ee4b6575f))


### Performance Improvements

* **test:** complete gmail test coverage ([0a94066](https://github.com/erxes/erxes-integrations/commit/0a94066225c94e281e43ddab4c849ef3e45658b0))
* **test:** improve nylas test coverage ([ab83714](https://github.com/erxes/erxes-integrations/commit/ab837141521db43cb7f64cbcba61ea822a551f21))

# [0.13.0](https://github.com/erxes/erxes-integrations/compare/0.12.4...0.13.0) (2020-03-17)


### Bug Fixes

* await in initConsumer ([a925ca4](https://github.com/erxes/erxes-integrations/commit/a925ca468e01e7a14f7ca6de35f9316133350805))
* await redis init ([d1b30e6](https://github.com/erxes/erxes-integrations/commit/d1b30e6642a8e5e2c9a00bfe749c5047341a1483))
* merge with master and conflict ([93622fd](https://github.com/erxes/erxes-integrations/commit/93622fdbe33058211d1c7a172484926df934ab3b))
* remove account only when there is no integrations ([f13c2a9](https://github.com/erxes/erxes-integrations/commit/f13c2a95196cb4eebd632502a39456ee44b45c38))


### Features

* **videoCall:** add video call integration using daily.co ([7e61cf8](https://github.com/erxes/erxes-integrations/commit/7e61cf89e4a5637fa5cbbacb7c17dd446180b1a2)), closes [erxes/erxes#1638](https://github.com/erxes/erxes/issues/1638)

## [0.12.4](https://github.com/erxes/erxes-integrations/compare/0.12.3...0.12.4) (2020-03-09)


### Bug Fixes

* **common:** improved error handlers ([24c894f](https://github.com/erxes/erxes-integrations/commit/24c894f9aa3a14085652316f9305c62727f995e3))

## [0.12.3](https://github.com/erxes/erxes-integrations/compare/0.12.2...0.12.3) (2020-03-06)


### Bug Fixes

* **gmail:** remove account ([#90](https://github.com/erxes/erxes-integrations/issues/90)) ([63b14f0](https://github.com/erxes/erxes-integrations/commit/63b14f0dfe5e06131db489a756f73bbc3ba97d44))

## [0.12.2](https://github.com/erxes/erxes-integrations/compare/0.12.1...0.12.2) (2020-03-04)


### Bug Fixes

* **gmail:** add error handle in watchPushNotification ([#89](https://github.com/erxes/erxes-integrations/issues/89)) ([087d423](https://github.com/erxes/erxes-integrations/commit/087d4235600c4a5cbc1beaaccd266771ab3b1b9a))

## [0.12.1](https://github.com/erxes/erxes-integrations/compare/0.12.0...0.12.1) (2020-03-02)


### Bug Fixes

* load dotenv in order to get process.env values ([2ec0463](https://github.com/erxes/erxes-integrations/commit/2ec046356668ba433f45f8d0e4faadd735b915b6))

# [0.12.0](https://github.com/erxes/erxes-integrations/compare/0.11.2...0.12.0) (2020-01-08)


### Bug Fixes

* check env in startup and add handle promise error ([8133160](https://github.com/erxes/erxes-integrations/commit/81331607bace41f8c6ac4be30db4fbda7563172e))


### Features

* **integration:** auto assign callpro user ([6770a31](https://github.com/erxes/erxes-integrations/commit/6770a3150dd19082be4dffba1f1010ca4c4a0564)), closes [#69](https://github.com/erxes/erxes-integrations/issues/69)

## [0.11.2](https://github.com/erxes/erxes-integrations/compare/0.11.0...0.11.2) (2019-12-15)


### Bug Fixes

* **chatfuel:** encode issue ([141e376](https://github.com/erxes/erxes-integrations/commit/141e3767305b1f3a992a338fc2d51338de1baf74)), closes [#57](https://github.com/erxes/erxes-integrations/issues/57)

# [0.11.0](https://github.com/erxes/erxes-integrations/compare/0.10.3...0.11.0) (2019-11-01)


### Features

* **facebook-post:** add facebook post ([9a5a7fb](https://github.com/erxes/erxes-integrations/commit/9a5a7fb)), closes [#16](https://github.com/erxes/erxes-integrations/issues/16)
* **imap:** add imap feature by nylus ([acb073c](https://github.com/erxes/erxes-integrations/commit/acb073c)), closes [#32](https://github.com/erxes/erxes-integrations/issues/32)
* **integration:** add chatfuel ([c7bf99d](https://github.com/erxes/erxes-integrations/commit/c7bf99d)), closes [#27](https://github.com/erxes/erxes-integrations/issues/27)
* **integration:** add yahoo by nylus ([bd3e7a3](https://github.com/erxes/erxes-integrations/commit/bd3e7a3)), closes [#48](https://github.com/erxes/erxes-integrations/issues/48)
* **integration:** integration outlook ([6f3410c](https://github.com/erxes/erxes-integrations/commit/6f3410c)), closes [#47](https://github.com/erxes/erxes-integrations/issues/47)
* **nylus:** add nylus gmail integration ([db8b3f7](https://github.com/erxes/erxes-integrations/commit/db8b3f7)), closes [#25](https://github.com/erxes/erxes-integrations/issues/25)
* **office365:** add office365 feature by nylus ([ec8a4d5](https://github.com/erxes/erxes-integrations/commit/ec8a4d5))
* **twitter-dm:** add twitter direct message feature ([776c440](https://github.com/erxes/erxes-integrations/commit/776c440)), closes [#33](https://github.com/erxes/erxes-integrations/issues/33)


### Performance Improvements

* **facebook:** store page tokens to database ([c75e495](https://github.com/erxes/erxes-integrations/commit/c75e495)), closes [#15](https://github.com/erxes/erxes-integrations/issues/15)

## [0.10.3](https://github.com/erxes/erxes-integrations/compare/0.10.2...0.10.3) (2019-08-31)


### Bug Fixes

* **integration/account:** remove customer, conversation, message when integration deleted ([88f3acb](https://github.com/erxes/erxes-integrations/commit/88f3acb)), closes [#12](https://github.com/erxes/erxes-integrations/issues/12)


### Features

* **integration:** integration callpro ([c26f980](https://github.com/erxes/erxes-integrations/commit/c26f980)), closes [#8](https://github.com/erxes/erxes-integrations/issues/8)

## [0.10.2](https://github.com/erxes/erxes-integrations/compare/0.10.1...0.10.2) (2019-08-20)

## [0.10.1](https://github.com/erxes/erxes-integrations/compare/0.10.0...0.10.1) (2019-08-19)


### Bug Fixes

* **broker:** invalid cron message acknowledgement ([e0b75e0](https://github.com/erxes/erxes-integrations/commit/e0b75e0)), closes [#6](https://github.com/erxes/erxes-integrations/issues/6)

# [0.10.0](https://github.com/erxes/erxes-integrations/compare/0.9.17...0.10.0) (2019-08-15)


### Features

* **gmail:** add gmail integration ([83d2b41](https://github.com/erxes/erxes-integrations/commit/83d2b41)), closes [#5](https://github.com/erxes/erxes-integrations/issues/5)


### Performance Improvements

* **facebook:** add unique indexes ([448a8ae](https://github.com/erxes/erxes-integrations/commit/448a8ae)), closes [#4](https://github.com/erxes/erxes-integrations/issues/4)

## [0.9.17](https://github.com/erxes/erxes-integrations/compare/0.9.16...0.9.17) (2019-07-09)


### Bug Fixes

* **docker:** fix dockerfile permission error ([93a2c42](https://github.com/erxes/erxes-integrations/commit/93a2c42))

## [0.9.16](https://github.com/erxes/erxes-integrations/compare/0.9.16-beta1...0.9.16) (2019-07-03)

First stable release.

## 0.9.16-beta1 (2019-07-03)

Initial release.