## [0.17.6](https://github.com/erxes/erxes-api/compare/0.17.5...0.17.6) (2020-08-20)

## [0.17.5](https://github.com/erxes/erxes-api/compare/0.17.4...0.17.5) (2020-08-20)

## [0.17.4](https://github.com/erxes/erxes-api/compare/0.17.3...0.17.4) (2020-08-20)

## [0.17.3](https://github.com/erxes/erxes-api/compare/0.17.2...0.17.3) (2020-08-20)


### Performance Improvements

* **message-broker:** added http client ([957b2d9](https://github.com/erxes/erxes-api/commit/957b2d9a578170f0f678626d7cf15d8826e24c72))

## [0.17.2](https://github.com/erxes/erxes-api/compare/0.17.1...0.17.2) (2020-08-20)

## [0.17.1](https://github.com/erxes/erxes-api/compare/0.17.0...0.17.1) (2020-08-20)

# [0.17.0](https://github.com/erxes/erxes-api/compare/0.16.2...0.17.0) (2020-08-17)


### Bug Fixes

* **script-manager:** fix cors issue in script-manager url ([c18e5a9](https://github.com/erxes/erxes-api/commit/c18e5a9b1ce6d38df0ce5a0b2221aeba230013d3)), closes [erxes/erxes#2223](https://github.com/erxes/erxes/issues/2223)


### Features

* **widget:** show server time & online status ([5d04366](https://github.com/erxes/erxes-api/commit/5d043662de6852761205866adbba43f2d2f5dd8c)), closes [erxes/erxes#2191](https://github.com/erxes/erxes/issues/2191)


### Performance Improvements

* **dependencies:** made rabbitmq, redis optional ([1aa671f](https://github.com/erxes/erxes-api/commit/1aa671f2ba2c1c5ddca9d519bb0e911d6a41fd67))

## [0.16.2](https://github.com/erxes/erxes-api/compare/0.16.1...0.16.2) (2020-07-28)

## [0.16.1](https://github.com/erxes/erxes-api/compare/0.16.0...0.16.1) (2020-07-28)

# [0.16.0](https://github.com/erxes/erxes-api/compare/0.15.5...0.16.0) (2020-07-28)

## [0.15.5](https://github.com/erxes/erxes-api/compare/0.15.4...0.15.5) (2020-07-15)

## [0.15.4](https://github.com/erxes/erxes-api/compare/0.5.13...0.15.4) (2020-07-08)

## [0.15.3](https://github.com/erxes/erxes-api/compare/0.5.13...0.15.3) (2020-07-08)

## [0.5.13](https://github.com/erxes/erxes-api/compare/0.15.2...0.5.13) (2020-07-08)

## [0.15.2](https://github.com/erxes/erxes-api/compare/0.15.1...0.15.2) (2020-07-07)

## [0.15.1](https://github.com/erxes/erxes-api/compare/0.15.0...0.15.1) (2020-07-07)

# [0.15.0](https://github.com/erxes/erxes-api/compare/0.14.3...0.15.0) (2020-07-07)


### Bug Fixes

* **brands:** not using email config ([dd88de8](https://github.com/erxes/erxes-api/commit/dd88de8b37039d5f2df535f70a1a7069b9ea40fd)), closes [#789](https://github.com/erxes/erxes-api/issues/789)
* **companies:** custom properties data is being cleared when update ([3decf6f](https://github.com/erxes/erxes-api/commit/3decf6f4188398b94201f344b339e4435b4bc21b)), closes [erxes/erxes#2019](https://github.com/erxes/erxes/issues/2019)
* **customers:** clearing customFieldsData when update ([baa9d91](https://github.com/erxes/erxes-api/commit/baa9d915180051acc3a99aa95ba934998a7cacc5)), closes [#784](https://github.com/erxes/erxes-api/issues/784)
* **customers:** clearing customFieldsData when update ([d7f51c9](https://github.com/erxes/erxes-api/commit/d7f51c9062342862c50d353f816b64880e6aec18)), closes [erxes/erxes#784](https://github.com/erxes/erxes/issues/784)
* **email-verifier:** add request dependency ([ddc2ef3](https://github.com/erxes/erxes-api/commit/ddc2ef3713a7282f8765766c5307186b0467ce90))
* **field:** validate empty string in required field ([f3474d8](https://github.com/erxes/erxes-api/commit/f3474d810dbebe204890942188bbee7222c0f9f0)), closes [erxes/erxes#2041](https://github.com/erxes/erxes/issues/2041)
* **import:** Not filling the names field on the company with the primaryName in import ([43ae29e](https://github.com/erxes/erxes-api/commit/43ae29ec29fc21b9e03c39693b08ab9a32478309)), closes [#788](https://github.com/erxes/erxes-api/issues/788)
* **segments:** fixed customer custom fields segment form ([f88c4dd](https://github.com/erxes/erxes-api/commit/f88c4dd3a75ba74ba936ed53aa1aafeb3c6560bf))
* **users:** forgot password link bug ([86e7256](https://github.com/erxes/erxes-api/commit/86e72563b07a0133589dcd09f57a31fc5a023b6a)), closes [#786](https://github.com/erxes/erxes-api/issues/786)


### Features

* **import:** added companiesPrimaryNames column in customer import excel ([a452a5c](https://github.com/erxes/erxes-api/commit/a452a5cbd2c4d4c073dc846f5ba653ba6b093fd9)), closes [#787](https://github.com/erxes/erxes-api/issues/787)


### Performance Improvements

* **ci:** upload compiled version to github release assets ([add7d68](https://github.com/erxes/erxes-api/commit/add7d68e92f0bb01212a6e35fe5d5259a517dea6))
* **engages:** used streams ([606d072](https://github.com/erxes/erxes-api/commit/606d0728a7fb5f844585adcdfa1cbe6f9173cc36)), closes [#801](https://github.com/erxes/erxes-api/issues/801)
* **healthcheck:** add mongodb redis and rabbitmq healthcheck ([30da525](https://github.com/erxes/erxes-api/commit/30da525040b7e91f0f2280daa2d1db727a05280f)), closes [erxes/erxes#2073](https://github.com/erxes/erxes/issues/2073)
* **import:** stream excel file import ([2cf2f53](https://github.com/erxes/erxes-api/commit/2cf2f53859cecd2aecef4d96a8ffa6dbc24e600f)), closes [erxes/erxes#2075](https://github.com/erxes/erxes/issues/2075)
* **integrations:** add brand restriction option to integrations ([ff534a0](https://github.com/erxes/erxes-api/commit/ff534a02bf426fba33a53d324c0c44b3104ced24)), closes [erxes/erxes#2050](https://github.com/erxes/erxes/issues/2050)
* **integrations:** add brand restriction option to integrations ([b79d178](https://github.com/erxes/erxes-api/commit/b79d17832866435abfed9ae386a17a9d7c130f0a)), closes [#2050](https://github.com/erxes/erxes-api/issues/2050)
* **phoneValidation:** add phone validation to customer schema ([b61df74](https://github.com/erxes/erxes-api/commit/b61df74080aa5935e730b1fe044c67560461d729)), closes [#796](https://github.com/erxes/erxes-api/issues/796)

## [0.14.3](https://github.com/erxes/erxes-api/compare/0.14.2...0.14.3) (2020-06-17)


### Bug Fixes

* **initial-script:** wrapped connection string in double quote ([8fe761e](https://github.com/erxes/erxes-api/commit/8fe761e5d94db58123f7425d04fadd77564d04f6))

## [0.14.2](https://github.com/erxes/erxes-api/compare/0.14.1...0.14.2) (2020-06-17)


### Bug Fixes

* **commands:** passed uri option to loadInitialData command ([d2296e0](https://github.com/erxes/erxes-api/commit/d2296e02b54b88a92c04d87d28fc41c6bcefd31c))

## [0.14.1](https://github.com/erxes/erxes-api/compare/0.14.0...0.14.1) (2020-05-19)


### Bug Fixes

* **emails:** sending empty auth info ([a0fcc5f](https://github.com/erxes/erxes-api/commit/a0fcc5fd1dd967af562ba8d5f606178e635041cc)), closes [#777](https://github.com/erxes/erxes-api/issues/777)
* **emailTemplate:** revert change in email template query ([f19b35e](https://github.com/erxes/erxes-api/commit/f19b35e1e4960a91096de342151a40081e4fa618))
* **engages:** added unverifed emails limit config ([5312fae](https://github.com/erxes/erxes-api/commit/5312fae15cd2f3febbfbeaf00538f0c612022a9c)), closes [erxes/erxes#1931](https://github.com/erxes/erxes/issues/1931)
* **test:** change random string to enum in factory ([535c803](https://github.com/erxes/erxes-api/commit/535c8036cdec9fbac8f9e828f0be6f30512879d4))


### Performance Improvements

* **customer:** added uriVisits field on schema ([c1e39ce](https://github.com/erxes/erxes-api/commit/c1e39ce7d257f6da351b0fc97001cb19288c41db)), closes [#776](https://github.com/erxes/erxes-api/issues/776)
* **customers:** flatten customFieldsData, trackedData fields ([934970b](https://github.com/erxes/erxes-api/commit/934970b6160f1a849ead3b23923c6b3ff2871462)), closes [#774](https://github.com/erxes/erxes-api/issues/774)
* **docker:** upgrade dockerfile nodejs version ([5e7ea88](https://github.com/erxes/erxes-api/commit/5e7ea88b66eec6b9f936ec61ff01f5b1796b0d2d)), closes [erxes/erxes#1993](https://github.com/erxes/erxes/issues/1993)
* **node:** update package.json for node v12 ([15e498a](https://github.com/erxes/erxes-api/commit/15e498ab0efbb1704100ba227d4007f51fd5cbb4))
* **schema:** add select options to enum fields  ([4af015b](https://github.com/erxes/erxes-api/commit/4af015b513d5ee349b167928678758043d71b4fc))
* **schema:** add select options to some field in customer erxes/erxes[#1959](https://github.com/erxes/erxes-api/issues/1959) ([2720987](https://github.com/erxes/erxes-api/commit/2720987c028ded43bd541ac0e221e72434fa6b7a))
* **stage:** count archived cards ([3700afa](https://github.com/erxes/erxes-api/commit/3700afaa20912286e12d442ebb0047d398abb081)), closes [#778](https://github.com/erxes/erxes-api/issues/778)

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

