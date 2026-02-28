# Changelog

## [2.17.34](https://github.com/erxes/erxes/compare/2.17.33...2.17.34) (2026-02-11)

### Bug Fixes

* improve import file upload handling and remove debug logs ([2d1962d](https://github.com/erxes/erxes/commit/2d1962d0bcf48b5d5f9e1bfcf1b7e2d38479f9de))

## [2.17.33](https://github.com/erxes/erxes/compare/2.17.32...2.17.33) (2026-02-11)

### Bug Fixes

* handle loyalty owner when customers merge ([#6957](https://github.com/erxes/erxes/issues/6957)) ([3884345](https://github.com/erxes/erxes/commit/3884345ed779485bce23ea5ffa7be126f32a5526))
* update existing attachment instead of creating duplicate in uploader ([07fe50e](https://github.com/erxes/erxes/commit/07fe50e986e28dc6351126d28e6eb3e1c64d9a71))

## [2.17.32](https://github.com/erxes/erxes/compare/2.17.31...2.17.32) (2026-02-06)

### Features

* add erxes 2.0 inbox features  ([36b16b4](https://github.com/erxes/erxes/commit/36b16b48def95be9a706e5f641e0370084cbfcae))
* **engages:** add response field to email logs and improve error handling ([c1ca4e1](https://github.com/erxes/erxes/commit/c1ca4e1433c57a3cc8c08d2b6bad59feecbd27a5))
* inbox date filter and conversation call pro  refactor  ([e73cd94](https://github.com/erxes/erxes/commit/e73cd94ddcf2e22c86284841e0ceaa990ecc24a7))
* **inbox:** add call audio and conversation history UI  ([04a8ef9](https://github.com/erxes/erxes/commit/04a8ef9c7f0fcfa075ae685f3441c871e770cff5))
* **inbox:** date filter calendar  ([2493496](https://github.com/erxes/erxes/commit/249349666d0b18a02bf17e764da50dd73d24a320))

### Bug Fixes

* can't count segment count on customersCount. query and set import error on  history ([04264fd](https://github.com/erxes/erxes/commit/04264fdccfe513feb17f7e64997c65a1d8514475))
* **date-filter:** handle UTC to local timezone correctly ([3eb79b3](https://github.com/erxes/erxes/commit/3eb79b392db0b93272a19bec2233371c7ded26fe))
* **inbox:** resolve filter update issue  ([bedc731](https://github.com/erxes/erxes/commit/bedc731522876a8392115ae59125bd07217cdc46))
* loyalty discount calculation in checkLoyalties for sales ([b5bc9b7](https://github.com/erxes/erxes/commit/b5bc9b7167b4fd6b7eb51777802ba925f8e68e60))
* score log with custom description ([b5e284f](https://github.com/erxes/erxes/commit/b5e284f6f2d7f5bd675a23a53fb3b77eaeeda43a))
* totalAmount is 0 then close this order on pos ([02398eb](https://github.com/erxes/erxes/commit/02398eb5e089a47cc28f61d51de3a9dda938428e))
* **utils:** update API URL retrieval to use environment variables ([95b7cb2](https://github.com/erxes/erxes/commit/95b7cb24971e6bc8023d83e34b0375f8793e445c))

## [2.17.31](https://github.com/erxes/erxes/compare/2.17.30...2.17.31) (2026-01-06)

### Features

* add loyalty voucher discount calculation for deals ([f1bfdd7](https://github.com/erxes/erxes/commit/f1bfdd70fd2ec6dad05fad2894ff9c671c3c21c6))
* **core:** add chunked file upload support to core package ([944ecbd](https://github.com/erxes/erxes/commit/944ecbde8e02f5fe558d2495eb6161ead77ab201))

## [2.17.30](https://github.com/erxes/erxes/compare/2.17.29...2.17.30) (2025-12-22)

### Bug Fixes

* **messageBroker:** improve error handling for non-existing queue names ([70338e2](https://github.com/erxes/erxes/commit/70338e2bf8091c7fd19117890212a1fc3a5bdbef))

## [2.17.29](https://github.com/erxes/erxes/compare/2.17.28...2.17.29) (2025-12-05)

### Features

* product lastCode ([#6715](https://github.com/erxes/erxes/issues/6715)) ([6528f90](https://github.com/erxes/erxes/commit/6528f90c15dc693ff96335bec218a35537fe5726))
* **tickets:** fix create ticket properties ([881c355](https://github.com/erxes/erxes/commit/881c355fa15a68688025749bfd0f5961d50b8aa3))

## [2.17.28](https://github.com/erxes/erxes/compare/2.17.27...2.17.28) (2025-11-19)

## <small>2.17.27 (2025-11-18)</small>

* chore(calls): debug grandsteam requests ([f42d6a4](https://github.com/erxes/erxes/commit/f42d6a4))
* fix(tickets): convert to ticket in inbox ([f4bb913](https://github.com/erxes/erxes/commit/f4bb913))

## <small>2.17.26 (2025-11-17)</small>

* chore(calls): remove tick provider ([126fa63](https://github.com/erxes/erxes/commit/126fa63))
* fix(calls): monitor local time ([873f868](https://github.com/erxes/erxes/commit/873f868))

## <small>2.17.25 (2025-11-17)</small>

* fix(cms): fix duplicate fields error ([e5d9156](https://github.com/erxes/erxes/commit/e5d9156))
* fix(cms): fix duplicate tag slug errors by recursively adding increment numbers ([e9beeff](https://github.com/erxes/erxes/commit/e9beeff))
* fix(cms): use dynamic search value in tag query ([1ac45bd](https://github.com/erxes/erxes/commit/1ac45bd))
* fix(ticket): add local storage changer ([2154c92](https://github.com/erxes/erxes/commit/2154c92))
* chore: add tick provider and debug ([4a9d96e](https://github.com/erxes/erxes/commit/4a9d96e))
* chore: remove console ([8fdec5a](https://github.com/erxes/erxes/commit/8fdec5a))
* chore(clientportal): update typo ([fbdfc5e](https://github.com/erxes/erxes/commit/fbdfc5e))
* feat: show vip customer in incoming call ([9114b0d](https://github.com/erxes/erxes/commit/9114b0d))
* feat(cms): generate unique slug/code before save models ([6721453](https://github.com/erxes/erxes/commit/6721453))

## <small>2.17.24 (2025-11-07)</small>

* fix: car clientPortal mutations ([625e3c4](https://github.com/erxes/erxes/commit/625e3c4))
* fix: car clientPortal mutations ([e4dfe14](https://github.com/erxes/erxes/commit/e4dfe14))
* fix: fix call monitor ([1b08a2d](https://github.com/erxes/erxes/commit/1b08a2d))
* fix: incoming call ringtone ([4e06b47](https://github.com/erxes/erxes/commit/4e06b47))
* chore: debug call queue list ([a9ed5bf](https://github.com/erxes/erxes/commit/a9ed5bf))
* chore: debug call queue list ([4fd0149](https://github.com/erxes/erxes/commit/4fd0149))
* chore(cms): fix categories/tags pagination ([69e01fb](https://github.com/erxes/erxes/commit/69e01fb))
* feat: add call cookie resseter ([0a4376a](https://github.com/erxes/erxes/commit/0a4376a))
* feat(ticket): initialize fields from localStorage and sync with props in componentDidUpdate  ([dd3f23b](https://github.com/erxes/erxes/commit/dd3f23b))
* Release 2.17.23 ([67c704e](https://github.com/erxes/erxes/commit/67c704e))
* bugfix(cms): prevent 'isScheduled' from being sent in mutation input ([e298a38](https://github.com/erxes/erxes/commit/e298a38))

* Merge branch 'master' of github.com:erxes/erxes (2dbbdee8d1)
* feat(ticket): initialize fields from localStorage and sync with props in componentDidUpdate (dd3f23b42f)
* fix: car clientPortal mutations (625e3c44d4)
* fix: car clientPortal mutations (e4dfe1432f)
* chore(cms): fix categories/tags pagination (69e01fb674)
* bugfix(cms): prevent 'isScheduled' from being sent in mutation input (e298a383ac)
* Merge branch 'master' of github.com:erxes/erxes (721337422e)

## <small>2.17.23 (2025-11-04)</small>

## <small>2.17.22 (2025-10-31)</small>

* fix: pos ui filter has a remainder ([0b283f6](https://github.com/erxes/erxes/commit/0b283f6))
* fix: pos, temp save remainders, sort and filter remainder and price (#6547) ([3bf532a](https://github.com/erxes/erxes/commit/3bf532a)), closes [#6547](https://github.com/erxes/erxes/issues/6547)
* fix: tourism update (#6543) ([d3a6611](https://github.com/erxes/erxes/commit/d3a6611)), closes [#6543](https://github.com/erxes/erxes/issues/6543)
* fix(ticket): fix required field validation preventing ticket creation ([2e49065](https://github.com/erxes/erxes/commit/2e49065))
* chore: pos fetch remainder refactor ([ee9a3a2](https://github.com/erxes/erxes/commit/ee9a3a2))
* debug: add additional console logs for score calculations and updated custom fields in ScoreCampaign ([2d75db9](https://github.com/erxes/erxes/commit/2d75db9))
* debug: add console logs for placeholder and parent object in ScoreCampaigns and utils ([6770877](https://github.com/erxes/erxes/commit/6770877))
* debug: update console log to stringify parent object in resolvePlaceholderValue function ([d3448eb](https://github.com/erxes/erxes/commit/d3448eb))

## [2.17.21](https://github.com/erxes/erxes/compare/2.17.20...2.17.21) (2025-10-23)

## [2.17.20](https://github.com/erxes/erxes/compare/2.17.19...2.17.20) (2025-10-23)

## [2.17.19](https://github.com/erxes/erxes/compare/2.17.18...2.17.19) (2025-10-22)

### Bug Fixes

* update regex for value replacement in automations and improve code formatting in RFEditor and SetProperty components ([d2b5b5e](https://github.com/erxes/erxes/commit/d2b5b5ea2a85494fe3a9a3bcfffea085df0c848a))

## [2.17.18](https://github.com/erxes/erxes/compare/2.17.17...2.17.18) (2025-10-21)

### Features

* **core:** add fieldsGroupFix mutation for fixing property groups ([8d1e0df](https://github.com/erxes/erxes/commit/8d1e0df1d1929d2d1edacdf384b63897c849a9e6))
* **syncer:** add logging for template creation and update Elasticsearch URL handling in initial sync ([3fc6b98](https://github.com/erxes/erxes/commit/3fc6b980acbb1f289991742d51d5ccdfd10db762))
* **syncer:** implement batch processing for MongoDB to Elasticsearch synchronization with improved concurrency and performance settings ([79208e4](https://github.com/erxes/erxes/commit/79208e4f11aad7eb3857b0d5a86dd29197096395))

### Bug Fixes

* similiraties products per with remainder ([1e5a11d](https://github.com/erxes/erxes/commit/1e5a11d3f3359aa44e9981f199ca2a7b7c27d753))
* **syncer:** remove unnecessary performance flags from monstache command in initial sync ([a7d3f10](https://github.com/erxes/erxes/commit/a7d3f10d66a7efcca5d1a36226efc4c1614fbc07))
* tourism update ([1e8b627](https://github.com/erxes/erxes/commit/1e8b627f80b47c2137d81f7efec1c1fdae85037b))

## [2.17.17](https://github.com/erxes/erxes/compare/2.17.16...2.17.17) (2025-10-09)

### Features

* **core:**  Create Relations group if not exists ([902dd7a](https://github.com/erxes/erxes/commit/902dd7a41621dba59ef1d548af98dbace4e377b6))
* enhance score campaign functionality with new field origin and improved placeholder resolution ([929362b](https://github.com/erxes/erxes/commit/929362b8af15a3923c23840c30f2be88a20395de))

## [2.17.16](https://github.com/erxes/erxes/compare/2.17.15...2.17.16) (2025-10-06)

### Bug Fixes

* add delay and logging in relatedServices function of getItems automation ([e7a81bb](https://github.com/erxes/erxes/commit/e7a81bb8e1d3eb1c16ad22799d870b9c2974920d))
* update related service name from 'contacts' to 'core' in getItems automation ([3da6e99](https://github.com/erxes/erxes/commit/3da6e997b778d78ab8a24ab4602cc3a9f57dabed))

## [2.17.15](https://github.com/erxes/erxes/compare/2.17.14...2.17.15) (2025-10-06)

### Bug Fixes

* **pos:** check barcode and shop theme show unitPrice and remainder ([3be14d7](https://github.com/erxes/erxes/commit/3be14d7770c316f092be3bb3e2d57275711eff3d))
* posclient sync util performance ([1d01f51](https://github.com/erxes/erxes/commit/1d01f519fb0aae8175b61ee6540beb9e6c8969e2))
* update redirect logic in handleMagiclink and handleCoreLogin to support dynamic subdomain routing based on organization type ([a1967ec](https://github.com/erxes/erxes/commit/a1967ec9a5a7f8ccb37002d7149e086bc7ae3785))

## [2.17.14](https://github.com/erxes/erxes/compare/2.17.13...2.17.14) (2025-10-01)

### Features

* enhance automation rule handling with expression support ([3bec802](https://github.com/erxes/erxes/commit/3bec802070a5dcebf628ef9ec3f466691e8527fe))

### Bug Fixes

* cars from clientportal many car many customer ([e292f02](https://github.com/erxes/erxes/commit/e292f0256e55fb1e41866c004c38eba5c6737b9b))
* posclient groupedSimilarity products with remainder ([2865741](https://github.com/erxes/erxes/commit/28657419a64d2aad9181d46009d9fc70f59aa516))
* posclient similarity chosen page with remainder ([b34cb62](https://github.com/erxes/erxes/commit/b34cb62cf7385262175805d111050294b5a05be7))
* posclient similarity chosen page with remainder ([937ff54](https://github.com/erxes/erxes/commit/937ff54dcf60caabc2ba39bd54c2d216f9784b44))

## [2.17.13](https://github.com/erxes/erxes/compare/2.17.12...2.17.13) (2025-09-29)

### Features

* add resume option to main.go configuration ([7d20e0e](https://github.com/erxes/erxes/commit/7d20e0e3f5f08b1cef53692583c1811fd19a44b6))
* enhance email generation with dynamic from email placeholder ([9068bee](https://github.com/erxes/erxes/commit/9068bee7de60c20e091dc9f2f1303a3698eba518))
* filter organizations by last active date in main.go ([fdbfcf5](https://github.com/erxes/erxes/commit/fdbfcf5424d4cef4bf089f95706aa28495f02ec6))

### Bug Fixes

* mongo-driver version 1.7 ([b2845a8](https://github.com/erxes/erxes/commit/b2845a85de5ab19b37813326f16a8faa84af7ce8))

## [2.17.12](https://github.com/erxes/erxes/compare/2.17.11...2.17.12) (2025-09-26)

### Bug Fixes

* pos - show remainder on coffeeshop theme ([2c01bd1](https://github.com/erxes/erxes/commit/2c01bd139d0ff1597cb51996f3b51c6514ec1c84))
* pos ebarimt show choice sum quantity ([3b6f1b6](https://github.com/erxes/erxes/commit/3b6f1b6e1eceb4e6f3a3957f5eb5413c8adc2ca4))
* pos ebarimt with discount ([65867b3](https://github.com/erxes/erxes/commit/65867b35716c6b807586235223438f273e021947))

## <small>2.17.11 (2025-09-23)</small>

* feat(inbox): add required and default values to createdUserId, kind, createdA ([eb81bf8](https://github.com/erxes/erxes/commit/eb81bf8))
* feat(ticket): add custom fields and persist ticket in localStorage ([318ce88](https://github.com/erxes/erxes/commit/318ce88))
* fix(calls):  duplicate histories, unknown caller, call dashboard and pause issues fixed (#6154) ([2579d98](https://github.com/erxes/erxes/commit/2579d98)), closes [#6154](https://github.com/erxes/erxes/issues/6154)
* fix(tourism): fix ([d90ffd2](https://github.com/erxes/erxes/commit/d90ffd2))
* pass ci ([b9812d2](https://github.com/erxes/erxes/commit/b9812d2))

## [2.17.10](https://github.com/erxes/erxes/compare/2.17.9...2.17.10) (2025-09-21)

## <small>2.17.9 (2025-09-19)</small>

* revert: create inbox message ([a745ac7](https://github.com/erxes/erxes/commit/a745ac7))

## [2.17.8](https://github.com/erxes/erxes/compare/2.17.7...2.17.8) (2025-09-18)

### Bug Fixes

* **inbox:** correctly set primary phone and prevent duplicate conversations ([a0f42e6](https://github.com/erxes/erxes/commit/a0f42e6703344215fc3d16b495f72431fa8273b2))

## [2.17.7](https://github.com/erxes/erxes/compare/2.17.6...2.17.7) (2025-09-17)

### Bug Fixes

* add phones when render full name ([b774f77](https://github.com/erxes/erxes/commit/b774f775df12f4e368dd3e71ff227c2ccb85b400))
* **calls:** fix minus waiting call sec ([688f447](https://github.com/erxes/erxes/commit/688f447a1b1806f6f8897c62e1a4521b403b1545))

## [2.17.6](https://github.com/erxes/erxes/compare/2.17.5...2.17.6) (2025-09-15)

### Bug Fixes

* payments type properties to set ([d5f7f0e](https://github.com/erxes/erxes/commit/d5f7f0e0ab094e3c4c360478c1723aac85af1dc3))

## [2.17.5](https://github.com/erxes/erxes/compare/2.17.4...2.17.5) (2025-09-15)

### Bug Fixes

* totalAmount save on deal ([2d450ec](https://github.com/erxes/erxes/commit/2d450ec8a10502d43ea47f858d472a8ba5d0ff76))

## <small>2.17.4 (2025-09-15)</small>

* fix(erxes-ui): include details.position when positions are empty  ([74f9d8c](https://github.com/erxes/erxes/commit/74f9d8c))
* Update api.ts ([3c619ec](https://github.com/erxes/erxes/commit/3c619ec))

## <small>2.17.3 (2025-09-12)</small>

* feat(ticket): Add Attribution ([47cafdb](https://github.com/erxes/erxes/commit/47cafdb))

## [2.17.2](https://github.com/erxes/erxes/compare/2.17.1...2.17.2) (2025-09-11)

### Bug Fixes

* paymentTypes config format read eval ([1893cbc](https://github.com/erxes/erxes/commit/1893cbc30d0ce93f6339eb8c73e04effa9965ffb))

## [2.17.1](https://github.com/erxes/erxes/compare/2.17.0...2.17.1) (2025-09-10)

### Features

* enhance automation field generation and related value retrieval ([361f7de](https://github.com/erxes/erxes/commit/361f7de7a84fe8bf2411b92fbaa10f55da60a945))
* **tickets:** allow system or owner users to see all tickets ([7441c63](https://github.com/erxes/erxes/commit/7441c63081842fa91e7888781962f5ad235769c4))

### Bug Fixes

* correct string interpolation and formatting in Docker utility functions ([358b0fd](https://github.com/erxes/erxes/commit/358b0fdb3ef88ad4857294a6c2eb20dcb87d6425))

## [2.17.0](https://github.com/erxes/erxes/compare/2.16.7...2.17.0) (2025-09-09)

### Features

* **inbox:** add tag type and update search filter ([9dd3475](https://github.com/erxes/erxes/commit/9dd3475bb6f2064adc37b1270d69668692a57d78))
* update cli version to 2.0.3 ([6804f5c](https://github.com/erxes/erxes/commit/6804f5ca1a389cd74ccfda57567cf84456fb5df9))

### Bug Fixes

* An error occured in CLEAN while prepareCustomFieldsData to continue ([97f1df1](https://github.com/erxes/erxes/commit/97f1df1c773b360ea5488a4da708fa212cdd66b2))
* essyncer base version up and some mappings up  ([c4befba](https://github.com/erxes/erxes/commit/c4befbac04cce2c0170ea5717d04801b470e2589))
* fields clean with await ([#6130](https://github.com/erxes/erxes/issues/6130)) ([4750c2c](https://github.com/erxes/erxes/commit/4750c2c76f7f8387fa9627a2392374fab50cd829))

## [2.16.7](https://github.com/erxes/erxes/compare/2.16.6...2.16.7) (2025-09-04)

### Features

* **form:** select team members based on the branch ([feee3c3](https://github.com/erxes/erxes/commit/feee3c3ddf93d1251548442a4e07b263d808801c))
* **tickets:** add toggle type for ticket relations in sidebar ([38246a0](https://github.com/erxes/erxes/commit/38246a033bddeba82787f94cff17384ffd9ab48f))
* **tickets:** enhance getRelatedValue to include parent branch titles ([9c556f4](https://github.com/erxes/erxes/commit/9c556f411b668e27dd08a9792e5b551ba05dec9d))
* **tickets:** generate custom fields log for ticket form ([8346014](https://github.com/erxes/erxes/commit/83460148e0e4c828058f08d6faa163d8e18c7269))
* **tickets:** refactor branch UI ([1ee5de9](https://github.com/erxes/erxes/commit/1ee5de9b01954756627fb19821699b80dc4dda8c))
* **ui-form:** set default value to current time ([cfcf621](https://github.com/erxes/erxes/commit/cfcf6219c2aee6a6b130d548210e9e49c4226295))

### Bug Fixes

* **calls:** select call customer ([8f351d0](https://github.com/erxes/erxes/commit/8f351d0875e896187ad23fa002f622d64de710a9))
* **core-ui:** Assigned to field UI depends on branch selection ([e84656c](https://github.com/erxes/erxes/commit/e84656c3386453c3aaa229a997c60d01d35fb083))
* **core-ui:** generateField add branch props ([9673190](https://github.com/erxes/erxes/commit/96731907b8075ffd7497275e50f0968f57cc32d6))
* **core-ui:** properly handle selectedOptions in SelectWithSearch ([4399466](https://github.com/erxes/erxes/commit/4399466f0ac16feb029adf0c6d963bc26d7c93df))
* loans, savings and syncpolaris improve ([#6113](https://github.com/erxes/erxes/issues/6113)) ([7143bf1](https://github.com/erxes/erxes/commit/7143bf141bf5d8db8e3d8a3aa5c2957e061e0391))
* pricing repeat ui ([638fd1d](https://github.com/erxes/erxes/commit/638fd1d6744e9f11b1ca436dd9424caba9db74fd))
* **tickets:** user query search  ([ddab9a2](https://github.com/erxes/erxes/commit/ddab9a2f6dc114206b5871d08fa78cf885438a6d))

## [2.16.6](https://github.com/erxes/erxes/compare/2.16.5...2.16.6) (2025-08-26)

### Features

* **cms:** add tag, menu, page, category translations ([#6108](https://github.com/erxes/erxes/issues/6108)) ([35ec836](https://github.com/erxes/erxes/commit/35ec8360b1d3aa43965b266e477b3cc6db39eaf0))
* **erxes-ui:** improve user option labels with positions and branches ([3313556](https://github.com/erxes/erxes/commit/33135564866c2f40fb50e5e929fed2e0e5995bf2))
* **tickets-api:** add new fields for branches and createdBy parent in field generation and related value automation ([cb5d476](https://github.com/erxes/erxes/commit/cb5d4764bed3c9ff15755f11a3361466227ff14e))

### Bug Fixes

* pos orders filter by types ([2fa0b51](https://github.com/erxes/erxes/commit/2fa0b517f588ccbf52680b620cdc6633f71e024b))
* **pos:** pos daily report filter with startDate and endDate ([3eabd3f](https://github.com/erxes/erxes/commit/3eabd3fb2826da6c41d70dccb0705564ce260904))

## [2.16.5](https://github.com/erxes/erxes/compare/2.16.4...2.16.5) (2025-08-20)

### Features

* **tickets:** user enable filtering by branchIds ([39701cf](https://github.com/erxes/erxes/commit/39701cf1dfd0637c51a4df951d2c9a489bf9c5c3))

### Bug Fixes

* **facebook:** remove invalid standby field from page subscription ([#6107](https://github.com/erxes/erxes/issues/6107)) ([c2b9067](https://github.com/erxes/erxes/commit/c2b9067171e0e0aab73f17c4aed59bf96c8ecfa7))
* pos progress bill print per config ([#6102](https://github.com/erxes/erxes/issues/6102)) ([9953c50](https://github.com/erxes/erxes/commit/9953c500d0a3fa678c813c50f654d7595fa6275a))
* productChooser with pipelineId on deal ([ca0080d](https://github.com/erxes/erxes/commit/ca0080d03865a268d5b57aa81307eeba33b5d041))

## [2.16.4](https://github.com/erxes/erxes/compare/2.16.3...2.16.4) (2025-08-13)

### Bug Fixes

* emails format widget connect customer ([fee074e](https://github.com/erxes/erxes/commit/fee074e62bdeb5de992409b0a944e6cab2d397c7))

## [2.16.3](https://github.com/erxes/erxes/compare/2.16.2...2.16.3) (2025-08-12)

### Bug Fixes

* enhance error handling and code consistency in ticket tagging ([3fafab3](https://github.com/erxes/erxes/commit/3fafab3ed87a35c0281b3d8d8f001f684368f5de))
* posclient report filter startNumber only 8length ([152110f](https://github.com/erxes/erxes/commit/152110f3f47f1cc5820ac400a0c758a61780feca))
* **ticket:** Add user fetching by selected branch during filtering recovery ([ff631dc](https://github.com/erxes/erxes/commit/ff631dc999275dc79cf4d260761b382626da76ae))
* users query when isAssignee without filter branchIds ([f6f2a84](https://github.com/erxes/erxes/commit/f6f2a84cd09cf305bee4ef794c72ff783d7fb0ba))

## [2.16.2](https://github.com/erxes/erxes/compare/2.16.1...2.16.2) (2025-08-06)

### Bug Fixes

* purchase ([#6100](https://github.com/erxes/erxes/issues/6100)) ([679ab14](https://github.com/erxes/erxes/commit/679ab145a6f46bad7828967647511bdf2be79fa5))

## [2.16.1](https://github.com/erxes/erxes/compare/2.16.0...2.16.1) (2025-08-06)

### Features

* pos with invoice ([#6087](https://github.com/erxes/erxes/issues/6087)) ([20f12a5](https://github.com/erxes/erxes/commit/20f12a513505c4d44d2ebbbf83ff4945353c2c35))

### Bug Fixes

* paymentform ([0eacfa5](https://github.com/erxes/erxes/commit/0eacfa5e14e50a0aaf1d3b45af7dad6ed476f10e))
* purchase manage expenses ([b45ccac](https://github.com/erxes/erxes/commit/b45ccac87e63c6d96116caff6c9133141bc4a9c5))

## [2.16.0](https://github.com/erxes/erxes/compare/2.15.8...2.16.0) (2025-08-03)

### Features

* enhance logging capabilities with new schemas ([df822a3](https://github.com/erxes/erxes/commit/df822a3f3b17a2da6a2cc1c0024ee5696a10ed04))
* **tickets:** Add ability to hide relations & fix ui branch ([9359000](https://github.com/erxes/erxes/commit/9359000f7b6a8a4e10df720d2e8d926f3a20eb99))

### Bug Fixes

* **pms:** edit aftermutations ([6894e40](https://github.com/erxes/erxes/commit/6894e409be5c440d465b8910692f7034d7ac3c9b))
* **pms:** filter pms rooms ([2d9028c](https://github.com/erxes/erxes/commit/2d9028c35d6bf8131c3a1fe86fbc21e189a259be))
* release.yaml ([c2e00ea](https://github.com/erxes/erxes/commit/c2e00ea41672040d2d899a3718581a60fe3034d0))
* **tms:** cronjobs ([15e585c](https://github.com/erxes/erxes/commit/15e585cfa22f8db9bf30b1f71109f605b264420e))
* **tms:** date_status field ([559a623](https://github.com/erxes/erxes/commit/559a623540293004ce8621334bdd759eb9a21b7e))
* **tms:** filter remove time ([4996959](https://github.com/erxes/erxes/commit/4996959d63ac35f8ef39c66b9c9e6250f4d1b48c))
* **tms:** order query ([96d5179](https://github.com/erxes/erxes/commit/96d5179f745f12892216ca9c9f43eae06b40fb26))
* **tms:** orderadd by systemuser ([0880aa3](https://github.com/erxes/erxes/commit/0880aa3cbd11ab8b138403c510efe604e2e2f053))
* **tms:** query tours ([3391248](https://github.com/erxes/erxes/commit/3391248bf8f1cd034083dc748f48128a822f2560))
* **tms:** spelling error ([33212a3](https://github.com/erxes/erxes/commit/33212a3d856e8dfa0fdabb7b76066aec7394bf08))
* **tms:** tourgroup ([65da785](https://github.com/erxes/erxes/commit/65da7858e16898d4fcbf43f2f6ce05063ab6e99d))
* **tms:** update itinerary ([1525689](https://github.com/erxes/erxes/commit/15256898f1cc33625ea644bf129fc00934c76ae2))

## [2.15.8](https://github.com/erxes/erxes/compare/2.15.7...2.15.8) (2025-07-31)

### Bug Fixes

* correct data structure in getRelatedValue automation ([6dea839](https://github.com/erxes/erxes/commit/6dea83972c41fb170c215baf0db0e77a21e54d66))

## [2.15.7](https://github.com/erxes/erxes/compare/2.15.6...2.15.7) (2025-07-30)

### Features

* implement email automation features ([4eea104](https://github.com/erxes/erxes/commit/4eea104cf288e5a64ae065ff69f23b26324fe0d1))

## [2.15.6](https://github.com/erxes/erxes/compare/2.15.5...2.15.6) (2025-07-30)

### Bug Fixes

* ebarimt group products with sortNumber ([63ad4ab](https://github.com/erxes/erxes/commit/63ad4ab21d3c3e9e2458eed794e56988978b5ead))

## [2.15.5](https://github.com/erxes/erxes/compare/2.15.4...2.15.5) (2025-07-29)

### Features

* add new fields and enhance related value retrieval in automation ([6bc253a](https://github.com/erxes/erxes/commit/6bc253a713b51ec1df7c522d7de5d355afd1452e))
* enhance automation placeholders and related value retrieval ([5d3e1da](https://github.com/erxes/erxes/commit/5d3e1da38ffb2166cb8d0de1c7f1e732280b1524))

### Bug Fixes

* **pms:**  pms rooms ([a034c8d](https://github.com/erxes/erxes/commit/a034c8dfa12f33e1a3653a3a12d40403e3e72141))
* update URL in getRelatedValue to point to ticket board ([e1a9076](https://github.com/erxes/erxes/commit/e1a90767fe7d25569d626172b2d35247fe6bf252))

## [2.15.4](https://github.com/erxes/erxes/compare/2.15.3...2.15.4) (2025-07-28)

### Features

* add new fields for automation and enhance target structure ([7ae2c09](https://github.com/erxes/erxes/commit/7ae2c09b4375294e68ff8a6c008c0a62f3190670))
* **tickets:** add tag UI and fix pipeline integration ([f7c2e96](https://github.com/erxes/erxes/commit/f7c2e966f9caace3bcb1a7d5d10cb8c5993ba3cc))

### Bug Fixes

* loyalty with qrCode some bug ([3ef4dbd](https://github.com/erxes/erxes/commit/3ef4dbdf2ab838f3283f0e3af3334c684bbeda4c))

## [2.15.3](https://github.com/erxes/erxes/compare/2.15.2...2.15.3) (2025-07-23)

### Features

* ebarimt grouped by some product config ([#6091](https://github.com/erxes/erxes/issues/6091)) ([5fee820](https://github.com/erxes/erxes/commit/5fee8206054a4e44f43580d4fb4b72aab8d6320c))

### Bug Fixes

* display user names in customProperties and prevent undefined fieldData errors  ([a9f05d8](https://github.com/erxes/erxes/commit/a9f05d81f445b2ab5648cc5fed4c445a617f1677))

## [2.15.2](https://github.com/erxes/erxes/compare/2.15.1...2.15.2) (2025-07-21)

### Features

* Loyalty with qrcode on sales payments ([#6088](https://github.com/erxes/erxes/issues/6088)) ([3bfba84](https://github.com/erxes/erxes/commit/3bfba841757ce81307e540f8855042bce7adb912))

### Bug Fixes

* description ([c87cf36](https://github.com/erxes/erxes/commit/c87cf364d97b781bbcbc3a32a47f06a52ff3af7f))

## [2.15.1](https://github.com/erxes/erxes/compare/2.15.0...2.15.1) (2025-07-09)

### Bug Fixes

* **cp:** apollo client uri ([0b69071](https://github.com/erxes/erxes/commit/0b690710943a57b602ad2bcf22e25e0e82fca13d))
* Ebarimt improve, putResponseDetail and put response with user, and golomt pos terminal devPort configure ([#6084](https://github.com/erxes/erxes/issues/6084)) ([549d7cf](https://github.com/erxes/erxes/commit/549d7cf1ad7e24205508f9754c106967854fcc5e))
* **pms:** add after mutation consumer in pms ([4293010](https://github.com/erxes/erxes/commit/4293010729988e6d71605266b6e16175b0f8768a))
* **pms:** afterMutation miss typo plugin name ([4bd79fe](https://github.com/erxes/erxes/commit/4bd79fe1eb7aa8e73fb149ebe4208a29fd621f0c))
* **pms:** revert configs ([1fd0b22](https://github.com/erxes/erxes/commit/1fd0b22581894f94e4197664ecb441fd42718969))
* pos golomt terminal with diff portNo ([3cf7f00](https://github.com/erxes/erxes/commit/3cf7f00cdd56fc841c3fa3c00631b0d00f6b1623))
* **ticket:** little issues ([5c31448](https://github.com/erxes/erxes/commit/5c314484c3fed92502367ad58af123efd300f714))
* **tickets:** debug ([4229377](https://github.com/erxes/erxes/commit/422937774a859b29c9a45b0715e05c0f54fe7c26))
* **tms:** update ([86294e6](https://github.com/erxes/erxes/commit/86294e6dd85c73e0134c11b8d583a9cd540b7943))

## [2.15.0](https://github.com/erxes/erxes/compare/2.14.5...2.15.0) (2025-07-02)

### Features

* **ticket:** Add user fetching by selected branch during filtering ([7084e41](https://github.com/erxes/erxes/commit/7084e41df7d248dd01c12f282c24badbfcb26b43))
* **tickets:** add search functionality to SelectNewBranches component ([0f670df](https://github.com/erxes/erxes/commit/0f670dfd80917fcbbea9924e6f424ad6373279a9))

### Bug Fixes

* can't send target as trigger when tagged object ([a71b98e](https://github.com/erxes/erxes/commit/a71b98e27b15f47e03fda57b7790bdbabef5a990))
* **essyncer:** allow lookup by registration number ([ec085d8](https://github.com/erxes/erxes/commit/ec085d8e712df256719b9164667ca6346d090a7d))
* sales deal stageId not newly ([bc621f6](https://github.com/erxes/erxes/commit/bc621f6c320a9d3d0488b9fb2d46f81a3218b265))
* **tickets:** searchable contact rd and branch select ([8af43d4](https://github.com/erxes/erxes/commit/8af43d4facc781efc42498b61395ecc4aaee049b))
## [2.15.0-rc.0](https://github.com/erxes/erxes/compare/2.14.5...2.15.0) (2025-06-17)

## [2.15.0-rc.0](https://github.com/erxes/erxes/compare/2.14.0...2.15.0-rc.0) (2025-06-17)
## [2.14.5](https://github.com/erxes/erxes/compare/2.14.4...2.14.5) (2025-06-30)

### Features

* **tickets:** add new branch-selector component ([5241d85](https://github.com/erxes/erxes/commit/5241d85281243531aea963e0fb381646f8f26792))

### Bug Fixes

* **loyalties:**  cronjob ([05f0ca0](https://github.com/erxes/erxes/commit/05f0ca0ecef74e885de6983e7958ad31135006cf))
* sales products sticky 2 columns ([0998d6f](https://github.com/erxes/erxes/commit/0998d6fceb96c8f445240497d52a6c568e0760b3))
* sales with pricing bonus product addition 0 amounts row ([9f5cd5d](https://github.com/erxes/erxes/commit/9f5cd5d190d233b678fde4315717b4063e385e82))

## [2.14.4](https://github.com/erxes/erxes/compare/2.14.3...2.14.4) (2025-06-26)

### Bug Fixes

* sales deal products data save then old sort ([3c98a87](https://github.com/erxes/erxes/commit/3c98a87a62e16d8ac71da9d8e6162400bf579498))

## [2.14.3](https://github.com/erxes/erxes/compare/2.14.2...2.14.3) (2025-06-25)

### Bug Fixes

* sales deal detail with assignee activity log ([c48b018](https://github.com/erxes/erxes/commit/c48b0181ca3f47ae40159361e1113781bc219cdc))

## [2.14.2](https://github.com/erxes/erxes/compare/2.14.1...2.14.2) (2025-06-23)

### Features

* **clientportal:** toki invoice check ([f8d7bb5](https://github.com/erxes/erxes/commit/f8d7bb5b436e4ffc88b631b9ee6a221556b39ac3))

## [2.14.1](https://github.com/erxes/erxes/compare/2.14.0...2.14.1) (2025-06-19)

### Bug Fixes

* sales deal stageId not newly ([a64c392](https://github.com/erxes/erxes/commit/a64c39257993c6889f9dfc347c9d419a544fc418))

## [2.14.0](https://github.com/erxes/erxes/compare/2.14.0-rc.4...2.14.0) (2025-06-17)

### Bug Fixes

* **clientPortal:** correct notification logic in cardUpdateHandler ([#6062](https://github.com/erxes/erxes/issues/6062)) ([caff152](https://github.com/erxes/erxes/commit/caff1529b565650430c5379baff2c9fb18af803c))
* deals assignedusers related by productsData assignedUser ([3b561fe](https://github.com/erxes/erxes/commit/3b561fed3295f6951af29b3396bb8be6932b9260))

## [2.14.0-rc.4](https://github.com/erxes/erxes/compare/2.14.0-rc.3...2.14.0-rc.4) (2025-06-17)

### Bug Fixes

* sales editForm stageNotFound error ([c92d2c1](https://github.com/erxes/erxes/commit/c92d2c14a5f2f7c5327fae5e42e4f140cd3d3af7))

## [2.14.0-rc.3](https://github.com/erxes/erxes/compare/2.13.4...2.14.0-rc.3) (2025-06-16)

### Features

* **clientportal:** introduce environment variables ([#6059](https://github.com/erxes/erxes/issues/6059)) ([3c52dd8](https://github.com/erxes/erxes/commit/3c52dd81d38cff00d4c9db1b5c09c3924efcacfe))

### Bug Fixes

* **assets:** permission ([4d14da5](https://github.com/erxes/erxes/commit/4d14da53552ebc114ff3f8223dfba7ed00aacdb5))
* pos order to deal when without branch or allBranch condition ([4eff734](https://github.com/erxes/erxes/commit/4eff7340c8a650c6af5dab8884c9005603eda309))
## [2.13.4](https://github.com/erxes/erxes/compare/2.13.4...2.14.0-rc.3) (2025-06-12)

### Bug Fixes

* fixNumber some case ([74da81f](https://github.com/erxes/erxes/commit/74da81f09e26896ceae40399741011069783a3ef))
## [2.13.3](https://github.com/erxes/erxes/compare/2.13.4...2.14.0-rc.3) (2025-06-12)

### Features

* **calls:** Improve Grandstream API auth and session handling ([4b84df5](https://github.com/erxes/erxes/commit/4b84df53748a564da5407f3258f29b11a234745b))
* **ticket:** add Chingeltei ticket functionality ([#6053](https://github.com/erxes/erxes/issues/6053)) ([2195d6f](https://github.com/erxes/erxes/commit/2195d6f7398ec919782420d73eb76beb9a3c35b2))
## [2.13.2](https://github.com/erxes/erxes/compare/2.13.4...2.14.0-rc.3) (2025-06-06)
## [2.13.1](https://github.com/erxes/erxes/compare/2.13.4...2.14.0-rc.3) (2025-06-05)

### Bug Fixes

* deals assigned users from check productsData assignedUser ([42482f2](https://github.com/erxes/erxes/commit/42482f23070d319640700526e45350ff5d98037a))
* ebarimt sub id show ([9e9f680](https://github.com/erxes/erxes/commit/9e9f680d2895f58515c39c3b696872aa7ec1ee89))
## [2.14.0-rc.2](https://github.com/erxes/erxes/compare/2.13.4...2.14.0-rc.3) (2025-06-15)

### Bug Fixes

* **segments:** pass whole associationFilters not one by ones ([4bdccd6](https://github.com/erxes/erxes/commit/4bdccd62f21778645c8e5dcbd99adef128d2b7e5))
## [2.14.0-rc.1](https://github.com/erxes/erxes/compare/2.13.4...2.14.0-rc.3) (2025-06-12)

### Bug Fixes

* **cards:** able to sync changes on stage changes ([3bc8c72](https://github.com/erxes/erxes/commit/3bc8c72c1b98669221d8041fbb4893f4d2fa501c))
## [2.14.0-rc.0](https://github.com/erxes/erxes/compare/2.13.4...2.14.0-rc.3) (2025-06-03)

### Features

* brenscoring and Loansresearch improve ([#5937](https://github.com/erxes/erxes/issues/5937)) ([328c5c2](https://github.com/erxes/erxes/commit/328c5c2f8a84c1d82876558561fffaf6b2ee73be))
* burenscore deal side bar add ([#5952](https://github.com/erxes/erxes/issues/5952)) ([c449eb8](https://github.com/erxes/erxes/commit/c449eb822bea66fb39d6789741a682960f8b1499))
* danRule add on contract type ([99b7e3f](https://github.com/erxes/erxes/commit/99b7e3f8c4fc00d046e4d73bf6c97de0d5706cb0))
* loans contract improve ([#5948](https://github.com/erxes/erxes/issues/5948)) ([168ba97](https://github.com/erxes/erxes/commit/168ba97969972722434ae95d2e77114f239c951a))
* loans research sales pipeline data add ([fa1cecd](https://github.com/erxes/erxes/commit/fa1cecdd1cb22d6c070fd4d31cde0ae089883d4b))
* loansresearch number value fixed ([f8c661c](https://github.com/erxes/erxes/commit/f8c661c7a4919ae8144a2998d924473a82676c4d))
* loansresearch number value fixed on sales side bar ([8a2621e](https://github.com/erxes/erxes/commit/8a2621e19fb6764f050cecfba00a7b3699717a16))
* permission add on loan research ([#5889](https://github.com/erxes/erxes/issues/5889)) ([29ed04a](https://github.com/erxes/erxes/commit/29ed04ad75263e041e8e47fe144ad56932d3f0da))
* syncpolaris with Loans and saving improve ([#6016](https://github.com/erxes/erxes/issues/6016)) ([28dfe2b](https://github.com/erxes/erxes/commit/28dfe2b48355232fa5bc35abc3b90282b16a2437))

### Bug Fixes

* **burenscoring:** update ui view on sales detail ([1f34719](https://github.com/erxes/erxes/commit/1f34719be5d6b724b036e8116d3259753d383718))
* calc schedule with last type ([7974f04](https://github.com/erxes/erxes/commit/7974f043828d9bcb652f4853734b904385fc4ffb))
* contract from refactor ([d7697b5](https://github.com/erxes/erxes/commit/d7697b5dcdf67edd70dfcc94e687a2320deda06b))
* **deal:** update product ui ([5f7e585](https://github.com/erxes/erxes/commit/5f7e5850759d157c3377dfde55342fe42de65572))
* fake contract on deal ([8594950](https://github.com/erxes/erxes/commit/85949509ec59fc806de6ac9c3c3c519a8d8e2c74))
* import * as _ from 'lodash'; ([ec497da](https://github.com/erxes/erxes/commit/ec497da4adc487bec2530ee25f3f4057ab3308b1))
* little ([9d2c9f2](https://github.com/erxes/erxes/commit/9d2c9f237bc2e947f8ff1a880b6c7c0dbed61f3e))
* little ([71b9264](https://github.com/erxes/erxes/commit/71b9264ed8798644a65cc15b3aa6a2f44301e475))
* little contract from ([3f96974](https://github.com/erxes/erxes/commit/3f9697403539bd8566aa80bf5699714ef4ab5bd9))
* loan contract section on deal ([91741d4](https://github.com/erxes/erxes/commit/91741d44acbe76167f2dd39412da95ade3f1ca0c))
* loans calc diff day ([26ca5dc](https://github.com/erxes/erxes/commit/26ca5dc5da11ee0a3cde69491e255d269f269930))
* loans calculation ([571b408](https://github.com/erxes/erxes/commit/571b408f0a1a34fbc5f8e6c1232ebdcc0b6aec15))
* loans contracts filter by status ([ef20b43](https://github.com/erxes/erxes/commit/ef20b43d93b7106bf9258a5ccf7c8cc8147ec911))
* loans contracttype config ([f0b60f9](https://github.com/erxes/erxes/commit/f0b60f9f53c9949687c6735647d9dc084dd7ff71))
* loans contracttype config ([cd76141](https://github.com/erxes/erxes/commit/cd76141499ad8282069bb11e513aefff92765a0a))
* loans contractype with some rules ([7b774f3](https://github.com/erxes/erxes/commit/7b774f353ca8357fbff8880b249f8843967b5393))
* Loans customer rightSidebar ([#5953](https://github.com/erxes/erxes/issues/5953)) ([a5e226d](https://github.com/erxes/erxes/commit/a5e226d7de02b31c912a9c7d1fdf2c1eaa9145d2))
* loans date is equal ([b080a35](https://github.com/erxes/erxes/commit/b080a358d8b06a313ea10cf70dc8cebfa945a16b))
* Loans improve ([#5959](https://github.com/erxes/erxes/issues/5959)) ([8f5ebea](https://github.com/erxes/erxes/commit/8f5ebea1e5143e0cd084cb2fd933ccdae9e824e3))
* loans overPayUtils ([136c615](https://github.com/erxes/erxes/commit/136c6155df4bd3233225a6adc78e6db37398ca21))
* loans repayment type checker ([ad17556](https://github.com/erxes/erxes/commit/ad175563a02bada2eeee2be66d9af37b0a74b3d0))
* loans some bug ([4b80251](https://github.com/erxes/erxes/commit/4b8025139abe558331f203566482647ee8496479))
* **loans:** contact detail view ([f334133](https://github.com/erxes/erxes/commit/f334133fe22b24c542138bf3be0fd1ed7aaaea80))
* Loansresearch improve ([#5891](https://github.com/erxes/erxes/issues/5891)) ([eaecc96](https://github.com/erxes/erxes/commit/eaecc96b5a823207a7b6c67cf3932374a854c5d7))
* Loansresearch improve ([#5895](https://github.com/erxes/erxes/issues/5895)) ([34abb10](https://github.com/erxes/erxes/commit/34abb1011d66bad67a83878b462eecb09c1ecc5b))
* Loansresearch improve ([#5970](https://github.com/erxes/erxes/issues/5970)) ([49e9900](https://github.com/erxes/erxes/commit/49e990088120249fc1babdb4471881b8aa67a302))
* Loansresearch improve, after sync xypdan data ([#5897](https://github.com/erxes/erxes/issues/5897)) ([d4412a8](https://github.com/erxes/erxes/commit/d4412a8bab85be379537f9b620080e14eb86cbfd))
* Loansresearch improve, from new contracts debt amount calc ([#5969](https://github.com/erxes/erxes/issues/5969)) ([8da2109](https://github.com/erxes/erxes/commit/8da21098160c4c8b4da433388c68e864663309af))
* Loansresearch recalc and loan contract improve ([#5975](https://github.com/erxes/erxes/issues/5975)) ([b7f36ff](https://github.com/erxes/erxes/commit/b7f36ff9e3904b4d391ba37935b1e82a2c54977d))
* part of give transaction logic and loans type refactor ([99fc85d](https://github.com/erxes/erxes/commit/99fc85d1167709dc6842bd14c1358b2f1147404f))
* posclient product sync allow null taxRule ([d2039d5](https://github.com/erxes/erxes/commit/d2039d509ad7e9c079c2999fb7df771d4aa0b1ef))
* **sales:** fix contract apply button ([820aaf7](https://github.com/erxes/erxes/commit/820aaf71723f59aada39a728a6388842a25161d7))
* **sales:** update deal edit form ([fa39af7](https://github.com/erxes/erxes/commit/fa39af7ac3a0bd2a12b5eec029c6535853db41ce))
* schedule utils repayment default is fixed ([6dfb5a0](https://github.com/erxes/erxes/commit/6dfb5a0f321915655b8971d4ef959a99edb24bac))
* syncpolaris and loans and savings improve ([#5990](https://github.com/erxes/erxes/issues/5990)) ([e8e113d](https://github.com/erxes/erxes/commit/e8e113dad5bf299117b0e54092afcc8113d34daf))
* unusedBalance has not schedules ([f52e223](https://github.com/erxes/erxes/commit/f52e223fa9c09f64f70f24a730d40c8b4c1dfcae))
* update cis ([8c34f38](https://github.com/erxes/erxes/commit/8c34f38741586798d70d5e6f1b3d3c70026763d4))
* update contractType ([00fac50](https://github.com/erxes/erxes/commit/00fac50ffcf7d5ac5bb60a2cd752a0a24992909b))
* update pluginsMap ([8f81a49](https://github.com/erxes/erxes/commit/8f81a49bfd478470a71ce79ca605eaeadbc8ffa5))
* update pluginsMap ([c8ea762](https://github.com/erxes/erxes/commit/c8ea76279e3e20347d4b211e56146c4597f6baba))
* update pluginsMap ([41d9b0a](https://github.com/erxes/erxes/commit/41d9b0a024e05d5ccddecfc57b80d48ab56123b1))
* update pluginsMap ([78c44eb](https://github.com/erxes/erxes/commit/78c44eb329c5d1b6b6be4200bae6b57d8e22a8c4))
* update pluginsMap ([381666d](https://github.com/erxes/erxes/commit/381666d475e84b4dbee6d86763454d46edaa1ea6))
* xyp deal sidebar ([43cb3b8](https://github.com/erxes/erxes/commit/43cb3b8e343ff100f2dd2a0e14f0d91bc99ad5b3))
* xyp image ([8fcf3fa](https://github.com/erxes/erxes/commit/8fcf3fab38ab2774851fe04f47073a6cb565f582))
* xypDataByObject grouped by serviceName ([dbf4e8b](https://github.com/erxes/erxes/commit/dbf4e8b8e4e6ce8bdcf02c9b3a7b0743c80795b0))

### Performance Improvements

* **sales:** Fix properties view in full edit sales form ([8dc2b79](https://github.com/erxes/erxes/commit/8dc2b79f7c081b367d136a37a3cdb6d5ac960097))
* **sales:** fix xyp data on sales detail ([4f116e7](https://github.com/erxes/erxes/commit/4f116e70055cfe66068522ffa82eeb077d68545f))
* **sales:** fix xyp data on small sales detail ([a1f0c17](https://github.com/erxes/erxes/commit/a1f0c172b290001568d0ad097a5bf949ea00136e))
* **sales:** Update salespipeline ui ([#5898](https://github.com/erxes/erxes/issues/5898)) ([b536b05](https://github.com/erxes/erxes/commit/b536b053d28443bd6e281e3d064bc5c4a7c35b9a))

## [2.14.0-rc.2](https://github.com/erxes/erxes/compare/2.14.0-rc.1...2.14.0-rc.2) (2025-06-15)

### Bug Fixes

* **segments:** pass whole associationFilters not one by ones ([4bdccd6](https://github.com/erxes/erxes/commit/4bdccd62f21778645c8e5dcbd99adef128d2b7e5))

## [2.14.0-rc.1](https://github.com/erxes/erxes/compare/2.14.0-rc.0...2.14.0-rc.1) (2025-06-12)

### Bug Fixes

* **cards:** able to sync changes on stage changes ([3bc8c72](https://github.com/erxes/erxes/commit/3bc8c72c1b98669221d8041fbb4893f4d2fa501c))
* CI up node version and some ubuntu version ([#6049](https://github.com/erxes/erxes/issues/6049)) ([548636a](https://github.com/erxes/erxes/commit/548636a0fbbd7d32f3761d6ddaad94034ce22525))
## [2.13.0](https://github.com/erxes/erxes/compare/2.14.0-rc.0...2.14.0-rc.1) (2025-06-03)

### Bug Fixes

* release.yaml ([ce1f20a](https://github.com/erxes/erxes/commit/ce1f20aac27a59d71ab1ef1807891f8010b23a28))

## [2.14.0-rc.0](https://github.com/erxes/erxes/compare/2.12.3...2.14.0-rc.0) (2025-06-03)
## [2.13.0](https://github.com/erxes/erxes/compare/2.12.3...2.13.0) (2025-06-03)

### Features

* clientportal and cms translations ([#6044](https://github.com/erxes/erxes/issues/6044)) ([8f05d90](https://github.com/erxes/erxes/commit/8f05d90693c065523cf79493162eb7fef52b9814))
* **clientportal:** introduce production field to toki config ([f5c1744](https://github.com/erxes/erxes/commit/f5c174417a63f8af62bc906d30bb88f0d423a23a))
* syncpolaris with Loans and saving improve ([#6016](https://github.com/erxes/erxes/issues/6016)) ([28dfe2b](https://github.com/erxes/erxes/commit/28dfe2b48355232fa5bc35abc3b90282b16a2437))

### Bug Fixes

* **cards:** add related ticket ([f05690d](https://github.com/erxes/erxes/commit/f05690d5a5365a41867fb3d03af5d3902c6f70f4))
* **cards:** related cards ([a5966f8](https://github.com/erxes/erxes/commit/a5966f8a4c0bfd52188a33f28668b50d414d1fa0))
* **clientportal:** fix tokiconfig bug ([04d0538](https://github.com/erxes/erxes/commit/04d0538e6e442eab84cac3f5ed553293dcaf0175))
* get cards association types ([d88d0ab](https://github.com/erxes/erxes/commit/d88d0ab3b9a6d6d6d48ef27b3e8df39bd4fee4e5))
* improve syncpolaris and loans, savings ([#6047](https://github.com/erxes/erxes/issues/6047)) ([e2ab9db](https://github.com/erxes/erxes/commit/e2ab9db81935f7a284d867d4f23fa5bb107622ba))
* **products:** filter & bugs ([04b27b9](https://github.com/erxes/erxes/commit/04b27b98656e7eaa73b40f25efc36899136bf633))
* release.yaml ([ce1f20a](https://github.com/erxes/erxes/commit/ce1f20aac27a59d71ab1ef1807891f8010b23a28))
* **sales:** add some attributes in document ([acbb9ab](https://github.com/erxes/erxes/commit/acbb9ab04eab286cc5cd9996e4acc288493e5298))
* **tms:** advancecheck ([52ef4a6](https://github.com/erxes/erxes/commit/52ef4a6f248638dc9ba65e752dc69aed2b9409df))
* **tms:** changes ([55e744c](https://github.com/erxes/erxes/commit/55e744c5a91afc8b3205a8f16b206d4f7fa6d79b))
* **tms:** join percent ([9338bad](https://github.com/erxes/erxes/commit/9338badb44ce77cc1105b521b7a5c214e78aeca3))
* **tms:** notification & payment ([31bedd6](https://github.com/erxes/erxes/commit/31bedd617310c5a23b59dfa3cd34dfd562e9ac24))
* **tms:** status group ([1b532e3](https://github.com/erxes/erxes/commit/1b532e38c74a3fb6d4dea9e005e194863c0c239c))
* **tms:** tour fields ([a2611fe](https://github.com/erxes/erxes/commit/a2611fe781549af3316728bceb8658d252d6579f))
* **tms:** update notifications ([7bd4201](https://github.com/erxes/erxes/commit/7bd420157043b662d829bc0e5d69d2b1474b0aa7))
* **tms:** update payment and logs ([2d27d37](https://github.com/erxes/erxes/commit/2d27d378712306e6d595bb5ecd2a6cf329279e4a))
* **tms:** update tour ([569cccf](https://github.com/erxes/erxes/commit/569cccfbdf19d4dc60478a745741481291308add))
## [2.13.0-rc.0](https://github.com/erxes/erxes/compare/2.12.3...2.14.0-rc.0) (2025-05-18)

### Features

* brenscoring and Loansresearch improve ([#5937](https://github.com/erxes/erxes/issues/5937)) ([328c5c2](https://github.com/erxes/erxes/commit/328c5c2f8a84c1d82876558561fffaf6b2ee73be))
* burenscore deal side bar add ([#5952](https://github.com/erxes/erxes/issues/5952)) ([c449eb8](https://github.com/erxes/erxes/commit/c449eb822bea66fb39d6789741a682960f8b1499))
* **cards:** product bundle ([409458b](https://github.com/erxes/erxes/commit/409458bc3a7326e72b3b7f4c2b0a0b5f5a5e5a03))
* danRule add on contract type ([99b7e3f](https://github.com/erxes/erxes/commit/99b7e3f8c4fc00d046e4d73bf6c97de0d5706cb0))
* loans contract improve ([#5948](https://github.com/erxes/erxes/issues/5948)) ([168ba97](https://github.com/erxes/erxes/commit/168ba97969972722434ae95d2e77114f239c951a))
* loans research sales pipeline data add ([fa1cecd](https://github.com/erxes/erxes/commit/fa1cecdd1cb22d6c070fd4d31cde0ae089883d4b))
* loansresearch number value fixed ([f8c661c](https://github.com/erxes/erxes/commit/f8c661c7a4919ae8144a2998d924473a82676c4d))
* loansresearch number value fixed on sales side bar ([8a2621e](https://github.com/erxes/erxes/commit/8a2621e19fb6764f050cecfba00a7b3699717a16))
* permission add on loan research ([#5889](https://github.com/erxes/erxes/issues/5889)) ([29ed04a](https://github.com/erxes/erxes/commit/29ed04ad75263e041e8e47fe144ad56932d3f0da))
## [2.13.0-rc.0](https://github.com/erxes/erxes/compare/2.12.3...2.13.0) (2025-05-18)

### Features

* **cards:** product bundle ([409458b](https://github.com/erxes/erxes/commit/409458bc3a7326e72b3b7f4c2b0a0b5f5a5e5a03))
* **product:** add new bundle feature on product ([30668c2](https://github.com/erxes/erxes/commit/30668c27a2215c40749981835b32d72d5ca7c03a))
* **product:** bundle ([9caba47](https://github.com/erxes/erxes/commit/9caba47c4d003916d9f3d3d44e19d4f40192c0d0))

### Bug Fixes

* accountings query with record ([ef9a54b](https://github.com/erxes/erxes/commit/ef9a54b3e5529980aecbf176870618ba7d1e4fdf))
* **burenscoring:** update ui view on sales detail ([1f34719](https://github.com/erxes/erxes/commit/1f34719be5d6b724b036e8116d3259753d383718))
* calc schedule with last type ([7974f04](https://github.com/erxes/erxes/commit/7974f043828d9bcb652f4853734b904385fc4ffb))
* contract from refactor ([d7697b5](https://github.com/erxes/erxes/commit/d7697b5dcdf67edd70dfcc94e687a2320deda06b))
* **deal:** update product ui ([5f7e585](https://github.com/erxes/erxes/commit/5f7e5850759d157c3377dfde55342fe42de65572))
* fake contract on deal ([8594950](https://github.com/erxes/erxes/commit/85949509ec59fc806de6ac9c3c3c519a8d8e2c74))
* import * as _ from 'lodash'; ([ec497da](https://github.com/erxes/erxes/commit/ec497da4adc487bec2530ee25f3f4057ab3308b1))
* little ([9d2c9f2](https://github.com/erxes/erxes/commit/9d2c9f237bc2e947f8ff1a880b6c7c0dbed61f3e))
* little ([71b9264](https://github.com/erxes/erxes/commit/71b9264ed8798644a65cc15b3aa6a2f44301e475))
* little contract from ([3f96974](https://github.com/erxes/erxes/commit/3f9697403539bd8566aa80bf5699714ef4ab5bd9))
* loan contract section on deal ([91741d4](https://github.com/erxes/erxes/commit/91741d44acbe76167f2dd39412da95ade3f1ca0c))
* loans calc diff day ([26ca5dc](https://github.com/erxes/erxes/commit/26ca5dc5da11ee0a3cde69491e255d269f269930))
* loans calculation ([571b408](https://github.com/erxes/erxes/commit/571b408f0a1a34fbc5f8e6c1232ebdcc0b6aec15))
* loans contracts filter by status ([ef20b43](https://github.com/erxes/erxes/commit/ef20b43d93b7106bf9258a5ccf7c8cc8147ec911))
* loans contracttype config ([f0b60f9](https://github.com/erxes/erxes/commit/f0b60f9f53c9949687c6735647d9dc084dd7ff71))
* loans contracttype config ([cd76141](https://github.com/erxes/erxes/commit/cd76141499ad8282069bb11e513aefff92765a0a))
* loans contractype with some rules ([7b774f3](https://github.com/erxes/erxes/commit/7b774f353ca8357fbff8880b249f8843967b5393))
* Loans customer rightSidebar ([#5953](https://github.com/erxes/erxes/issues/5953)) ([a5e226d](https://github.com/erxes/erxes/commit/a5e226d7de02b31c912a9c7d1fdf2c1eaa9145d2))
* loans date is equal ([b080a35](https://github.com/erxes/erxes/commit/b080a358d8b06a313ea10cf70dc8cebfa945a16b))
* Loans improve ([#5959](https://github.com/erxes/erxes/issues/5959)) ([8f5ebea](https://github.com/erxes/erxes/commit/8f5ebea1e5143e0cd084cb2fd933ccdae9e824e3))
* loans overPayUtils ([136c615](https://github.com/erxes/erxes/commit/136c6155df4bd3233225a6adc78e6db37398ca21))
* loans repayment type checker ([ad17556](https://github.com/erxes/erxes/commit/ad175563a02bada2eeee2be66d9af37b0a74b3d0))
* loans some bug ([4b80251](https://github.com/erxes/erxes/commit/4b8025139abe558331f203566482647ee8496479))
* **loans:** contact detail view ([f334133](https://github.com/erxes/erxes/commit/f334133fe22b24c542138bf3be0fd1ed7aaaea80))
* Loansresearch improve ([#5891](https://github.com/erxes/erxes/issues/5891)) ([eaecc96](https://github.com/erxes/erxes/commit/eaecc96b5a823207a7b6c67cf3932374a854c5d7))
* Loansresearch improve ([#5895](https://github.com/erxes/erxes/issues/5895)) ([34abb10](https://github.com/erxes/erxes/commit/34abb1011d66bad67a83878b462eecb09c1ecc5b))
* Loansresearch improve ([#5970](https://github.com/erxes/erxes/issues/5970)) ([49e9900](https://github.com/erxes/erxes/commit/49e990088120249fc1babdb4471881b8aa67a302))
* Loansresearch improve, after sync xypdan data ([#5897](https://github.com/erxes/erxes/issues/5897)) ([d4412a8](https://github.com/erxes/erxes/commit/d4412a8bab85be379537f9b620080e14eb86cbfd))
* Loansresearch improve, from new contracts debt amount calc ([#5969](https://github.com/erxes/erxes/issues/5969)) ([8da2109](https://github.com/erxes/erxes/commit/8da21098160c4c8b4da433388c68e864663309af))
* Loansresearch recalc and loan contract improve ([#5975](https://github.com/erxes/erxes/issues/5975)) ([b7f36ff](https://github.com/erxes/erxes/commit/b7f36ff9e3904b4d391ba37935b1e82a2c54977d))
* part of give transaction logic and loans type refactor ([99fc85d](https://github.com/erxes/erxes/commit/99fc85d1167709dc6842bd14c1358b2f1147404f))
* posclient product sync allow null taxRule ([d2039d5](https://github.com/erxes/erxes/commit/d2039d509ad7e9c079c2999fb7df771d4aa0b1ef))
* **sales:** fix contract apply button ([820aaf7](https://github.com/erxes/erxes/commit/820aaf71723f59aada39a728a6388842a25161d7))
* **sales:** update deal edit form ([fa39af7](https://github.com/erxes/erxes/commit/fa39af7ac3a0bd2a12b5eec029c6535853db41ce))
* schedule utils repayment default is fixed ([6dfb5a0](https://github.com/erxes/erxes/commit/6dfb5a0f321915655b8971d4ef959a99edb24bac))
* syncpolaris and loans and savings improve ([#5990](https://github.com/erxes/erxes/issues/5990)) ([e8e113d](https://github.com/erxes/erxes/commit/e8e113dad5bf299117b0e54092afcc8113d34daf))
* unusedBalance has not schedules ([f52e223](https://github.com/erxes/erxes/commit/f52e223fa9c09f64f70f24a730d40c8b4c1dfcae))
* update cis ([8c34f38](https://github.com/erxes/erxes/commit/8c34f38741586798d70d5e6f1b3d3c70026763d4))
* update contractType ([00fac50](https://github.com/erxes/erxes/commit/00fac50ffcf7d5ac5bb60a2cd752a0a24992909b))
* update pluginsMap ([8f81a49](https://github.com/erxes/erxes/commit/8f81a49bfd478470a71ce79ca605eaeadbc8ffa5))
* update pluginsMap ([c8ea762](https://github.com/erxes/erxes/commit/c8ea76279e3e20347d4b211e56146c4597f6baba))
* update pluginsMap ([41d9b0a](https://github.com/erxes/erxes/commit/41d9b0a024e05d5ccddecfc57b80d48ab56123b1))
* update pluginsMap ([78c44eb](https://github.com/erxes/erxes/commit/78c44eb329c5d1b6b6be4200bae6b57d8e22a8c4))
* update pluginsMap ([381666d](https://github.com/erxes/erxes/commit/381666d475e84b4dbee6d86763454d46edaa1ea6))
* xyp deal sidebar ([43cb3b8](https://github.com/erxes/erxes/commit/43cb3b8e343ff100f2dd2a0e14f0d91bc99ad5b3))
* xyp image ([8fcf3fa](https://github.com/erxes/erxes/commit/8fcf3fab38ab2774851fe04f47073a6cb565f582))
* xypDataByObject grouped by serviceName ([dbf4e8b](https://github.com/erxes/erxes/commit/dbf4e8b8e4e6ce8bdcf02c9b3a7b0743c80795b0))

### Performance Improvements

* **sales:** Fix properties view in full edit sales form ([8dc2b79](https://github.com/erxes/erxes/commit/8dc2b79f7c081b367d136a37a3cdb6d5ac960097))
* **sales:** fix xyp data on sales detail ([4f116e7](https://github.com/erxes/erxes/commit/4f116e70055cfe66068522ffa82eeb077d68545f))
* **sales:** fix xyp data on small sales detail ([a1f0c17](https://github.com/erxes/erxes/commit/a1f0c172b290001568d0ad097a5bf949ea00136e))
* **sales:** Update salespipeline ui ([#5898](https://github.com/erxes/erxes/issues/5898)) ([b536b05](https://github.com/erxes/erxes/commit/b536b053d28443bd6e281e3d064bc5c4a7c35b9a))

## [2.13.0-rc.0](https://github.com/erxes/erxes/compare/2.12.0...2.13.0-rc.0) (2025-05-18)

### Bug Fixes

* accountings query with record ([ef9a54b](https://github.com/erxes/erxes/commit/ef9a54b3e5529980aecbf176870618ba7d1e4fdf))

## [2.12.0](https://github.com/erxes/erxes/compare/2.11.3...2.12.0) (2025-05-18)

### Features

* **clientportal:** implement client portal comment addition with notifications ([2825c22](https://github.com/erxes/erxes/commit/2825c22038ea198e8d2b13b492a7cbf7f1ba79a0))
* **clientportal:** Send email notifications to both assigned users and the ticket creator ([70aba57](https://github.com/erxes/erxes/commit/70aba57559349492f46bbe59cf3f021e0a8570dd))
* **facebook:** enhance performance of facebookGetPosts query ([dd2e245](https://github.com/erxes/erxes/commit/dd2e245d86b35c9ac92527491df2cf81459fb1b8))
* **notifications:** add userId variable to notifications query ([#6027](https://github.com/erxes/erxes/issues/6027)) ([c91369f](https://github.com/erxes/erxes/commit/c91369ff4899ee1a340d322ac1c5d6226903b65f))

### Bug Fixes

* clientportal ci ([88146f7](https://github.com/erxes/erxes/commit/88146f7e7178a4910b83e57e6ee469999cfbc582))
* clientportal ci ([9318936](https://github.com/erxes/erxes/commit/931893639ab02cb21a0f9fa99555ac592f1175ac))
* **cp:** add ability replace subdomain in getEnv ([10ec8c1](https://github.com/erxes/erxes/commit/10ec8c14401586acb43c0c431f1a5a9d211b1b86))
* **cp:** apollo client uri ([a86a7b4](https://github.com/erxes/erxes/commit/a86a7b474eedb1f70522059dc2922607844721b3))
* **cp:** can't generate uri apollo client propertly ([5517213](https://github.com/erxes/erxes/commit/55172130c5c1f92d1646b8d93f27a61d6c9b3c1e))
* Msdynamic double send ([#6028](https://github.com/erxes/erxes/issues/6028)) ([795c5ae](https://github.com/erxes/erxes/commit/795c5ae6e0a0a981278a76c9b820303f63a3a88f))
* **payment:** 9ix callback on manual checking invoice ([a78a205](https://github.com/erxes/erxes/commit/a78a20572068100615b293e087e8268db2c428a6))
* **sales:** refetch deal detail in Main Board ([36650a0](https://github.com/erxes/erxes/commit/36650a0e35399fffcf1c6e587bacea29248e4293))
* **tms:** tourgroup ([a0a616f](https://github.com/erxes/erxes/commit/a0a616f75012f8f5f06be82d90ee530489f7801e))
* **tms:** tourgroup ([39b06f4](https://github.com/erxes/erxes/commit/39b06f4aa19f6d9a8ebdde65ba3bffea906ba234))
## [2.12.0-rc.0](https://github.com/erxes/erxes/compare/2.11.3...2.12.0) (2025-05-04)

### Bug Fixes

* accountings correction inventories costs ([489a727](https://github.com/erxes/erxes/commit/489a727fa81ed02bdbbacdb943db7f68bf8d5c3e))
* **loans:** fix detail bug and dropdown ([44de37b](https://github.com/erxes/erxes/commit/44de37bf6b0b40ded4ffd97315f4dc593dbc9abf))
* **sales:** fix some ui ([d66973a](https://github.com/erxes/erxes/commit/d66973aa1c9b419970d4b16f3317a71da53623bd))

### Performance Improvements

* **messenger:** update ticket and call ([#6014](https://github.com/erxes/erxes/issues/6014)) ([a799820](https://github.com/erxes/erxes/commit/a799820fa403dd6e736b61192c762c5ceeaf5848))

## [2.12.0-rc.0](https://github.com/erxes/erxes/compare/2.11.0...2.12.0-rc.0) (2025-05-04)

### Bug Fixes

* accountings correction inventories costs ([489a727](https://github.com/erxes/erxes/commit/489a727fa81ed02bdbbacdb943db7f68bf8d5c3e))
* **loans:** fix detail bug and dropdown ([44de37b](https://github.com/erxes/erxes/commit/44de37bf6b0b40ded4ffd97315f4dc593dbc9abf))
* **sales:** fix some ui ([d66973a](https://github.com/erxes/erxes/commit/d66973aa1c9b419970d4b16f3317a71da53623bd))

### Performance Improvements

* **messenger:** update ticket and call ([#6014](https://github.com/erxes/erxes/issues/6014)) ([a799820](https://github.com/erxes/erxes/commit/a799820fa403dd6e736b61192c762c5ceeaf5848))

## [2.11.0](https://github.com/erxes/erxes/compare/2.11.0-rc.0...2.11.0) (2025-05-04)

### Bug Fixes

* loans and savings improve ([#6015](https://github.com/erxes/erxes/issues/6015)) ([596f8a6](https://github.com/erxes/erxes/commit/596f8a6cc7c584ce9ae7592e66ad77b7f171a277))
* **payment:** fix golomt e-commerce api authorization error handling ([c4b486d](https://github.com/erxes/erxes/commit/c4b486de2fd10fcdb1a8797e19cacfa4732834a2))
* **tms:** visible name ([644d1ce](https://github.com/erxes/erxes/commit/644d1cea4fa58238e7ecb39a9ae19883bc70d3e1))
* **workers:** can't run when array field value are empty ([4983f19](https://github.com/erxes/erxes/commit/4983f19243df700a927ecf0f5e69cfd905d49bd0))
## [2.11.0-rc.0](https://github.com/erxes/erxes/compare/2.11.0-rc.0...2.11.0) (2025-04-17)

### Features

* **clientportal:** add card type UI for SMS ([d403e70](https://github.com/erxes/erxes/commit/d403e707ab6816530c96e5b5865fd511f50d20d6))

### Bug Fixes

* **automations:** handle if string has null undefined in generateEmails ([3d0b402](https://github.com/erxes/erxes/commit/3d0b402a34fc60e04e31b9d8113cc7dc3e7ca3ca))
* scorelogs with index ([cb5919f](https://github.com/erxes/erxes/commit/cb5919fd1275a223714ed05981ed7c2e85131eec))
* tr fullDate ([6d751f3](https://github.com/erxes/erxes/commit/6d751f3da4e5e166546a6684dcc99ac3a98702b5))
## [2.10.2](https://github.com/erxes/erxes/compare/2.11.0-rc.0...2.11.0) (2025-04-25)

### Features

* put another logs on msdynamic ([4fda221](https://github.com/erxes/erxes/commit/4fda221d18d096c11f04c98f7b17ef7293018f0e))
* put some log on msdynamic ([bce9c69](https://github.com/erxes/erxes/commit/bce9c696750e67000db549536cbb1469f74fe893))

### Bug Fixes

* pricing ui readOnly objects ([9d36b6e](https://github.com/erxes/erxes/commit/9d36b6e02178131692e5f13465e0a3d42c3428ef))
* **sales:** update deal edit form ([743faa6](https://github.com/erxes/erxes/commit/743faa6f72da548208c7fe34cccbfd9f3ee425d2))
## [2.10.1](https://github.com/erxes/erxes/compare/2.11.0-rc.0...2.11.0) (2025-04-22)

### Features

* deal to msdynamic sync added ([#6000](https://github.com/erxes/erxes/issues/6000)) ([263a3c2](https://github.com/erxes/erxes/commit/263a3c2bc4610c8dcc3ab5e5044ae3a5d868b350))

### Bug Fixes

* **facebook:** can't send fb message when on error typing_on ([5459233](https://github.com/erxes/erxes/commit/545923367a2c9c0758cd9a783d25e09306c2be88))
* **helper:** correct request handling for Instagram, Facebook, and WhatsApp integrations ([#5999](https://github.com/erxes/erxes/issues/5999)) ([fe90dc0](https://github.com/erxes/erxes/commit/fe90dc0671486958cf24cd841479ffcf956c2799))
* **tms:** icon search ([16ac8ad](https://github.com/erxes/erxes/commit/16ac8ad1d237eca58ba56d62a757906d8d61a07f))
* **tms:** visibible name ([88eddd8](https://github.com/erxes/erxes/commit/88eddd81b4bea02a760ad7ad49cd65567e464292))

## [2.11.0-rc.0](https://github.com/erxes/erxes/compare/2.10.0...2.11.0-rc.0) (2025-04-17)

### Features

* **clientportal:** add card type UI for SMS ([d403e70](https://github.com/erxes/erxes/commit/d403e707ab6816530c96e5b5865fd511f50d20d6))

### Bug Fixes

* **automations:** handle if string has null undefined in generateEmails ([3d0b402](https://github.com/erxes/erxes/commit/3d0b402a34fc60e04e31b9d8113cc7dc3e7ca3ca))
* scorelogs with index ([cb5919f](https://github.com/erxes/erxes/commit/cb5919fd1275a223714ed05981ed7c2e85131eec))
* tr fullDate ([6d751f3](https://github.com/erxes/erxes/commit/6d751f3da4e5e166546a6684dcc99ac3a98702b5))

## [2.10.0](https://github.com/erxes/erxes/compare/2.9.5...2.10.0) (2025-04-17)

### Bug Fixes

* **assets:** query syntax error ([a0e841a](https://github.com/erxes/erxes/commit/a0e841af9167c20e5f8f6e203ed7ffc72d24b5e2))
* **cards:** vendor users filter ([5327197](https://github.com/erxes/erxes/commit/53271975def93841c3abe6877f509bc8cd754ccf))
* **facebook:** little bot ui fixes ([62eb0f5](https://github.com/erxes/erxes/commit/62eb0f5d4e26ef00f1db48de69ea8bccc98f4efd))
* **gateway:** ci runs-on to ubuntu-22.04 from ubuntu-20.04 ([5fe8b3a](https://github.com/erxes/erxes/commit/5fe8b3a0551804564959761e417831883fe31c8e))
* **loyalties:** add target extender & fix can't generate excludeAmount on target ([8e77836](https://github.com/erxes/erxes/commit/8e778361d2d112a6c0dbd4e66dff81902c7601df))
* **tms:** branch on element ([115ccfe](https://github.com/erxes/erxes/commit/115ccfee48e41897901e033d25b3165f30b7e964))
* **tms:** filter branch ([e037e87](https://github.com/erxes/erxes/commit/e037e87b49b73935317120a424e3a8b69b7c9dba))
## [2.10.0-rc.1](https://github.com/erxes/erxes/compare/2.9.5...2.10.0) (2025-04-04)
## [2.10.0-rc.0](https://github.com/erxes/erxes/compare/2.9.5...2.10.0) (2025-04-02)

### Bug Fixes

* accountings invIncome save and t balance improve ([3ee3131](https://github.com/erxes/erxes/commit/3ee3131708798147cba9319a8b7cf8469c99a05a))
* deal products form filter by barcode ([2331133](https://github.com/erxes/erxes/commit/23311334115c73127db4e7510d9b583cd62f9527))

## [2.10.0-rc.1](https://github.com/erxes/erxes/compare/2.10.0-rc.0...2.10.0-rc.1) (2025-04-04)
## [2.10.0-rc.0](https://github.com/erxes/erxes/compare/2.10.0-rc.0...2.10.0-rc.1) (2025-04-02)
## [2.9.5](https://github.com/erxes/erxes/compare/2.9.4...2.9.5) (2025-04-16)

### Bug Fixes

* **facebook:** safe content ([989dbc7](https://github.com/erxes/erxes/commit/989dbc7a41121781323aabd9b8a197a31b74d8ba))
* product chooser search by text ([3dd135b](https://github.com/erxes/erxes/commit/3dd135b8ad2e3044c9b1239d47d51bfb582589b7))
* products query doubled ([52e0b6d](https://github.com/erxes/erxes/commit/52e0b6dbef2955cf1af327da2053c0018518fc11))

## [2.9.4](https://github.com/erxes/erxes/compare/2.9.3...2.9.4) (2025-04-15)

### Bug Fixes

* **facebook:** display permalink even when content is empty ([6937ee0](https://github.com/erxes/erxes/commit/6937ee076b85f34ee364ac30a01fcf40ffbc58e6))
* **inbox:** send a trigger to automations when a company is updated ([31974a7](https://github.com/erxes/erxes/commit/31974a730906e28627f78a32e28eaedfae919501))
* **inbox:** send a trigger to automations when a company is updated. ([f8f8a30](https://github.com/erxes/erxes/commit/f8f8a306aaf83d4d71035e5bf137a56acf411bab))
* products data save per row on sales ([#6001](https://github.com/erxes/erxes/issues/6001)) ([953fc3c](https://github.com/erxes/erxes/commit/953fc3c359af60397096824642dbac26a284f6c3))

## [2.9.3](https://github.com/erxes/erxes/compare/2.9.2...2.9.3) (2025-04-10)

### Features

* number to mn word utils and mnt rates download cron ([#5996](https://github.com/erxes/erxes/issues/5996)) ([7662543](https://github.com/erxes/erxes/commit/766254317848d8fbdcc8dc842a01dd90ed4bec6c))

### Bug Fixes

* accountings invIncome save and t balance improve ([3ee3131](https://github.com/erxes/erxes/commit/3ee3131708798147cba9319a8b7cf8469c99a05a))
* deal products form filter by barcode ([2331133](https://github.com/erxes/erxes/commit/23311334115c73127db4e7510d9b583cd62f9527))
## [2.9.1](https://github.com/erxes/erxes/compare/2.10.0-rc.0...2.10.0-rc.1) (2025-04-04)

### Bug Fixes

* add permission dealsRemoveProductsData and productsData filter by barcode ([e7d859a](https://github.com/erxes/erxes/commit/e7d859aa7c2f96b4dcb2298b8105b03a6097ab3c))
* syncerkhet return with records ([caa532f](https://github.com/erxes/erxes/commit/caa532f37119cbbad1a86820fff621067f9dc56a))
* update pluginsMap ([24f7a54](https://github.com/erxes/erxes/commit/24f7a54408a64995f74c0a0be557f15ed3e7de77))

## [2.10.0-rc.0](https://github.com/erxes/erxes/compare/2.9.0...2.10.0-rc.0) (2025-04-02)

### Bug Fixes

* accountings invIncome save and t balance improve ([3ee3131](https://github.com/erxes/erxes/commit/3ee3131708798147cba9319a8b7cf8469c99a05a))
* deal products form filter by barcode ([2331133](https://github.com/erxes/erxes/commit/23311334115c73127db4e7510d9b583cd62f9527))
## [2.9.1](https://github.com/erxes/erxes/compare/2.9.0...2.9.1) (2025-04-04)

### Bug Fixes

* add permission dealsRemoveProductsData and productsData filter by barcode ([e7d859a](https://github.com/erxes/erxes/commit/e7d859aa7c2f96b4dcb2298b8105b03a6097ab3c))
* syncerkhet return with records ([caa532f](https://github.com/erxes/erxes/commit/caa532f37119cbbad1a86820fff621067f9dc56a))
* update pluginsMap ([24f7a54](https://github.com/erxes/erxes/commit/24f7a54408a64995f74c0a0be557f15ed3e7de77))

## [2.9.0](https://github.com/erxes/erxes/compare/2.8.3...2.9.0) (2025-04-02)

### Features

* add phone number and email validation in Call component ([b16e93a](https://github.com/erxes/erxes/commit/b16e93a3d2d09074dc3407cc85e65acb3481649d))
* **cms:** Implement custom fields group functionality for CMS categories and pages, extending the existing custom fields ([#5987](https://github.com/erxes/erxes/issues/5987)) ([f82d136](https://github.com/erxes/erxes/commit/f82d136a73e67ca610d61f6863531b5142df7627))
* **pms:** check-in & check-out ([9d89279](https://github.com/erxes/erxes/commit/9d8927908175e931a63a07bf6b4433764034909f))

### Bug Fixes

* **bm:** sort on tour,itinerary, tour group ([d0ae651](https://github.com/erxes/erxes/commit/d0ae6512095dafea81f676ac23971cc903bd2987))
* **cards:** null pointer on chart view ([bfb1a8c](https://github.com/erxes/erxes/commit/bfb1a8c1512315b7d787a75b271b56b57866d83a))
* **core:** can't import unitPrice is string on products ([4cbeb4b](https://github.com/erxes/erxes/commit/4cbeb4b2d31f4f0026d58f7321bbeb387be732f7))
* improve 2-way audio for multiple operators ([97940c1](https://github.com/erxes/erxes/commit/97940c170564ac3087430906a771644014e68695))
* **pms:** pms rooms pagination ([6cef89b](https://github.com/erxes/erxes/commit/6cef89bd40471c78bc506d0801b62f3cf8b612b8))
* **tms:** tour images and order fields ([234adb1](https://github.com/erxes/erxes/commit/234adb1403c13e85fa27cc3d4822a253868c7948))
* yaml files ([858aaf5](https://github.com/erxes/erxes/commit/858aaf54707aff14f40981dc45092e4b29809656))
## [2.9.0-rc.0](https://github.com/erxes/erxes/compare/2.8.3...2.9.0) (2025-03-16)

### Features

* Accountings improve ([#5966](https://github.com/erxes/erxes/issues/5966)) ([f7ef547](https://github.com/erxes/erxes/commit/f7ef5470f4afbcb5aed5f2044456f8642825b9a9))
* improve sales-ui, improve loans, add plugin loansresearch ([#5968](https://github.com/erxes/erxes/issues/5968)) ([19e5397](https://github.com/erxes/erxes/commit/19e539708a082b40d7a6fb8ce52ae982fd0c7a93)), closes [#5895](https://github.com/erxes/erxes/issues/5895) [#5898](https://github.com/erxes/erxes/issues/5898)

### Bug Fixes

* **pms:** room change permission ([442c512](https://github.com/erxes/erxes/commit/442c51245ead4c39851ebdbbe5e7154be9392203))
* **pms:** room change permission ([20079a9](https://github.com/erxes/erxes/commit/20079a911276ea10a1ea0bdd5196c27a93eb4739))
* **tms:** extra ([77cc177](https://github.com/erxes/erxes/commit/77cc177515d513823aa33f1e42ff819fde2cf27d))
* **tms:** extrafields ([8e4ecfb](https://github.com/erxes/erxes/commit/8e4ecfb0958a5ec06aff2db7e68301e401dcccc1))

## [2.9.0-rc.0](https://github.com/erxes/erxes/compare/2.8.0...2.9.0-rc.0) (2025-03-16)
## [2.8.3](https://github.com/erxes/erxes/compare/2.8.2...2.8.3) (2025-03-26)

### Bug Fixes

* temp sales to erkhet without debit ([bb4ab11](https://github.com/erxes/erxes/commit/bb4ab117054965bed07694c29a30809444b56b07))

## [2.8.2](https://github.com/erxes/erxes/compare/2.8.1...2.8.2) (2025-03-24)

### Features

* **cms:** Introduce custom post types and field groups ([#5982](https://github.com/erxes/erxes/issues/5982)) ([adfd12d](https://github.com/erxes/erxes/commit/adfd12dbbf1b36193ba000f59f208e8f21da5045))

### Bug Fixes

* **calls:** check timezone ([0ab4c38](https://github.com/erxes/erxes/commit/0ab4c3870fc4c2e8abdafcaa0d2150f6b8d4266b))
* **payment:** trigger payment success callback on manual status check ([#5983](https://github.com/erxes/erxes/issues/5983)) ([277d493](https://github.com/erxes/erxes/commit/277d4939f8cfa5571ce3ded0cedff6584084881b))
* posclient from payment settlement, when hasnt ebarimt ([16e840a](https://github.com/erxes/erxes/commit/16e840a1abec32f7e3b9c76a078d4e1308c95127))
* posclient types ([04b9589](https://github.com/erxes/erxes/commit/04b9589b7d0f7a404ffa94835745dee324cf1ef4))
* **tms:** tour images and order fields ([00013c6](https://github.com/erxes/erxes/commit/00013c69e44fc97b080c39e9bc53616aca07e342))

## [2.8.1](https://github.com/erxes/erxes/compare/2.8.0...2.8.1) (2025-03-16)

### Reverts

* release.yaml ([276288e](https://github.com/erxes/erxes/commit/276288e94d5c7d7f156b329ef59da96f5ae4247d))

## [2.8.0](https://github.com/erxes/erxes/compare/2.8.0-rc.0...2.8.0) (2025-03-16)

### Features

* **cloudflare call:** Add cloudflare call in widget and web call ([b052383](https://github.com/erxes/erxes/commit/b0523830458e593c229c9f0f5098626932a1dc0b))
* Unit_Price remove from sendSalesLine on msm ([8105816](https://github.com/erxes/erxes/commit/81058160f7b4e11e0888b5a6155d8a42b4a72505))

### Bug Fixes

* can't filter by segment customers & can't display custom property group name in segment property list ([f597c94](https://github.com/erxes/erxes/commit/f597c9449f28eda58cfc7c68410933331fdaab40))
* core utils add getFullDate and return getPureDate is clean timeZone ([bac9df3](https://github.com/erxes/erxes/commit/bac9df3a80206b745dd2a5d8754317c849f4aca1))
* pos cover end date ([5edd6ce](https://github.com/erxes/erxes/commit/5edd6cebaa4f1c3dae4898efecfa5f2c18ca292a))

### Reverts

* lost code from commit id: b052383 ([9e9170b](https://github.com/erxes/erxes/commit/9e9170b4fbbc20010f66026c78dfedf954ef178c))
## [2.8.0-rc.0](https://github.com/erxes/erxes/compare/2.8.0-rc.0...2.8.0) (2025-03-05)

### Features

* **cloudflare call:** Add cloudflare call in widget and web call ([#5960](https://github.com/erxes/erxes/issues/5960)) ([19cbfbf](https://github.com/erxes/erxes/commit/19cbfbf7967527f7997a0dff04c9aa7a527a7f10))

### Bug Fixes

* **inbox:** minor query adjustment for getStarted condition ([#5938](https://github.com/erxes/erxes/issues/5938)) ([3a2cd16](https://github.com/erxes/erxes/commit/3a2cd161579e738ec4f798bbbf5cca281d7a7237))

### Reverts

* release.yaml to rc ([d7e04db](https://github.com/erxes/erxes/commit/d7e04db7f495c5e085a5fcb956b60b2da6832236))
## [2.7.1](https://github.com/erxes/erxes/compare/2.8.0-rc.0...2.8.0) (2025-03-10)

### Features

* core login mutation improve for activedirector ([171ba02](https://github.com/erxes/erxes/commit/171ba026d0b525f252aec8133509569f47564a42))
* **khanbank:** implement IBAN ([#5963](https://github.com/erxes/erxes/issues/5963)) ([afa5cc7](https://github.com/erxes/erxes/commit/afa5cc73ccf572805bc78e9c28119062796339a6))

### Bug Fixes

* **calls:** date format ([82c5c8a](https://github.com/erxes/erxes/commit/82c5c8a6043acf35c695fc18e50f4d8efe9a7838))
* msdynamic with discount soap ([6cfb71c](https://github.com/erxes/erxes/commit/6cfb71c20dacd5eb0a7b283387e068bc2aca9512))

## [2.8.0-rc.0](https://github.com/erxes/erxes/compare/2.7.0...2.8.0-rc.0) (2025-03-05)

### Features

* **cloudflare call:** Add cloudflare call in widget and web call ([#5960](https://github.com/erxes/erxes/issues/5960)) ([19cbfbf](https://github.com/erxes/erxes/commit/19cbfbf7967527f7997a0dff04c9aa7a527a7f10))

### Bug Fixes

* **inbox:** minor query adjustment for getStarted condition ([#5938](https://github.com/erxes/erxes/issues/5938)) ([3a2cd16](https://github.com/erxes/erxes/commit/3a2cd161579e738ec4f798bbbf5cca281d7a7237))

### Reverts

* release.yaml to rc ([d7e04db](https://github.com/erxes/erxes/commit/d7e04db7f495c5e085a5fcb956b60b2da6832236))

## [2.7.0](https://github.com/erxes/erxes/compare/2.7.0-rc.0...2.7.0) (2025-03-05)

### Features

* add cms _id in plugin pages items field ([7c693f1](https://github.com/erxes/erxes/commit/7c693f193100d3936505560913d58210c0201d8e))
* **core:** introduce OAuth 2.0 client management ([#5949](https://github.com/erxes/erxes/issues/5949)) ([18328f0](https://github.com/erxes/erxes/commit/18328f002fce6918887d836d6c710d290f38bc32))
* **payment:** add wechat and add authorization in payments ([#5958](https://github.com/erxes/erxes/issues/5958)) ([72ddff6](https://github.com/erxes/erxes/commit/72ddff6db8d17ae49ec64f1133b531ff2cca8b37))
* **payment:** create payment transaction if paymentId is present in invoice ([6f2c238](https://github.com/erxes/erxes/commit/6f2c238ee3ff38b9405337c46fdee694e7364fa3))

### Bug Fixes

* **bm:** add ability set image tag on commit id ([aab150e](https://github.com/erxes/erxes/commit/aab150e6345f8470ac0da24282e5d689b12f81a8))
* **cards:** checklists subscriptions ([e5f9ef9](https://github.com/erxes/erxes/commit/e5f9ef92d7e12ef76af2606a77f45e3aca46e706))
* **cards:** department supervisor permission on cards ([9e4eaa6](https://github.com/erxes/erxes/commit/9e4eaa63d2942ab77fc73f5babbf83165bc9abd0))
* **pms:** room change permission ([09288a8](https://github.com/erxes/erxes/commit/09288a80e2d8a830393a78d1be55fafad3d5853c))
* **pms:** room change permission ([c21d3a0](https://github.com/erxes/erxes/commit/c21d3a0808ca3db79b0d8f32e6f4f6c7c2b6f7f2))
* **pms:** ui numbers ([e9bcd69](https://github.com/erxes/erxes/commit/e9bcd69f3bf2dfec6b9f874ce1b5c3eff62bf62a))
* pos order history on detail payments ([5866405](https://github.com/erxes/erxes/commit/586640523a64e44867d49df8159c6459161a7445))
* posclient product sync allow null taxRule ([f510674](https://github.com/erxes/erxes/commit/f510674084e0c9ca1a40f4c5633e4a6fc5433a74))
* poscProducts totalCount query ([946830c](https://github.com/erxes/erxes/commit/946830cf4a952d3a3ec903150407d89ecc5f8d2b))
* similiraties products sort ([fd3e80a](https://github.com/erxes/erxes/commit/fd3e80ae534a67d4406c94afec601043c3571cbe))
* **tms,pms:** saas configs ([c732eac](https://github.com/erxes/erxes/commit/c732eac67fcb5257e66180a34cbff1936a3e7166))
* **tms:** config & fields channged ([d4a8367](https://github.com/erxes/erxes/commit/d4a8367b9333bf6e0d8eb03ed468d31caa699ec1))
* **tms:** fields ([1d1358a](https://github.com/erxes/erxes/commit/1d1358ad30100cee58bc9a5bebd2e1e2f1be71c2))

## [2.7.0-rc.0](https://github.com/erxes/erxes/compare/2.6.0...2.7.0-rc.0) (2025-02-16)

### Features

* add TimePicker component and combineDateTime utility for improved time handling ([#5903](https://github.com/erxes/erxes/issues/5903)) ([f2b1449](https://github.com/erxes/erxes/commit/f2b1449546ce48fb95a6197030666a45ee450f58))
* added orderNotf on pos ([#5919](https://github.com/erxes/erxes/issues/5919)) ([807781f](https://github.com/erxes/erxes/commit/807781ffc0efbd9aa994d61b5de672a72e35083b))
* Exchange rates ([#5932](https://github.com/erxes/erxes/issues/5932)) ([c6ffbb9](https://github.com/erxes/erxes/commit/c6ffbb9b1a91e50f499309350c5e611811ed7c30))

### Bug Fixes

* improvement for pos ([#5909](https://github.com/erxes/erxes/issues/5909)) ([d5d082f](https://github.com/erxes/erxes/commit/d5d082ff279592a2507d72641f49fdec1d511575))
* **messenger:** add get-started ([8bdeb07](https://github.com/erxes/erxes/commit/8bdeb077df264dc8a561b04b97027de1d6cbb8dd))
* **messenger:** add persistent menu in bot ([b5e7c5e](https://github.com/erxes/erxes/commit/b5e7c5e3d6ea037874c0fc84dd92e4c5b4495a10))

### Performance Improvements

* **messenger:** hide menu when clicked on persistent ([9a66ca3](https://github.com/erxes/erxes/commit/9a66ca3daca65ea41d1fedb11ab2c4c325b6fb32))
* **messenger:** move getStarted and persistent menu in message sender ([3ca0ae6](https://github.com/erxes/erxes/commit/3ca0ae6ecd06d5cd005ba116500e66dd0368090f))
* **messenger:** update messenger bot ([d80cbd7](https://github.com/erxes/erxes/commit/d80cbd7140a2cd39413849956d00b98ad40e3f1d))

## [2.6.0](https://github.com/erxes/erxes/compare/2.5.1...2.6.0) (2025-02-16)

### Features

* add customers & labels to cards import ([d5cc4f7](https://github.com/erxes/erxes/commit/d5cc4f74e2d7a8b07ca86103d876b2dcd748d2a7))
* msdynamic ([eb8ee2f](https://github.com/erxes/erxes/commit/eb8ee2f782de5bfcb861515181648530660d1940))
* **pms:** insight ([116d5f0](https://github.com/erxes/erxes/commit/116d5f075a911d221f7a818238c4d6dbf8c1c2b0))

### Bug Fixes

* **cards:** activityLog refetch in stages moving ([0037bc3](https://github.com/erxes/erxes/commit/0037bc3b2c78bb91d2286675e57d63e985453868))
* **cards:** deal loading cause of null tag ([c246b02](https://github.com/erxes/erxes/commit/c246b026950af4e216f76f74812f5ff4600dd604))
* **cards:** the same data between list and detail views ([9f94c0f](https://github.com/erxes/erxes/commit/9f94c0f1b3ce5a71d8959c37f51429091c2b5dc7))
* **logs:** can't display changes in ui ([1d95866](https://github.com/erxes/erxes/commit/1d958668fe35707b7bd3bd768b1ed128dd60a351))
* **pms:** clear codes ([c537d0a](https://github.com/erxes/erxes/commit/c537d0a08cf391000ebdfa879eb087605f5acf50))
* **pms:** logo in admin ([fa5140a](https://github.com/erxes/erxes/commit/fa5140a68a7d292f4bb635ade5e476f2e010123c))
* **pms:** names ([333a882](https://github.com/erxes/erxes/commit/333a882060b73799ea55308cd30bd4a1cd20d7ab))
* **pms:** names ([88b265e](https://github.com/erxes/erxes/commit/88b265ea642650002a7847f65d45f82f223a51e8))
* **pms:** room category ([dfc5303](https://github.com/erxes/erxes/commit/dfc5303ab56ea9bfa7be1791d54a89d708c7da0d))
* **tms,pms:** discount & some fields ([b9d3437](https://github.com/erxes/erxes/commit/b9d34374908b99987fb7db37d394fb241f90b943))
* **tms,pms:** report & config ([bb475c4](https://github.com/erxes/erxes/commit/bb475c40f904662a49a0c97407a65066e23825d5))
* **tms:** code quality ([21693b6](https://github.com/erxes/erxes/commit/21693b6077567370ef6069c9d723675db5a21a2a))
* **tms:** filter ([9b990b9](https://github.com/erxes/erxes/commit/9b990b92dcc9d3871d086cf4d4550fe5583a58f9))
* **tms:** logo in admin ([a43c378](https://github.com/erxes/erxes/commit/a43c378052397c4ad153867165d72a0fad176a9d))
## [2.6.0-rc.0](https://github.com/erxes/erxes/compare/2.5.1...2.6.0) (2025-02-04)

### Features

* **messenger:** add bot functionality to Erxes Messenger widget ([71b9b92](https://github.com/erxes/erxes/commit/71b9b92abaee4cd23456eb93c5b25137d6409776))

### Bug Fixes

* **cards:** make customerName visible in documents ([d0e5b9e](https://github.com/erxes/erxes/commit/d0e5b9ebc0af24a9a70399b660356e9b49c03508))
* **pms:** cleaning default ([076d1bb](https://github.com/erxes/erxes/commit/076d1bb65ddcd82c7237718028674d9815a7947c))
* **pms:** product category settings ([9b9c343](https://github.com/erxes/erxes/commit/9b9c3432abf0fb38ffb4d55f3ea81120784e9f6a))

## [2.6.0-rc.0](https://github.com/erxes/erxes/compare/2.5.0...2.6.0-rc.0) (2025-02-04)

### Features

- **messenger:** add bot functionality to Erxes Messenger widget ([71b9b92](https://github.com/erxes/erxes/commit/71b9b92abaee4cd23456eb93c5b25137d6409776))

## [2.5.1](https://github.com/erxes/erxes/compare/2.5.0...2.5.1) (2025-02-10)

### Bug Fixes

- **cards:** cards loading cause of null tag ([b4764ae](https://github.com/erxes/erxes/commit/b4764ae775bd894cad3e8546765249d6e6e6936a))
- company code check tax payer ([3ca34f8](https://github.com/erxes/erxes/commit/3ca34f89ddd49dfa8831c37fa647fe494fd3ebcb))
- create deal then to syncerkhet ([85462ab](https://github.com/erxes/erxes/commit/85462ab6a549b1fc25fe374f52259c5248d344a8))
- MSDynamic plugin improve with exchangeRate ([#5904](https://github.com/erxes/erxes/issues/5904)) ([dc4b4cf](https://github.com/erxes/erxes/commit/dc4b4cf14f58603bf569ada184e172af69b1b278))
- **payment:** fix khanbank payment form ([4a28abc](https://github.com/erxes/erxes/commit/4a28abcd27b7fc3eff5ddb3b97a3ad15aaf32d1f))
- syncerkhet config remove ([ecda3a5](https://github.com/erxes/erxes/commit/ecda3a56e97248b7c20fa752f7e02de90ad85bc1))

## [2.5.0](https://github.com/erxes/erxes/compare/2.5.0-rc.1...2.5.0) (2025-02-04)

### Features

- add essyncer saas ([d8f3f4c](https://github.com/erxes/erxes/commit/d8f3f4cb3743e509dc069f0b15f32d46917e234e))
- customer, company and products filter by tags and excludeTags ([2a7c32c](https://github.com/erxes/erxes/commit/2a7c32cd6d21758628fa122b417cd1ff923152b9))
- **forms:** implement clear cache toggle to lead forms ([9031b94](https://github.com/erxes/erxes/commit/9031b9418341de122803cb8938522736941cd796))
- get plugins json from url essyncer-saas ([4d9d566](https://github.com/erxes/erxes/commit/4d9d5664a205ccf662a15ccf75d17755160af76f))
- **payment:** mask sensitive payment credentials at the resolver level ([76540d3](https://github.com/erxes/erxes/commit/76540d385ee5ee8ac23f137f2d1f1c0228be721f))
- update dockerfile for essyncer-saas ([2828e7b](https://github.com/erxes/erxes/commit/2828e7bd502c5eed9e61b2abf10c445759983d76))

### Bug Fixes

- calc Pre tax ebarimt ([#5902](https://github.com/erxes/erxes/issues/5902)) ([a8c62be](https://github.com/erxes/erxes/commit/a8c62be9898616dfbd3437737641cb07c5054d02))
- essyncer-saas yaml ([616b042](https://github.com/erxes/erxes/commit/616b042b4faedef1c217e655bfe16bc1ed4c0c29))
- **forms:** prevent contactsGathered & viewCount from being overwritten on edit ([4bf04fb](https://github.com/erxes/erxes/commit/4bf04fb5bada5b3041045d6aeeac7601a3adde64))
- **loyalties:** can't get owner in automation ([90b450e](https://github.com/erxes/erxes/commit/90b450edae6830bdf16d26eea38b3c35e029cadf))
- posclient products filter by hasImage ([63800fe](https://github.com/erxes/erxes/commit/63800fe6e0a7f5a3f4e643bfd76fe265fcc443d0))
- posclient some filter ([f74c1f5](https://github.com/erxes/erxes/commit/f74c1f59604a08586c687136c2ab22fc84193574))
- products form with vendor ([93553c6](https://github.com/erxes/erxes/commit/93553c68928cf4615347b4b5189164774266bf7d))
- sales deal archive with permission ([be77f21](https://github.com/erxes/erxes/commit/be77f2177770d8f5fe5bdef451787ada67a52672))

## [2.5.0-rc.1](https://github.com/erxes/erxes/compare/2.4.1...2.5.0-rc.1) (2025-01-29)

### Features

- **bms:** url and ui options ([8a1155e](https://github.com/erxes/erxes/commit/8a1155ec32247154fa4e5aff4b9282677d060eaa))
- **clientportal,cms:** add vercel integration ([20073eb](https://github.com/erxes/erxes/commit/20073eba8982127862575caf9e7a87af65123e4f))
- **payment:** introduce khanbank as a payment ([#5892](https://github.com/erxes/erxes/issues/5892)) ([a795837](https://github.com/erxes/erxes/commit/a79583701cb3c9c68408ccebdb0d67d8adcb3915))

### Bug Fixes

- **cards:** department select bug and ui ([a44bf44](https://github.com/erxes/erxes/commit/a44bf444d8cdbfa70c6011d290a09508919a351c))
- **cards:** show relations fields on deal-creation ([60581b8](https://github.com/erxes/erxes/commit/60581b8fc7688a5df14ada283fa60b3e92884b2d))
- **cards:** subscriptions name change ([0f48639](https://github.com/erxes/erxes/commit/0f486395af487f25325428eb03a76970de4fc18f))
- **clientportal:** type definition on cms plugin ([008859b](https://github.com/erxes/erxes/commit/008859b266058bbf0c454e029f1f8a02068c9369))
- core products with has similarities rule refactor ([395224d](https://github.com/erxes/erxes/commit/395224d4dbeda24cf0ff2bdc40297a5805b446c3))
- **export:** fix export cards & contacts ([278270a](https://github.com/erxes/erxes/commit/278270abc4b80a5c42aaff7de113476905e26474))
- **pms:** settings ([721bf57](https://github.com/erxes/erxes/commit/721bf572496e2008caef5708d2d353787bb2f22f))
- **tms:** filter on tours ([012f019](https://github.com/erxes/erxes/commit/012f019d22623fc5800b2da6dfebe649975faa6c))

## [2.5.0-rc.0](https://github.com/erxes/erxes/compare/2.4.1...2.5.0-rc.1) (2025-01-19)

### Features

- **clientportal:** MessagePro sends an SMS to the customer's phone number. ([94c4a8b](https://github.com/erxes/erxes/commit/94c4a8b9faa47777e1fc7fb9ca5cdbe282676fd1))

## [2.5.0-rc.0](https://github.com/erxes/erxes/compare/2.4.0...2.5.0-rc.0) (2025-01-19)

## [2.4.1](https://github.com/erxes/erxes/compare/2.4.0...2.4.1) (2025-01-22)

### Features

- **clientportal:** MessagePro sends an SMS to the customer's phone number. ([94c4a8b](https://github.com/erxes/erxes/commit/94c4a8b9faa47777e1fc7fb9ca5cdbe282676fd1))
- add loans research plugin ([#5862](https://github.com/erxes/erxes/issues/5862)) ([6fc7e5a](https://github.com/erxes/erxes/commit/6fc7e5a3da70c323d73e61ab5cf26637ec0ef363))

### Bug Fixes

- **clientportal:** check cms plugin is aviable in Post type and ClientportalUserPostList type ([c4e6f02](https://github.com/erxes/erxes/commit/c4e6f021fa5960fae315e6eeef9dc6e2b0d36860))
- **core:** get GOOGLE_APPLICATION_CREDENTIALS_JSON from env in firebase ([c361698](https://github.com/erxes/erxes/commit/c361698b97b9b54587fbc7f0a4f3563feff94e64))
- fix visibility ([fc84e8d](https://github.com/erxes/erxes/commit/fc84e8df559ecf3ea56e324f3c627146b4bbe4db))
- **sales:** can't get stage probability in custom trigger & only wait if checked some items of checklist in create checklist action ([4918e3e](https://github.com/erxes/erxes/commit/4918e3ecb29006abd08bab8eb31d496f5bbe2238))

## [2.4.0](https://github.com/erxes/erxes/compare/2.3.2...2.4.0) (2025-01-19)

### Features

- add clientportaluser posts and custom properties to cms post([#5871](https://github.com/erxes/erxes/issues/5871)) ([5e10e25](https://github.com/erxes/erxes/commit/5e10e251c072f9f02953bfe0440439696e7c3927))

### Bug Fixes

- auth description ([3ba4a65](https://github.com/erxes/erxes/commit/3ba4a65748f43638a5262c4f53411b7efdd12828))
- getRealIdFromElk can't get \_id when version saas ([1288354](https://github.com/erxes/erxes/commit/128835495d583634c3a633fa95b207477bbc4e3f))
- **loyalties:** check new score lower than 0 ([210ae23](https://github.com/erxes/erxes/commit/210ae23c21f18fc4e59060d62bf115f76aca0c52))
- msdynamic default value empty string ([691c1ec](https://github.com/erxes/erxes/commit/691c1eceebb3639f9c5f6f43a934d443d9e05a09))
- **sales:** show relations on adding deal ([6c52eae](https://github.com/erxes/erxes/commit/6c52eaee7040d8ec6239448fd7b47298812763fd))
- syncerkhet from posorder and billType is inner then hasnot vat ([708dda7](https://github.com/erxes/erxes/commit/708dda7f6cec96f165038d5e80539e6e441c47bd))

### Performance Improvements

- **knowledgebase:** optimize cron job ([7011441](https://github.com/erxes/erxes/commit/701144125ccea0e847615e04d2b5621c76961b03))

## [2.4.0-rc.0](https://github.com/erxes/erxes/compare/2.3.2...2.4.0) (2025-01-03)

### Bug Fixes

- sales settings stage row ([#5838](https://github.com/erxes/erxes/issues/5838)) ([d2d328b](https://github.com/erxes/erxes/commit/d2d328b64289d8d60afdc590cd135dd028e0ce62))

## [2.3.2](https://github.com/erxes/erxes/compare/2.3.1...2.3.2) (2025-01-06)

### Bug Fixes

- **automations:** add condition ignore when value has string with arithmetic methods ([7cb39d4](https://github.com/erxes/erxes/commit/7cb39d4660a9054fb530c3ec02785ac691ae2cdb))

## [2.3.1](https://github.com/erxes/erxes/compare/2.3.0...2.3.1) (2025-01-05)

### Bug Fixes

- **coreui:** add some settings menu in goto navigation ([aaf1a55](https://github.com/erxes/erxes/commit/aaf1a55f65a9d68f4781b6699de83986dd55a589))

## [2.3.0](https://github.com/erxes/erxes/compare/2.3.0-rc.1...2.3.0) (2025-01-03)

### Features

- Active directory improve ([#5855](https://github.com/erxes/erxes/issues/5855)) ([2db39ab](https://github.com/erxes/erxes/commit/2db39ab6761fe9fbb5c768e51e660dc48e703bb4))

### Bug Fixes

- sales pipeline deal payment form, and payment data syncerkhet ([184690a](https://github.com/erxes/erxes/commit/184690a035cc25b7472ce8ecacbebeb09b47d4f3))

## [2.3.0-rc.1](https://github.com/erxes/erxes/compare/2.3.0-rc.1...2.3.0) (2024-12-23)

### Features

- add plugin sync active directory ([#5854](https://github.com/erxes/erxes/issues/5854)) ([41cca44](https://github.com/erxes/erxes/commit/41cca44b658dd535709cfa9f1dd2734b80d61a47))

### Bug Fixes

- **activedirectory:** release.yaml ([8ba7086](https://github.com/erxes/erxes/commit/8ba708661164eb830352e116dcec0a0858f5351e))

## [2.3.0-rc.0](https://github.com/erxes/erxes/compare/2.3.0-rc.1...2.3.0) (2024-12-19)

### Features

- **whatsapp:** chatbot v1 ([4d074e6](https://github.com/erxes/erxes/commit/4d074e67a030e295691a15e5555a65fce552551e))

## [2.2.2](https://github.com/erxes/erxes/compare/2.3.0-rc.1...2.3.0) (2024-12-27)

### Bug Fixes

- **gateway:** can't set user logintoken sessioncode in userMiddleware ([5b4c2d3](https://github.com/erxes/erxes/commit/5b4c2d3155b6cd556487ab21595cc6641bc91f75))
- posclient use header ([49a41da](https://github.com/erxes/erxes/commit/49a41da9af9a2035b315500b7c942642a586f2ff))
- **segments:** get just content type is lead if source is engages ([280815d](https://github.com/erxes/erxes/commit/280815d60e4436d9241628cdfda87d27c786bb52))

## [2.3.0-rc.1](https://github.com/erxes/erxes/compare/2.3.0-rc.0...2.3.0-rc.1) (2024-12-23)

### Features

- add plugin sync active directory ([#5854](https://github.com/erxes/erxes/issues/5854)) ([41cca44](https://github.com/erxes/erxes/commit/41cca44b658dd535709cfa9f1dd2734b80d61a47))

### Bug Fixes

- **activedirectory:** release.yaml ([8ba7086](https://github.com/erxes/erxes/commit/8ba708661164eb830352e116dcec0a0858f5351e))

## [2.3.0-rc.0](https://github.com/erxes/erxes/compare/2.3.0-rc.0...2.3.0-rc.1) (2024-12-19)

### Features

- **whatsapp:** chatbot v1 ([4d074e6](https://github.com/erxes/erxes/commit/4d074e67a030e295691a15e5555a65fce552551e))

## [2.2.1](https://github.com/erxes/erxes/compare/2.3.0-rc.0...2.3.0-rc.1) (2024-12-20)

### Features

- inventories safeRemainder with census items ([19eb27d](https://github.com/erxes/erxes/commit/19eb27dc678ecd747b5285b0618d56be8e91d8b2))
- posclient qrmenu backend ([8482dab](https://github.com/erxes/erxes/commit/8482dab481964a0038c9d693de6517c7819fd30c))

### Bug Fixes

- ebarimt product tax rule find ([4f266b0](https://github.com/erxes/erxes/commit/4f266b0507444e6745ac5373f8cd38b1dbcb330b))

## [2.2.1](https://github.com/erxes/erxes/compare/2.2.0...2.2.1) (2024-12-20)

### Features

- inventories safeRemainder with census items ([19eb27d](https://github.com/erxes/erxes/commit/19eb27dc678ecd747b5285b0618d56be8e91d8b2))
- posclient qrmenu backend ([8482dab](https://github.com/erxes/erxes/commit/8482dab481964a0038c9d693de6517c7819fd30c))

### Bug Fixes

- ebarimt product tax rule find ([4f266b0](https://github.com/erxes/erxes/commit/4f266b0507444e6745ac5373f8cd38b1dbcb330b))

## [2.2.0](https://github.com/erxes/erxes/compare/2.2.0-rc.11...2.2.0) (2024-12-19)

## [2.2.0-rc.11](https://github.com/erxes/erxes/compare/2.2.0-rc.11...2.2.0) (2024-12-16)

### Bug Fixes

- syncpolaris add keepAlive ([15446de](https://github.com/erxes/erxes/commit/15446dec4f473624eca7d11183bce1bdfc26339a))

## [2.2.0-rc.10](https://github.com/erxes/erxes/compare/2.2.0-rc.11...2.2.0) (2024-12-14)

## [2.2.0-rc.9](https://github.com/erxes/erxes/compare/2.2.0-rc.11...2.2.0) (2024-12-12)

### Bug Fixes

- syncpolaris pull settings ([61caefa](https://github.com/erxes/erxes/commit/61caefae0e6ab3e2af4d1fa6675cbdfc528f9561))
- userMiddleware exclude deviceTokens ([16ddc72](https://github.com/erxes/erxes/commit/16ddc72a578916e9ba535f7478f5bacf4536833b))

## [2.2.0-rc.8](https://github.com/erxes/erxes/compare/2.2.0-rc.11...2.2.0) (2024-12-10)

## [2.2.0-rc.7](https://github.com/erxes/erxes/compare/2.2.0-rc.11...2.2.0) (2024-12-10)

## [2.1.0-rc.6](https://github.com/erxes/erxes/compare/2.2.0-rc.11...2.2.0) (2024-12-10)

## [2.2.0-rc.6](https://github.com/erxes/erxes/compare/2.2.0-rc.11...2.2.0) (2024-12-10)

## [2.2.0-rc.5](https://github.com/erxes/erxes/compare/2.2.0-rc.11...2.2.0) (2024-12-09)

### Features

- **cards:** add new permission feat which shows cards based on branch ([780b192](https://github.com/erxes/erxes/commit/780b192e25aa056e28779cad4b34cc514a2de9e6))

## [2.2.0-rc.4](https://github.com/erxes/erxes/compare/2.2.0-rc.11...2.2.0) (2024-12-06)

## [2.2.0-rc.3](https://github.com/erxes/erxes/compare/2.2.0-rc.11...2.2.0) (2024-12-06)

## [2.2.0-rc.2](https://github.com/erxes/erxes/compare/2.2.0-rc.11...2.2.0) (2024-12-05)

### Bug Fixes

- wrong type field ([8417647](https://github.com/erxes/erxes/commit/8417647ca323d06128d579f490837504d79cb1df))

## [2.2.0-rc.1](https://github.com/erxes/erxes/compare/2.2.0-rc.11...2.2.0) (2024-12-04)

### Features

- syncpolaris pull polaris config and save ([#5819](https://github.com/erxes/erxes/issues/5819)) ([88cf624](https://github.com/erxes/erxes/commit/88cf62415075b575d99665d36082ba977af0930d))

## [2.2.0-rc.0](https://github.com/erxes/erxes/compare/2.2.0-rc.11...2.2.0) (2024-12-03)

### Features

- add Accountings plugin ([#5058](https://github.com/erxes/erxes/issues/5058)) ([40e07bf](https://github.com/erxes/erxes/commit/40e07bf9c200b2609810eea91941b01af015c622))
- Cars plugin log improve ([3aa8fcf](https://github.com/erxes/erxes/commit/3aa8fcf772c2162abd5179d983e6b071a1bdf130))
- **instagram:** add chatbot integration for Messenger, Comments, and Ads management ([18ab33e](https://github.com/erxes/erxes/commit/18ab33e82742249d5a0217055e0ecb7703a1a248))
- **whatsapp:** v1 ([8f82337](https://github.com/erxes/erxes/commit/8f82337a9b597903f0b75f355ed224fd642ebc11))

### Bug Fixes

- accountings account query ([c638d14](https://github.com/erxes/erxes/commit/c638d14cfe7e6f89e67805ec2da49065ccd21db6))
- accountings form refetch ([34fbd13](https://github.com/erxes/erxes/commit/34fbd13263b93ae0caadd066b6f07393dc61497f))
- accountings schema ([359bef1](https://github.com/erxes/erxes/commit/359bef11a6d51ff6855715c288315944b77371b7))
- accountings schema resolver ([eb98ac5](https://github.com/erxes/erxes/commit/eb98ac59670e1e534ec29f037b814b9b7b31f563))
- accountings transactions filter ptrStatus ([3fe64ac](https://github.com/erxes/erxes/commit/3fe64ac959c531d156ec97036ef4941d46842e7e))
- check push customer ([87b62fc](https://github.com/erxes/erxes/commit/87b62fc30155f2be9fe8641bc3906c89be6026d8))
- **core:** can't export data ([9592e98](https://github.com/erxes/erxes/commit/9592e9884e93f51e964188824cb52f7a3aaf2649))
- **goal:** tags type fixed ([021e720](https://github.com/erxes/erxes/commit/021e72041b950dea1f8ae7ee81c76b25a35c1e7d))
- **imap:** not showed signature and other little bugs ([467aec6](https://github.com/erxes/erxes/commit/467aec6f8a760d102dd5cdeb7c52665c4ab5edc8))
- not check enabled contacts on pos-api ([8f7bebd](https://github.com/erxes/erxes/commit/8f7bebdf3c373adeabff86d5366d7830f7831cc7))
- **whatsapp:** change callback url ([e6ac87d](https://github.com/erxes/erxes/commit/e6ac87deeaf8dc238a5aeb503753a071fa302a25))
- **whatsapp:** debug ([fe950a8](https://github.com/erxes/erxes/commit/fe950a8b71c177c4a3030c468c935341623c2773))
- **whatsapp:** remove some types ([4115fd5](https://github.com/erxes/erxes/commit/4115fd5f7fcf5551c9a6260180ea885a676ee90c))
- **whatsapp:** Whats app log ([#5809](https://github.com/erxes/erxes/issues/5809)) ([b97edb3](https://github.com/erxes/erxes/commit/b97edb317a05276c1670636683af5b1ce9118bd6))

### Performance Improvements

- accounting ([#5823](https://github.com/erxes/erxes/issues/5823)) ([db3fa98](https://github.com/erxes/erxes/commit/db3fa98bffa4a1850347b34cd416b6aa422ee72a))

## [2.1.6](https://github.com/erxes/erxes/compare/2.2.0-rc.11...2.2.0) (2024-12-18)

### Bug Fixes

- posclient add header erxes-pos-token ([66d8b4c](https://github.com/erxes/erxes/commit/66d8b4c57b59703e81a6efb6b05e5055369491fa))
- **saas:** can't get contact remain from bundle ([215d5b2](https://github.com/erxes/erxes/commit/215d5b2378823bc2a7fa0521c045ed8cdc4dd595))
- **saas:** debug ([4064d80](https://github.com/erxes/erxes/commit/4064d80e3b231d2dde6ad0980dee35c76859bf6d))

## [2.1.5](https://github.com/erxes/erxes/compare/2.2.0-rc.11...2.2.0) (2024-12-17)

### Features

- **cms:** introduce cms plugin ([#5848](https://github.com/erxes/erxes/issues/5848)) ([97caf5b](https://github.com/erxes/erxes/commit/97caf5b67a66341de728fd4aef2625ab514c3557))

### Bug Fixes

- coreui ci up ([419a1d4](https://github.com/erxes/erxes/commit/419a1d4449d815f0f9606e0b23894fe77f6b3a23))
- sales documents ([8b700e5](https://github.com/erxes/erxes/commit/8b700e589f28b5c82539a564b7ee86f2d88c55b2))

## [2.1.6](https://github.com/erxes/erxes/compare/2.1.5...2.1.6) (2024-12-18)

## [2.2.0-rc.11](https://github.com/erxes/erxes/compare/2.2.0-rc.10...2.2.0-rc.11) (2024-12-16)

### Bug Fixes

- posclient add header erxes-pos-token ([66d8b4c](https://github.com/erxes/erxes/commit/66d8b4c57b59703e81a6efb6b05e5055369491fa))
- **saas:** can't get contact remain from bundle ([215d5b2](https://github.com/erxes/erxes/commit/215d5b2378823bc2a7fa0521c045ed8cdc4dd595))
- **saas:** debug ([4064d80](https://github.com/erxes/erxes/commit/4064d80e3b231d2dde6ad0980dee35c76859bf6d))

## [2.1.5](https://github.com/erxes/erxes/compare/2.1.4...2.1.5) (2024-12-17)

- **automations:** can't set first form when not selected any form ([07410da](https://github.com/erxes/erxes/commit/07410da62e67f89f4b852ca75c89b177c0686b37))
- syncpolaris add keepAlive ([15446de](https://github.com/erxes/erxes/commit/15446dec4f473624eca7d11183bce1bdfc26339a))

## [2.2.0-rc.10](https://github.com/erxes/erxes/compare/2.2.0-rc.10...2.2.0-rc.11) (2024-12-14)

## [2.2.0-rc.9](https://github.com/erxes/erxes/compare/2.2.0-rc.10...2.2.0-rc.11) (2024-12-12)

### Bug Fixes

- syncpolaris pull settings ([61caefa](https://github.com/erxes/erxes/commit/61caefae0e6ab3e2af4d1fa6675cbdfc528f9561))
- userMiddleware exclude deviceTokens ([16ddc72](https://github.com/erxes/erxes/commit/16ddc72a578916e9ba535f7478f5bacf4536833b))

## [2.2.0-rc.8](https://github.com/erxes/erxes/compare/2.2.0-rc.10...2.2.0-rc.11) (2024-12-10)

## [2.2.0-rc.7](https://github.com/erxes/erxes/compare/2.2.0-rc.10...2.2.0-rc.11) (2024-12-10)

## [2.1.0-rc.6](https://github.com/erxes/erxes/compare/2.2.0-rc.10...2.2.0-rc.11) (2024-12-10)

## [2.2.0-rc.6](https://github.com/erxes/erxes/compare/2.2.0-rc.10...2.2.0-rc.11) (2024-12-10)

## [2.2.0-rc.5](https://github.com/erxes/erxes/compare/2.2.0-rc.10...2.2.0-rc.11) (2024-12-09)

### Features

- **cms:** introduce cms plugin ([#5848](https://github.com/erxes/erxes/issues/5848)) ([97caf5b](https://github.com/erxes/erxes/commit/97caf5b67a66341de728fd4aef2625ab514c3557))
- **cards:** add new permission feat which shows cards based on branch ([780b192](https://github.com/erxes/erxes/commit/780b192e25aa056e28779cad4b34cc514a2de9e6))

## [2.2.0-rc.4](https://github.com/erxes/erxes/compare/2.2.0-rc.10...2.2.0-rc.11) (2024-12-06)

## [2.2.0-rc.3](https://github.com/erxes/erxes/compare/2.2.0-rc.10...2.2.0-rc.11) (2024-12-06)

## [2.2.0-rc.2](https://github.com/erxes/erxes/compare/2.2.0-rc.10...2.2.0-rc.11) (2024-12-05)

### Bug Fixes

- **automations:** can't set first form when not selected any form ([07410da](https://github.com/erxes/erxes/commit/07410da62e67f89f4b852ca75c89b177c0686b37))
- coreui ci up ([419a1d4](https://github.com/erxes/erxes/commit/419a1d4449d815f0f9606e0b23894fe77f6b3a23))
- sales documents ([8b700e5](https://github.com/erxes/erxes/commit/8b700e589f28b5c82539a564b7ee86f2d88c55b2))

## [2.1.4](https://github.com/erxes/erxes/compare/2.1.3...2.1.4) (2024-12-16)

- wrong type field ([8417647](https://github.com/erxes/erxes/commit/8417647ca323d06128d579f490837504d79cb1df))

## [2.2.0-rc.1](https://github.com/erxes/erxes/compare/2.2.0-rc.10...2.2.0-rc.11) (2024-12-04)

### Features

- syncpolaris pull polaris config and save ([#5819](https://github.com/erxes/erxes/issues/5819)) ([88cf624](https://github.com/erxes/erxes/commit/88cf62415075b575d99665d36082ba977af0930d))

## [2.2.0-rc.0](https://github.com/erxes/erxes/compare/2.2.0-rc.10...2.2.0-rc.11) (2024-12-03)

### Features

- add Accountings plugin ([#5058](https://github.com/erxes/erxes/issues/5058)) ([40e07bf](https://github.com/erxes/erxes/commit/40e07bf9c200b2609810eea91941b01af015c622))
- Cars plugin log improve ([3aa8fcf](https://github.com/erxes/erxes/commit/3aa8fcf772c2162abd5179d983e6b071a1bdf130))
- **instagram:** add chatbot integration for Messenger, Comments, and Ads management ([18ab33e](https://github.com/erxes/erxes/commit/18ab33e82742249d5a0217055e0ecb7703a1a248))
- **whatsapp:** v1 ([8f82337](https://github.com/erxes/erxes/commit/8f82337a9b597903f0b75f355ed224fd642ebc11))

### Bug Fixes

- accountings account query ([c638d14](https://github.com/erxes/erxes/commit/c638d14cfe7e6f89e67805ec2da49065ccd21db6))
- accountings form refetch ([34fbd13](https://github.com/erxes/erxes/commit/34fbd13263b93ae0caadd066b6f07393dc61497f))
- accountings schema ([359bef1](https://github.com/erxes/erxes/commit/359bef11a6d51ff6855715c288315944b77371b7))
- accountings schema resolver ([eb98ac5](https://github.com/erxes/erxes/commit/eb98ac59670e1e534ec29f037b814b9b7b31f563))
- accountings transactions filter ptrStatus ([3fe64ac](https://github.com/erxes/erxes/commit/3fe64ac959c531d156ec97036ef4941d46842e7e))
- check push customer ([87b62fc](https://github.com/erxes/erxes/commit/87b62fc30155f2be9fe8641bc3906c89be6026d8))
- **core:** can't export data ([9592e98](https://github.com/erxes/erxes/commit/9592e9884e93f51e964188824cb52f7a3aaf2649))
- **goal:** tags type fixed ([021e720](https://github.com/erxes/erxes/commit/021e72041b950dea1f8ae7ee81c76b25a35c1e7d))
- **imap:** not showed signature and other little bugs ([467aec6](https://github.com/erxes/erxes/commit/467aec6f8a760d102dd5cdeb7c52665c4ab5edc8))
- not check enabled contacts on pos-api ([8f7bebd](https://github.com/erxes/erxes/commit/8f7bebdf3c373adeabff86d5366d7830f7831cc7))
- **whatsapp:** change callback url ([e6ac87d](https://github.com/erxes/erxes/commit/e6ac87deeaf8dc238a5aeb503753a071fa302a25))
- **whatsapp:** debug ([fe950a8](https://github.com/erxes/erxes/commit/fe950a8b71c177c4a3030c468c935341623c2773))
- **whatsapp:** remove some types ([4115fd5](https://github.com/erxes/erxes/commit/4115fd5f7fcf5551c9a6260180ea885a676ee90c))
- **whatsapp:** Whats app log ([#5809](https://github.com/erxes/erxes/issues/5809)) ([b97edb3](https://github.com/erxes/erxes/commit/b97edb317a05276c1670636683af5b1ce9118bd6))

### Performance Improvements

- accounting ([#5823](https://github.com/erxes/erxes/issues/5823)) ([db3fa98](https://github.com/erxes/erxes/commit/db3fa98bffa4a1850347b34cd416b6aa422ee72a))

## [2.1.4](https://github.com/erxes/erxes/compare/2.2.0-rc.10...2.2.0-rc.11) (2024-12-16)

### Features

- **automations:** add ability send documents ([3d1e04e](https://github.com/erxes/erxes/commit/3d1e04edf31582bf99bd7af1a8df4f0d03b80271))
- ebarimt some products another tax rule ([#5845](https://github.com/erxes/erxes/issues/5845)) ([d84230f](https://github.com/erxes/erxes/commit/d84230f38750986754edd3ea427826bb4a5ba296))

### Bug Fixes

- **automations:** check documents plugin enabled ([76d4df7](https://github.com/erxes/erxes/commit/76d4df7b0948ac917367c2fe1b5768043f243959))
- **pos:** check score aviable to subtract from loyalties ([8cabf47](https://github.com/erxes/erxes/commit/8cabf47dca041f5c7b13743ef0a0caaab3893fe0))

## [2.2.0-rc.10](https://github.com/erxes/erxes/compare/2.2.0-rc.9...2.2.0-rc.10) (2024-12-14)

### Bug Fixes

- **automations:** can't replace placeholders of form in form submissions ([de0e482](https://github.com/erxes/erxes/commit/de0e482adef25c7704583dcb5e89c6671268b436))
- **knowledgebase:** can't handle attachment when null in PDFUploader ([ff9ae05](https://github.com/erxes/erxes/commit/ff9ae05b0651546a3d6066d70a7ebdaa713e173e))

## [2.2.0-rc.9](https://github.com/erxes/erxes/compare/2.2.0-rc.8...2.2.0-rc.9) (2024-12-12)

### Bug Fixes

- syncpolaris pull settings ([61caefa](https://github.com/erxes/erxes/commit/61caefae0e6ab3e2af4d1fa6675cbdfc528f9561))
- userMiddleware exclude deviceTokens ([16ddc72](https://github.com/erxes/erxes/commit/16ddc72a578916e9ba535f7478f5bacf4536833b))

## [2.2.0-rc.8](https://github.com/erxes/erxes/compare/2.2.0-rc.8...2.2.0-rc.9) (2024-12-10)

## [2.2.0-rc.7](https://github.com/erxes/erxes/compare/2.2.0-rc.8...2.2.0-rc.9) (2024-12-10)

## [2.1.0-rc.6](https://github.com/erxes/erxes/compare/2.2.0-rc.8...2.2.0-rc.9) (2024-12-10)

## [2.2.0-rc.6](https://github.com/erxes/erxes/compare/2.2.0-rc.8...2.2.0-rc.9) (2024-12-10)

## [2.2.0-rc.5](https://github.com/erxes/erxes/compare/2.2.0-rc.8...2.2.0-rc.9) (2024-12-09)

### Features

- **cards:** add new permission feat which shows cards based on branch ([780b192](https://github.com/erxes/erxes/commit/780b192e25aa056e28779cad4b34cc514a2de9e6))

## [2.2.0-rc.4](https://github.com/erxes/erxes/compare/2.2.0-rc.8...2.2.0-rc.9) (2024-12-06)

## [2.2.0-rc.3](https://github.com/erxes/erxes/compare/2.2.0-rc.8...2.2.0-rc.9) (2024-12-06)

## [2.2.0-rc.2](https://github.com/erxes/erxes/compare/2.2.0-rc.8...2.2.0-rc.9) (2024-12-05)

### Bug Fixes

- wrong type field ([8417647](https://github.com/erxes/erxes/commit/8417647ca323d06128d579f490837504d79cb1df))

## [2.2.0-rc.1](https://github.com/erxes/erxes/compare/2.2.0-rc.8...2.2.0-rc.9) (2024-12-04)

### Features

- syncpolaris pull polaris config and save ([#5819](https://github.com/erxes/erxes/issues/5819)) ([88cf624](https://github.com/erxes/erxes/commit/88cf62415075b575d99665d36082ba977af0930d))

## [2.2.0-rc.0](https://github.com/erxes/erxes/compare/2.2.0-rc.8...2.2.0-rc.9) (2024-12-03)

### Features

- add Accountings plugin ([#5058](https://github.com/erxes/erxes/issues/5058)) ([40e07bf](https://github.com/erxes/erxes/commit/40e07bf9c200b2609810eea91941b01af015c622))
- Cars plugin log improve ([3aa8fcf](https://github.com/erxes/erxes/commit/3aa8fcf772c2162abd5179d983e6b071a1bdf130))
- **instagram:** add chatbot integration for Messenger, Comments, and Ads management ([18ab33e](https://github.com/erxes/erxes/commit/18ab33e82742249d5a0217055e0ecb7703a1a248))
- **whatsapp:** v1 ([8f82337](https://github.com/erxes/erxes/commit/8f82337a9b597903f0b75f355ed224fd642ebc11))

### Bug Fixes

- accountings account query ([c638d14](https://github.com/erxes/erxes/commit/c638d14cfe7e6f89e67805ec2da49065ccd21db6))
- accountings form refetch ([34fbd13](https://github.com/erxes/erxes/commit/34fbd13263b93ae0caadd066b6f07393dc61497f))
- accountings schema ([359bef1](https://github.com/erxes/erxes/commit/359bef11a6d51ff6855715c288315944b77371b7))
- accountings schema resolver ([eb98ac5](https://github.com/erxes/erxes/commit/eb98ac59670e1e534ec29f037b814b9b7b31f563))
- accountings transactions filter ptrStatus ([3fe64ac](https://github.com/erxes/erxes/commit/3fe64ac959c531d156ec97036ef4941d46842e7e))
- check push customer ([87b62fc](https://github.com/erxes/erxes/commit/87b62fc30155f2be9fe8641bc3906c89be6026d8))
- **core:** can't export data ([9592e98](https://github.com/erxes/erxes/commit/9592e9884e93f51e964188824cb52f7a3aaf2649))
- **goal:** tags type fixed ([021e720](https://github.com/erxes/erxes/commit/021e72041b950dea1f8ae7ee81c76b25a35c1e7d))
- **imap:** not showed signature and other little bugs ([467aec6](https://github.com/erxes/erxes/commit/467aec6f8a760d102dd5cdeb7c52665c4ab5edc8))
- not check enabled contacts on pos-api ([8f7bebd](https://github.com/erxes/erxes/commit/8f7bebdf3c373adeabff86d5366d7830f7831cc7))
- **whatsapp:** change callback url ([e6ac87d](https://github.com/erxes/erxes/commit/e6ac87deeaf8dc238a5aeb503753a071fa302a25))
- **whatsapp:** debug ([fe950a8](https://github.com/erxes/erxes/commit/fe950a8b71c177c4a3030c468c935341623c2773))
- **whatsapp:** remove some types ([4115fd5](https://github.com/erxes/erxes/commit/4115fd5f7fcf5551c9a6260180ea885a676ee90c))
- **whatsapp:** Whats app log ([#5809](https://github.com/erxes/erxes/issues/5809)) ([b97edb3](https://github.com/erxes/erxes/commit/b97edb317a05276c1670636683af5b1ce9118bd6))

### Performance Improvements

- accounting ([#5823](https://github.com/erxes/erxes/issues/5823)) ([db3fa98](https://github.com/erxes/erxes/commit/db3fa98bffa4a1850347b34cd416b6aa422ee72a))

## [2.1.3](https://github.com/erxes/erxes/compare/2.2.0-rc.8...2.2.0-rc.9) (2024-12-12)

### Features

- **loyalties:** score campaign ([9951e63](https://github.com/erxes/erxes/commit/9951e6301428ce3e389d6f3c8fdf9290ab5ce7ba))
- **payment:** use payment name as qpay sender_branch_code ([fab5443](https://github.com/erxes/erxes/commit/fab5443c08398bceb5cb4bd0f47bedc04b043080))

### Bug Fixes

- deal export & notifType handle null ([8f7b106](https://github.com/erxes/erxes/commit/8f7b10607924c9bf137a302a1b2eb31c570bcc9c))
- **sales:** can't send email notification when created sales card using rpc request ([d2a75d3](https://github.com/erxes/erxes/commit/d2a75d39beac00b5ec62876ea62856a6792c59a5))
- **segments:** add adility prevent infinity loop in associationFilter segments ([64e4b49](https://github.com/erxes/erxes/commit/64e4b492495ca7840929fde1842fadaa474e7574))

## [2.1.3](https://github.com/erxes/erxes/compare/2.1.2...2.1.3) (2024-12-12)

### Features

- **loyalties:** score campaign ([9951e63](https://github.com/erxes/erxes/commit/9951e6301428ce3e389d6f3c8fdf9290ab5ce7ba))
- **payment:** use payment name as qpay sender_branch_code ([fab5443](https://github.com/erxes/erxes/commit/fab5443c08398bceb5cb4bd0f47bedc04b043080))

### Bug Fixes

- **automations:** add abilit create aws transport when ([f8d3088](https://github.com/erxes/erxes/commit/f8d308823e43a0c072c6695ca067a7314c24a1a1))
- **automations:** remove unnecessary condition ([9221083](https://github.com/erxes/erxes/commit/9221083e7cf35b309f5c06085ff490d9a4c281f4))
- **automations:** stop get from user from ([5b24be0](https://github.com/erxes/erxes/commit/5b24be0df91cc557b10ef4ea0af011fc599c5773))
- deal export & notifType handle null ([8f7b106](https://github.com/erxes/erxes/commit/8f7b10607924c9bf137a302a1b2eb31c570bcc9c))
- **notifications:** saas ([8d20244](https://github.com/erxes/erxes/commit/8d20244436b4c53b0548ef10ec2741d277be44fb))
- **sales:** can't send email notification when created sales card using rpc request ([d2a75d3](https://github.com/erxes/erxes/commit/d2a75d39beac00b5ec62876ea62856a6792c59a5))
- **segments:** add adility prevent infinity loop in associationFilter segments ([64e4b49](https://github.com/erxes/erxes/commit/64e4b492495ca7840929fde1842fadaa474e7574))
- **segments:** count ([cd48fc1](https://github.com/erxes/erxes/commit/cd48fc18af8b6039e83c4be092d493812f02eb8c))

## [2.1.2](https://github.com/erxes/erxes/compare/2.1.1...2.1.2) (2024-12-05)

### Bug Fixes

- **automations:** add ability set custom additional attributes in action detail form & check is getRecipientsEmails field value is array ([ffcfa87](https://github.com/erxes/erxes/commit/ffcfa876e9410330a6fc14d21f7bb4964363b580))
- cloudflare account hash env ([62419c8](https://github.com/erxes/erxes/commit/62419c8067a75c1d8716c0635ebb82d1b4ec4cae))
- sales documents stage type ([1661416](https://github.com/erxes/erxes/commit/166141603c5d6ae8700016715204a94b9d3a3a38))
- **segments:** add filter params in segment form ([d72460c](https://github.com/erxes/erxes/commit/d72460cbb21837b986ad287c548d856289c22969))

### Reverts

- **sales:** revert unnecessary removed code ([bd81564](https://github.com/erxes/erxes/commit/bd8156440e302b4bb144199a4df178837869e721))

## [2.2.0-rc.0](https://github.com/erxes/erxes/compare/2.2.0-rc.0...2.2.0-rc.1) (2024-12-03)

### Features

- add Accountings plugin ([#5058](https://github.com/erxes/erxes/issues/5058)) ([40e07bf](https://github.com/erxes/erxes/commit/40e07bf9c200b2609810eea91941b01af015c622))
- Cars plugin log improve ([3aa8fcf](https://github.com/erxes/erxes/commit/3aa8fcf772c2162abd5179d983e6b071a1bdf130))
- **instagram:** add chatbot integration for Messenger, Comments, and Ads management ([18ab33e](https://github.com/erxes/erxes/commit/18ab33e82742249d5a0217055e0ecb7703a1a248))
- **whatsapp:** v1 ([8f82337](https://github.com/erxes/erxes/commit/8f82337a9b597903f0b75f355ed224fd642ebc11))

### Bug Fixes

- accountings account query ([c638d14](https://github.com/erxes/erxes/commit/c638d14cfe7e6f89e67805ec2da49065ccd21db6))
- accountings form refetch ([34fbd13](https://github.com/erxes/erxes/commit/34fbd13263b93ae0caadd066b6f07393dc61497f))
- accountings schema ([359bef1](https://github.com/erxes/erxes/commit/359bef11a6d51ff6855715c288315944b77371b7))
- accountings schema resolver ([eb98ac5](https://github.com/erxes/erxes/commit/eb98ac59670e1e534ec29f037b814b9b7b31f563))
- accountings transactions filter ptrStatus ([3fe64ac](https://github.com/erxes/erxes/commit/3fe64ac959c531d156ec97036ef4941d46842e7e))
- check push customer ([87b62fc](https://github.com/erxes/erxes/commit/87b62fc30155f2be9fe8641bc3906c89be6026d8))
- **core:** can't export data ([9592e98](https://github.com/erxes/erxes/commit/9592e9884e93f51e964188824cb52f7a3aaf2649))
- **goal:** tags type fixed ([021e720](https://github.com/erxes/erxes/commit/021e72041b950dea1f8ae7ee81c76b25a35c1e7d))
- **imap:** not showed signature and other little bugs ([467aec6](https://github.com/erxes/erxes/commit/467aec6f8a760d102dd5cdeb7c52665c4ab5edc8))
- not check enabled contacts on pos-api ([8f7bebd](https://github.com/erxes/erxes/commit/8f7bebdf3c373adeabff86d5366d7830f7831cc7))
- **whatsapp:** change callback url ([e6ac87d](https://github.com/erxes/erxes/commit/e6ac87deeaf8dc238a5aeb503753a071fa302a25))
- **whatsapp:** debug ([fe950a8](https://github.com/erxes/erxes/commit/fe950a8b71c177c4a3030c468c935341623c2773))
- **whatsapp:** remove some types ([4115fd5](https://github.com/erxes/erxes/commit/4115fd5f7fcf5551c9a6260180ea885a676ee90c))
- **whatsapp:** Whats app log ([#5809](https://github.com/erxes/erxes/issues/5809)) ([b97edb3](https://github.com/erxes/erxes/commit/b97edb317a05276c1670636683af5b1ce9118bd6))

### Performance Improvements

- accounting ([#5823](https://github.com/erxes/erxes/issues/5823)) ([db3fa98](https://github.com/erxes/erxes/commit/db3fa98bffa4a1850347b34cd416b6aa422ee72a))

## [2.1.1](https://github.com/erxes/erxes/compare/2.2.0-rc.0...2.2.0-rc.1) (2024-12-04)

### Bug Fixes

- **cards:** add tags field on list field types ([500cc30](https://github.com/erxes/erxes/commit/500cc30164a235aafbb049fff728e4edef203dd2))

## [2.1.0](https://github.com/erxes/erxes/compare/2.2.0-rc.0...2.2.0-rc.1) (2024-12-03)

## [2.2.0-rc.0](https://github.com/erxes/erxes/compare/2.1.0-rc.3...2.2.0-rc.0) (2024-12-03)

## [2.1.1](https://github.com/erxes/erxes/compare/2.1.0...2.1.1) (2024-12-04)

### Bug Fixes

- **cards:** add tags field on list field types ([500cc30](https://github.com/erxes/erxes/commit/500cc30164a235aafbb049fff728e4edef203dd2))

## [2.1.0](https://github.com/erxes/erxes/compare/2.1.0-rc.3...2.1.0) (2024-12-03)

### Features

- add Accountings plugin ([#5058](https://github.com/erxes/erxes/issues/5058)) ([40e07bf](https://github.com/erxes/erxes/commit/40e07bf9c200b2609810eea91941b01af015c622))
- Cars plugin log improve ([3aa8fcf](https://github.com/erxes/erxes/commit/3aa8fcf772c2162abd5179d983e6b071a1bdf130))
- **core:** add pdfAttachment to product ([40cfd9b](https://github.com/erxes/erxes/commit/40cfd9be9b577bb8f2a0919ad0693efef7caecd3))
- cp user move mutation add ([f5a863d](https://github.com/erxes/erxes/commit/f5a863d0bfd91f0d9eb510a8730b49b7829eb2ad))
- form insight ([54aa96c](https://github.com/erxes/erxes/commit/54aa96c4778d47dbed50f2222a958b00169a08cc))
- form template ([483ec7f](https://github.com/erxes/erxes/commit/483ec7f3aa0532f9cfaf68264cb4575b30c6e783))
- **instagram:** add chatbot integration for Messenger, Comments, and Ads management ([18ab33e](https://github.com/erxes/erxes/commit/18ab33e82742249d5a0217055e0ecb7703a1a248))
- **whatsapp:** v1 ([8f82337](https://github.com/erxes/erxes/commit/8f82337a9b597903f0b75f355ed224fd642ebc11))

### Bug Fixes

- accountings account query ([c638d14](https://github.com/erxes/erxes/commit/c638d14cfe7e6f89e67805ec2da49065ccd21db6))
- accountings form refetch ([34fbd13](https://github.com/erxes/erxes/commit/34fbd13263b93ae0caadd066b6f07393dc61497f))
- accountings schema ([359bef1](https://github.com/erxes/erxes/commit/359bef11a6d51ff6855715c288315944b77371b7))
- accountings schema resolver ([eb98ac5](https://github.com/erxes/erxes/commit/eb98ac59670e1e534ec29f037b814b9b7b31f563))
- accountings transactions filter ptrStatus ([3fe64ac](https://github.com/erxes/erxes/commit/3fe64ac959c531d156ec97036ef4941d46842e7e))
- **cards:** set stageChangedDate when stage chaged when editItem ([9121c2e](https://github.com/erxes/erxes/commit/9121c2e6d600ab4675e4e52efb3d39437a888227))
- **cards:** tag, cards copy, remainder ([d8d800e](https://github.com/erxes/erxes/commit/d8d800eb62f9013cb9876d022ca58031b142a776))
- check push customer ([87b62fc](https://github.com/erxes/erxes/commit/87b62fc30155f2be9fe8641bc3906c89be6026d8))
- **core:** can't export data ([9592e98](https://github.com/erxes/erxes/commit/9592e9884e93f51e964188824cb52f7a3aaf2649))
- editor wrapper resize ([fffc1b8](https://github.com/erxes/erxes/commit/fffc1b887f6806a348f97af24f0669bb1c070876))
- fix saas upload file configs ([bedf5d0](https://github.com/erxes/erxes/commit/bedf5d04c41f83f0fe0b9307ee457bb85369fa90))
- **goal:** tags type fixed ([021e720](https://github.com/erxes/erxes/commit/021e72041b950dea1f8ae7ee81c76b25a35c1e7d))
- **imap:** not showed signature and other little bugs ([467aec6](https://github.com/erxes/erxes/commit/467aec6f8a760d102dd5cdeb7c52665c4ab5edc8))
- loans and savings contract type detail save ([aa14d5c](https://github.com/erxes/erxes/commit/aa14d5c926822fcf98071b5df3ce3edfe9e86899))
- not check enabled contacts on pos-api ([8f7bebd](https://github.com/erxes/erxes/commit/8f7bebdf3c373adeabff86d5366d7830f7831cc7))
- **cards:** set stageChangedDate when stage chaged when editItem ([9121c2e](https://github.com/erxes/erxes/commit/9121c2e6d600ab4675e4e52efb3d39437a888227))
- **cards:** tag, cards copy, remainder ([d8d800e](https://github.com/erxes/erxes/commit/d8d800eb62f9013cb9876d022ca58031b142a776))
- editor wrapper resize ([fffc1b8](https://github.com/erxes/erxes/commit/fffc1b887f6806a348f97af24f0669bb1c070876))
- fix saas upload file configs ([bedf5d0](https://github.com/erxes/erxes/commit/bedf5d04c41f83f0fe0b9307ee457bb85369fa90))
- loans and savings contract type detail save ([aa14d5c](https://github.com/erxes/erxes/commit/aa14d5c926822fcf98071b5df3ce3edfe9e86899))
- pos ui market billType and golomt cover ([a5c5da0](https://github.com/erxes/erxes/commit/a5c5da0433a4504b475080017e06403a321938da))
- posOrder auto number latest order checker ([669f03a](https://github.com/erxes/erxes/commit/669f03a36b058b63b4c5ce29c96fe3269ba9769a))
- savings section ([92e4caa](https://github.com/erxes/erxes/commit/92e4caa27690405222a3b8adbb23ad8ef236cbe4))
- **segments:** stop counting temporary segments in saas limit ([7be82d9](https://github.com/erxes/erxes/commit/7be82d9407f9b67483660f1c29e0ca3515eafb5a))
- some check isEnabled missing plugins ([debb0c9](https://github.com/erxes/erxes/commit/debb0c9bcebb71bbb96ced320d08ccca028ea846))
- **whatsapp:** change callback url ([e6ac87d](https://github.com/erxes/erxes/commit/e6ac87deeaf8dc238a5aeb503753a071fa302a25))
- **whatsapp:** debug ([fe950a8](https://github.com/erxes/erxes/commit/fe950a8b71c177c4a3030c468c935341623c2773))
- **whatsapp:** remove some types ([4115fd5](https://github.com/erxes/erxes/commit/4115fd5f7fcf5551c9a6260180ea885a676ee90c))
- **whatsapp:** Whats app log ([#5809](https://github.com/erxes/erxes/issues/5809)) ([b97edb3](https://github.com/erxes/erxes/commit/b97edb317a05276c1670636683af5b1ce9118bd6))

### Performance Improvements

- accounting ([#5823](https://github.com/erxes/erxes/issues/5823)) ([db3fa98](https://github.com/erxes/erxes/commit/db3fa98bffa4a1850347b34cd416b6aa422ee72a))

## [2.1.0-rc.3](https://github.com/erxes/erxes/compare/2.1.0-rc.2...2.1.0-rc.3) (2024-11-25)

### Bug Fixes

- inventories list sidebar ([a1377f4](https://github.com/erxes/erxes/commit/a1377f404b46857cf944ad5c0ed9062a9e01e9ef))
- pos order dueDate validation ([5269753](https://github.com/erxes/erxes/commit/52697536df7eef56cbf230bb868f4e93adf0cca0))
- pos order sync with try ([d2610dd](https://github.com/erxes/erxes/commit/d2610dd0d34a9f395c0ccc2d445ea51baa1e56ef))
- replace collection name for label insight ([ee90633](https://github.com/erxes/erxes/commit/ee90633b8d42f544bed35442f29ef0fa1d4bbcc7))
- show publisher instead of writer ([8593844](https://github.com/erxes/erxes/commit/85938448b9c3f3d577943ffa3b3da7a41f5c529d))

## [2.1.0-rc.2](https://github.com/erxes/erxes/compare/2.1.0-rc.2...2.1.0-rc.3) (2024-11-19)

### Bug Fixes

- **goal:** tags type fixed ([a30b7c5](https://github.com/erxes/erxes/commit/a30b7c5547444e1d4e6f66dcd7d063de3cd04058))
- pos-ui shop theme billType ([8bf5bc4](https://github.com/erxes/erxes/commit/8bf5bc4316aa087ed0d644893cfabdedc39ebb6b))
- pos-ui ui shop theme diolog ([f757430](https://github.com/erxes/erxes/commit/f757430483dcf4386411a89e3aac9f03f3b13ef3))
- pricing getQuantityRules ([9a04343](https://github.com/erxes/erxes/commit/9a04343ae5960dc7795e880840b86280b2df4452))
- sales documents ([ae84b53](https://github.com/erxes/erxes/commit/ae84b53023958d635d7db7caab1d59432888a634))

## [2.1.0-rc.1](https://github.com/erxes/erxes/compare/2.1.0-rc.2...2.1.0-rc.3) (2024-11-17)

### Features

- add functionality to export savings & loans transactions ([caa52f3](https://github.com/erxes/erxes/commit/caa52f359c7531ccf82707f94be7dd141eeef490))

### Bug Fixes

- do transaction from contract detail ([d3b374d](https://github.com/erxes/erxes/commit/d3b374db0a193ba2244b4a3122f26a0b716dfd2f))
- facebook full_picture and limit fix ([#5796](https://github.com/erxes/erxes/issues/5796)) ([b0d9116](https://github.com/erxes/erxes/commit/b0d9116755335324738488b9c9ede67ae5670ef2))
- loans with storedInterest ([c4aaac3](https://github.com/erxes/erxes/commit/c4aaac31fcc3a536b34a7ef10645d48288467156))
- savings getAccountOwner ([65124df](https://github.com/erxes/erxes/commit/65124df11f14ac5dda89baae1b046eb145386624))

## [2.1.0-rc.0](https://github.com/erxes/erxes/compare/2.1.0-rc.2...2.1.0-rc.3) (2024-11-06)

### Features

- add endpoint ([1f29c78](https://github.com/erxes/erxes/commit/1f29c785af20a3ca5e464d5f70f037d7558d0865))
- add knowledgebase template ([e946e75](https://github.com/erxes/erxes/commit/e946e752ba02fac5b54b23c96608e711e89d9139))
- add product template ([d1ca792](https://github.com/erxes/erxes/commit/d1ca792afbdbacde540947bedea6744c2cedf44f))
- add sales template ([8e77fc1](https://github.com/erxes/erxes/commit/8e77fc16391e0644e8c3b96bd035c27435261901))
- ebarimt from deal with header and footer ([d5f270f](https://github.com/erxes/erxes/commit/d5f270f9064f849b72712d138ada5bb66d739ba1))
- get related content of main template ([2f2bdf9](https://github.com/erxes/erxes/commit/2f2bdf929dcd22d08f5f7b50c29d5f08877088a3))
- Timeclock request section added, refactor front-end ([0bca59b](https://github.com/erxes/erxes/commit/0bca59bf42ad00b6f17d160753abd4d9ccb06ec4))

### Bug Fixes

- **core:** can't save department parentId ([4d6e53d](https://github.com/erxes/erxes/commit/4d6e53d0704d16265ffb2d51bae03da3467641c1))
- ebarimt customerName optional ([724ac02](https://github.com/erxes/erxes/commit/724ac0268f977b01a60c061668ef7a8a1913ebfb))
- forms can't update field ([c65765c](https://github.com/erxes/erxes/commit/c65765c42a9d3a4f374ef0064e6ac6ab7f275d2c))
- loans and savings subscription when payment paid ([723e949](https://github.com/erxes/erxes/commit/723e949140b7c439dddfe31600ae1d6909efe4cd))
- loans and savings filter by total ([1c4cd64](https://github.com/erxes/erxes/commit/1c4cd644005ed397a2b8a8e42ab9758281353a3c))
- loans refactor ([ac20187](https://github.com/erxes/erxes/commit/ac2018739f47db402955e8131f82108039034d9f))
- loans refactor closeContract ([58c4b7f](https://github.com/erxes/erxes/commit/58c4b7f742f66f68ecbbc5362648ce6ef59d43e0))
- loans syncpolaris update ([13a1388](https://github.com/erxes/erxes/commit/13a1388b5b898844c5ae3cafbf1ae87e84b75092))
- polaris type ([b7413a0](https://github.com/erxes/erxes/commit/b7413a04a3a671c61ae58df204afede979231c68))
- pricing filter sidebar ([92eef61](https://github.com/erxes/erxes/commit/92eef6102c4d27cc024f3aa4a7499f66175255e6))
- product form sumuoms ui bug ([1170089](https://github.com/erxes/erxes/commit/1170089233a8756804ceccc83c8410c3354d78b5))
- productplaces ui bug ([554d66b](https://github.com/erxes/erxes/commit/554d66b12d1b6b243d4800e958a3b4e253bacd86))
- savings with productType ([0590431](https://github.com/erxes/erxes/commit/0590431b7120b695aa181ea1b06b2855378d62d9))
- syncerkhet weight ([db1c563](https://github.com/erxes/erxes/commit/db1c5634a070d9292b678310d32fa701882f5e77))

## [1.17.7](https://github.com/erxes/erxes/compare/2.1.0-rc.2...2.1.0-rc.3) (2024-10-24)

### Bug Fixes

- **core:** can't select parent ([ba51397](https://github.com/erxes/erxes/commit/ba513979140d0624f9448ffea273e52172c9fdc4))
- loans contractType with initial stageId at internetBank ([6812df4](https://github.com/erxes/erxes/commit/6812df4124493531382bac6499215a07cf3b5d7d))

### Performance Improvements

- burenScoring customerSidebar ([c610f29](https://github.com/erxes/erxes/commit/c610f299a018ef3a8d834ddb18d57672b616f5e1))

## [1.17.6](https://github.com/erxes/erxes/compare/2.1.0-rc.2...2.1.0-rc.3) (2024-10-22)

### Bug Fixes

- **insight:** remove progress field ([22d8eab](https://github.com/erxes/erxes/commit/22d8eab8f76eb727e28745c508cdfb6e784ef836))
- loans create from deal with contractype ([7f3f9db](https://github.com/erxes/erxes/commit/7f3f9dba4781f1646bdd6192be8a48c44b204080))

## [2.0.9](https://github.com/erxes/erxes/compare/2.1.0-rc.2...2.1.0-rc.3) (2024-11-25)

### Bug Fixes

- msdynamic remainders with reserveRemainder bug ([f247f42](https://github.com/erxes/erxes/commit/f247f4291955c99ca985e6a68db52923ca5f602f))
- pos order sync check paidDate ([b4b55e6](https://github.com/erxes/erxes/commit/b4b55e695362443cfce77cf077f451e56ece6519))
- purchases, tasks, tickets, sales export import fixed ([50d65b1](https://github.com/erxes/erxes/commit/50d65b1160f08741c8273b7c3e41c6325b2f605d))

## [2.0.8](https://github.com/erxes/erxes/compare/2.1.0-rc.2...2.1.0-rc.3) (2024-11-21)

### Features

- Pos tempbill ux ([#5804](https://github.com/erxes/erxes/issues/5804)) ([a8bf7a2](https://github.com/erxes/erxes/commit/a8bf7a2caa57f2f7de71cf99c786a77f3ecd3157))

### Bug Fixes

- **automations:** can' generate emails to send email action ([36c0624](https://github.com/erxes/erxes/commit/36c0624acaa89d39263da91d3ad6e2273bb19f34))
- pos order dueDate validation ([6d27c42](https://github.com/erxes/erxes/commit/6d27c420e66bc8c58f783b9e17f1b86b3602912c))
- pos order edit validation ([dab7a1c](https://github.com/erxes/erxes/commit/dab7a1cb9ddcc33861f28119d33aeb452dfcdd36))
- **posclient:** stop check by product when renewable subcsription ([b534070](https://github.com/erxes/erxes/commit/b53407011990289047524b0c22d651e331dbff6c))

## [2.0.7](https://github.com/erxes/erxes/compare/2.1.0-rc.2...2.1.0-rc.3) (2024-11-19)

### Features

- add integration & brand to conversation export ([3423de5](https://github.com/erxes/erxes/commit/3423de5f8cbb4fdede2f3146656a3ebb5aff2f27))
- duplicate products ([5070cc8](https://github.com/erxes/erxes/commit/5070cc8650a24d8dd7b1fa2ba8950ae64ec32630))
- exclude non working time ([589991c](https://github.com/erxes/erxes/commit/589991ca22efc55d063a1c0043546ac5e6c03e66))

### Bug Fixes

- ensure selected option appears correctly ([8399432](https://github.com/erxes/erxes/commit/8399432285bc83703476109d028cef21f55fa1da))
- migrate customer searchText & extract attachemnt ([c4e2541](https://github.com/erxes/erxes/commit/c4e2541b79dff754f3926050b3806a2629c03948))
- rename history prop to navigate in ManageColumns for Company ([2ceed3d](https://github.com/erxes/erxes/commit/2ceed3d85633ef1a2b7bea1e173390fc683245f5))
- triage bugs ([b34b90f](https://github.com/erxes/erxes/commit/b34b90fbcbd2e7f97cd5b4b6f50106c776c56644))

### Performance Improvements

- **widget:** update messenger ([#5803](https://github.com/erxes/erxes/issues/5803)) ([ffec4f9](https://github.com/erxes/erxes/commit/ffec4f90aa8267e7879257d2e7cbf0886f31cca0))

## [2.0.9](https://github.com/erxes/erxes/compare/2.0.8...2.0.9) (2024-11-25)

### Bug Fixes

- msdynamic remainders with reserveRemainder bug ([f247f42](https://github.com/erxes/erxes/commit/f247f4291955c99ca985e6a68db52923ca5f602f))
- pos order sync check paidDate ([b4b55e6](https://github.com/erxes/erxes/commit/b4b55e695362443cfce77cf077f451e56ece6519))
- purchases, tasks, tickets, sales export import fixed ([50d65b1](https://github.com/erxes/erxes/commit/50d65b1160f08741c8273b7c3e41c6325b2f605d))

## [2.0.8](https://github.com/erxes/erxes/compare/2.0.7...2.0.8) (2024-11-21)

### Features

- syncerkhet return deal with returnType ([742429d](https://github.com/erxes/erxes/commit/742429d9139ba2a7cf57099d63fc60011cae0246))

### Bug Fixes

- **automations:** can' generate emails to send email action ([36c0624](https://github.com/erxes/erxes/commit/36c0624acaa89d39263da91d3ad6e2273bb19f34))
- pos order dueDate validation ([6d27c42](https://github.com/erxes/erxes/commit/6d27c420e66bc8c58f783b9e17f1b86b3602912c))
- pos order edit validation ([dab7a1c](https://github.com/erxes/erxes/commit/dab7a1cb9ddcc33861f28119d33aeb452dfcdd36))
- **posclient:** stop check by product when renewable subcsription ([b534070](https://github.com/erxes/erxes/commit/b53407011990289047524b0c22d651e331dbff6c))

## [2.0.7](https://github.com/erxes/erxes/compare/2.0.6...2.0.7) (2024-11-19)

### Features

- syncerkhet return deal with returnType ([742429d](https://github.com/erxes/erxes/commit/742429d9139ba2a7cf57099d63fc60011cae0246))

### Bug Fixes

- **goal:** tags type fixed ([a30b7c5](https://github.com/erxes/erxes/commit/a30b7c5547444e1d4e6f66dcd7d063de3cd04058))
- pos-ui shop theme billType ([8bf5bc4](https://github.com/erxes/erxes/commit/8bf5bc4316aa087ed0d644893cfabdedc39ebb6b))
- pos-ui ui shop theme diolog ([f757430](https://github.com/erxes/erxes/commit/f757430483dcf4386411a89e3aac9f03f3b13ef3))
- pricing getQuantityRules ([9a04343](https://github.com/erxes/erxes/commit/9a04343ae5960dc7795e880840b86280b2df4452))
- sales documents ([ae84b53](https://github.com/erxes/erxes/commit/ae84b53023958d635d7db7caab1d59432888a634))

## [2.1.0-rc.1](https://github.com/erxes/erxes/compare/2.1.0-rc.0...2.1.0-rc.1) (2024-11-17)

### Features

- add functionality to export savings & loans transactions ([caa52f3](https://github.com/erxes/erxes/commit/caa52f359c7531ccf82707f94be7dd141eeef490))
- **workers:** Add background processing for large PDF uploads with Cloudflare integration and PDF to image conversion ([#5790](https://github.com/erxes/erxes/issues/5790)) ([f5d96b0](https://github.com/erxes/erxes/commit/f5d96b064dd6ce971f4c319b00effab2c55d297d))
- **workers:** PDF upload logic to support chunked uploads, improving the handling of large files and reducing the risk of upload failures. ([#5794](https://github.com/erxes/erxes/issues/5794)) ([aae52b5](https://github.com/erxes/erxes/commit/aae52b565a82fc636de610c69cee171f4059b6b1))

### Bug Fixes

- do transaction from contract detail ([d3b374d](https://github.com/erxes/erxes/commit/d3b374db0a193ba2244b4a3122f26a0b716dfd2f))
- facebook full_picture and limit fix ([#5796](https://github.com/erxes/erxes/issues/5796)) ([b0d9116](https://github.com/erxes/erxes/commit/b0d9116755335324738488b9c9ede67ae5670ef2))
- loans with storedInterest ([c4aaac3](https://github.com/erxes/erxes/commit/c4aaac31fcc3a536b34a7ef10645d48288467156))
- msdynamic check config ([f4bee52](https://github.com/erxes/erxes/commit/f4bee529b4890b4e947ac7ed0725bcf3065c0a52))
- posclient poscProductSimilarities with remainder ([9b55f62](https://github.com/erxes/erxes/commit/9b55f62b1c965b7da4aade5d88e00d706a548954))
- savings getAccountOwner ([65124df](https://github.com/erxes/erxes/commit/65124df11f14ac5dda89baae1b046eb145386624))

## [2.1.0-rc.0](https://github.com/erxes/erxes/compare/2.1.0-rc.0...2.1.0-rc.1) (2024-11-06)

### Features

- add endpoint ([1f29c78](https://github.com/erxes/erxes/commit/1f29c785af20a3ca5e464d5f70f037d7558d0865))
- add knowledgebase template ([e946e75](https://github.com/erxes/erxes/commit/e946e752ba02fac5b54b23c96608e711e89d9139))
- add product template ([d1ca792](https://github.com/erxes/erxes/commit/d1ca792afbdbacde540947bedea6744c2cedf44f))
- add sales template ([8e77fc1](https://github.com/erxes/erxes/commit/8e77fc16391e0644e8c3b96bd035c27435261901))
- ebarimt from deal with header and footer ([d5f270f](https://github.com/erxes/erxes/commit/d5f270f9064f849b72712d138ada5bb66d739ba1))
- get related content of main template ([2f2bdf9](https://github.com/erxes/erxes/commit/2f2bdf929dcd22d08f5f7b50c29d5f08877088a3))
- Timeclock request section added, refactor front-end ([0bca59b](https://github.com/erxes/erxes/commit/0bca59bf42ad00b6f17d160753abd4d9ccb06ec4))

### Bug Fixes

- **core:** can't save department parentId ([4d6e53d](https://github.com/erxes/erxes/commit/4d6e53d0704d16265ffb2d51bae03da3467641c1))
- ebarimt customerName optional ([724ac02](https://github.com/erxes/erxes/commit/724ac0268f977b01a60c061668ef7a8a1913ebfb))
- forms can't update field ([c65765c](https://github.com/erxes/erxes/commit/c65765c42a9d3a4f374ef0064e6ac6ab7f275d2c))
- loans and savings subscription when payment paid ([723e949](https://github.com/erxes/erxes/commit/723e949140b7c439dddfe31600ae1d6909efe4cd))
- loans and savings filter by total ([1c4cd64](https://github.com/erxes/erxes/commit/1c4cd644005ed397a2b8a8e42ab9758281353a3c))
- loans refactor ([ac20187](https://github.com/erxes/erxes/commit/ac2018739f47db402955e8131f82108039034d9f))
- loans refactor closeContract ([58c4b7f](https://github.com/erxes/erxes/commit/58c4b7f742f66f68ecbbc5362648ce6ef59d43e0))
- loans syncpolaris update ([13a1388](https://github.com/erxes/erxes/commit/13a1388b5b898844c5ae3cafbf1ae87e84b75092))
- polaris type ([b7413a0](https://github.com/erxes/erxes/commit/b7413a04a3a671c61ae58df204afede979231c68))
- pricing filter sidebar ([92eef61](https://github.com/erxes/erxes/commit/92eef6102c4d27cc024f3aa4a7499f66175255e6))
- product form sumuoms ui bug ([1170089](https://github.com/erxes/erxes/commit/1170089233a8756804ceccc83c8410c3354d78b5))
- productplaces ui bug ([554d66b](https://github.com/erxes/erxes/commit/554d66b12d1b6b243d4800e958a3b4e253bacd86))
- savings with productType ([0590431](https://github.com/erxes/erxes/commit/0590431b7120b695aa181ea1b06b2855378d62d9))
- syncerkhet weight ([db1c563](https://github.com/erxes/erxes/commit/db1c5634a070d9292b678310d32fa701882f5e77))

## [1.17.7](https://github.com/erxes/erxes/compare/2.1.0-rc.0...2.1.0-rc.1) (2024-10-24)

### Bug Fixes

- **core:** can't select parent ([ba51397](https://github.com/erxes/erxes/commit/ba513979140d0624f9448ffea273e52172c9fdc4))
- loans contractType with initial stageId at internetBank ([6812df4](https://github.com/erxes/erxes/commit/6812df4124493531382bac6499215a07cf3b5d7d))

### Performance Improvements

- burenScoring customerSidebar ([c610f29](https://github.com/erxes/erxes/commit/c610f299a018ef3a8d834ddb18d57672b616f5e1))

## [1.17.6](https://github.com/erxes/erxes/compare/2.1.0-rc.0...2.1.0-rc.1) (2024-10-22)

### Bug Fixes

- **insight:** remove progress field ([22d8eab](https://github.com/erxes/erxes/commit/22d8eab8f76eb727e28745c508cdfb6e784ef836))
- loans create from deal with contractype ([7f3f9db](https://github.com/erxes/erxes/commit/7f3f9dba4781f1646bdd6192be8a48c44b204080))

## [2.0.6](https://github.com/erxes/erxes/compare/2.1.0-rc.0...2.1.0-rc.1) (2024-11-11)

### Bug Fixes

- **documents:** can't display print button ([cd35668](https://github.com/erxes/erxes/commit/cd35668c1b2091a27452bf33d6245aa2dc57c612))
- **documents:** move documents config of core plugins from core plugin ([1448d6c](https://github.com/erxes/erxes/commit/1448d6c78149c75c002dda9f9875194a693ea961))
- insight chart ([48bb51d](https://github.com/erxes/erxes/commit/48bb51d4c656a136e31a3db15b076960d98ac748))
- msdynamic ([5c6d4dd](https://github.com/erxes/erxes/commit/5c6d4dd2b2d4575782cf56f504fead43a7d70e23))
- msdynamic ([e70c0ab](https://github.com/erxes/erxes/commit/e70c0abc06991382c2b6ae36292779ad8fa1687d))
- msdynamic await ([70c564a](https://github.com/erxes/erxes/commit/70c564a523a54ed4e564a70e8f30b6cf0f49fdbc))
- **payment:** hot fixes ([d9ac969](https://github.com/erxes/erxes/commit/d9ac969cb9b04e4f3b866397702dca574d3fd5b5))
- **pos:** stop close subscription when ordered new order for renewable subscription before end subscription ([b1c4db8](https://github.com/erxes/erxes/commit/b1c4db823577321d3a705fec6a463c98d551fe7e))
- syncdynamic from pos order ([3c3fbc3](https://github.com/erxes/erxes/commit/3c3fbc38b94652b78053e7006b293d33a082b554))
- **widgets:** check process type before access ([37396e9](https://github.com/erxes/erxes/commit/37396e9e46b966dcce116899b09fdcd6b9b552e8))
- with permission on integrations ([e16d1b8](https://github.com/erxes/erxes/commit/e16d1b8cd26ca9b6d1709d2bac3b5a9b2abc4f15))

## [2.0.5](https://github.com/erxes/erxes/compare/2.1.0-rc.0...2.1.0-rc.1) (2024-11-06)

### Bug Fixes

- segments filter for export ([7a47e90](https://github.com/erxes/erxes/commit/7a47e900c996ed8cb3ac4dbe8731136fce6a0f52))

## [2.1.0-rc.0](https://github.com/erxes/erxes/compare/2.0.4...2.1.0-rc.0) (2024-11-06)

### Features

- add endpoint ([1f29c78](https://github.com/erxes/erxes/commit/1f29c785af20a3ca5e464d5f70f037d7558d0865))
- add knowledgebase template ([e946e75](https://github.com/erxes/erxes/commit/e946e752ba02fac5b54b23c96608e711e89d9139))
- add product template ([d1ca792](https://github.com/erxes/erxes/commit/d1ca792afbdbacde540947bedea6744c2cedf44f))
- add sales template ([8e77fc1](https://github.com/erxes/erxes/commit/8e77fc16391e0644e8c3b96bd035c27435261901))
- ebarimt from deal with header and footer ([d5f270f](https://github.com/erxes/erxes/commit/d5f270f9064f849b72712d138ada5bb66d739ba1))
- get related content of main template ([2f2bdf9](https://github.com/erxes/erxes/commit/2f2bdf929dcd22d08f5f7b50c29d5f08877088a3))
- Timeclock request section added, refactor front-end ([0bca59b](https://github.com/erxes/erxes/commit/0bca59bf42ad00b6f17d160753abd4d9ccb06ec4))

### Bug Fixes

- **core:** can't save department parentId ([4d6e53d](https://github.com/erxes/erxes/commit/4d6e53d0704d16265ffb2d51bae03da3467641c1))
- ebarimt customerName optional ([724ac02](https://github.com/erxes/erxes/commit/724ac0268f977b01a60c061668ef7a8a1913ebfb))
- forms can't update field ([c65765c](https://github.com/erxes/erxes/commit/c65765c42a9d3a4f374ef0064e6ac6ab7f275d2c))
- loans and savings subscription when payment paid ([723e949](https://github.com/erxes/erxes/commit/723e949140b7c439dddfe31600ae1d6909efe4cd))
- loans and savings filter by total ([1c4cd64](https://github.com/erxes/erxes/commit/1c4cd644005ed397a2b8a8e42ab9758281353a3c))
- loans refactor ([ac20187](https://github.com/erxes/erxes/commit/ac2018739f47db402955e8131f82108039034d9f))
- loans refactor closeContract ([58c4b7f](https://github.com/erxes/erxes/commit/58c4b7f742f66f68ecbbc5362648ce6ef59d43e0))
- loans syncpolaris update ([13a1388](https://github.com/erxes/erxes/commit/13a1388b5b898844c5ae3cafbf1ae87e84b75092))
- polaris type ([b7413a0](https://github.com/erxes/erxes/commit/b7413a04a3a671c61ae58df204afede979231c68))
- pricing filter sidebar ([92eef61](https://github.com/erxes/erxes/commit/92eef6102c4d27cc024f3aa4a7499f66175255e6))
- product form sumuoms ui bug ([1170089](https://github.com/erxes/erxes/commit/1170089233a8756804ceccc83c8410c3354d78b5))
- productplaces ui bug ([554d66b](https://github.com/erxes/erxes/commit/554d66b12d1b6b243d4800e958a3b4e253bacd86))
- savings with productType ([0590431](https://github.com/erxes/erxes/commit/0590431b7120b695aa181ea1b06b2855378d62d9))
- syncerkhet weight ([db1c563](https://github.com/erxes/erxes/commit/db1c5634a070d9292b678310d32fa701882f5e77))

## [1.17.7](https://github.com/erxes/erxes/compare/2.0.4...2.1.0-rc.0) (2024-10-24)

## [2.0.6](https://github.com/erxes/erxes/compare/2.0.5...2.0.6) (2024-11-11)

### Bug Fixes

- **core:** can't select parent ([ba51397](https://github.com/erxes/erxes/commit/ba513979140d0624f9448ffea273e52172c9fdc4))
- loans contractType with initial stageId at internetBank ([6812df4](https://github.com/erxes/erxes/commit/6812df4124493531382bac6499215a07cf3b5d7d))

### Performance Improvements

- burenScoring customerSidebar ([c610f29](https://github.com/erxes/erxes/commit/c610f299a018ef3a8d834ddb18d57672b616f5e1))

## [1.17.6](https://github.com/erxes/erxes/compare/2.0.4...2.1.0-rc.0) (2024-10-22)

- **documents:** can't display print button ([cd35668](https://github.com/erxes/erxes/commit/cd35668c1b2091a27452bf33d6245aa2dc57c612))
- **documents:** move documents config of core plugins from core plugin ([1448d6c](https://github.com/erxes/erxes/commit/1448d6c78149c75c002dda9f9875194a693ea961))
- insight chart ([48bb51d](https://github.com/erxes/erxes/commit/48bb51d4c656a136e31a3db15b076960d98ac748))
- msdynamic ([5c6d4dd](https://github.com/erxes/erxes/commit/5c6d4dd2b2d4575782cf56f504fead43a7d70e23))
- msdynamic ([e70c0ab](https://github.com/erxes/erxes/commit/e70c0abc06991382c2b6ae36292779ad8fa1687d))
- msdynamic await ([70c564a](https://github.com/erxes/erxes/commit/70c564a523a54ed4e564a70e8f30b6cf0f49fdbc))
- **payment:** hot fixes ([d9ac969](https://github.com/erxes/erxes/commit/d9ac969cb9b04e4f3b866397702dca574d3fd5b5))
- **pos:** stop close subscription when ordered new order for renewable subscription before end subscription ([b1c4db8](https://github.com/erxes/erxes/commit/b1c4db823577321d3a705fec6a463c98d551fe7e))
- syncdynamic from pos order ([3c3fbc3](https://github.com/erxes/erxes/commit/3c3fbc38b94652b78053e7006b293d33a082b554))
- **widgets:** check process type before access ([37396e9](https://github.com/erxes/erxes/commit/37396e9e46b966dcce116899b09fdcd6b9b552e8))
- with permission on integrations ([e16d1b8](https://github.com/erxes/erxes/commit/e16d1b8cd26ca9b6d1709d2bac3b5a9b2abc4f15))

## [2.0.5](https://github.com/erxes/erxes/compare/2.0.4...2.0.5) (2024-11-06)

### Bug Fixes

- **insight:** remove progress field ([22d8eab](https://github.com/erxes/erxes/commit/22d8eab8f76eb727e28745c508cdfb6e784ef836))
- loans create from deal with contractype ([7f3f9db](https://github.com/erxes/erxes/commit/7f3f9dba4781f1646bdd6192be8a48c44b204080))

## [2.0.4](https://github.com/erxes/erxes/compare/2.0.3...2.0.4) (2024-11-06)

### Features

- add car option to contact dimension ([1caa705](https://github.com/erxes/erxes/commit/1caa705ba57ea6d49acb6a170255142ef33f1654))
- add dimension ([3aa270e](https://github.com/erxes/erxes/commit/3aa270eef07ef443ee757a3a280fc46c4639e100))
- add dimension ([6b99364](https://github.com/erxes/erxes/commit/6b99364739a04d8e6d55e02ab7f2a72e4b38b912))
- add subfield for insight ([d1e5229](https://github.com/erxes/erxes/commit/d1e5229997d7ece18358f1f17e9b7f68eb8bc07c))
- **clientportal:** default language and seperate cards into ticket, deal, task, purchase plugins ([#5780](https://github.com/erxes/erxes/issues/5780)) ([91d6930](https://github.com/erxes/erxes/commit/91d6930bdb66324503c77b4e09ca7e2526f94ba3))
- **loans:** add functionality to export loan transactions ([151fb03](https://github.com/erxes/erxes/commit/151fb031bd0b521fb697fa78f033015ac4789b02))
- **loans:** add functionality to export saving transactions ([39af6db](https://github.com/erxes/erxes/commit/39af6db91bc026886a87db6faa6b27b6ea7ee43b))
- **savings:** add functionality to export saving transactions ([353c953](https://github.com/erxes/erxes/commit/353c9537ecd23b81c10f8cd5f9e6872e69c00a2b))

### Bug Fixes

- **calls:** added timezone ([236aa5c](https://github.com/erxes/erxes/commit/236aa5ca92a2fe6cd8c40ee681f5cbd6ff6fd051))
- **calls:** sometimes not saved call history ([b424c6d](https://github.com/erxes/erxes/commit/b424c6d64a2f311cd7bd836838deb741a2261223))
- **core:** check inbox enabled before send message to inbox ([ecfcc7e](https://github.com/erxes/erxes/commit/ecfcc7e3d087785057d9e5eb3aa21e331ebafeaa))
- ebarimt with description on sales ([b8bff50](https://github.com/erxes/erxes/commit/b8bff50a7cd96a65dca38bddb1b6a254b94fb0b8))

### Reverts

- **widgets:** fallback to older version ([#5766](https://github.com/erxes/erxes/issues/5766)) ([3f6c69a](https://github.com/erxes/erxes/commit/3f6c69a249a1ac6795ed41e859f51a5472d0bf3d))

## [2.0.3](https://github.com/erxes/erxes/compare/2.0.2...2.0.3) (2024-10-29)

## [2.0.2](https://github.com/erxes/erxes/compare/2.0.1...2.0.2) (2024-10-29)

## [2.0.1](https://github.com/erxes/erxes/compare/1.19.0-rc.0...2.0.1) (2024-10-29)

### Features

- add handle3secondjob cronjob ([b83831e](https://github.com/erxes/erxes/commit/b83831e831014d89ce83ea981205caf5acfe7b30))
- add transifix some files ([1b81cff](https://github.com/erxes/erxes/commit/1b81cff0bd6e72784aaeb59748615b2855ab859d))
- **core:** add support for HWP and HWPX file types ([#5694](https://github.com/erxes/erxes/issues/5694)) ([55bb435](https://github.com/erxes/erxes/commit/55bb435ce15d3876b2bed4228f047c7af82107bf))
- implement azure blob storage file management ([c257039](https://github.com/erxes/erxes/commit/c2570394f52e7688fff2e55675a46a263b66bfdd))
- improve query handling ([a140a2f](https://github.com/erxes/erxes/commit/a140a2f1bde18d491f04ecda15224baa40ff7eea))
- insight query handling ([#5717](https://github.com/erxes/erxes/issues/5717)) ([12d304e](https://github.com/erxes/erxes/commit/12d304efda0d4f5fdb1603ec3d25bcf0bbd820f0))
- **knowledgebase:** add functionality to handle large pdf file ([#5712](https://github.com/erxes/erxes/issues/5712)) ([b6f3c3c](https://github.com/erxes/erxes/commit/b6f3c3c43ba36f256c00e4f265961a5b2d2d61b4))
- navigate add on car row component ([8a35eb7](https://github.com/erxes/erxes/commit/8a35eb751e03a4702833943a8fc8579d1cbe1a47))
- **payment:** introduce Stripe as new payment method ([#5708](https://github.com/erxes/erxes/issues/5708)) ([7efa064](https://github.com/erxes/erxes/commit/7efa064839f1c0e28de5b2d0269509f0c9a56de9))
- **sales:** sidebar section always noSkipArchive: true ([09a71a9](https://github.com/erxes/erxes/commit/09a71a9feee72d47483724ead8387ea00e6982f5))
- timeclock schedule config update, location added back-end and front-end, ([21d5f80](https://github.com/erxes/erxes/commit/21d5f809a04724561f01e12c5b4bd5e41233425a))

### Bug Fixes

- add document on product ([036750c](https://github.com/erxes/erxes/commit/036750c7486f6c67c4632da2ecda9c1742ba863b))
- cars list ([9a8dc5f](https://github.com/erxes/erxes/commit/9a8dc5fcddf106dcd9cd7261457018497e87fc7b))
- cars list ([6cc31df](https://github.com/erxes/erxes/commit/6cc31df4596af34b75bb955b9ec9324b2b21246b))
- contacts & products import ([36f11ef](https://github.com/erxes/erxes/commit/36f11efeeed30d02904f263f6fff7b15dacdc357))
- contacts & products import ([510199a](https://github.com/erxes/erxes/commit/510199aed09550d5852d9a1f5ef50f24404afceb))
- contacts custom list view ([59400f8](https://github.com/erxes/erxes/commit/59400f819608e9c0e529a31af03a79f2f4283fe6))
- core-api delay check ([f509724](https://github.com/erxes/erxes/commit/f509724e023d884fd7fc2b95aaac7d6a3d7ff463))
- **core-ui:** fix form description ([5de9c40](https://github.com/erxes/erxes/commit/5de9c403776af70898c641431e319868baae8c79))
- **core:** add missing searchValue params of forms query ([6c33377](https://github.com/erxes/erxes/commit/6c33377559d97f375d8b864a20603da303a7bddf))
- **core:** fix pagination in forms list ([fdf2fa4](https://github.com/erxes/erxes/commit/fdf2fa4ba140c5c838ed72953d677b3b1307376c))
- **core:** resolve issue with readFile not returning WebP image from Cloudflare ([1e937fc](https://github.com/erxes/erxes/commit/1e937fc1dd185657c35876461e1c2294fcee766f))
- **core:** update verifier callback url ([edbd144](https://github.com/erxes/erxes/commit/edbd1444b165109ba6184a443bbd67f59d4a6226))
- custom field for aggregation ([1564b10](https://github.com/erxes/erxes/commit/1564b10f20eed1b0db60231e1396d77c29cf5c12))
- customers.prepareEngageCustomers ([6da32ab](https://github.com/erxes/erxes/commit/6da32abaff9d483a6897fc49002accdacee655d8))
- **engages:** add missing 'Host' value to the Amazon SES email header to ensure proper email tracking ([d8af2f7](https://github.com/erxes/erxes/commit/d8af2f7f76d48ee03438417e5daac882777053f3))
- **engages:** add missing 'Host' value to the Amazon SES email header to ensure proper email tracking ([4dc1bee](https://github.com/erxes/erxes/commit/4dc1beefa9533fe5c275f9c5295770a2e868e517))
- **engages:** engageTracker handle both SaaS and opensource SES events and SNS notifications, with better error handling. ([eb05a17](https://github.com/erxes/erxes/commit/eb05a17d5d4a410df0197fd694abbd6aafa76783))
- **engages:** engageTracker handle both SaaS and opensource SES events and SNS notifications, with better error handling ([f97ccbe](https://github.com/erxes/erxes/commit/f97ccbedf15e3caa0cbd106330af3f5ac47a0c45))
- **engages:** get ses configset using getValueAsString([#5678](https://github.com/erxes/erxes/issues/5678)) ([52907d9](https://github.com/erxes/erxes/commit/52907d97c4a8dc245cda3b74c0410e92ff42e45e))
- **engages:** skip cronjob if subdomain not found ([627ce35](https://github.com/erxes/erxes/commit/627ce35e1cb979d883b275e15033d189ef0a52e6))
- engageUtils ([9165701](https://github.com/erxes/erxes/commit/916570170b6e8522695d7fa8c645d7da3c2228b0))
- export fix core ([#5705](https://github.com/erxes/erxes/issues/5705)) ([2c852c6](https://github.com/erxes/erxes/commit/2c852c615fdbff63810a595484da32964adfb349))
- **facebook:** can't send bot message ([fe35b4d](https://github.com/erxes/erxes/commit/fe35b4d55c317dd4e79c6c8795dca277d629e3d1))
- **facebook:** can't send bot message ([11cbc51](https://github.com/erxes/erxes/commit/11cbc51b91d45087c5c4e6d9dbcc06211e5facda))
- **facebook:** Improved handling of media uploads with enhanced support for AWS S3 as the storage service, Facebook post, comment code refactor ([6089025](https://github.com/erxes/erxes/commit/6089025c7a88292743e913c9f9ea3f5c2982cc5b))
- fix cards filter by pipeline labels ([ff5fa97](https://github.com/erxes/erxes/commit/ff5fa97dc43050f0e045cc83df564b2a94ab4b3c))
- form export url ([4832fa7](https://github.com/erxes/erxes/commit/4832fa7d2f726f4988f03a45c1b9146f1b6c6ee0))
- inventories permission ([718f0c9](https://github.com/erxes/erxes/commit/718f0c92405f600d9083c64b28c1eca9179cb3dd))
- inventories remainders permissions ([62d1d61](https://github.com/erxes/erxes/commit/62d1d611c41c67352c2d9462df58ab3bf36d95c7))
- **knowledgebase:** fix cors options ([07170fb](https://github.com/erxes/erxes/commit/07170fb555300f4bb13ce95a414303310638cedf))
- **knowledgebase:** skip cronjob if subdomain not found ([4cc055d](https://github.com/erxes/erxes/commit/4cc055d2d19836195b52051b3fe855350c936a14))
- **knowledgebase:** skip cronjob if subdomain not found ([bcc804f](https://github.com/erxes/erxes/commit/bcc804ff14087df07781e55831f66544e3ff328c))
- msdynamic products remainder ([beb2bcb](https://github.com/erxes/erxes/commit/beb2bcb255e6d0a78a2d7b7afce475df6939fbec))
- msdynamic products remainder ([6f34735](https://github.com/erxes/erxes/commit/6f3473509e4bebcb8e879c77812dbcb2039cbf8c))
- **payment:** fix payment config form while editing payment ([4cc6459](https://github.com/erxes/erxes/commit/4cc645998c78214b3c8603f0fbca4fab36f96830))
- **payment:** fix payment form initial states ([9fd1d95](https://github.com/erxes/erxes/commit/9fd1d95c6b4886a826fcbb4bfab2eb5b5ba2fab0))
- posclient contacts and products messageBroker ([599deab](https://github.com/erxes/erxes/commit/599deab4ee798bb6f5fe8aa2704eebb4350a4eb7))
- **pos:** slots builder ui ([bd24375](https://github.com/erxes/erxes/commit/bd243754349c3a5f552f5d590469e143ae35e1fc))
- prepareEngageCustomers ([bd2a201](https://github.com/erxes/erxes/commit/bd2a201b90e7c7ae19dfa794858c15686951b568))
- **pricing:** save bug ([2b71e3f](https://github.com/erxes/erxes/commit/2b71e3f0d963f360f68e5f344ab5a82b71894b91))
- product description field ([f183bed](https://github.com/erxes/erxes/commit/f183bed371b1b6c2f4b4b5edcdf79ae47714d2f6))
- products add barcode ([225a466](https://github.com/erxes/erxes/commit/225a4660316dce01f0ce339add2608bfac80560e))
- products filter by has image ([1c8c491](https://github.com/erxes/erxes/commit/1c8c491aa600c06c8ca7fedaefeaf7a7ec24b805))
- restraunt print ([#5699](https://github.com/erxes/erxes/issues/5699)) ([88571f8](https://github.com/erxes/erxes/commit/88571f803bc0bb8954ad47bf3684fac9ad5fad00))
- search navigation ([1224060](https://github.com/erxes/erxes/commit/1224060a1efa6081e70faf803ee3e8fb3da858ea))
- some broker channel ([55eca34](https://github.com/erxes/erxes/commit/55eca349c746fa3d71bcc43cd77e9ef266e84ec0))
- some paths ([4daee48](https://github.com/erxes/erxes/commit/4daee489c9b786ffeab9c260bd8277dda3682230))
- syncerkhet check orders sidebar ([8e1adbf](https://github.com/erxes/erxes/commit/8e1adbf762814273f8a0edb891ca5a6685bd7b9f))
- syncerkhet with products aftermutation ([06f7c5e](https://github.com/erxes/erxes/commit/06f7c5e66b673795c7b99312821bbcef38becdef))
- widgets css load ([f406e00](https://github.com/erxes/erxes/commit/f406e0076653770b215a5187dbeb31ad428c6295))
- widgets get env ([a20a860](https://github.com/erxes/erxes/commit/a20a86025d2c674f81a7c2d31970f0cd6a21b9d0))
- widgets graphql errors ([61c79d5](https://github.com/erxes/erxes/commit/61c79d56ba7651e7c9dc929b7332edffccac9be8))
- **widgets:** enhance getEnv to support both open-source and SaaS versions ([#5680](https://github.com/erxes/erxes/issues/5680)) ([b3989a5](https://github.com/erxes/erxes/commit/b3989a5e4cf794efbe0ceaf1acfe265b734c2b47))
- xyp configs update ([b16bc96](https://github.com/erxes/erxes/commit/b16bc96d1272a7f1eb759e9b4c9afcafe7a9d382))
- xyp fetched view ([289f5c9](https://github.com/erxes/erxes/commit/289f5c9e4dfb90ec89bc62421889b4c12f5a3e8f))

### Reverts

- **widgets:** fallback to previous version ([4516136](https://github.com/erxes/erxes/commit/45161366fa5e8102f5f9b20e7b190bc58dce6949))

## [1.17.5](https://github.com/erxes/erxes/compare/1.19.0-rc.0...2.0.1) (2024-10-07)

### Bug Fixes

- checkCompany rd or tin format ([115d9b3](https://github.com/erxes/erxes/commit/115d9b346f1191ec5e15761e968bd0fb65c57db0))
- pos orders description to deals description ([1d2da1d](https://github.com/erxes/erxes/commit/1d2da1dc46f34b8e76f6742bff77d09b46900026))
- **pos:** delivery deal ([5ce51a8](https://github.com/erxes/erxes/commit/5ce51a816c8555f9534c56fd4e9febea9ed51b7b))
- **pos:** offline pos not connected rmq then not crash ([4a3a3a5](https://github.com/erxes/erxes/commit/4a3a3a57d0b7d8922b20868d8225b1ddea63dd31))
- select labels on form ([d6f17e0](https://github.com/erxes/erxes/commit/d6f17e045f79416ffc9012578256a60e6477e593))

## [1.17.4](https://github.com/erxes/erxes/compare/1.19.0-rc.0...2.0.1) (2024-10-03)

### Bug Fixes

- pos kitchen reciept filter item ([#5663](https://github.com/erxes/erxes/issues/5663)) ([cde56b0](https://github.com/erxes/erxes/commit/cde56b0000d629fe16a5dbde149e7b30a294a2be))

## [1.17.3](https://github.com/erxes/erxes/compare/1.19.0-rc.0...2.0.1) (2024-10-03)

## [1.17.2](https://github.com/erxes/erxes/compare/1.19.0-rc.0...2.0.1) (2024-10-03)

### Bug Fixes

- **exm:** deleted mutation ([edfef53](https://github.com/erxes/erxes/commit/edfef539d9410d60ebaee6768c4f8d71e734d394))
- **instagram:** many comments ([d5a1163](https://github.com/erxes/erxes/commit/d5a1163cd8ced8cd7b098404d65b082d9e418e29))
- **instagram:** profile pictures fixed ([ed654aa](https://github.com/erxes/erxes/commit/ed654aa3e7b8fc98892b4f738253c6a66db0b1e9))
- **instagram:** unknown message ([7a7ba91](https://github.com/erxes/erxes/commit/7a7ba91b58dbd539833aab65fe75a0261be65919))
- omz some bugs ([c7693d3](https://github.com/erxes/erxes/commit/c7693d3091a7d76a1e397780d7f792a9bd044855))
- **pos:** can't extend close date on subscription ([b47504d](https://github.com/erxes/erxes/commit/b47504dac2acf1b7966b6ac6596fd20703209fe7))
- **pos:** loading khan improve ([#5660](https://github.com/erxes/erxes/issues/5660)) ([8d3cb81](https://github.com/erxes/erxes/commit/8d3cb81b35bd5b799aab7efb600425ad9c8c5f9d))
- **pos:** market theme checkout ([fe4badb](https://github.com/erxes/erxes/commit/fe4badbcf8610d1d4203c896013532312bc66bb8))
- **pos:** offline pos payments ([f0d4e20](https://github.com/erxes/erxes/commit/f0d4e20c625b837d5ff3511f1792b67de78d7198))
- **pos:** sendData ([0f702b1](https://github.com/erxes/erxes/commit/0f702b1abc3b0494c00f75600147de57bb9233e2))
- product attachment preview ([a070455](https://github.com/erxes/erxes/commit/a07045550170c86072c0d8ba9616365d7132d5de))
- syncpolaris dynamic data sender ([6a756eb](https://github.com/erxes/erxes/commit/6a756ebfab2fee7e7b124c7e15f76869ee7ea7f2))
- syncpolaris settings ([b58cc12](https://github.com/erxes/erxes/commit/b58cc12b31fdbc57315aa45fa8a06f2d7713376b))
- syncpolaris settings bug ([d9e565b](https://github.com/erxes/erxes/commit/d9e565b3e97adf96f07ff76f2c0374154a375e86))

## [1.17.1](https://github.com/erxes/erxes/compare/1.19.0-rc.0...2.0.1) (2024-09-23)

### Features

- show remainder when hover on remainder ([#5646](https://github.com/erxes/erxes/issues/5646)) ([8984713](https://github.com/erxes/erxes/commit/8984713799992364a79427c0c209ad933542b295))

### Bug Fixes

- Pos direct discount on market theme ([#5639](https://github.com/erxes/erxes/issues/5639)) ([b71e272](https://github.com/erxes/erxes/commit/b71e2725c4a8429acb5bcadc167efb4bdf418528))
- pos remainders on hower ([#5647](https://github.com/erxes/erxes/issues/5647)) ([af46db9](https://github.com/erxes/erxes/commit/af46db94c8598f16984e52b0ea4f9d6cc30f2e58))
- posOrder ebarimt totalAmount with round ([6a301ee](https://github.com/erxes/erxes/commit/6a301ee5dd87f4457bb6a92f4bebf495890722d3))
- posOrder ebarimt totalAmount with round ([134b446](https://github.com/erxes/erxes/commit/134b446915c75640ee8a39d773961ce694026089))
- xyp data sync refactor ([535c854](https://github.com/erxes/erxes/commit/535c8542e910f26d77567b9f6075f9188329a32b))
- xyp util ([92b9b38](https://github.com/erxes/erxes/commit/92b9b386294d43788ae6ebc9e1f7bd20f8cd50c6))

## [1.19.0-rc.0](https://github.com/erxes/erxes/compare/2.0.0...1.19.0-rc.0) (2024-10-08)

### Bug Fixes

- **calls:** possible to call audio playback and show email of widget call contacts ([4df963f](https://github.com/erxes/erxes/commit/4df963fad0458746024f9275699727062cb0ce0c))
- **calls:** save extension number on missed call ([f5b38bc](https://github.com/erxes/erxes/commit/f5b38bc53fa98122ae7640f3af6db54b31a117ac))
- cards select board ([1b74f9a](https://github.com/erxes/erxes/commit/1b74f9a66c256c7296c19cdf55dba6d66684812b))
- contacts segment ([db7288c](https://github.com/erxes/erxes/commit/db7288c5c82f9452029992f3bd61a336853ef4e4))
- engage query lint ([647d9fb](https://github.com/erxes/erxes/commit/647d9fb002dc14afdcb59c231ae5664dad098dc6))
- **facebook:** content format ,subscription read users ([7bd6a45](https://github.com/erxes/erxes/commit/7bd6a45ba1e4ac7c8d0cedc3e6b0cdf272e05b72))
- fix tasks checklist refetch query ([3b0a124](https://github.com/erxes/erxes/commit/3b0a124e47d99196eadddb3fa04983183f457b69))
- **forms:** can't save builded form when isReadyToSave ([865e99f](https://github.com/erxes/erxes/commit/865e99f8428ab5d353733814c7eddd2921b82572))
- integrations query schema ([9d96197](https://github.com/erxes/erxes/commit/9d961973a3db3eb0787a1f78d64a11df8fde87d6))
- **widgets-messenger:** set launcher iframe's color-scheme ([20c3446](https://github.com/erxes/erxes/commit/20c3446cdb3cd58116001b3cd7bbffb81f230472))

### Performance Improvements

- **calls:** write the missed call ([00ab101](https://github.com/erxes/erxes/commit/00ab101ddc3779ab7ee597138236a27bb45e4b7c))
- **inbox:** add FileDrop for file uploads and resolve facebook issues with function attachments ([eaac03c](https://github.com/erxes/erxes/commit/eaac03ce7abcc8dfe93167997f34afc5d2ccd302))

## [2.0.0](https://github.com/erxes/erxes/compare/1.18.0-rc.0...2.0.0) (2024-09-20)

## [1.17.5](https://github.com/erxes/erxes/compare/1.17.4...1.17.5) (2024-10-07)

### Bug Fixes

- checkCompany rd or tin format ([115d9b3](https://github.com/erxes/erxes/commit/115d9b346f1191ec5e15761e968bd0fb65c57db0))
- pos orders description to deals description ([1d2da1d](https://github.com/erxes/erxes/commit/1d2da1dc46f34b8e76f6742bff77d09b46900026))
- **pos:** delivery deal ([5ce51a8](https://github.com/erxes/erxes/commit/5ce51a816c8555f9534c56fd4e9febea9ed51b7b))
- **pos:** offline pos not connected rmq then not crash ([4a3a3a5](https://github.com/erxes/erxes/commit/4a3a3a57d0b7d8922b20868d8225b1ddea63dd31))

## [1.17.4](https://github.com/erxes/erxes/compare/1.17.3...1.17.4) (2024-10-03)

### Bug Fixes

- pos kitchen reciept filter item ([#5663](https://github.com/erxes/erxes/issues/5663)) ([cde56b0](https://github.com/erxes/erxes/commit/cde56b0000d629fe16a5dbde149e7b30a294a2be))

## [1.17.3](https://github.com/erxes/erxes/compare/1.17.2...1.17.3) (2024-10-03)

## [1.17.2](https://github.com/erxes/erxes/compare/1.17.1...1.17.2) (2024-10-03)

### Bug Fixes

- **pos:** can't extend close date on subscription ([b47504d](https://github.com/erxes/erxes/commit/b47504dac2acf1b7966b6ac6596fd20703209fe7))
- **pos:** loading khan improve ([#5660](https://github.com/erxes/erxes/issues/5660)) ([8d3cb81](https://github.com/erxes/erxes/commit/8d3cb81b35bd5b799aab7efb600425ad9c8c5f9d))
- **pos:** market theme checkout ([fe4badb](https://github.com/erxes/erxes/commit/fe4badbcf8610d1d4203c896013532312bc66bb8))
- **pos:** offline pos payments ([f0d4e20](https://github.com/erxes/erxes/commit/f0d4e20c625b837d5ff3511f1792b67de78d7198))
- **pos:** sendData ([0f702b1](https://github.com/erxes/erxes/commit/0f702b1abc3b0494c00f75600147de57bb9233e2))
- product attachment preview ([a070455](https://github.com/erxes/erxes/commit/a07045550170c86072c0d8ba9616365d7132d5de))

## [1.17.1](https://github.com/erxes/erxes/compare/1.18.0-rc.0...1.17.1) (2024-09-23)

### Features

- show remainder when hover on remainder ([#5646](https://github.com/erxes/erxes/issues/5646)) ([8984713](https://github.com/erxes/erxes/commit/8984713799992364a79427c0c209ad933542b295))

### Bug Fixes

- posOrder ebarimt totalAmount with round ([134b446](https://github.com/erxes/erxes/commit/134b446915c75640ee8a39d773961ce694026089))

## [1.18.0-rc.0](https://github.com/erxes/erxes/compare/1.17.0...1.18.0-rc.0) (2024-09-17)

### Bug Fixes

- **core:** fix tagsTag mutation ([bae5118](https://github.com/erxes/erxes/commit/bae5118bd56562112baffdf1c44c2987bc6fcd9c))

## [2.0.0-rc.0](https://github.com/erxes/erxes/compare/1.18.0-rc.0...2.0.0) (2024-08-18)

### Bug Fixes

- fix typescript any types ([6f254b6](https://github.com/erxes/erxes/commit/6f254b654973f79036a6b30c810f0e386ff9f61a))

### Features

- **contacts:** Implement SaaS-specific restrictions and enhancements ([1fe8ce7](https://github.com/erxes/erxes/commit/1fe8ce7f46f8445f33af0b1e8b466899ba474323))
- **knowledgebase:** add scheduling feature for future article publishing ([99b0373](https://github.com/erxes/erxes/commit/99b03737fc5d18577c4a3532944389da29c4e53c))

### Bug Fixes

- msdynamic with reserve remainder ([e01c6cd](https://github.com/erxes/erxes/commit/e01c6cd6e0308f91e5b927a9a4b0d9eba1204321))

## [1.15.0](https://github.com/erxes/erxes/compare/1.16.0-rc.0...1.16.0-rc.1) (2024-08-23)

## [1.16.0-rc.0](https://github.com/erxes/erxes/compare/1.15.0-rc.11...1.16.0-rc.0) (2024-08-26)

### Features

- **calls:** Added realtime dashboard ([bef1bf2](https://github.com/erxes/erxes/commit/bef1bf2186c97310533c60cfcf7fea055f371836))

### Bug Fixes

- **cards:** fix bugs cards insights ([5df88f3](https://github.com/erxes/erxes/commit/5df88f33e844fdb0afaa186b68b32752c7704536))
- **cards:** name auto field ([#5593](https://github.com/erxes/erxes/issues/5593)) ([4251eda](https://github.com/erxes/erxes/commit/4251eda6ef9ae4c3efcb4bf4e51392e2850aa6f8))
- customers searchText with middleName ([def9620](https://github.com/erxes/erxes/commit/def9620cf11acbae9e5b3d5a44537fa6aa62f5a5))
- deal to contract ([#5544](https://github.com/erxes/erxes/issues/5544)) ([df8e8fb](https://github.com/erxes/erxes/commit/df8e8fb60835f37630d0df72dce763deb8d9fa3e))
- duplicated ebarimt re return ([5988deb](https://github.com/erxes/erxes/commit/5988deb022aebb921b0dc139442cb1c1ac9702b1))
- **facebook:** fixed old conversation and added avatar ([70284aa](https://github.com/erxes/erxes/commit/70284aa4559a00fd9a79f85afd1d0645bd24cea9))
- Golomt corporate updates ([#5523](https://github.com/erxes/erxes/issues/5523)) ([ab8a7fa](https://github.com/erxes/erxes/commit/ab8a7fa31f005a1ea605898cbdd1f29c4946f57e))
- loans contract form fill by cards and contacts ([#5584](https://github.com/erxes/erxes/issues/5584)) ([8e90bb5](https://github.com/erxes/erxes/commit/8e90bb59910b43f3822121782dcdfa2b1b8ea23d))
- loans contract relation deal ([48695be](https://github.com/erxes/erxes/commit/48695be742f7748e7718b0bd11800490ee99e54d))
- msdynamic external_doc_no and posOrder to cards with payment ([effe8ad](https://github.com/erxes/erxes/commit/effe8adf1d2a742b0e4320b7da14adcb7b8bd7f1))
- pos mobile print ([#5565](https://github.com/erxes/erxes/issues/5565)) ([96ad3f7](https://github.com/erxes/erxes/commit/96ad3f72671adf2cec63aebacd1cf37308b04857))
- **reactions:** replace mongoose exists query with countDocuments to return boolean in isHearted & isLiked ([344c5d4](https://github.com/erxes/erxes/commit/344c5d42cebdd3b2e57b6949ba9960399dedc92a))
- register number duplicated get CIF from polaris ([#5586](https://github.com/erxes/erxes/issues/5586)) ([d3f9380](https://github.com/erxes/erxes/commit/d3f9380a2e77467ca461e33a282ef4773cec4379))
- selectWithSearch with exact filter ([#5581](https://github.com/erxes/erxes/issues/5581)) ([af945c7](https://github.com/erxes/erxes/commit/af945c7778c74e3f51dfb3e216d5d20fadf3be9d))
- syncpolaris logs headers show ([6df0f44](https://github.com/erxes/erxes/commit/6df0f44dd8ae88bb2831b895ef336539405b9491))
- syncpolaris save header ([df4ecef](https://github.com/erxes/erxes/commit/df4ecef2ef89c359eab3fb17cbb907e6365e3e1d))
- syncpolaris save sendData ([e71aabe](https://github.com/erxes/erxes/commit/e71aabe14519887830abe2f302329758e80b2b29))
- TransferInputGolomt ([876c733](https://github.com/erxes/erxes/commit/876c733c2ab769055d0731d1eacc85ce65c2caad))

### Performance Improvements

- slot ux improvement of restaurant theme ([#5563](https://github.com/erxes/erxes/issues/5563)) ([486d613](https://github.com/erxes/erxes/commit/486d613cd73f9f98ac79511dfb8d4ea767fe161a))

## [1.15.0-rc.14](https://github.com/erxes/erxes/compare/1.15.0-rc.13...1.15.0-rc.14) (2024-08-15)

## [1.15.0-rc.13](https://github.com/erxes/erxes/compare/1.15.0-rc.12...1.15.0-rc.13) (2024-08-14)

### Features

- **calls:** Added realtime dashboard ([bef1bf2](https://github.com/erxes/erxes/commit/bef1bf2186c97310533c60cfcf7fea055f371836))

## [1.15.0-rc.12](https://github.com/erxes/erxes/compare/1.15.0-rc.11...1.15.0-rc.12) (2024-08-14)

### Bug Fixes

- msdynamic external_doc_no and posOrder to cards with payment ([effe8ad](https://github.com/erxes/erxes/commit/effe8adf1d2a742b0e4320b7da14adcb7b8bd7f1))

## [1.15.0-rc.11](https://github.com/erxes/erxes/compare/1.15.0-rc.10...1.15.0-rc.11) (2024-08-12)

## [1.15.0-rc.10](https://github.com/erxes/erxes/compare/1.15.0-rc.9...1.15.0-rc.10) (2024-08-12)

### Bug Fixes

- **cards:** auto name field ([0d80278](https://github.com/erxes/erxes/commit/0d8027851dd5889bb62c1a25272ba33ac60e6e63))
- change brand on pos ([4178e05](https://github.com/erxes/erxes/commit/4178e0571ef3513464bb177f0fadd047c90f0c6e))
- ebarimt duplicated refactor ([c894110](https://github.com/erxes/erxes/commit/c89411083d9299688a63f8ba1d2e3d45119f725e))
- msdynamic order update and customer check ([#5578](https://github.com/erxes/erxes/issues/5578)) ([91f74d1](https://github.com/erxes/erxes/commit/91f74d11238184915daf6a8dd4c3e8fdc9f9032e))
- msdynamic send sales line save data ([e06e079](https://github.com/erxes/erxes/commit/e06e079164dcaf63d8dc816eaec52f88c0be4b6c))
- **reactions:** replace mongoose exists query with countDocuments to return boolean in isHearted & isLiked ([0d5fa13](https://github.com/erxes/erxes/commit/0d5fa138e99506808429a43ae92f052a8f60000b))

## [1.15.0-rc.9](https://github.com/erxes/erxes/compare/1.15.0-rc.8...1.15.0-rc.9) (2024-08-07)

### Bug Fixes

- **core:** add error handler in experience customCode ([c4c4851](https://github.com/erxes/erxes/commit/c4c485142c2f441fca16d7226c26663d3788af59))

## [1.14.2](https://github.com/erxes/erxes/compare/1.15.0-rc.8...1.15.0-rc.9) (2024-08-04)

### Bug Fixes

- **core:** add ability create brand consumer in message broker ([02f1b80](https://github.com/erxes/erxes/commit/02f1b8051cae249eb96363856889685ccd4c63fb))
- **instagram:** fix instagram crash on recieve ([01d0a04](https://github.com/erxes/erxes/commit/01d0a040739557362b4829143f85f70dd761f7ce))
- **instagram:** fixed messenger receiver ([7e904fa](https://github.com/erxes/erxes/commit/7e904fa516856175f9bcb584c5eab1c7d9dfbfe4))

### Performance Improvements

- **welcome:** Add saas welcome ([#5558](https://github.com/erxes/erxes/issues/5558)) ([b1bf188](https://github.com/erxes/erxes/commit/b1bf188fe280d875dffde462f2ad2dfaccb7b264))

## [1.15.0-rc.8](https://github.com/erxes/erxes/compare/1.15.0-rc.7...1.15.0-rc.8) (2024-08-05)

### Bug Fixes

- msdynamic show content ([ad4f1e2](https://github.com/erxes/erxes/commit/ad4f1e2d9b9966f4edc9e1b88c8d501f75154e7a))
- **widgets:** replace AppConsumer and WithContext HOC with hooks for prop management ([e719371](https://github.com/erxes/erxes/commit/e719371d6ff7ebf8a12c64764e1919e73fd4a435))

## [1.15.0-rc.7](https://github.com/erxes/erxes/compare/1.15.0-rc.6...1.15.0-rc.7) (2024-08-02)

### Bug Fixes

- **core:** remove return into for loop in sendmail ([233546d](https://github.com/erxes/erxes/commit/233546df1bcce37666c7be7fa82bd94ef35ac598))

## [1.15.0-rc.6](https://github.com/erxes/erxes/compare/1.15.0-rc.5...1.15.0-rc.6) (2024-07-30)

### Features

- **messenger:** enable dynamic configuration for external links ([4bce69a](https://github.com/erxes/erxes/commit/4bce69a88618a9578a80c770999ec8d4f35e7b1b))

- **instagram:** fixed repair button ([5a9fd08](https://github.com/erxes/erxes/commit/5a9fd080f29415ef4fa13c2c9001301beade0e46))

## [1.15.0-rc.4](https://github.com/erxes/erxes/compare/1.15.0-rc.4...1.15.0-rc.5) (2024-07-23)

### Bug Fixes

## [1.15.0-rc.2](https://github.com/erxes/erxes/compare/1.15.0-rc.4...1.15.0-rc.5) (2024-07-19)

- **cards:** name auto field ([174f482](https://github.com/erxes/erxes/commit/174f482e1ef59de83dc3e3b589454d008d303eb2))

### Bug Fixes

### Features

- clientportal dropdown items and saving little bug ([#5477](https://github.com/erxes/erxes/issues/5477)) ([fa32e14](https://github.com/erxes/erxes/commit/fa32e149d2bfbace470f827daaba00f772c8168a))
- khanbank method ([#5466](https://github.com/erxes/erxes/issues/5466)) ([dcc9f68](https://github.com/erxes/erxes/commit/dcc9f68f2fb0a533fa171a60a6976eb03a9035b1))
- pos slots query ([#5473](https://github.com/erxes/erxes/issues/5473)) ([a909dde](https://github.com/erxes/erxes/commit/a909dde6fa09f0e30b10541d37efd645480e95dd))

## [1.14.1](https://github.com/erxes/erxes/compare/1.15.0-rc.4...1.15.0-rc.5) (2024-07-25)

- **instagram:** fix instagram crash on recieve ([01d0a04](https://github.com/erxes/erxes/commit/01d0a040739557362b4829143f85f70dd761f7ce))

### Features

- payment invoice paid then to syncerkhet from third systems data ([#5543](https://github.com/erxes/erxes/issues/5543)) ([dd95a4a](https://github.com/erxes/erxes/commit/dd95a4a1a35c9fe66c8eaa916d16b1e400929404))

### Bug Fixes

- inbox hooks ([1716603](https://github.com/erxes/erxes/commit/17166034412e24a0c5fb214642d3781e134f652e))
- pos orders filter ([5a96f58](https://github.com/erxes/erxes/commit/5a96f58263b382e440e8fd196ba757202dce99b5))

## [1.15.0-rc.4](https://github.com/erxes/erxes/compare/1.15.0-rc.3...1.15.0-rc.4) (2024-07-23)

### Bug Fixes

- **cards:** properties remove from card when close modal ([08b8ce4](https://github.com/erxes/erxes/commit/08b8ce4da849e2f0eb4155a89a7f83b6dc18e3a9))
- **inbox:** mail widget loading ([7d027df](https://github.com/erxes/erxes/commit/7d027df593258b4d398de5cec80079fcc59b569e))
- **pos:** pos create form ([#5529](https://github.com/erxes/erxes/issues/5529)) ([47dd26e](https://github.com/erxes/erxes/commit/47dd26e6e741d3873ebe8d2ab7ab71ec3d884efb))

## [1.15.0-rc.3](https://github.com/erxes/erxes/compare/1.15.0-rc.2...1.15.0-rc.3) (2024-07-20)

### Bug Fixes

- widgets messenger minified css applies correctly ([392db80](https://github.com/erxes/erxes/commit/392db807dc8672bc3627161cc7efb3cb0f4ac2a3))

## [1.15.0-rc.2](https://github.com/erxes/erxes/compare/1.15.0-rc.1...1.15.0-rc.2) (2024-07-19)

### Bug Fixes

- **widget:** revert widgets.yaml ([1bb09ad](https://github.com/erxes/erxes/commit/1bb09ad2182d304d6dcf043c4d12f65af6937bec))

## [1.15.0-rc.1](https://github.com/erxes/erxes/compare/1.15.0-rc.0...1.15.0-rc.1) (2024-07-19)

### Features

- **cards:** name auto field ([174f482](https://github.com/erxes/erxes/commit/174f482e1ef59de83dc3e3b589454d008d303eb2))
- **timeclock:** timeclock config update ([0eadd60](https://github.com/erxes/erxes/commit/0eadd606b83898d51881c1b09d68d3cbcca956f0))

### Bug Fixes

- fix instagram post & messenger config ([3eaf7d9](https://github.com/erxes/erxes/commit/3eaf7d92628406f0f5a692f79ce7691678fe4af6))
- **riskassessment:** can't calculate correct when using calculate method by percent ([cd32ca4](https://github.com/erxes/erxes/commit/cd32ca465923ecd9e05b9404e95ba5a93fc05741))

## [1.15.0-rc.0](https://github.com/erxes/erxes/compare/1.14.0...1.15.0-rc.0) (2024-07-17)

## [1.14.1](https://github.com/erxes/erxes/compare/1.14.0...1.14.1) (2024-07-25)

### Features

- **cards:** name auto field ([174f482](https://github.com/erxes/erxes/commit/174f482e1ef59de83dc3e3b589454d008d303eb2))
- **timeclock:** timeclock config update ([0eadd60](https://github.com/erxes/erxes/commit/0eadd606b83898d51881c1b09d68d3cbcca956f0))

- fix instagram post & messenger config ([3eaf7d9](https://github.com/erxes/erxes/commit/3eaf7d92628406f0f5a692f79ce7691678fe4af6))
- **riskassessment:** can't calculate correct when using calculate method by percent ([cd32ca4](https://github.com/erxes/erxes/commit/cd32ca465923ecd9e05b9404e95ba5a93fc05741))

## [1.15.0-rc.0](https://github.com/erxes/erxes/compare/1.14.0...1.15.0-rc.0) (2024-07-17)

### Features

- Add golomt transaction ([#5459](https://github.com/erxes/erxes/issues/5459)) ([6803fbf](https://github.com/erxes/erxes/commit/6803fbf06dfe4e752c1d317d8be0d9d845a11292))
- Pos split order and confirm edited order ([#5411](https://github.com/erxes/erxes/issues/5411)) ([2220380](https://github.com/erxes/erxes/commit/2220380df029eeb9351086045926df2a1804ec00))

### Bug Fixes

- clientportal dropdown items and saving little bug ([#5477](https://github.com/erxes/erxes/issues/5477)) ([fa32e14](https://github.com/erxes/erxes/commit/fa32e149d2bfbace470f827daaba00f772c8168a))
- instagram create integration bug ([857b92c](https://github.com/erxes/erxes/commit/857b92c465dca80b7ad89a1370b820050448bcc9))
- instagram integration bugs ([a59df5e](https://github.com/erxes/erxes/commit/a59df5e23f560d1e552d9e90587093bff5339f89))
- khanbank account name ([c2d7fc6](https://github.com/erxes/erxes/commit/c2d7fc6cb70965d99184f65c65f462d61d43d170))
- khanbank method ([#5466](https://github.com/erxes/erxes/issues/5466)) ([dcc9f68](https://github.com/erxes/erxes/commit/dcc9f68f2fb0a533fa171a60a6976eb03a9035b1))
- khanbank, account holder query ([#5504](https://github.com/erxes/erxes/issues/5504)) ([0e55898](https://github.com/erxes/erxes/commit/0e558981f925f3aeeedb7d9593eb2117d81e4d3d))
- loans and savings transaction and query ([#5448](https://github.com/erxes/erxes/issues/5448)) ([be27c11](https://github.com/erxes/erxes/commit/be27c11444b7db503acf51c1c1623e3a70b2ed3b))
- pos payment ([#5479](https://github.com/erxes/erxes/issues/5479)) ([089a014](https://github.com/erxes/erxes/commit/089a01474d35f2811fef5bad753bb71941b5f2dd))
- pos slots query ([#5473](https://github.com/erxes/erxes/issues/5473)) ([a909dde](https://github.com/erxes/erxes/commit/a909dde6fa09f0e30b10541d37efd645480e95dd))
- scoring bug ([#5460](https://github.com/erxes/erxes/issues/5460)) ([dc9b7b3](https://github.com/erxes/erxes/commit/dc9b7b3b76c624eea26f567c7a6a45e0c765e005))
- **verifier:** add missing enum in mongoose schema ([4133372](https://github.com/erxes/erxes/commit/4133372507bd9adb51d3f2002d9bd9689be566a0))
- inbox hooks ([1716603](https://github.com/erxes/erxes/commit/17166034412e24a0c5fb214642d3781e134f652e))
- pos orders filter ([5a96f58](https://github.com/erxes/erxes/commit/5a96f58263b382e440e8fd196ba757202dce99b5))

- **clientportal:** enable password reset for users from erxes ([6f3f3c6](https://github.com/erxes/erxes/commit/6f3f3c6cbb9acb0b88f98e533916a3e18111785e))

### Bug Fixes

=======

### Features

- Add golomt transaction ([#5459](https://github.com/erxes/erxes/issues/5459)) ([6803fbf](https://github.com/erxes/erxes/commit/6803fbf06dfe4e752c1d317d8be0d9d845a11292))
- Pos split order and confirm edited order ([#5411](https://github.com/erxes/erxes/issues/5411)) ([2220380](https://github.com/erxes/erxes/commit/2220380df029eeb9351086045926df2a1804ec00))
- payment invoice paid then to syncerkhet from third systems data ([#5543](https://github.com/erxes/erxes/issues/5543)) ([dd95a4a](https://github.com/erxes/erxes/commit/dd95a4a1a35c9fe66c8eaa916d16b1e400929404))

### Bug Fixes

- clientportal dropdown items and saving little bug ([#5477](https://github.com/erxes/erxes/issues/5477)) ([fa32e14](https://github.com/erxes/erxes/commit/fa32e149d2bfbace470f827daaba00f772c8168a))
- instagram create integration bug ([857b92c](https://github.com/erxes/erxes/commit/857b92c465dca80b7ad89a1370b820050448bcc9))
- instagram integration bugs ([a59df5e](https://github.com/erxes/erxes/commit/a59df5e23f560d1e552d9e90587093bff5339f89))
- khanbank account name ([c2d7fc6](https://github.com/erxes/erxes/commit/c2d7fc6cb70965d99184f65c65f462d61d43d170))
- khanbank method ([#5466](https://github.com/erxes/erxes/issues/5466)) ([dcc9f68](https://github.com/erxes/erxes/commit/dcc9f68f2fb0a533fa171a60a6976eb03a9035b1))
- khanbank, account holder query ([#5504](https://github.com/erxes/erxes/issues/5504)) ([0e55898](https://github.com/erxes/erxes/commit/0e558981f925f3aeeedb7d9593eb2117d81e4d3d))
- loans and savings transaction and query ([#5448](https://github.com/erxes/erxes/issues/5448)) ([be27c11](https://github.com/erxes/erxes/commit/be27c11444b7db503acf51c1c1623e3a70b2ed3b))
- pos payment ([#5479](https://github.com/erxes/erxes/issues/5479)) ([089a014](https://github.com/erxes/erxes/commit/089a01474d35f2811fef5bad753bb71941b5f2dd))
- pos slots query ([#5473](https://github.com/erxes/erxes/issues/5473)) ([a909dde](https://github.com/erxes/erxes/commit/a909dde6fa09f0e30b10541d37efd645480e95dd))
- scoring bug ([#5460](https://github.com/erxes/erxes/issues/5460)) ([dc9b7b3](https://github.com/erxes/erxes/commit/dc9b7b3b76c624eea26f567c7a6a45e0c765e005))
- **verifier:** add missing enum in mongoose schema ([4133372](https://github.com/erxes/erxes/commit/4133372507bd9adb51d3f2002d9bd9689be566a0))
- inbox hooks ([1716603](https://github.com/erxes/erxes/commit/17166034412e24a0c5fb214642d3781e134f652e))
- pos orders filter ([5a96f58](https://github.com/erxes/erxes/commit/5a96f58263b382e440e8fd196ba757202dce99b5))

## [1.14.0](https://github.com/erxes/erxes/compare/1.14.0-rc.10...1.14.0) (2024-07-17)

### Features

- **automations:** facebook comment bot ([4b14e6b](https://github.com/erxes/erxes/commit/4b14e6b23608e3599c44a5cabbcacbe50807af7d))
- **calls:** added abandoned call ([9211675](https://github.com/erxes/erxes/commit/921167500cfebf48c4313a220f29bcdfbbb23b74))
- **clientportal:** enable password reset for users from erxes ([6f3f3c6](https://github.com/erxes/erxes/commit/6f3f3c6cbb9acb0b88f98e533916a3e18111785e))

### Bug Fixes

- **cards:** cards move use on top bar and pipeline settings ([#5520](https://github.com/erxes/erxes/issues/5520)) ([188bc0b](https://github.com/erxes/erxes/commit/188bc0b661aaa0c3ded604caf0b2548284815243))
- posclient check customer ([f8221c7](https://github.com/erxes/erxes/commit/f8221c73f13489b483b16d630e72e426e1faa9bd))

## [1.13.6](https://github.com/erxes/erxes/compare/1.14.0-rc.10...1.14.0) (2024-07-05)

### Reverts

- fallback to AWS for marketing emails and SendGrid for transactional emails in SaaS version ([7d8d104](https://github.com/erxes/erxes/commit/7d8d10478b7ee11a4255d3551cf10fb45ab3eb65))

## [1.14.0-rc.10](https://github.com/erxes/erxes/compare/1.14.0-rc.9...1.14.0-rc.10) (2024-07-07)

### Bug Fixes

- **automations:** can't replace customer or companies in cards ([5d68d5c](https://github.com/erxes/erxes/commit/5d68d5c80296b046cb13a7441d69fd18048bf213))
- por product similarites query filter by special character ([3c8fe04](https://github.com/erxes/erxes/commit/3c8fe04d5cc8eec4ad0711f23a77daf81d31637e))

## [1.14.0-rc.9](https://github.com/erxes/erxes/compare/1.14.0-rc.8...1.14.0-rc.9) (2024-07-05)

### Bug Fixes

- **msdynamic:** to deal with customer NO ([7a8008b](https://github.com/erxes/erxes/commit/7a8008b28744b7888faad7f1b8ea4c3dd11721aa))

## [1.14.0-rc.8](https://github.com/erxes/erxes/compare/1.14.0-rc.5...1.14.0-rc.8) (2024-07-04)

### Features

- **calls:** added new tones ([1705120](https://github.com/erxes/erxes/commit/17051209a2c3c5c35919c8d04b6efa71643ba60e))
- **calls:** added ringing and busy tone ([85ecb8e](https://github.com/erxes/erxes/commit/85ecb8e90e9865ce73096a828d0e3b4d38b9a35c))
- **calls:** Enhanced call functionality by adding a keypad view with DTMF support and improving call action interfaces. ([2583c7c](https://github.com/erxes/erxes/commit/2583c7cc6e1ccc07ae0cc4e5b5baf0353592e10f))
- sentry crons setup ([3592cf0](https://github.com/erxes/erxes/commit/3592cf06201648d8ce627b3cc83803de07bc3ba4))

### Bug Fixes

- **automations:** remove tick used from generateTotalAmount ([122a175](https://github.com/erxes/erxes/commit/122a175e37616ff24d80aa1ffb00ff1eac48bed2))
- pos create deal per orders linked ([76c7ada](https://github.com/erxes/erxes/commit/76c7adaf813127a7b9667a770ab45ded95fe8c01))
- pos order list with summary and cardsConfig edit ([fe3c5fa](https://github.com/erxes/erxes/commit/fe3c5faa244659cc3c08947849f17d79a95b541a))
- **pos:** create per deal description from deliveryInfo ([7306564](https://github.com/erxes/erxes/commit/7306564e523a123646211cb7df9046a9df081e4c))
- **riskassessment:** can't filters cardsFilters in riskassessment statistic ([4545566](https://github.com/erxes/erxes/commit/45455661bfde0e8d3e7cc99b66a9eb2c9dfe9944))

## [1.14.0-rc.5](https://github.com/erxes/erxes/compare/1.14.0-rc.5...1.14.0-rc.8) (2024-07-02)

### Bug Fixes

- **automations:** can't get contactIds in addScore action ([5a7c1b8](https://github.com/erxes/erxes/commit/5a7c1b8e2679b6ea38fa1e2851b68bac69fcb1f4))
- **automations:** can't handle error in Attribution component ([37803be](https://github.com/erxes/erxes/commit/37803bed4af073df31ba331bfa4d94244057ad46))

## [1.14.0-rc.4](https://github.com/erxes/erxes/compare/1.14.0-rc.5...1.14.0-rc.8) (2024-07-02)

### Bug Fixes

- **timeclocks:** fix timeclock config issues ([ab8083e](https://github.com/erxes/erxes/commit/ab8083e6dd4c941e1c2540ecd70a1b41d0e38e5c))

## [1.14.0-rc.3](https://github.com/erxes/erxes/compare/1.14.0-rc.5...1.14.0-rc.8) (2024-07-01)

## [1.14.0-rc.2](https://github.com/erxes/erxes/compare/1.14.0-rc.5...1.14.0-rc.8) (2024-06-27)

### Bug Fixes

- **assets:** can't save asset kb histories as action added ([656d8eb](https://github.com/erxes/erxes/commit/656d8eb2449fdb1665849c204b5387d26a34e3ad))
- **assets:** can't sort by createdAt in getLasthistoryEachAssets ([5fd442e](https://github.com/erxes/erxes/commit/5fd442eca5d7534df4a94ceeb31ae08522daaa93))
- **core:** get branches children by status ([10806d4](https://github.com/erxes/erxes/commit/10806d410ff00cc738249374f317b41a98be4dc3))
- elastic \_id bug ([#5470](https://github.com/erxes/erxes/issues/5470)) ([ad044c5](https://github.com/erxes/erxes/commit/ad044c5197873c0d31c61766fc3dd6fc4520540e))
- **riskassessment:** prevent risk assessment submitting multiple times ([ef00e9a](https://github.com/erxes/erxes/commit/ef00e9ada708fc8ed8254619d6267ed203965fbd))

## [1.14.0-rc.1](https://github.com/erxes/erxes/compare/1.14.0-rc.5...1.14.0-rc.8) (2024-06-26)

## [1.14.0-rc.0](https://github.com/erxes/erxes/compare/1.14.0-rc.5...1.14.0-rc.8) (2024-06-25)

### Features

- add template plugin ([dc8b891](https://github.com/erxes/erxes/commit/dc8b891ff821f4e06bb5660a3a67a3e5cd05f3c6))
- **assets:** added ability set history when kb articles changed ([a5a8f23](https://github.com/erxes/erxes/commit/a5a8f23715d6482930cb186cdda3273b0b83ced6))
- Loans transaction logic ([#5399](https://github.com/erxes/erxes/issues/5399)) ([4da3750](https://github.com/erxes/erxes/commit/4da3750595fd6e102e1c0ce6f55c001ba3ba8623))

### Bug Fixes

- **automations:** added rpc trigger consumer in automations ([40b9fa6](https://github.com/erxes/erxes/commit/40b9fa6d7462410aa03cf20dbb56e526fec4039e))
- **automations:** can't paginate automation history ([fb18302](https://github.com/erxes/erxes/commit/fb18302e39fdd1d2801586fb6e174b54db6d5c1a))
- burenscoring and golomt ([#5393](https://github.com/erxes/erxes/issues/5393)) ([753d697](https://github.com/erxes/erxes/commit/753d697dbeebcd7f68fb15cdf9fc6cca9b9f12e1))
- field name changed in burenscoring query ([#5425](https://github.com/erxes/erxes/issues/5425)) ([8e76b1a](https://github.com/erxes/erxes/commit/8e76b1a70ea976e8af91b679ca55a6c9f074a2ec))
- golomtbank CI ([5b57849](https://github.com/erxes/erxes/commit/5b57849c9543d9ecc8d7806db4e3cb08a6dd7d87))
- settings ui bug ([959153b](https://github.com/erxes/erxes/commit/959153b4ae6925bbba98d4ac2286639a055cccd3))
- **template:** change ui scope ([57fbe19](https://github.com/erxes/erxes/commit/57fbe19685d14e0c786c0a3271db02661fed8d73))
- **templates:** file export ([e2f647c](https://github.com/erxes/erxes/commit/e2f647ccb53eb7680d66e0de9c76ca7a90bbe0a4))
- transaction ([429f933](https://github.com/erxes/erxes/commit/429f9335482d4dfc1c985ae2f8ae0474aa765f51))

## [1.13.5](https://github.com/erxes/erxes/compare/1.14.0-rc.5...1.14.0-rc.8) (2024-07-04)

### Bug Fixes

- **inbox:** fix convert to and fix cards save when hit enter ([45cf7a5](https://github.com/erxes/erxes/commit/45cf7a5995d5af6be9211845c66eef65450f1c18))

## [1.13.4](https://github.com/erxes/erxes/compare/1.14.0-rc.5...1.14.0-rc.8) (2024-07-02)

### Bug Fixes

- **acitivityLog:** ignore all <style> tag showing in email activity log ([16b78f5](https://github.com/erxes/erxes/commit/16b78f5867483121ee11a12a6eaff09aa1ff2ce8))
- **clientportal:** user detail not showing ([89d19c5](https://github.com/erxes/erxes/commit/89d19c5dde526211cfc07e77dec6717827ac041c))
- **engages:** fix engage email ([c41a28f](https://github.com/erxes/erxes/commit/c41a28f73b7f53504b82e2e9c6bf1a165c1f2138))
- **inbox:** Merge button not working in action ([fd57f9a](https://github.com/erxes/erxes/commit/fd57f9aadc8b6cfeb6c23435569e0726acb412b8))

## [1.13.3](https://github.com/erxes/erxes/compare/1.14.0-rc.5...1.14.0-rc.8) (2024-07-02)

## [1.14.0-rc.6](https://github.com/erxes/erxes/compare/1.14.0-rc.4...1.14.0-rc.6) (2024-07-02)

## [1.13.5](https://github.com/erxes/erxes/compare/1.13.4...1.13.5) (2024-07-04)

### Bug Fixes

- **inbox:** fix convert to and fix cards save when hit enter ([45cf7a5](https://github.com/erxes/erxes/commit/45cf7a5995d5af6be9211845c66eef65450f1c18))

## [1.13.4](https://github.com/erxes/erxes/compare/1.13.3...1.13.4) (2024-07-02)

### Bug Fixes

- **automations:** can't get contactIds in addScore action ([5a7c1b8](https://github.com/erxes/erxes/commit/5a7c1b8e2679b6ea38fa1e2851b68bac69fcb1f4))
- **automations:** can't handle error in Attribution component ([37803be](https://github.com/erxes/erxes/commit/37803bed4af073df31ba331bfa4d94244057ad46))
- update pluginsMap ([8177a61](https://github.com/erxes/erxes/commit/8177a61f30f9f1880742dc4231d75d37239d5a8b))

## [1.14.0-rc.4](https://github.com/erxes/erxes/compare/1.14.0-rc.3...1.14.0-rc.4) (2024-07-02)

### Bug Fixes

- **timeclocks:** fix timeclock config issues ([ab8083e](https://github.com/erxes/erxes/commit/ab8083e6dd4c941e1c2540ecd70a1b41d0e38e5c))

## [1.14.0-rc.3](https://github.com/erxes/erxes/compare/1.14.0-rc.2...1.14.0-rc.3) (2024-07-01)

### Bug Fixes

- posslots query ([7267d28](https://github.com/erxes/erxes/commit/7267d28ae8f68456f5e1a8e855f7e448b2b17a0f))

## [1.14.0-rc.2](https://github.com/erxes/erxes/compare/1.14.0-rc.2...1.14.0-rc.3) (2024-06-27)

### Bug Fixes

- **assets:** can't save asset kb histories as action added ([656d8eb](https://github.com/erxes/erxes/commit/656d8eb2449fdb1665849c204b5387d26a34e3ad))
- **assets:** can't sort by createdAt in getLasthistoryEachAssets ([5fd442e](https://github.com/erxes/erxes/commit/5fd442eca5d7534df4a94ceeb31ae08522daaa93))
- **core:** get branches children by status ([10806d4](https://github.com/erxes/erxes/commit/10806d410ff00cc738249374f317b41a98be4dc3))
- elastic \_id bug ([#5470](https://github.com/erxes/erxes/issues/5470)) ([ad044c5](https://github.com/erxes/erxes/commit/ad044c5197873c0d31c61766fc3dd6fc4520540e))
- **riskassessment:** prevent risk assessment submitting multiple times ([ef00e9a](https://github.com/erxes/erxes/commit/ef00e9ada708fc8ed8254619d6267ed203965fbd))

## [1.14.0-rc.1](https://github.com/erxes/erxes/compare/1.14.0-rc.2...1.14.0-rc.3) (2024-06-26)

## [1.14.0-rc.0](https://github.com/erxes/erxes/compare/1.14.0-rc.2...1.14.0-rc.3) (2024-06-25)

### Features

- add template plugin ([dc8b891](https://github.com/erxes/erxes/commit/dc8b891ff821f4e06bb5660a3a67a3e5cd05f3c6))
- **assets:** added ability set history when kb articles changed ([a5a8f23](https://github.com/erxes/erxes/commit/a5a8f23715d6482930cb186cdda3273b0b83ced6))
- Loans transaction logic ([#5399](https://github.com/erxes/erxes/issues/5399)) ([4da3750](https://github.com/erxes/erxes/commit/4da3750595fd6e102e1c0ce6f55c001ba3ba8623))

### Bug Fixes

- **automations:** added rpc trigger consumer in automations ([40b9fa6](https://github.com/erxes/erxes/commit/40b9fa6d7462410aa03cf20dbb56e526fec4039e))
- **automations:** can't paginate automation history ([fb18302](https://github.com/erxes/erxes/commit/fb18302e39fdd1d2801586fb6e174b54db6d5c1a))
- burenscoring and golomt ([#5393](https://github.com/erxes/erxes/issues/5393)) ([753d697](https://github.com/erxes/erxes/commit/753d697dbeebcd7f68fb15cdf9fc6cca9b9f12e1))
- field name changed in burenscoring query ([#5425](https://github.com/erxes/erxes/issues/5425)) ([8e76b1a](https://github.com/erxes/erxes/commit/8e76b1a70ea976e8af91b679ca55a6c9f074a2ec))
- golomtbank CI ([5b57849](https://github.com/erxes/erxes/commit/5b57849c9543d9ecc8d7806db4e3cb08a6dd7d87))
- settings ui bug ([959153b](https://github.com/erxes/erxes/commit/959153b4ae6925bbba98d4ac2286639a055cccd3))
- **template:** change ui scope ([57fbe19](https://github.com/erxes/erxes/commit/57fbe19685d14e0c786c0a3271db02661fed8d73))
- **templates:** file export ([e2f647c](https://github.com/erxes/erxes/commit/e2f647ccb53eb7680d66e0de9c76ca7a90bbe0a4))
- transaction ([429f933](https://github.com/erxes/erxes/commit/429f9335482d4dfc1c985ae2f8ae0474aa765f51))

## [1.13.2](https://github.com/erxes/erxes/compare/1.14.0-rc.2...1.14.0-rc.3) (2024-06-28)

### Bug Fixes

- ebarimt return check and rereturn link ([#5478](https://github.com/erxes/erxes/issues/5478)) ([3692d7e](https://github.com/erxes/erxes/commit/3692d7ed4b541e8037ff6aa3d8d607b0bc9a6e82))

## [1.13.1](https://github.com/erxes/erxes/compare/1.14.0-rc.2...1.14.0-rc.3) (2024-06-27)

## [1.14.0-rc.2](https://github.com/erxes/erxes/compare/1.14.0-rc.1...1.14.0-rc.2) (2024-06-27)

### Features

- products query check used cards pipeline ([346de3a](https://github.com/erxes/erxes/commit/346de3adda573612468f5cf9ebe7523dcbf16e78))

### Bug Fixes

- **assets:** can't save asset kb histories as action added ([656d8eb](https://github.com/erxes/erxes/commit/656d8eb2449fdb1665849c204b5387d26a34e3ad))
- **assets:** can't sort by createdAt in getLasthistoryEachAssets ([5fd442e](https://github.com/erxes/erxes/commit/5fd442eca5d7534df4a94ceeb31ae08522daaa93))
- **core:** get branches children by status ([10806d4](https://github.com/erxes/erxes/commit/10806d410ff00cc738249374f317b41a98be4dc3))
- elastic \_id bug ([#5470](https://github.com/erxes/erxes/issues/5470)) ([ad044c5](https://github.com/erxes/erxes/commit/ad044c5197873c0d31c61766fc3dd6fc4520540e))
- **riskassessment:** prevent risk assessment submitting multiple times ([ef00e9a](https://github.com/erxes/erxes/commit/ef00e9ada708fc8ed8254619d6267ed203965fbd))

## [1.14.0-rc.1](https://github.com/erxes/erxes/compare/1.14.0-rc.0...1.14.0-rc.1) (2024-06-26)

## [1.14.0-rc.0](https://github.com/erxes/erxes/compare/1.13.0...1.14.0-rc.0) (2024-06-25)

### Features

- add template plugin ([dc8b891](https://github.com/erxes/erxes/commit/dc8b891ff821f4e06bb5660a3a67a3e5cd05f3c6))
- **assets:** added ability set history when kb articles changed ([a5a8f23](https://github.com/erxes/erxes/commit/a5a8f23715d6482930cb186cdda3273b0b83ced6))
- Loans transaction logic ([#5399](https://github.com/erxes/erxes/issues/5399)) ([4da3750](https://github.com/erxes/erxes/commit/4da3750595fd6e102e1c0ce6f55c001ba3ba8623))

### Bug Fixes

- **automations:** added rpc trigger consumer in automations ([40b9fa6](https://github.com/erxes/erxes/commit/40b9fa6d7462410aa03cf20dbb56e526fec4039e))
- **automations:** can't paginate automation history ([fb18302](https://github.com/erxes/erxes/commit/fb18302e39fdd1d2801586fb6e174b54db6d5c1a))
- burenscoring and golomt ([#5393](https://github.com/erxes/erxes/issues/5393)) ([753d697](https://github.com/erxes/erxes/commit/753d697dbeebcd7f68fb15cdf9fc6cca9b9f12e1))
- field name changed in burenscoring query ([#5425](https://github.com/erxes/erxes/issues/5425)) ([8e76b1a](https://github.com/erxes/erxes/commit/8e76b1a70ea976e8af91b679ca55a6c9f074a2ec))
- golomtbank CI ([5b57849](https://github.com/erxes/erxes/commit/5b57849c9543d9ecc8d7806db4e3cb08a6dd7d87))
- settings ui bug ([959153b](https://github.com/erxes/erxes/commit/959153b4ae6925bbba98d4ac2286639a055cccd3))
- **template:** change ui scope ([57fbe19](https://github.com/erxes/erxes/commit/57fbe19685d14e0c786c0a3271db02661fed8d73))
- **templates:** file export ([e2f647c](https://github.com/erxes/erxes/commit/e2f647ccb53eb7680d66e0de9c76ca7a90bbe0a4))
- transaction ([429f933](https://github.com/erxes/erxes/commit/429f9335482d4dfc1c985ae2f8ae0474aa765f51))

## [1.13.0](https://github.com/erxes/erxes/compare/1.13.0-rc.6...1.13.0) (2024-06-25)

### Bug Fixes

- **automations:** switch to sendgrid for email sending in SaaS version ([ce83c65](https://github.com/erxes/erxes/commit/ce83c65e5dd23d9dde675dbc7ce9ffef1b205d94))
- **core:** send reset password mail via sendgrid in SaaS version ([9fc1afc](https://github.com/erxes/erxes/commit/9fc1afc81445182f8e9de57ff8e058a46df76a1c))
- **core:** team members bug ([#5435](https://github.com/erxes/erxes/issues/5435)) ([77f30d3](https://github.com/erxes/erxes/commit/77f30d31cac8125018bbdf34d4dbb1ffe5b1a098))
- **payment:** fix check invoices method ([9513e78](https://github.com/erxes/erxes/commit/9513e78cf4ad001bf137b7da552acd6916ee7211))
- **posclient:** get uoms from right rpc channel ([47905f0](https://github.com/erxes/erxes/commit/47905f0e84bc46e4d72253054ee99dbd1aa331b3))
- **syncErkhet:** can't click new config button ([bb8a824](https://github.com/erxes/erxes/commit/bb8a8244fe9d60e23b5359eb3b7247d4417e103d))
- **syncErkhet:** save btn not working ([0488474](https://github.com/erxes/erxes/commit/0488474167d597cb51edc79917c2ca2aa1e763b2))
- **timeclock:** schedules main query ([#5430](https://github.com/erxes/erxes/issues/5430)) ([b8feb7d](https://github.com/erxes/erxes/commit/b8feb7d35be96eeec932d2729fcf4ac2d99811bf))

## [1.13.0-rc.6](https://github.com/erxes/erxes/compare/1.13.0-rc.5...1.13.0-rc.6) (2024-06-23)

### Features

- documents replace by plugin.collection.field ([#5433](https://github.com/erxes/erxes/issues/5433)) ([21624ae](https://github.com/erxes/erxes/commit/21624aee6953827fada20b8f1a0383604eb102b6))

### Bug Fixes

- (document) duplicate call ([#5436](https://github.com/erxes/erxes/issues/5436)) ([8bbcec5](https://github.com/erxes/erxes/commit/8bbcec56f25bafdc7485e4deb9ce8adb6ab92038))

## [1.13.0-rc.5](https://github.com/erxes/erxes/compare/1.13.0-rc.5...1.13.0-rc.6) (2024-06-19)

### Bug Fixes

- **cards:** description edit height when edit card ([#5395](https://github.com/erxes/erxes/issues/5395)) ([efa3b4b](https://github.com/erxes/erxes/commit/efa3b4bee21307a241f4aac44f066c4a5612ba5f))
- **cards:** stage pipeline form update ([#5409](https://github.com/erxes/erxes/issues/5409)) ([021904d](https://github.com/erxes/erxes/commit/021904d470ea1b70e67a01de33374bfe5bd6facc))
- **coreui:** import, export properties ([#5363](https://github.com/erxes/erxes/issues/5363)) ([a127db6](https://github.com/erxes/erxes/commit/a127db6eab253d67eae6f37fc429d389077e8577))
- **engage:** fix create broadcast ([#5380](https://github.com/erxes/erxes/issues/5380)) ([3cea391](https://github.com/erxes/erxes/commit/3cea3913ddd7882d61b919a09e8bb32e48043bba))
- **product:** Advanced view ui ([#5417](https://github.com/erxes/erxes/issues/5417)) ([74ef3ce](https://github.com/erxes/erxes/commit/74ef3cef5d1c40532e1e3d5c934b3d6670ae9a71))
- **syncerkhet:** sync erkhet filter, permission filter ([#5419](https://github.com/erxes/erxes/issues/5419)) ([9727760](https://github.com/erxes/erxes/commit/97277602d77f6f9882a4a41cfae417e3de6c3294))

## [1.13.0-rc.4](https://github.com/erxes/erxes/compare/1.13.0-rc.5...1.13.0-rc.6) (2024-06-18)

### Bug Fixes

- **calls:** fix websocket error ([a3a9a2e](https://github.com/erxes/erxes/commit/a3a9a2e7909019b8e32abb42b932e2d0d88e4dbc))
- **calls:** improve record file and added report fields ([e535219](https://github.com/erxes/erxes/commit/e535219ec9f1b127e1b0d85b269d72f9639615ad))

## [1.13.0-rc.2](https://github.com/erxes/erxes/compare/1.13.0-rc.5...1.13.0-rc.6) (2024-06-17)

## [1.13.0-rc.1](https://github.com/erxes/erxes/compare/1.13.0-rc.5...1.13.0-rc.6) (2024-06-13)

### Bug Fixes

- fix insight table type ([efd64e3](https://github.com/erxes/erxes/commit/efd64e3109a2a335ae800f6c01ace02c22e0a8be))

## [1.13.0-rc.0](https://github.com/erxes/erxes/compare/1.13.0-rc.5...1.13.0-rc.6) (2024-06-12)

### Bug Fixes

- (broadcast) Update broadcast ([#5352](https://github.com/erxes/erxes/issues/5352)) ([bd7ad30](https://github.com/erxes/erxes/commit/bd7ad30e0744efa00e5d22c9df02e53a4707f1fe))
- **burenscoring:** some fix ([127e4fa](https://github.com/erxes/erxes/commit/127e4fa755f5d9a2479566222e7e86dc7f15c836))
- **clientportal:** fix sidebar filter of client portal user list ([2a686e2](https://github.com/erxes/erxes/commit/2a686e240c9b1c6ede72c3911ddb7f67f5cb5759))
- **coreui:** added default chip text ([d326eaa](https://github.com/erxes/erxes/commit/d326eaa5807f15af8702d647bd0fa32bab35e7c9))
- **facebook:** can't send message to automation trigger when message or comment added ([052c476](https://github.com/erxes/erxes/commit/052c476a7551bfaac2f63a2755b04d82d92474cc))
- loans contract filter ([#5344](https://github.com/erxes/erxes/issues/5344)) ([019d73e](https://github.com/erxes/erxes/commit/019d73e4132603ff1c6bb8646aac151b0fd14c9b))
- Loans some fix ([#5356](https://github.com/erxes/erxes/issues/5356)) ([6c462d4](https://github.com/erxes/erxes/commit/6c462d4b0316d17a064997d4a43c55dbc18ebc7c))
- Loans transaction filter ([#5346](https://github.com/erxes/erxes/issues/5346)) ([a6143d3](https://github.com/erxes/erxes/commit/a6143d3be46d7ee804c96e7c2f3d6ff28026fef4))
- savings and loans configs ([#5341](https://github.com/erxes/erxes/issues/5341)) ([0739a96](https://github.com/erxes/erxes/commit/0739a969d3c78a9ecfbc8d4e5a643e514422efcd))
- syncerkhet check products shortName ([a0d424e](https://github.com/erxes/erxes/commit/a0d424ec2d5e22747cf01fd7846cca277d87f223))
- **xyp:** some ui update ([#5333](https://github.com/erxes/erxes/issues/5333)) ([c63e9fe](https://github.com/erxes/erxes/commit/c63e9fecfd04ab7585a25eb8a823d5d26bfb781f))

### Performance Improvements

- Loans report ([#5321](https://github.com/erxes/erxes/issues/5321)) ([1ec890e](https://github.com/erxes/erxes/commit/1ec890ef233b515b60ca433985a46e473a498d32))

## [1.12.8](https://github.com/erxes/erxes/compare/1.13.0-rc.5...1.13.0-rc.6) (2024-06-23)

### Bug Fixes

- **automation:** can't send facebook message in chatbot ([cbe546a](https://github.com/erxes/erxes/commit/cbe546afee65fa3b587b21dd4cc67645a5a1ed7e))
- **facebook:** display link inpuy in chatbot message action ([0c4a969](https://github.com/erxes/erxes/commit/0c4a969c929d551b9128d65891f88465365b0146))

## [1.12.7](https://github.com/erxes/erxes/compare/1.13.0-rc.5...1.13.0-rc.6) (2024-06-22)

### Features

- **payment:** new ui in payment, introduce golomt ecommerce and minupay as new payment methods([#5392](https://github.com/erxes/erxes/issues/5392)) ([8ef2237](https://github.com/erxes/erxes/commit/8ef22371b96237aec6769a83f1039b091be64de1))

### Bug Fixes

- **coreui:** Label filter ([#5434](https://github.com/erxes/erxes/issues/5434)) ([78f6474](https://github.com/erxes/erxes/commit/78f647420eeb72cbe37edea91ba5345e4425e8ff))
- **posclient:** can't generate closeDate of subscription item of order ([4755886](https://github.com/erxes/erxes/commit/4755886962ee6a1d2cbe17ec4f775fb3f02c6fde))
- **posclient:** can't get uoms when subscription type product in order ([f77e088](https://github.com/erxes/erxes/commit/f77e088eef6858e98c10298687258b6d2b8a734d))
- **products:** can't popover DaySelector ([44dbee3](https://github.com/erxes/erxes/commit/44dbee36b2bea65048797147df9e911719061b28))

## [1.12.6](https://github.com/erxes/erxes/compare/1.13.0-rc.5...1.13.0-rc.6) (2024-06-20)

### Bug Fixes

- **coreui:** update confirm modal ([29d01fe](https://github.com/erxes/erxes/commit/29d01fe829ed13ca5e49e30ffba5f78fedac5134))

## [1.13.0-rc.5](https://github.com/erxes/erxes/compare/1.12.5...1.13.0-rc.5) (2024-06-19)

## [1.12.8](https://github.com/erxes/erxes/compare/1.12.7...1.12.8) (2024-06-23)

### Bug Fixes

- **automation:** can't send facebook message in chatbot ([cbe546a](https://github.com/erxes/erxes/commit/cbe546afee65fa3b587b21dd4cc67645a5a1ed7e))
- **facebook:** display link inpuy in chatbot message action ([0c4a969](https://github.com/erxes/erxes/commit/0c4a969c929d551b9128d65891f88465365b0146))

## [1.12.7](https://github.com/erxes/erxes/compare/1.12.6...1.12.7) (2024-06-22)

### Features

- **payment:** new ui in payment, introduce golomt ecommerce and minupay as new payment methods([#5392](https://github.com/erxes/erxes/issues/5392)) ([8ef2237](https://github.com/erxes/erxes/commit/8ef22371b96237aec6769a83f1039b091be64de1))

### Bug Fixes

- **coreui:** Label filter ([#5434](https://github.com/erxes/erxes/issues/5434)) ([78f6474](https://github.com/erxes/erxes/commit/78f647420eeb72cbe37edea91ba5345e4425e8ff))
- **posclient:** can't generate closeDate of subscription item of order ([4755886](https://github.com/erxes/erxes/commit/4755886962ee6a1d2cbe17ec4f775fb3f02c6fde))
- **posclient:** can't get uoms when subscription type product in order ([f77e088](https://github.com/erxes/erxes/commit/f77e088eef6858e98c10298687258b6d2b8a734d))
- **products:** can't popover DaySelector ([44dbee3](https://github.com/erxes/erxes/commit/44dbee36b2bea65048797147df9e911719061b28))

## [1.12.6](https://github.com/erxes/erxes/compare/1.12.5...1.12.6) (2024-06-20)

### Bug Fixes

- **cards:** description edit height when edit card ([#5395](https://github.com/erxes/erxes/issues/5395)) ([efa3b4b](https://github.com/erxes/erxes/commit/efa3b4bee21307a241f4aac44f066c4a5612ba5f))
- **cards:** stage pipeline form update ([#5409](https://github.com/erxes/erxes/issues/5409)) ([021904d](https://github.com/erxes/erxes/commit/021904d470ea1b70e67a01de33374bfe5bd6facc))
- **coreui:** import, export properties ([#5363](https://github.com/erxes/erxes/issues/5363)) ([a127db6](https://github.com/erxes/erxes/commit/a127db6eab253d67eae6f37fc429d389077e8577))
- **engage:** fix create broadcast ([#5380](https://github.com/erxes/erxes/issues/5380)) ([3cea391](https://github.com/erxes/erxes/commit/3cea3913ddd7882d61b919a09e8bb32e48043bba))
- **product:** Advanced view ui ([#5417](https://github.com/erxes/erxes/issues/5417)) ([74ef3ce](https://github.com/erxes/erxes/commit/74ef3cef5d1c40532e1e3d5c934b3d6670ae9a71))
- **syncerkhet:** sync erkhet filter, permission filter ([#5419](https://github.com/erxes/erxes/issues/5419)) ([9727760](https://github.com/erxes/erxes/commit/97277602d77f6f9882a4a41cfae417e3de6c3294))

## [1.13.0-rc.4](https://github.com/erxes/erxes/compare/1.12.5...1.13.0-rc.5) (2024-06-18)

### Bug Fixes

- **calls:** fix websocket error ([a3a9a2e](https://github.com/erxes/erxes/commit/a3a9a2e7909019b8e32abb42b932e2d0d88e4dbc))
- **calls:** improve record file and added report fields ([e535219](https://github.com/erxes/erxes/commit/e535219ec9f1b127e1b0d85b269d72f9639615ad))

## [1.13.0-rc.2](https://github.com/erxes/erxes/compare/1.12.5...1.13.0-rc.5) (2024-06-17)

## [1.13.0-rc.1](https://github.com/erxes/erxes/compare/1.12.5...1.13.0-rc.5) (2024-06-13)

### Bug Fixes

- fix insight table type ([efd64e3](https://github.com/erxes/erxes/commit/efd64e3109a2a335ae800f6c01ace02c22e0a8be))

## [1.13.0-rc.0](https://github.com/erxes/erxes/compare/1.12.5...1.13.0-rc.5) (2024-06-12)

### Bug Fixes

- (broadcast) Update broadcast ([#5352](https://github.com/erxes/erxes/issues/5352)) ([bd7ad30](https://github.com/erxes/erxes/commit/bd7ad30e0744efa00e5d22c9df02e53a4707f1fe))
- **burenscoring:** some fix ([127e4fa](https://github.com/erxes/erxes/commit/127e4fa755f5d9a2479566222e7e86dc7f15c836))
- **clientportal:** fix sidebar filter of client portal user list ([2a686e2](https://github.com/erxes/erxes/commit/2a686e240c9b1c6ede72c3911ddb7f67f5cb5759))
- **coreui:** added default chip text ([d326eaa](https://github.com/erxes/erxes/commit/d326eaa5807f15af8702d647bd0fa32bab35e7c9))
- **facebook:** can't send message to automation trigger when message or comment added ([052c476](https://github.com/erxes/erxes/commit/052c476a7551bfaac2f63a2755b04d82d92474cc))
- loans contract filter ([#5344](https://github.com/erxes/erxes/issues/5344)) ([019d73e](https://github.com/erxes/erxes/commit/019d73e4132603ff1c6bb8646aac151b0fd14c9b))
- Loans some fix ([#5356](https://github.com/erxes/erxes/issues/5356)) ([6c462d4](https://github.com/erxes/erxes/commit/6c462d4b0316d17a064997d4a43c55dbc18ebc7c))
- Loans transaction filter ([#5346](https://github.com/erxes/erxes/issues/5346)) ([a6143d3](https://github.com/erxes/erxes/commit/a6143d3be46d7ee804c96e7c2f3d6ff28026fef4)),save
- savings and loans configs ([#5341](https://github.com/erxes/erxes/issues/5341)) ([0739a96](https://github.com/erxes/erxes/commit/0739a969d3c78a9ecfbc8d4e5a643e514422efcd))
- syncerkhet check products shortName ([a0d424e](https://github.com/erxes/erxes/commit/a0d424ec2d5e22747cf01fd7846cca277d87f223))
- **xyp:** some ui update ([#5333](https://github.com/erxes/erxes/issues/5333)) ([c63e9fe](https://github.com/erxes/erxes/commit/c63e9fecfd04ab7585a25eb8a823d5d26bfb781f))

### Performance Improvements

- Loans report ([#5321](https://github.com/erxes/erxes/issues/5321)) ([1ec890e](https://github.com/erxes/erxes/commit/1ec890ef233b515b60ca433985a46e473a498d32))

## [1.13.0-rc.4](https://github.com/erxes/erxes/compare/1.13.0-rc.2...1.13.0-rc.4) (2024-06-18)

- **coreui:** update confirm modal ([29d01fe](https://github.com/erxes/erxes/commit/29d01fe829ed13ca5e49e30ffba5f78fedac5134))

## [1.12.5](https://github.com/erxes/erxes/compare/1.12.4...1.12.5) (2024-06-19)

### Bug Fixes

- **calls:** fix websocket error ([a3a9a2e](https://github.com/erxes/erxes/commit/a3a9a2e7909019b8e32abb42b932e2d0d88e4dbc))
- **calls:** improve record file and added report fields ([e535219](https://github.com/erxes/erxes/commit/e535219ec9f1b127e1b0d85b269d72f9639615ad))

## [1.13.0-rc.2](https://github.com/erxes/erxes/compare/1.13.0-rc.2...1.13.0-rc.4) (2024-06-17)

## [1.13.0-rc.1](https://github.com/erxes/erxes/compare/1.13.0-rc.2...1.13.0-rc.4) (2024-06-13)

### Bug Fixes

- fix insight table type ([efd64e3](https://github.com/erxes/erxes/commit/efd64e3109a2a335ae800f6c01ace02c22e0a8be))

## [1.13.0-rc.0](https://github.com/erxes/erxes/compare/1.13.0-rc.2...1.13.0-rc.4) (2024-06-12)

### Bug Fixes

- (broadcast) Update broadcast ([#5352](https://github.com/erxes/erxes/issues/5352)) ([bd7ad30](https://github.com/erxes/erxes/commit/bd7ad30e0744efa00e5d22c9df02e53a4707f1fe))
- **burenscoring:** some fix ([127e4fa](https://github.com/erxes/erxes/commit/127e4fa755f5d9a2479566222e7e86dc7f15c836))
- **clientportal:** fix sidebar filter of client portal user list ([2a686e2](https://github.com/erxes/erxes/commit/2a686e240c9b1c6ede72c3911ddb7f67f5cb5759))
- **coreui:** added default chip text ([d326eaa](https://github.com/erxes/erxes/commit/d326eaa5807f15af8702d647bd0fa32bab35e7c9))
- **facebook:** can't send message to automation trigger when message or comment added ([052c476](https://github.com/erxes/erxes/commit/052c476a7551bfaac2f63a2755b04d82d92474cc))
- loans contract filter ([#5344](https://github.com/erxes/erxes/issues/5344)) ([019d73e](https://github.com/erxes/erxes/commit/019d73e4132603ff1c6bb8646aac151b0fd14c9b))
- Loans some fix ([#5356](https://github.com/erxes/erxes/issues/5356)) ([6c462d4](https://github.com/erxes/erxes/commit/6c462d4b0316d17a064997d4a43c55dbc18ebc7c))
- Loans transaction filter ([#5346](https://github.com/erxes/erxes/issues/5346)) ([a6143d3](https://github.com/erxes/erxes/commit/a6143d3be46d7ee804c96e7c2f3d6ff28026fef4))
- savings and loans configs ([#5341](https://github.com/erxes/erxes/issues/5341)) ([0739a96](https://github.com/erxes/erxes/commit/0739a969d3c78a9ecfbc8d4e5a643e514422efcd))
- syncerkhet check products shortName ([a0d424e](https://github.com/erxes/erxes/commit/a0d424ec2d5e22747cf01fd7846cca277d87f223))
- **xyp:** some ui update ([#5333](https://github.com/erxes/erxes/issues/5333)) ([c63e9fe](https://github.com/erxes/erxes/commit/c63e9fecfd04ab7585a25eb8a823d5d26bfb781f))

### Performance Improvements

- Loans report ([#5321](https://github.com/erxes/erxes/issues/5321)) ([1ec890e](https://github.com/erxes/erxes/commit/1ec890ef233b515b60ca433985a46e473a498d32))

## [1.12.4](https://github.com/erxes/erxes/compare/1.13.0-rc.2...1.13.0-rc.4) (2024-06-18)

### Features

- **forms:** add international phone option to form fields ([ab0385d](https://github.com/erxes/erxes/commit/ab0385d6ac2720443868d6cdbd93c57762c5cc3a))

## [1.12.3](https://github.com/erxes/erxes/compare/1.13.0-rc.2...1.13.0-rc.4) (2024-06-17)

### Bug Fixes

- added await some promise functions ([549c599](https://github.com/erxes/erxes/commit/549c599e233965cb8c8c5191acddb959c1f651ed))
- **automations:** can't get notes of automations ([a3641d5](https://github.com/erxes/erxes/commit/a3641d53e1de8ebc228b4d6b77adcb603d9456a5))
- **cards:** can't delete item ([9a5351a](https://github.com/erxes/erxes/commit/9a5351ac0dacb2b242bcaa2c841d4d6f65f64fae))
- **cards:** description edit height when edit card ([03cd614](https://github.com/erxes/erxes/commit/03cd614c77d133d48a7505d92767ff9741c28081))
- **cards:** stage pipeline form update ([117322f](https://github.com/erxes/erxes/commit/117322fc7052bc0d253475402ca17dd4845779af))
- **core:** can''t get structure main list ([c76f715](https://github.com/erxes/erxes/commit/c76f71592c0aef0f4717e697a96c845380e6fce1))
- **core:** can't edit user profile ([966c741](https://github.com/erxes/erxes/commit/966c741add2400373a535478943865b5129a3520))
- **core:** can't get plugins usage in organization profile ([836b580](https://github.com/erxes/erxes/commit/836b580cb90ff9a752ed2b3d3b49b220c91a1be9))
- **core:** can't remove departmentRemove ([b8c4aaa](https://github.com/erxes/erxes/commit/b8c4aaadad7b71f470dd92ead8389d27136830f8))
- **coreui:** import, export properties ([14a6a0e](https://github.com/erxes/erxes/commit/14a6a0ebd7bea954b501369e67a2182a260183bd))
- **engage:** fix create broadcast ([35ef987](https://github.com/erxes/erxes/commit/35ef987db9c3e04645b6ea3979e9173c08d9c11e))
- **product:** Advanced view ui ([996647f](https://github.com/erxes/erxes/commit/996647fa1619cd0bbedca565684a8494c8bac017))
- **product:** Advanced view ui ([2474030](https://github.com/erxes/erxes/commit/2474030c7cb9b1c1de65b67aaed034de76c41db6))
- **syncerkhet:** sync erkhet filter, permission filter ([92320ec](https://github.com/erxes/erxes/commit/92320ec77c90a10d4d2820196d78c29bfd412f41))
- update to use cursor() method in place of stream() for Mongoose 8 compatibility ([7c005ab](https://github.com/erxes/erxes/commit/7c005ab1a8feb97a7554ff033545423f2e40cd74))
- **workers:** can't get import histories ([1f36da6](https://github.com/erxes/erxes/commit/1f36da607f4bdb3308ad6e590d329cd4e77aac01))

## [1.12.4](https://github.com/erxes/erxes/compare/1.12.3...1.12.4) (2024-06-18)

### Features

- **forms:** add international phone option to form fields ([ab0385d](https://github.com/erxes/erxes/commit/ab0385d6ac2720443868d6cdbd93c57762c5cc3a))

## [1.12.3](https://github.com/erxes/erxes/compare/1.12.2...1.12.3) (2024-06-17)

### Bug Fixes

- added await some promise functions ([549c599](https://github.com/erxes/erxes/commit/549c599e233965cb8c8c5191acddb959c1f651ed))

## [1.12.2](https://github.com/erxes/erxes/compare/1.12.1...1.12.2) (2024-06-17)

### Performance Improvements

- **coreui:** add sentry on ui for error tracking ([617a0b0](https://github.com/erxes/erxes/commit/617a0b078c32b55014293330af7ca47fb53c83e7))
- **monitoring:** add grafana faro react monitoring on core ui ([8b6f741](https://github.com/erxes/erxes/commit/8b6f7419d2f651e1b0b12a130148b15e3b66afff))
- **monitoring:** add posthog on ui & add sentry on api ([a3ae094](https://github.com/erxes/erxes/commit/a3ae094bd8dd123543b22ab6bf268dcff59f04af))

## [1.12.1](https://github.com/erxes/erxes/compare/1.12.0...1.12.1) (2024-06-14)

### Features

- **core-ui:** get env js from public url ([ffa7f57](https://github.com/erxes/erxes/commit/ffa7f5715afee93a63addc762cd5f918762f10e2))

## [1.12.0](https://github.com/erxes/erxes/compare/1.12.0-rc.6...1.12.0) (2024-06-12)

### Bug Fixes

- **calls:** pause call and fixed websocket error ([4a12815](https://github.com/erxes/erxes/commit/4a12815e288c0035b29f66e1c54d589e5f7936d9))
- **coreui:** editor font size control style ([#5353](https://github.com/erxes/erxes/issues/5353)) ([10d0a7b](https://github.com/erxes/erxes/commit/10d0a7b7b8fe15da4ab5e54f188241bcca33b860))

## [1.12.0-rc.6](https://github.com/erxes/erxes/compare/1.12.0-rc.6...1.12.0) (2024-06-10)

### Bug Fixes

- **cards:** assignedUser glitch ([40eeb9a](https://github.com/erxes/erxes/commit/40eeb9aba9fb96b0379c30c11f04d556017cd5c8))
- **coreui:** change editor styles for headless UI ([#5301](https://github.com/erxes/erxes/issues/5301)) ([90ef5a9](https://github.com/erxes/erxes/commit/90ef5a9a5d25cd1be79db50197ce20c61d7eb404))
- **coreui:** fix confirmation and pipeline form ([#5334](https://github.com/erxes/erxes/issues/5334)) ([9856ab6](https://github.com/erxes/erxes/commit/9856ab6c802ed7857cd0fe6fc75f982310f1025d))
- **coreui:** tooltips update ([#5309](https://github.com/erxes/erxes/issues/5309)) ([07d7768](https://github.com/erxes/erxes/commit/07d7768f2ebe56beb1069055267cbdf7e5d4caec))
- fix loans bug to omz ([e4e92b8](https://github.com/erxes/erxes/commit/e4e92b8070193cf91660f9cdb3be320baaa0ae60))
- format ([1ffd884](https://github.com/erxes/erxes/commit/1ffd88439dc1e3073a04b1d47f21aa3ef6721cd2))

## [1.12.0-rc.3](https://github.com/erxes/erxes/compare/1.12.0-rc.6...1.12.0) (2024-06-05)

### Bug Fixes

- **calls:** add download option ([200b0eb](https://github.com/erxes/erxes/commit/200b0eb082c3ba4af7d5d9f1e2017fda0446189b))
- **calls:** saved transfer call record ([afbcb1e](https://github.com/erxes/erxes/commit/afbcb1e4090cd238d126e21d311980af1c8c48d0))
- **calls:** some change on activity log ([484e34b](https://github.com/erxes/erxes/commit/484e34b786323f0f80a2e973d177a20b2178157f))
- **coreui:** update wootric createdAt ([eb667af](https://github.com/erxes/erxes/commit/eb667afed37c8be114868cd942e9ac584ac54c2a))
- ebarimt-ui putResposes list filter ([98170aa](https://github.com/erxes/erxes/commit/98170aafb4b44907d33181573dd56efe46909135))
- ebarimt-ui putResposes list filter ([278777e](https://github.com/erxes/erxes/commit/278777edc8fbe4a001ccf962df9b9e19c2f6ea6f))
- insight multi dimension select ([#5325](https://github.com/erxes/erxes/issues/5325)) ([4037ec2](https://github.com/erxes/erxes/commit/4037ec2b1c848f7ac9d837b679e647596b7f9814))
- loans and savings, Contract type fix ([#5313](https://github.com/erxes/erxes/issues/5313)) ([b8fd89f](https://github.com/erxes/erxes/commit/b8fd89f468322838d6dbc79953868575592f136d))

## [1.12.0-rc.1](https://github.com/erxes/erxes/compare/1.12.0-rc.6...1.12.0) (2024-05-30)

### Bug Fixes

- (clientportal) bug and 2fa ([#5306](https://github.com/erxes/erxes/issues/5306)) ([793a0ff](https://github.com/erxes/erxes/commit/793a0ffde343fad75540977b764f2b14e45da3de))
- **calls:** undo ringing audio ([4cf7596](https://github.com/erxes/erxes/commit/4cf75966657ae0836142e6bd9d451c6386d8dbd3))
- cars resolver ([a8c04c7](https://github.com/erxes/erxes/commit/a8c04c7619259255435604caef5a5d47dd98cd00))
- **coreui:** add dropdown with modal component ([5de46fb](https://github.com/erxes/erxes/commit/5de46fbc88ec25f28f739bf4dadb07bf3a597b7c))
- **coreui:** headlessui dropdown modal save ([f040375](https://github.com/erxes/erxes/commit/f040375388d23eaf95b76f9ade916e69ee375ba4))
- **dropdown:** items style ([#5291](https://github.com/erxes/erxes/issues/5291)) ([c8d5155](https://github.com/erxes/erxes/commit/c8d51559a51e7aa448d1ad69efe8c4ba9fe6811e))
- loan and saving transaction bug ([#5305](https://github.com/erxes/erxes/issues/5305)) ([06ba616](https://github.com/erxes/erxes/commit/06ba616ae9ce3617b2f45938e7f6c50c23b9109a))
- loan and savings some bug fix ([#5308](https://github.com/erxes/erxes/issues/5308)) ([20f0fc1](https://github.com/erxes/erxes/commit/20f0fc1ad12321d1e516d91d641e5584d1dd4909))
- **profile:** save button not working and add confirm action ([94c5bc3](https://github.com/erxes/erxes/commit/94c5bc33dad7d3276063735516cf5ac7a68f7272))
- **saas:** some styling and view ([#5207](https://github.com/erxes/erxes/issues/5207)) ([d56e990](https://github.com/erxes/erxes/commit/d56e990b26141ba9846c14be1c70ed78dcf723ba))

## [1.12.0-rc.0](https://github.com/erxes/erxes/compare/1.12.0-rc.6...1.12.0) (2024-05-29)

### Features

- ebarimt 3.0 part of the pos ([be81482](https://github.com/erxes/erxes/commit/be8148278c52206dd0c81a22c357a9c644d0ebe4))
- Pos mobile theme ([#5205](https://github.com/erxes/erxes/issues/5205)) ([c43d76a](https://github.com/erxes/erxes/commit/c43d76adf25c4e746e73132460ad0a702b34a6ad))

### Bug Fixes

- **automation:** can't get list automations ([7add1a7](https://github.com/erxes/erxes/commit/7add1a79e764847bca24da42d21f201908765678))
- **automations:** fix magnet connect ([7abb235](https://github.com/erxes/erxes/commit/7abb235703b603bd23b9eb473ee4d52daab767af))
- **automations:** generate right url for bot data url in chatbot ([2c5d836](https://github.com/erxes/erxes/commit/2c5d8362ea446e91069883433de46811b91ab1e0))
- card reader result save ([dd30996](https://github.com/erxes/erxes/commit/dd30996c17a5937273ece738f30d262ff58efae0))
- **coreui:** can't disable button component ([592af11](https://github.com/erxes/erxes/commit/592af117c1169f7cadf6bdeeb952b99d6e4da892))
- **facebook:** can't edit bot & some ui fixes in bot form ([50d5ce9](https://github.com/erxes/erxes/commit/50d5ce94f1509d4dd72b8649e70e2ef763d913ec))
- **forms:** user passed as wrong prop name in customFieldsData Section ([fb6afa0](https://github.com/erxes/erxes/commit/fb6afa08342f8812461964c04418e061f2f98995))
- **internalnotes:** can't get contentIds in internalNotesByAction query ([c188c71](https://github.com/erxes/erxes/commit/c188c71ee27b51161ec0955ff4f98a4139d2ecea))
- **knowledgebase:** parent category error ([fdb04ea](https://github.com/erxes/erxes/commit/fdb04ea169ffbb39f035060dc9f74ae498bf7a91))
- MONGO_URL for local dev environments ([dcebe12](https://github.com/erxes/erxes/commit/dcebe12b4192848a85bb9637b1ee54a138dc4d27))
- pos-api syncOrderFromClient ([ccd5b1c](https://github.com/erxes/erxes/commit/ccd5b1cdaa3d21b2586de8fbfb04199b541588f7))
- product form with attachments ([2882cd5](https://github.com/erxes/erxes/commit/2882cd552e227217bef97df16473c632324c3219))
- typo ([01447d2](https://github.com/erxes/erxes/commit/01447d2a237ea904327de85b6e8ada56f965ba80))

### Performance Improvements

- **pos-ui:** os and saas merge code ([d165a4a](https://github.com/erxes/erxes/commit/d165a4afcb20d154a88aa4cabdd2292310a3c27c))

## [1.11.7](https://github.com/erxes/erxes/compare/1.12.0-rc.6...1.12.0) (2024-06-11)

### Features

- **engages:** introduce sendgrid as marketing mailer service ([#5323](https://github.com/erxes/erxes/issues/5323)) ([2481b95](https://github.com/erxes/erxes/commit/2481b953bcd3dd0846636fb3e542b39d69e7ce60))

### Performance Improvements

- **core-ui:** make possible to use public plugins js url in core ui ([5890eb0](https://github.com/erxes/erxes/commit/5890eb0c61a89c8066b49aa76159679e7d057755))

## [1.11.7](https://github.com/erxes/erxes/compare/1.11.6...1.11.7) (2024-06-11)

### Features

- **engages:** introduce sendgrid as marketing mailer service ([#5323](https://github.com/erxes/erxes/issues/5323)) ([2481b95](https://github.com/erxes/erxes/commit/2481b953bcd3dd0846636fb3e542b39d69e7ce60))

### Performance Improvements

- **core-ui:** make possible to use public plugins js url in core ui ([5890eb0](https://github.com/erxes/erxes/commit/5890eb0c61a89c8066b49aa76159679e7d057755))

## [1.11.6](https://github.com/erxes/erxes/compare/1.11.5...1.11.6) (2024-06-07)

### Bug Fixes

- **cards:** assignedUser glitch ([40eeb9a](https://github.com/erxes/erxes/commit/40eeb9aba9fb96b0379c30c11f04d556017cd5c8))
- **coreui:** change editor styles for headless UI ([#5301](https://github.com/erxes/erxes/issues/5301)) ([90ef5a9](https://github.com/erxes/erxes/commit/90ef5a9a5d25cd1be79db50197ce20c61d7eb404))
- **coreui:** fix confirmation and pipeline form ([#5334](https://github.com/erxes/erxes/issues/5334)) ([9856ab6](https://github.com/erxes/erxes/commit/9856ab6c802ed7857cd0fe6fc75f982310f1025d))
- **coreui:** tooltips update ([#5309](https://github.com/erxes/erxes/issues/5309)) ([07d7768](https://github.com/erxes/erxes/commit/07d7768f2ebe56beb1069055267cbdf7e5d4caec))
- fix loans bug to omz ([e4e92b8](https://github.com/erxes/erxes/commit/e4e92b8070193cf91660f9cdb3be320baaa0ae60))
- format ([1ffd884](https://github.com/erxes/erxes/commit/1ffd88439dc1e3073a04b1d47f21aa3ef6721cd2))

## [1.12.0-rc.3](https://github.com/erxes/erxes/compare/1.12.0-rc.3...1.12.0-rc.6) (2024-06-05)

### Bug Fixes

- **calls:** add download option ([200b0eb](https://github.com/erxes/erxes/commit/200b0eb082c3ba4af7d5d9f1e2017fda0446189b))
- **calls:** saved transfer call record ([afbcb1e](https://github.com/erxes/erxes/commit/afbcb1e4090cd238d126e21d311980af1c8c48d0))
- **calls:** some change on activity log ([484e34b](https://github.com/erxes/erxes/commit/484e34b786323f0f80a2e973d177a20b2178157f))
- **coreui:** update wootric createdAt ([eb667af](https://github.com/erxes/erxes/commit/eb667afed37c8be114868cd942e9ac584ac54c2a))
- ebarimt-ui putResposes list filter ([98170aa](https://github.com/erxes/erxes/commit/98170aafb4b44907d33181573dd56efe46909135))
- ebarimt-ui putResposes list filter ([278777e](https://github.com/erxes/erxes/commit/278777edc8fbe4a001ccf962df9b9e19c2f6ea6f))
- insight multi dimension select ([#5325](https://github.com/erxes/erxes/issues/5325)) ([4037ec2](https://github.com/erxes/erxes/commit/4037ec2b1c848f7ac9d837b679e647596b7f9814))
- loans and savings, Contract type fix ([#5313](https://github.com/erxes/erxes/issues/5313)) ([b8fd89f](https://github.com/erxes/erxes/commit/b8fd89f468322838d6dbc79953868575592f136d))

## [1.12.0-rc.1](https://github.com/erxes/erxes/compare/1.12.0-rc.3...1.12.0-rc.6) (2024-05-30)

### Bug Fixes

- (clientportal) bug and 2fa ([#5306](https://github.com/erxes/erxes/issues/5306)) ([793a0ff](https://github.com/erxes/erxes/commit/793a0ffde343fad75540977b764f2b14e45da3de))
- **calls:** undo ringing audio ([4cf7596](https://github.com/erxes/erxes/commit/4cf75966657ae0836142e6bd9d451c6386d8dbd3))
- cars resolver ([a8c04c7](https://github.com/erxes/erxes/commit/a8c04c7619259255435604caef5a5d47dd98cd00))
- **coreui:** add dropdown with modal component ([5de46fb](https://github.com/erxes/erxes/commit/5de46fbc88ec25f28f739bf4dadb07bf3a597b7c))
- **coreui:** headlessui dropdown modal save ([f040375](https://github.com/erxes/erxes/commit/f040375388d23eaf95b76f9ade916e69ee375ba4))
- **dropdown:** items style ([#5291](https://github.com/erxes/erxes/issues/5291)) ([c8d5155](https://github.com/erxes/erxes/commit/c8d51559a51e7aa448d1ad69efe8c4ba9fe6811e))
- loan and saving transaction bug ([#5305](https://github.com/erxes/erxes/issues/5305)) ([06ba616](https://github.com/erxes/erxes/commit/06ba616ae9ce3617b2f45938e7f6c50c23b9109a))
- loan and savings some bug fix ([#5308](https://github.com/erxes/erxes/issues/5308)) ([20f0fc1](https://github.com/erxes/erxes/commit/20f0fc1ad12321d1e516d91d641e5584d1dd4909))
- **profile:** save button not working and add confirm action ([94c5bc3](https://github.com/erxes/erxes/commit/94c5bc33dad7d3276063735516cf5ac7a68f7272))
- **saas:** some styling and view ([#5207](https://github.com/erxes/erxes/issues/5207)) ([d56e990](https://github.com/erxes/erxes/commit/d56e990b26141ba9846c14be1c70ed78dcf723ba))

## [1.12.0-rc.0](https://github.com/erxes/erxes/compare/1.12.0-rc.3...1.12.0-rc.6) (2024-05-29)

### Features

- ebarimt 3.0 part of the pos ([be81482](https://github.com/erxes/erxes/commit/be8148278c52206dd0c81a22c357a9c644d0ebe4))
- Pos mobile theme ([#5205](https://github.com/erxes/erxes/issues/5205)) ([c43d76a](https://github.com/erxes/erxes/commit/c43d76adf25c4e746e73132460ad0a702b34a6ad))

### Bug Fixes

- **automation:** can't get list automations ([7add1a7](https://github.com/erxes/erxes/commit/7add1a79e764847bca24da42d21f201908765678))
- **automations:** fix magnet connect ([7abb235](https://github.com/erxes/erxes/commit/7abb235703b603bd23b9eb473ee4d52daab767af))
- **automations:** generate right url for bot data url in chatbot ([2c5d836](https://github.com/erxes/erxes/commit/2c5d8362ea446e91069883433de46811b91ab1e0))
- card reader result save ([dd30996](https://github.com/erxes/erxes/commit/dd30996c17a5937273ece738f30d262ff58efae0))
- **coreui:** can't disable button component ([592af11](https://github.com/erxes/erxes/commit/592af117c1169f7cadf6bdeeb952b99d6e4da892))
- **facebook:** can't edit bot & some ui fixes in bot form ([50d5ce9](https://github.com/erxes/erxes/commit/50d5ce94f1509d4dd72b8649e70e2ef763d913ec))
- **forms:** user passed as wrong prop name in customFieldsData Section ([fb6afa0](https://github.com/erxes/erxes/commit/fb6afa08342f8812461964c04418e061f2f98995))
- **internalnotes:** can't get contentIds in internalNotesByAction query ([c188c71](https://github.com/erxes/erxes/commit/c188c71ee27b51161ec0955ff4f98a4139d2ecea))
- **knowledgebase:** parent category error ([fdb04ea](https://github.com/erxes/erxes/commit/fdb04ea169ffbb39f035060dc9f74ae498bf7a91))
- MONGO_URL for local dev environments ([dcebe12](https://github.com/erxes/erxes/commit/dcebe12b4192848a85bb9637b1ee54a138dc4d27))
- pos-api syncOrderFromClient ([ccd5b1c](https://github.com/erxes/erxes/commit/ccd5b1cdaa3d21b2586de8fbfb04199b541588f7))
- product form with attachments ([2882cd5](https://github.com/erxes/erxes/commit/2882cd552e227217bef97df16473c632324c3219))
- typo ([01447d2](https://github.com/erxes/erxes/commit/01447d2a237ea904327de85b6e8ada56f965ba80))

### Performance Improvements

- **pos-ui:** os and saas merge code ([d165a4a](https://github.com/erxes/erxes/commit/d165a4afcb20d154a88aa4cabdd2292310a3c27c))

## [1.11.6](https://github.com/erxes/erxes/compare/1.12.0-rc.3...1.12.0-rc.6) (2024-06-07)

### Features

- ebarimt putresponses filter by contentId ([4c71ab0](https://github.com/erxes/erxes/commit/4c71ab06b2193d8e11d8c3ea0f559a6ddb41ed70))

### Bug Fixes

- **payment:** quick qr ([dd8fad4](https://github.com/erxes/erxes/commit/dd8fad41a9dc19644f2bac9d213fcca4c9a07074))

## [1.11.5](https://github.com/erxes/erxes/compare/1.12.0-rc.3...1.12.0-rc.6) (2024-06-03)

## [1.12.0-rc.3](https://github.com/erxes/erxes/compare/1.12.0-rc.1...1.12.0-rc.3) (2024-06-05)

### Bug Fixes

- **calls:** add download option ([200b0eb](https://github.com/erxes/erxes/commit/200b0eb082c3ba4af7d5d9f1e2017fda0446189b))
- **calls:** saved transfer call record ([afbcb1e](https://github.com/erxes/erxes/commit/afbcb1e4090cd238d126e21d311980af1c8c48d0))
- **calls:** some change on activity log ([484e34b](https://github.com/erxes/erxes/commit/484e34b786323f0f80a2e973d177a20b2178157f))
- **coreui:** update wootric createdAt ([eb667af](https://github.com/erxes/erxes/commit/eb667afed37c8be114868cd942e9ac584ac54c2a))
- ebarimt-ui putResposes list filter ([98170aa](https://github.com/erxes/erxes/commit/98170aafb4b44907d33181573dd56efe46909135))
- ebarimt-ui putResposes list filter ([278777e](https://github.com/erxes/erxes/commit/278777edc8fbe4a001ccf962df9b9e19c2f6ea6f))
- **ebarimt:** b2b_reciepts bug ([19bf440](https://github.com/erxes/erxes/commit/19bf4401bfb49cee2a01953f210435deca7d91f5))
- insight multi dimension select ([#5325](https://github.com/erxes/erxes/issues/5325)) ([4037ec2](https://github.com/erxes/erxes/commit/4037ec2b1c848f7ac9d837b679e647596b7f9814))
- loans and savings, Contract type fix ([#5313](https://github.com/erxes/erxes/issues/5313)) ([b8fd89f](https://github.com/erxes/erxes/commit/b8fd89f468322838d6dbc79953868575592f136d))
- **posclient:** b2b_reciepts ([09abc66](https://github.com/erxes/erxes/commit/09abc66a0f96874ed4c73897442fc5c14f587660))

## [1.12.0-rc.1](https://github.com/erxes/erxes/compare/1.12.0-rc.1...1.12.0-rc.3) (2024-05-30)

### Bug Fixes

- (clientportal) bug and 2fa ([#5306](https://github.com/erxes/erxes/issues/5306)) ([793a0ff](https://github.com/erxes/erxes/commit/793a0ffde343fad75540977b764f2b14e45da3de))
- **calls:** undo ringing audio ([4cf7596](https://github.com/erxes/erxes/commit/4cf75966657ae0836142e6bd9d451c6386d8dbd3))
- cars resolver ([a8c04c7](https://github.com/erxes/erxes/commit/a8c04c7619259255435604caef5a5d47dd98cd00))
- **coreui:** add dropdown with modal component ([5de46fb](https://github.com/erxes/erxes/commit/5de46fbc88ec25f28f739bf4dadb07bf3a597b7c))
- **coreui:** headlessui dropdown modal save ([f040375](https://github.com/erxes/erxes/commit/f040375388d23eaf95b76f9ade916e69ee375ba4))
- **dropdown:** items style ([#5291](https://github.com/erxes/erxes/issues/5291)) ([c8d5155](https://github.com/erxes/erxes/commit/c8d51559a51e7aa448d1ad69efe8c4ba9fe6811e))
- loan and saving transaction bug ([#5305](https://github.com/erxes/erxes/issues/5305)) ([06ba616](https://github.com/erxes/erxes/commit/06ba616ae9ce3617b2f45938e7f6c50c23b9109a))
- loan and savings some bug fix ([#5308](https://github.com/erxes/erxes/issues/5308)) ([20f0fc1](https://github.com/erxes/erxes/commit/20f0fc1ad12321d1e516d91d641e5584d1dd4909))
- **profile:** save button not working and add confirm action ([94c5bc3](https://github.com/erxes/erxes/commit/94c5bc33dad7d3276063735516cf5ac7a68f7272))
- **saas:** some styling and view ([#5207](https://github.com/erxes/erxes/issues/5207)) ([d56e990](https://github.com/erxes/erxes/commit/d56e990b26141ba9846c14be1c70ed78dcf723ba))

## [1.12.0-rc.0](https://github.com/erxes/erxes/compare/1.12.0-rc.1...1.12.0-rc.3) (2024-05-29)

### Features

- ebarimt 3.0 part of the pos ([be81482](https://github.com/erxes/erxes/commit/be8148278c52206dd0c81a22c357a9c644d0ebe4))
- Pos mobile theme ([#5205](https://github.com/erxes/erxes/issues/5205)) ([c43d76a](https://github.com/erxes/erxes/commit/c43d76adf25c4e746e73132460ad0a702b34a6ad))

### Bug Fixes

- **automation:** can't get list automations ([7add1a7](https://github.com/erxes/erxes/commit/7add1a79e764847bca24da42d21f201908765678))
- **automations:** fix magnet connect ([7abb235](https://github.com/erxes/erxes/commit/7abb235703b603bd23b9eb473ee4d52daab767af))
- **automations:** generate right url for bot data url in chatbot ([2c5d836](https://github.com/erxes/erxes/commit/2c5d8362ea446e91069883433de46811b91ab1e0))
- card reader result save ([dd30996](https://github.com/erxes/erxes/commit/dd30996c17a5937273ece738f30d262ff58efae0))
- **coreui:** can't disable button component ([592af11](https://github.com/erxes/erxes/commit/592af117c1169f7cadf6bdeeb952b99d6e4da892))
- **facebook:** can't edit bot & some ui fixes in bot form ([50d5ce9](https://github.com/erxes/erxes/commit/50d5ce94f1509d4dd72b8649e70e2ef763d913ec))
- **forms:** user passed as wrong prop name in customFieldsData Section ([fb6afa0](https://github.com/erxes/erxes/commit/fb6afa08342f8812461964c04418e061f2f98995))
- **internalnotes:** can't get contentIds in internalNotesByAction query ([c188c71](https://github.com/erxes/erxes/commit/c188c71ee27b51161ec0955ff4f98a4139d2ecea))
- **knowledgebase:** parent category error ([fdb04ea](https://github.com/erxes/erxes/commit/fdb04ea169ffbb39f035060dc9f74ae498bf7a91))
- MONGO_URL for local dev environments ([dcebe12](https://github.com/erxes/erxes/commit/dcebe12b4192848a85bb9637b1ee54a138dc4d27))
- pos-api syncOrderFromClient ([ccd5b1c](https://github.com/erxes/erxes/commit/ccd5b1cdaa3d21b2586de8fbfb04199b541588f7))
- product form with attachments ([2882cd5](https://github.com/erxes/erxes/commit/2882cd552e227217bef97df16473c632324c3219))
- typo ([01447d2](https://github.com/erxes/erxes/commit/01447d2a237ea904327de85b6e8ada56f965ba80))

### Performance Improvements

- **pos-ui:** os and saas merge code ([d165a4a](https://github.com/erxes/erxes/commit/d165a4afcb20d154a88aa4cabdd2292310a3c27c))

## [1.11.4](https://github.com/erxes/erxes/compare/1.12.0-rc.1...1.12.0-rc.3) (2024-06-02)

### Bug Fixes

- **coreui:** can't redirect onboarding route ([6854c20](https://github.com/erxes/erxes/commit/6854c207864b5051b4a1a9ade9149a74bfd8d3bf))

## [1.11.3](https://github.com/erxes/erxes/compare/1.12.0-rc.1...1.12.0-rc.3) (2024-05-30)

## [1.11.2](https://github.com/erxes/erxes/compare/1.12.0-rc.1...1.12.0-rc.3) (2024-05-30)

### Bug Fixes

- **coreui:** add headlessui dropdown modal ([054fe71](https://github.com/erxes/erxes/commit/054fe710784387995a517d9b664e54aa1f0b418c))

## [1.11.1](https://github.com/erxes/erxes/compare/1.12.0-rc.1...1.12.0-rc.3) (2024-05-29)

## [1.12.0-rc.3](https://github.com/erxes/erxes/compare/1.12.0-rc.1...1.12.0-rc.3) (2024-06-05)

### Bug Fixes

- **calls:** add download option ([200b0eb](https://github.com/erxes/erxes/commit/200b0eb082c3ba4af7d5d9f1e2017fda0446189b))
- **calls:** saved transfer call record ([afbcb1e](https://github.com/erxes/erxes/commit/afbcb1e4090cd238d126e21d311980af1c8c48d0))
- **calls:** some change on activity log ([484e34b](https://github.com/erxes/erxes/commit/484e34b786323f0f80a2e973d177a20b2178157f))
- **coreui:** update wootric createdAt ([eb667af](https://github.com/erxes/erxes/commit/eb667afed37c8be114868cd942e9ac584ac54c2a))
- ebarimt-ui putResposes list filter ([98170aa](https://github.com/erxes/erxes/commit/98170aafb4b44907d33181573dd56efe46909135))
- ebarimt-ui putResposes list filter ([278777e](https://github.com/erxes/erxes/commit/278777edc8fbe4a001ccf962df9b9e19c2f6ea6f))
- **ebarimt:** b2b_reciepts bug ([19bf440](https://github.com/erxes/erxes/commit/19bf4401bfb49cee2a01953f210435deca7d91f5))
- insight multi dimension select ([#5325](https://github.com/erxes/erxes/issues/5325)) ([4037ec2](https://github.com/erxes/erxes/commit/4037ec2b1c848f7ac9d837b679e647596b7f9814))
- loans and savings, Contract type fix ([#5313](https://github.com/erxes/erxes/issues/5313)) ([b8fd89f](https://github.com/erxes/erxes/commit/b8fd89f468322838d6dbc79953868575592f136d))
- **posclient:** b2b_reciepts ([09abc66](https://github.com/erxes/erxes/commit/09abc66a0f96874ed4c73897442fc5c14f587660))

## [1.12.0-rc.1](https://github.com/erxes/erxes/compare/1.12.0-rc.1...1.12.0-rc.3) (2024-05-30)

### Bug Fixes

- (clientportal) bug and 2fa ([#5306](https://github.com/erxes/erxes/issues/5306)) ([793a0ff](https://github.com/erxes/erxes/commit/793a0ffde343fad75540977b764f2b14e45da3de))
- **calls:** undo ringing audio ([4cf7596](https://github.com/erxes/erxes/commit/4cf75966657ae0836142e6bd9d451c6386d8dbd3))
- cars resolver ([a8c04c7](https://github.com/erxes/erxes/commit/a8c04c7619259255435604caef5a5d47dd98cd00))
- **coreui:** add dropdown with modal component ([5de46fb](https://github.com/erxes/erxes/commit/5de46fbc88ec25f28f739bf4dadb07bf3a597b7c))
- **coreui:** headlessui dropdown modal save ([f040375](https://github.com/erxes/erxes/commit/f040375388d23eaf95b76f9ade916e69ee375ba4))
- **dropdown:** items style ([#5291](https://github.com/erxes/erxes/issues/5291)) ([c8d5155](https://github.com/erxes/erxes/commit/c8d51559a51e7aa448d1ad69efe8c4ba9fe6811e))
- loan and saving transaction bug ([#5305](https://github.com/erxes/erxes/issues/5305)) ([06ba616](https://github.com/erxes/erxes/commit/06ba616ae9ce3617b2f45938e7f6c50c23b9109a))
- loan and savings some bug fix ([#5308](https://github.com/erxes/erxes/issues/5308)) ([20f0fc1](https://github.com/erxes/erxes/commit/20f0fc1ad12321d1e516d91d641e5584d1dd4909))
- **profile:** save button not working and add confirm action ([94c5bc3](https://github.com/erxes/erxes/commit/94c5bc33dad7d3276063735516cf5ac7a68f7272))
- **saas:** some styling and view ([#5207](https://github.com/erxes/erxes/issues/5207)) ([d56e990](https://github.com/erxes/erxes/commit/d56e990b26141ba9846c14be1c70ed78dcf723ba))

## [1.12.0-rc.0](https://github.com/erxes/erxes/compare/1.12.0-rc.1...1.12.0-rc.3) (2024-05-29)

### Features

- ebarimt 3.0 part of the pos ([be81482](https://github.com/erxes/erxes/commit/be8148278c52206dd0c81a22c357a9c644d0ebe4))
- Pos mobile theme ([#5205](https://github.com/erxes/erxes/issues/5205)) ([c43d76a](https://github.com/erxes/erxes/commit/c43d76adf25c4e746e73132460ad0a702b34a6ad))

### Bug Fixes

- **automation:** can't get list automations ([7add1a7](https://github.com/erxes/erxes/commit/7add1a79e764847bca24da42d21f201908765678))
- **automations:** fix magnet connect ([7abb235](https://github.com/erxes/erxes/commit/7abb235703b603bd23b9eb473ee4d52daab767af))
- **automations:** generate right url for bot data url in chatbot ([2c5d836](https://github.com/erxes/erxes/commit/2c5d8362ea446e91069883433de46811b91ab1e0))
- card reader result save ([dd30996](https://github.com/erxes/erxes/commit/dd30996c17a5937273ece738f30d262ff58efae0))
- **coreui:** can't disable button component ([592af11](https://github.com/erxes/erxes/commit/592af117c1169f7cadf6bdeeb952b99d6e4da892))
- **facebook:** can't edit bot & some ui fixes in bot form ([50d5ce9](https://github.com/erxes/erxes/commit/50d5ce94f1509d4dd72b8649e70e2ef763d913ec))
- **forms:** user passed as wrong prop name in customFieldsData Section ([fb6afa0](https://github.com/erxes/erxes/commit/fb6afa08342f8812461964c04418e061f2f98995))
- **internalnotes:** can't get contentIds in internalNotesByAction query ([c188c71](https://github.com/erxes/erxes/commit/c188c71ee27b51161ec0955ff4f98a4139d2ecea))
- **knowledgebase:** parent category error ([fdb04ea](https://github.com/erxes/erxes/commit/fdb04ea169ffbb39f035060dc9f74ae498bf7a91))
- MONGO_URL for local dev environments ([dcebe12](https://github.com/erxes/erxes/commit/dcebe12b4192848a85bb9637b1ee54a138dc4d27))
- pos-api syncOrderFromClient ([ccd5b1c](https://github.com/erxes/erxes/commit/ccd5b1cdaa3d21b2586de8fbfb04199b541588f7))
- product form with attachments ([2882cd5](https://github.com/erxes/erxes/commit/2882cd552e227217bef97df16473c632324c3219))
- typo ([01447d2](https://github.com/erxes/erxes/commit/01447d2a237ea904327de85b6e8ada56f965ba80))

### Performance Improvements

- **pos-ui:** os and saas merge code ([d165a4a](https://github.com/erxes/erxes/commit/d165a4afcb20d154a88aa4cabdd2292310a3c27c))

## [1.11.4](https://github.com/erxes/erxes/compare/1.12.0-rc.1...1.12.0-rc.3) (2024-06-02)

### Bug Fixes

- **coreui:** can't redirect onboarding route ([6854c20](https://github.com/erxes/erxes/commit/6854c207864b5051b4a1a9ade9149a74bfd8d3bf))

## [1.11.3](https://github.com/erxes/erxes/compare/1.12.0-rc.1...1.12.0-rc.3) (2024-05-30)

## [1.11.2](https://github.com/erxes/erxes/compare/1.12.0-rc.1...1.12.0-rc.3) (2024-05-30)

### Bug Fixes

- **coreui:** add headlessui dropdown modal ([054fe71](https://github.com/erxes/erxes/commit/054fe710784387995a517d9b664e54aa1f0b418c))

## [1.11.1](https://github.com/erxes/erxes/compare/1.12.0-rc.1...1.12.0-rc.3) (2024-05-29)

## [1.12.0-rc.2](https://github.com/erxes/erxes/compare/1.12.0-rc.1...1.12.0-rc.2) (2024-06-03)

### Bug Fixes

- **calls:** saved transfer call record ([afbcb1e](https://github.com/erxes/erxes/commit/afbcb1e4090cd238d126e21d311980af1c8c48d0))

## [1.11.0-rc.8](https://github.com/erxes/erxes/compare/1.12.0-rc.1...1.12.0-rc.2) (2024-05-28)

## [1.11.0-rc.7](https://github.com/erxes/erxes/compare/1.12.0-rc.1...1.12.0-rc.2) (2024-05-28)

## [1.11.0-rc.6](https://github.com/erxes/erxes/compare/1.12.0-rc.1...1.12.0-rc.2) (2024-05-28)

## [1.12.0-rc.1](https://github.com/erxes/erxes/compare/1.12.0-rc.0...1.12.0-rc.1) (2024-05-30)

### Bug Fixes

- (clientportal) bug and 2fa ([#5306](https://github.com/erxes/erxes/issues/5306)) ([793a0ff](https://github.com/erxes/erxes/commit/793a0ffde343fad75540977b764f2b14e45da3de))
- **calls:** undo ringing audio ([4cf7596](https://github.com/erxes/erxes/commit/4cf75966657ae0836142e6bd9d451c6386d8dbd3))
- **coreui:** add dropdown with modal component ([5de46fb](https://github.com/erxes/erxes/commit/5de46fbc88ec25f28f739bf4dadb07bf3a597b7c))
- **coreui:** headlessui dropdown modal save ([f040375](https://github.com/erxes/erxes/commit/f040375388d23eaf95b76f9ade916e69ee375ba4))
- **dropdown:** items style ([#5291](https://github.com/erxes/erxes/issues/5291)) ([c8d5155](https://github.com/erxes/erxes/commit/c8d51559a51e7aa448d1ad69efe8c4ba9fe6811e))
- **knowledgebase:** parent category error ([fdb04ea](https://github.com/erxes/erxes/commit/fdb04ea169ffbb39f035060dc9f74ae498bf7a91))
- **profile:** save button not working and add confirm action ([94c5bc3](https://github.com/erxes/erxes/commit/94c5bc33dad7d3276063735516cf5ac7a68f7272))
- **saas:** some styling and view ([#5207](https://github.com/erxes/erxes/issues/5207)) ([d56e990](https://github.com/erxes/erxes/commit/d56e990b26141ba9846c14be1c70ed78dcf723ba))

## [1.12.0-rc.0](https://github.com/erxes/erxes/compare/1.11.0-rc.9...1.12.0-rc.0) (2024-05-29)

### Features

- ebarimt 3.0 part of the pos ([be81482](https://github.com/erxes/erxes/commit/be8148278c52206dd0c81a22c357a9c644d0ebe4))
- Pos mobile theme ([#5205](https://github.com/erxes/erxes/issues/5205)) ([c43d76a](https://github.com/erxes/erxes/commit/c43d76adf25c4e746e73132460ad0a702b34a6ad))

### Bug Fixes

- **automation:** can't get list automations ([7add1a7](https://github.com/erxes/erxes/commit/7add1a79e764847bca24da42d21f201908765678))
- **automations:** fix magnet connect ([7abb235](https://github.com/erxes/erxes/commit/7abb235703b603bd23b9eb473ee4d52daab767af))
- **automations:** generate right url for bot data url in chatbot ([2c5d836](https://github.com/erxes/erxes/commit/2c5d8362ea446e91069883433de46811b91ab1e0))
- card reader result save ([5a0ba85](https://github.com/erxes/erxes/commit/5a0ba85efb063d7c9cc94d7c72d06f6b747dac3c))
- card reader result save ([dd30996](https://github.com/erxes/erxes/commit/dd30996c17a5937273ece738f30d262ff58efae0))
- **clientportal:** fix google and facebook authentication ([0752226](https://github.com/erxes/erxes/commit/07522261f8b09b087327bcf336a1bcd52ff76dbf))
- **coreui:** can't disable button component ([592af11](https://github.com/erxes/erxes/commit/592af117c1169f7cadf6bdeeb952b99d6e4da892))
- **facebook:** can't edit bot & some ui fixes in bot form ([50d5ce9](https://github.com/erxes/erxes/commit/50d5ce94f1509d4dd72b8649e70e2ef763d913ec))
- **forms:** user passed as wrong prop name in customFieldsData Section ([fb6afa0](https://github.com/erxes/erxes/commit/fb6afa08342f8812461964c04418e061f2f98995))
- **internalnotes:** can't get contentIds in internalNotesByAction query ([c188c71](https://github.com/erxes/erxes/commit/c188c71ee27b51161ec0955ff4f98a4139d2ecea))
- MONGO_URL for local dev environments ([dcebe12](https://github.com/erxes/erxes/commit/dcebe12b4192848a85bb9637b1ee54a138dc4d27))
- pos-api syncOrderFromClient ([ccd5b1c](https://github.com/erxes/erxes/commit/ccd5b1cdaa3d21b2586de8fbfb04199b541588f7))
- product form with attachments ([2882cd5](https://github.com/erxes/erxes/commit/2882cd552e227217bef97df16473c632324c3219))
- typo ([01447d2](https://github.com/erxes/erxes/commit/01447d2a237ea904327de85b6e8ada56f965ba80))

### Performance Improvements

- **pos-ui:** os and saas merge code ([d165a4a](https://github.com/erxes/erxes/commit/d165a4afcb20d154a88aa4cabdd2292310a3c27c))

## [1.11.0-rc.9](https://github.com/erxes/erxes/compare/1.11.0-rc.5...1.11.0-rc.9) (2024-05-28)

### Bug Fixes

- **calls:** some style ([91fdcd3](https://github.com/erxes/erxes/commit/91fdcd3caca8966605f7ef7654fa514829c44306))
- **cards:** ui audit and spacing ([#5218](https://github.com/erxes/erxes/issues/5218)) ([f10d5a5](https://github.com/erxes/erxes/commit/f10d5a5d5bb4ab6c196f9925061f6ecac39079dc))

## [1.11.0-rc.7](https://github.com/erxes/erxes/compare/1.11.0-rc.5...1.11.0-rc.7) (2024-05-28)

### Bug Fixes

- **calls:** some style ([91fdcd3](https://github.com/erxes/erxes/commit/91fdcd3caca8966605f7ef7654fa514829c44306))
- **cards:** ui audit and spacing ([#5218](https://github.com/erxes/erxes/issues/5218)) ([f10d5a5](https://github.com/erxes/erxes/commit/f10d5a5d5bb4ab6c196f9925061f6ecac39079dc))

## [1.11.0-rc.8](https://github.com/erxes/erxes/compare/1.11.0-rc.5...1.11.0-rc.8) (2024-05-28)

### Bug Fixes

- **calls:** some style ([91fdcd3](https://github.com/erxes/erxes/commit/91fdcd3caca8966605f7ef7654fa514829c44306))
- **cards:** ui audit and spacing ([#5218](https://github.com/erxes/erxes/issues/5218)) ([f10d5a5](https://github.com/erxes/erxes/commit/f10d5a5d5bb4ab6c196f9925061f6ecac39079dc))

## [1.11.0-rc.6](https://github.com/erxes/erxes/compare/1.11.0-rc.5...1.11.0-rc.6) (2024-05-28)

### Bug Fixes

- **calls:** some style ([91fdcd3](https://github.com/erxes/erxes/commit/91fdcd3caca8966605f7ef7654fa514829c44306))
- **cards:** ui audit and spacing ([#5218](https://github.com/erxes/erxes/issues/5218)) ([f10d5a5](https://github.com/erxes/erxes/commit/f10d5a5d5bb4ab6c196f9925061f6ecac39079dc))

## [1.11.0-rc.7](https://github.com/erxes/erxes/compare/1.11.0-rc.6...1.11.0-rc.7) (2024-05-28)

## [1.11.0-rc.6](https://github.com/erxes/erxes/compare/1.11.0-rc.5...1.11.0-rc.6) (2024-05-28)

## [1.11.0-rc.5](https://github.com/erxes/erxes/compare/1.11.0...1.11.0-rc.5) (2024-05-28)

- chore: add burenscoring in release yaml (194418d9d2)
- Merge branch 'master' of github.com:erxes/erxes into rc (0d664bad14)
- feat: ebarimt billType for customFieldsData (#5226) (59897b51b2)
- chore: improve code quality (#5288) (6c2d30f5c6)
- Merge branch 'master' into rc (5004b340cb)
- chore(forms): handle strings starting with slash as plain regex (6955c5e0ab)
- Merge branch 'master' of github.com:erxes/erxes (83655ec344)
- chore: add call history count (43f4573c8c)
- chore: debug on call assigned used (125fabca68)
- fix(calls): fixed history filter (122274dbce)
- chore: show log and added search value on history (82e08f7af1)
- remove console log (85b2f87c73)
- fix package.json (be78ee6cc1)
- update pluginsMap (9a35c69e45)
- undo alert (ebba93b871)
- fix(calls): update callhistory query (39fdcba266)
- fix(calls): add sound (3aefb969ab)
- fix(calls): add go to conversation and search in history (b5e6e31b2b)
- fix(calls): update agent status (4a066b2291)
- fix(calls): agentStatus ui update (76bcff07ce)
- Merge branch 'rc' of github.com:erxes/erxes into rc (8104adefd2)
- fix(calls): add default open option in popover (bed6a668e8)
- fix(calls): add conversation detail (e07a5aa2ab)
- chore: update ui configs and essyncer (8ee46f8e29)

## [1.11.0-rc.4](https://github.com/erxes/erxes/compare/1.11.0-rc.3...1.11.0-rc.4) (2024-05-22)

### Features

- **calls:** added pause feature ([09ca636](https://github.com/erxes/erxes/commit/09ca63674c687f3d4a1188a8a7c994626fc4a480))

### Bug Fixes

- **calls:** Update some ui ([ece0dc8](https://github.com/erxes/erxes/commit/ece0dc8e24a823ed324404c12c78183bb0e576b8))
- **contacts:** Update user save ([f17d163](https://github.com/erxes/erxes/commit/f17d163f801957afff67fe813a1f48c7e46c79d9))

## [1.11.0-rc.3](https://github.com/erxes/erxes/compare/1.11.0-rc.3...1.11.0-rc.4) (2024-05-22)

### Features

- **calls:** added wait mode and transfer call and logs ([5b8854c](https://github.com/erxes/erxes/commit/5b8854cef31bb5938f8d857a1f85fb2d68c26766))

### Bug Fixes

- **inbox:** integration typename error ([50cdfbe](https://github.com/erxes/erxes/commit/50cdfbe4f9694ec3afb8497ec9f9dacf14173afc))
- **responsetemplate:** show save button ([ef3d79c](https://github.com/erxes/erxes/commit/ef3d79c53e280cc6bf1cbf71a43d950956074990))

## [1.11.0-rc.1](https://github.com/erxes/erxes/compare/1.11.0-rc.3...1.11.0-rc.4) (2024-05-20)

### Bug Fixes

- **cards:** detail chooser, properties and automation attribute ([#5210](https://github.com/erxes/erxes/issues/5210)) ([f4be0a7](https://github.com/erxes/erxes/commit/f4be0a730b037b754cc1d18c91126bd118bfefc0))

## [1.11.0-rc.0](https://github.com/erxes/erxes/compare/1.11.0-rc.3...1.11.0-rc.4) (2024-05-16)

### Bug Fixes

- Collateral type ([#5209](https://github.com/erxes/erxes/issues/5209)) ([b7f14e7](https://github.com/erxes/erxes/commit/b7f14e7113b5901e031df76485e9ac22ba61d14c))
- pos update groups fix ([03af5b5](https://github.com/erxes/erxes/commit/03af5b57372a107c48394ec92c7cf0ad7a7f0994))

## [1.10.0-rc.5](https://github.com/erxes/erxes/compare/1.11.0-rc.3...1.11.0-rc.4) (2024-05-15)

### Features

- add plugin buren scoring ([#5162](https://github.com/erxes/erxes/issues/5162)) ([b50c189](https://github.com/erxes/erxes/commit/b50c189a8ed226947daa677f663b427943fe321a))
- **email-verifier:** use clearout for email validation ([6260771](https://github.com/erxes/erxes/commit/62607713b19ed88d04d75400be3d7098c1380bea))

### Bug Fixes

- (merge) clientportal ([#5201](https://github.com/erxes/erxes/issues/5201)) ([5b4e6cf](https://github.com/erxes/erxes/commit/5b4e6cfad5959a9d73b0a2ffdd36fefa6066d0cf))
- **automation:** facebook message won't send ([949427a](https://github.com/erxes/erxes/commit/949427a19c7e8a2c14cd29965f7c8b0feb4807e7))
- clientportal improvement, vendor filter ([#5195](https://github.com/erxes/erxes/issues/5195)) ([9fb8b1d](https://github.com/erxes/erxes/commit/9fb8b1d501a41f219c972c6bc7f16584ca038429))
- **contacts:** change onClick action of manual email/phone validation status ([636e2f0](https://github.com/erxes/erxes/commit/636e2f0f53c962c6bbbd5a0478c46c3c64cd9a99))
- **loans:** Modal fix ([#5187](https://github.com/erxes/erxes/issues/5187)) ([1d7cea2](https://github.com/erxes/erxes/commit/1d7cea222af631358c997eaa47b541bccac0077a))
- msd product category syn with parent category ([0c367d8](https://github.com/erxes/erxes/commit/0c367d87046c7ca0c1fb80da9a285a90512eccf5))
- msdynamic check products Allow_Ecommerce ([2f717fe](https://github.com/erxes/erxes/commit/2f717febb5763a035a4d4508ec6c047d4204014e))
- msdynamic exclude item_category_code is null ([368783f](https://github.com/erxes/erxes/commit/368783f992cf0e3f3706c176431b0e96cfab3a6d))
- msdynamic item code not replace ([698eb1b](https://github.com/erxes/erxes/commit/698eb1be748d738128f0f99b501ed7b72f9a29c6))
- msdynamic Price_Inc_CityTax_and_VAT ([ca08979](https://github.com/erxes/erxes/commit/ca089796edde0011576d486d9c1da310c74a7316))
- msdynamic update check categories ([fefdb10](https://github.com/erxes/erxes/commit/fefdb108f69641968a6b7032d3bcff7c23b3d3a3))
- msdynamic update check categories ([f90c64e](https://github.com/erxes/erxes/commit/f90c64ed037eee7ae60d0a1758521daa9f790258))
- posclient product categories filter by ids ([6662501](https://github.com/erxes/erxes/commit/666250151b40b31f4018b06affae7cfe57637b90))

### Performance Improvements

- **widgets:** improve load time by specifying width for messenger launcher icon in widgets ([4be7b9e](https://github.com/erxes/erxes/commit/4be7b9e612233a875430797379702ff442c4f3d6))

### Reverts

- **verifier:** fallback to reacherhq ([75811a0](https://github.com/erxes/erxes/commit/75811a0caf46e1029e4df48904bf76b05698e4ac))
- **verifier:** revert to sendgrid ([960180c](https://github.com/erxes/erxes/commit/960180ce0fef2f92b658af0ca07bdc5a12f9aff5))

## [1.10.1](https://github.com/erxes/erxes/compare/1.11.0-rc.3...1.11.0-rc.4) (2024-05-22)

### Features

- ebarimt 3.0 ([af774fc](https://github.com/erxes/erxes/commit/af774fcb228d3fc746f32abab522b3385928dce7))

## [1.11.0-rc.3](https://github.com/erxes/erxes/compare/1.11.0-rc.1...1.11.0-rc.3) (2024-05-22)

## [1.10.1](https://github.com/erxes/erxes/compare/1.10.0...1.10.1) (2024-05-22)

### Features

- **calls:** added wait mode and transfer call and logs ([5b8854c](https://github.com/erxes/erxes/commit/5b8854cef31bb5938f8d857a1f85fb2d68c26766))

### Bug Fixes

- **inbox:** integration typename error ([50cdfbe](https://github.com/erxes/erxes/commit/50cdfbe4f9694ec3afb8497ec9f9dacf14173afc))
- **responsetemplate:** show save button ([ef3d79c](https://github.com/erxes/erxes/commit/ef3d79c53e280cc6bf1cbf71a43d950956074990))

## [1.10.0-rc.5](https://github.com/erxes/erxes/compare/1.11.0-rc.1...1.11.0-rc.3) (2024-05-15)

## [1.11.0-rc.1](https://github.com/erxes/erxes/compare/1.11.0-rc.0...1.11.0-rc.1) (2024-05-20)

### Bug Fixes

- **cards:** detail chooser, properties and automation attribute ([#5210](https://github.com/erxes/erxes/issues/5210)) ([f4be0a7](https://github.com/erxes/erxes/commit/f4be0a730b037b754cc1d18c91126bd118bfefc0))

## [1.11.0-rc.0](https://github.com/erxes/erxes/compare/1.10.0...1.11.0-rc.0) (2024-05-16)

### Features

- add plugin buren scoring ([#5162](https://github.com/erxes/erxes/issues/5162)) ([b50c189](https://github.com/erxes/erxes/commit/b50c189a8ed226947daa677f663b427943fe321a))
- **email-verifier:** use clearout for email validation ([6260771](https://github.com/erxes/erxes/commit/62607713b19ed88d04d75400be3d7098c1380bea))

### Bug Fixes

- (merge) clientportal ([#5201](https://github.com/erxes/erxes/issues/5201)) ([5b4e6cf](https://github.com/erxes/erxes/commit/5b4e6cfad5959a9d73b0a2ffdd36fefa6066d0cf))
- **automation:** facebook message won't send ([949427a](https://github.com/erxes/erxes/commit/949427a19c7e8a2c14cd29965f7c8b0feb4807e7))
- clientportal improvement, vendor filter ([#5195](https://github.com/erxes/erxes/issues/5195)) ([9fb8b1d](https://github.com/erxes/erxes/commit/9fb8b1d501a41f219c972c6bc7f16584ca038429))
- Collateral type ([#5209](https://github.com/erxes/erxes/issues/5209)) ([b7f14e7](https://github.com/erxes/erxes/commit/b7f14e7113b5901e031df76485e9ac22ba61d14c))
- **contacts:** change onClick action of manual email/phone validation status ([636e2f0](https://github.com/erxes/erxes/commit/636e2f0f53c962c6bbbd5a0478c46c3c64cd9a99))
- **loans:** Modal fix ([#5187](https://github.com/erxes/erxes/issues/5187)) ([1d7cea2](https://github.com/erxes/erxes/commit/1d7cea222af631358c997eaa47b541bccac0077a))
- msd product category syn with parent category ([0c367d8](https://github.com/erxes/erxes/commit/0c367d87046c7ca0c1fb80da9a285a90512eccf5))
- msdynamic check products Allow_Ecommerce ([2f717fe](https://github.com/erxes/erxes/commit/2f717febb5763a035a4d4508ec6c047d4204014e))
- msdynamic exclude item_category_code is null ([368783f](https://github.com/erxes/erxes/commit/368783f992cf0e3f3706c176431b0e96cfab3a6d))
- msdynamic item code not replace ([698eb1b](https://github.com/erxes/erxes/commit/698eb1be748d738128f0f99b501ed7b72f9a29c6))
- msdynamic Price_Inc_CityTax_and_VAT ([ca08979](https://github.com/erxes/erxes/commit/ca089796edde0011576d486d9c1da310c74a7316))
- msdynamic update check categories ([fefdb10](https://github.com/erxes/erxes/commit/fefdb108f69641968a6b7032d3bcff7c23b3d3a3))
- msdynamic update check categories ([f90c64e](https://github.com/erxes/erxes/commit/f90c64ed037eee7ae60d0a1758521daa9f790258))
- pos update groups fix ([03af5b5](https://github.com/erxes/erxes/commit/03af5b57372a107c48394ec92c7cf0ad7a7f0994))
- posclient product categories filter by ids ([6662501](https://github.com/erxes/erxes/commit/666250151b40b31f4018b06affae7cfe57637b90))

### Performance Improvements

- **widgets:** improve load time by specifying width for messenger launcher icon in widgets ([4be7b9e](https://github.com/erxes/erxes/commit/4be7b9e612233a875430797379702ff442c4f3d6))

### Reverts

- **verifier:** fallback to reacherhq ([75811a0](https://github.com/erxes/erxes/commit/75811a0caf46e1029e4df48904bf76b05698e4ac))
- **verifier:** revert to sendgrid ([960180c](https://github.com/erxes/erxes/commit/960180ce0fef2f92b658af0ca07bdc5a12f9aff5))

## [1.11.0-rc.0](https://github.com/erxes/erxes/compare/1.10.0...1.11.0-rc.0) (2024-05-16)

### Features

- add plugin buren scoring ([#5162](https://github.com/erxes/erxes/issues/5162)) ([b50c189](https://github.com/erxes/erxes/commit/b50c189a8ed226947daa677f663b427943fe321a))
- **email-verifier:** use clearout for email validation ([6260771](https://github.com/erxes/erxes/commit/62607713b19ed88d04d75400be3d7098c1380bea))

### Bug Fixes

- (merge) clientportal ([#5201](https://github.com/erxes/erxes/issues/5201)) ([5b4e6cf](https://github.com/erxes/erxes/commit/5b4e6cfad5959a9d73b0a2ffdd36fefa6066d0cf))
- **automation:** facebook message won't send ([949427a](https://github.com/erxes/erxes/commit/949427a19c7e8a2c14cd29965f7c8b0feb4807e7))
- clientportal improvement, vendor filter ([#5195](https://github.com/erxes/erxes/issues/5195)) ([9fb8b1d](https://github.com/erxes/erxes/commit/9fb8b1d501a41f219c972c6bc7f16584ca038429))
- Collateral type ([#5209](https://github.com/erxes/erxes/issues/5209)) ([b7f14e7](https://github.com/erxes/erxes/commit/b7f14e7113b5901e031df76485e9ac22ba61d14c))
- **contacts:** change onClick action of manual email/phone validation status ([636e2f0](https://github.com/erxes/erxes/commit/636e2f0f53c962c6bbbd5a0478c46c3c64cd9a99))
- **loans:** Modal fix ([#5187](https://github.com/erxes/erxes/issues/5187)) ([1d7cea2](https://github.com/erxes/erxes/commit/1d7cea222af631358c997eaa47b541bccac0077a))
- msd product category syn with parent category ([0c367d8](https://github.com/erxes/erxes/commit/0c367d87046c7ca0c1fb80da9a285a90512eccf5))
- msdynamic check products Allow_Ecommerce ([2f717fe](https://github.com/erxes/erxes/commit/2f717febb5763a035a4d4508ec6c047d4204014e))
- msdynamic exclude item_category_code is null ([368783f](https://github.com/erxes/erxes/commit/368783f992cf0e3f3706c176431b0e96cfab3a6d))
- msdynamic item code not replace ([698eb1b](https://github.com/erxes/erxes/commit/698eb1be748d738128f0f99b501ed7b72f9a29c6))
- msdynamic Price_Inc_CityTax_and_VAT ([ca08979](https://github.com/erxes/erxes/commit/ca089796edde0011576d486d9c1da310c74a7316))
- msdynamic update check categories ([fefdb10](https://github.com/erxes/erxes/commit/fefdb108f69641968a6b7032d3bcff7c23b3d3a3))
- msdynamic update check categories ([f90c64e](https://github.com/erxes/erxes/commit/f90c64ed037eee7ae60d0a1758521daa9f790258))
- pos update groups fix ([03af5b5](https://github.com/erxes/erxes/commit/03af5b57372a107c48394ec92c7cf0ad7a7f0994))
- posclient product categories filter by ids ([6662501](https://github.com/erxes/erxes/commit/666250151b40b31f4018b06affae7cfe57637b90))

### Performance Improvements

- **widgets:** improve load time by specifying width for messenger launcher icon in widgets ([4be7b9e](https://github.com/erxes/erxes/commit/4be7b9e612233a875430797379702ff442c4f3d6))

### Reverts

- **verifier:** fallback to reacherhq ([75811a0](https://github.com/erxes/erxes/commit/75811a0caf46e1029e4df48904bf76b05698e4ac))
- **verifier:** revert to sendgrid ([960180c](https://github.com/erxes/erxes/commit/960180ce0fef2f92b658af0ca07bdc5a12f9aff5))

* ebarimt 3.0 ([af774fc](https://github.com/erxes/erxes/commit/af774fcb228d3fc746f32abab522b3385928dce7))

## [1.10.0](https://github.com/erxes/erxes/compare/1.10.0-rc.7...1.10.0) (2024-05-16)

## [1.10.0-rc.7](https://github.com/erxes/erxes/compare/1.10.0-rc.6...1.10.0-rc.7) (2024-05-16)

## [1.10.0-rc.6](https://github.com/erxes/erxes/compare/1.10.0-rc.4...1.10.0-rc.6) (2024-05-16)

### Features

- **calls:** add activity log and fix incoming call widget ([4c6acf3](https://github.com/erxes/erxes/commit/4c6acf36a6280baddcbe44f08463713698b46221))

### Bug Fixes

- **cards:** card & insight bugs ([#5202](https://github.com/erxes/erxes/issues/5202)) ([49d35f8](https://github.com/erxes/erxes/commit/49d35f8e2f7c6ec163374e5d40f95c09fdfd78a6))

## [1.10.0-rc.4](https://github.com/erxes/erxes/compare/1.10.0-rc.3...1.10.0-rc.4) (2024-05-13)

### Features

- **core:** add 'inline' query parameter to 'read-file' endpoint for direct browser opening instead of download ([d91e895](https://github.com/erxes/erxes/commit/d91e89515126ea69761c03de4c34fbcde7849b5c))

## [1.9.1](https://github.com/erxes/erxes/compare/1.10.0-rc.3...1.10.0-rc.4) (2024-05-08)

### Bug Fixes

- **erxes-ui:** remove undefined or null elements from attachments ([dadc273](https://github.com/erxes/erxes/commit/dadc273b42add41b4c8635f18e1526519d020196))

## [1.9.0](https://github.com/erxes/erxes/compare/1.10.0-rc.3...1.10.0-rc.4) (2024-05-01)

### Bug Fixes

- **calls:** fix calls widgets in saas ([d7d462b](https://github.com/erxes/erxes/commit/d7d462b33c774c700aaa5c1e22eb7547d12e8165))
- generate subdomain in configs ([97bb518](https://github.com/erxes/erxes/commit/97bb518e37a3d7929eca25d5940b0804aaed759c))

### Performance Improvements

- fix context subdomain in saas ([c1fbdad](https://github.com/erxes/erxes/commit/c1fbdadfd465435cd9a494022cab15111476ba9d))

## [1.10.0-rc.3](https://github.com/erxes/erxes/compare/1.10.0-rc.2...1.10.0-rc.3) (2024-05-13)

### Bug Fixes

- **calls:** hide keypad when receive call ([cf839fe](https://github.com/erxes/erxes/commit/cf839feb0a5c3597bf00b9835fc18c29de424e6d))
- **cards:** fix add cart bug ([#5194](https://github.com/erxes/erxes/issues/5194)) ([2379d14](https://github.com/erxes/erxes/commit/2379d1421cbfb356ad0d685dd9d3b06e7359673d))
- **cards:** Left sidebar width error in cards detail ([#5192](https://github.com/erxes/erxes/issues/5192)) ([7a18242](https://github.com/erxes/erxes/commit/7a1824246e9044131329473a8767571e0441f855))
- **insight:** section select ([#5200](https://github.com/erxes/erxes/issues/5200)) ([e36c05b](https://github.com/erxes/erxes/commit/e36c05b9796806f2d96aa31b1b2b45755906ccf1))

## [1.10.0-rc.2](https://github.com/erxes/erxes/compare/1.10.0-rc.1...1.10.0-rc.2) (2024-05-09)

### Bug Fixes

- **automation:** facebook message won't send ([7e4399c](https://github.com/erxes/erxes/commit/7e4399c4e46169f55f7e30624c52303fdda3e9bb))
- **insight:** edit error & fix cards sidebar items ([#5193](https://github.com/erxes/erxes/issues/5193)) ([85062e7](https://github.com/erxes/erxes/commit/85062e72ef1878258ff78c908a8c05fb260ae619))

## [1.10.0-rc.1](https://github.com/erxes/erxes/compare/1.10.0-rc.0...1.10.0-rc.1) (2024-05-05)

### Bug Fixes

- cards change pipeline ([5b34c6d](https://github.com/erxes/erxes/commit/5b34c6d61b3cf7f15a43cbb3992142519040e890))
- create user with fullName from erxes app ([0e99624](https://github.com/erxes/erxes/commit/0e9962401bfe38a25d29ce3f8a835bd94a48df1c))
- reserve remainders permission ([b7cab5c](https://github.com/erxes/erxes/commit/b7cab5c4fc83b0bd29332b2bac63a9400064eb31))

### Performance Improvements

- **core:** Convert to react18 ([#5186](https://github.com/erxes/erxes/issues/5186)) ([e08ce55](https://github.com/erxes/erxes/commit/e08ce555a5a2107f1e2250246bb8b5258f04a74b))

## [1.10.0-rc.0](https://github.com/erxes/erxes/compare/1.9.0-rc.2...1.10.0-rc.0) (2024-05-01)

### Features

- **calls:** add record and fix subscription ([#5175](https://github.com/erxes/erxes/issues/5175)) ([66ba478](https://github.com/erxes/erxes/commit/66ba478538548e044970a986c2649a04217af6de))
- client saving contract request ([#5172](https://github.com/erxes/erxes/issues/5172)) ([99076a2](https://github.com/erxes/erxes/commit/99076a2dac5f3b566975828a1f43acb106034130))
- **instagram:** Added post ([6476730](https://github.com/erxes/erxes/commit/6476730ea5cfee5e586087803d7ea1e392f28df4))
- Loan block and savings block ([#5142](https://github.com/erxes/erxes/issues/5142)) ([98cb5ae](https://github.com/erxes/erxes/commit/98cb5aeb59ea408ef23f0097c427ef90831a3791))
- **timeclock:** add 'note' field to Schedule schema ([abf023e](https://github.com/erxes/erxes/commit/abf023ef44e273659a69dd94ca43856e9679a9a0))

### Bug Fixes

- **calls:** remove receive call and fix call status ([76ac111](https://github.com/erxes/erxes/commit/76ac11167a4697543a1cf7f0d809d720ccd21f01))
- clientportals notification ([#5151](https://github.com/erxes/erxes/issues/5151)) ([948a0b4](https://github.com/erxes/erxes/commit/948a0b4e721a675b90d4ab9e238e29144889e43f))
- **dailyco:** fix create room ([aef4968](https://github.com/erxes/erxes/commit/aef4968025608e094a865034437b8500668794a7))
- **facebook:** send conversationClientMessageInserted as RPC ([a8bd30e](https://github.com/erxes/erxes/commit/a8bd30e2d1cc94e7f04c14bc26055931f49cc483))
- **forms:** set associatedField when onPropertyChange fired ([035cc88](https://github.com/erxes/erxes/commit/035cc8864babb093919d465133c09b885f13d46e))
- **forms:** set associatedField when onPropertyChange fired ([eea78df](https://github.com/erxes/erxes/commit/eea78dff750026a35916d90b3bc2a8ca41ff438e))
- **forms:** show placeholder text on form description unless form object has description property ([b273285](https://github.com/erxes/erxes/commit/b27328535578f99843910f24292ff1faf50c302c))
- **imap:** fixed action log ([b3e1356](https://github.com/erxes/erxes/commit/b3e13562543363dd993133b61d356c7d7f686ed8))
- **inbox:** checked user on sendNotifications ([b6e44ae](https://github.com/erxes/erxes/commit/b6e44aef99c6b690e5833b1ebfdb963f799b2760))
- **inbox:** fix issue with saving image width changes in form callout step ([c7a4a12](https://github.com/erxes/erxes/commit/c7a4a12b1cb3ce135da15862c41efe7cba7199ad))
- loans and savings ([#5165](https://github.com/erxes/erxes/issues/5165)) ([b5a6f1d](https://github.com/erxes/erxes/commit/b5a6f1df65f038da6529b259f51b21b09f3b3390))
- Ms dynamic sync log save for sales line ([#5153](https://github.com/erxes/erxes/issues/5153)) ([8f2533a](https://github.com/erxes/erxes/commit/8f2533a836ec9c80d1470a666ae0f98bb33a55f6))
- Ms dynamic sync price refactor ([#5167](https://github.com/erxes/erxes/issues/5167)) ([a610dd8](https://github.com/erxes/erxes/commit/a610dd847eddb4681ebbc2a44464e1a6fb867672))
- Ms dynamic sync price update ([#5161](https://github.com/erxes/erxes/issues/5161)) ([3d94ba9](https://github.com/erxes/erxes/commit/3d94ba971c6a7321b36de04328354b0e4cfcc481))
- Ms dynamic sync products price update ([#5158](https://github.com/erxes/erxes/issues/5158)) ([b0ffdd0](https://github.com/erxes/erxes/commit/b0ffdd0b4d453627d4fc1b8d395eb1c2bf73305c))
- products similarity by default ([a8dea91](https://github.com/erxes/erxes/commit/a8dea910a2d60fde2e133ba640da57854ebd2ae4))
- products similarity refactor ([6d9ce6f](https://github.com/erxes/erxes/commit/6d9ce6f2a118ec502745f2740c3cc513cd0c255a))
- **response:** refresh edit ([#5157](https://github.com/erxes/erxes/issues/5157)) ([131f776](https://github.com/erxes/erxes/commit/131f776a9a7111fe7bb1cd77707fa061d35a2f97))
- RTE mention plugin & document editor issue ([69ac4fd](https://github.com/erxes/erxes/commit/69ac4fdc00379125bd2b3e4ec6bbc18182101019))
- **widgets:** change call out image width based on calloutImgSize ([6d168bd](https://github.com/erxes/erxes/commit/6d168bd7d3977f1434663475cdcccf29e7b1b595))
- **widgets:** set defaultValue of select field to first option by default ([657f57e](https://github.com/erxes/erxes/commit/657f57ea4c3f81b35d0a7e186d0c359575bc0848))

## [1.9.0-rc.2](https://github.com/erxes/erxes/compare/1.9.0-rc.1...1.9.0-rc.2) (2024-04-30)

## [1.9.0-rc.1](https://github.com/erxes/erxes/compare/1.9.0-rc.1...1.9.0-rc.2) (2024-04-26)

### Features

- **instagram:** add instagram post integration ([af364a1](https://github.com/erxes/erxes/commit/af364a1f0897b5a93071f3ebe5e8c7f5814c77bc))

### Bug Fixes

- **calls:** remove receiveCalls ([e1335d5](https://github.com/erxes/erxes/commit/e1335d531047639e0b64097930a2f0788b6256dc))

## [1.9.0-rc.0](https://github.com/erxes/erxes/compare/1.9.0-rc.1...1.9.0-rc.2) (2024-04-17)

### Features

- **cars:** Cars improvement ([#5120](https://github.com/erxes/erxes/issues/5120)) ([0aded13](https://github.com/erxes/erxes/commit/0aded133515f4b76c0de8790ce9ae980d74e2196))
- **loans:** contractType with product and customField, and clientQuery ([#5128](https://github.com/erxes/erxes/issues/5128)) ([e1bd7ff](https://github.com/erxes/erxes/commit/e1bd7fffc34d39eb5b5a1a0648b7a6dfc3b0ff4a))
- msdynamics check synced sale orders ([#5123](https://github.com/erxes/erxes/issues/5123)) ([d807efa](https://github.com/erxes/erxes/commit/d807efa350d496b7dd023e8f6da2fb8ce007cf87))
- **syncpolaris:** non balance transaction && polaris fix ([#5121](https://github.com/erxes/erxes/issues/5121)) ([7272785](https://github.com/erxes/erxes/commit/727278541706bf827ba6312f5665c9e3bb6d41d7))
- **timeclock:** schedule config update ([2faf6cb](https://github.com/erxes/erxes/commit/2faf6cb74c4f179d932dc2f632989e95f0023079))

### Bug Fixes

- **calls:** fix duplicated conversations ([05680c2](https://github.com/erxes/erxes/commit/05680c28c440991797e5460afb9a5217d31cef88))
- **emailtemplates:** fix email templates ([6c39314](https://github.com/erxes/erxes/commit/6c3931468f8f27dfa41d92f6573320b552807e91))
- fix inbox report ([a8f54b3](https://github.com/erxes/erxes/commit/a8f54b3961ee51d12ad52995edf4f29a04e838ff))
- **imap:** message false showed ([0fa0993](https://github.com/erxes/erxes/commit/0fa09936e712b2bb8f73fefc08d3c4944f76ed6c))
- insight report bugs ([a2253e7](https://github.com/erxes/erxes/commit/a2253e78be17a1bd0c335843a43a6557ef0b3163))
- posclient login or currentConfig conflict ([d41eac0](https://github.com/erxes/erxes/commit/d41eac090d417044e02a1847f6c15bcf7fd7f425))
- with team member restrictions filter ([a396257](https://github.com/erxes/erxes/commit/a396257d0f60106b49f00b3082afb742ad8aa98a))

## [1.8.3](https://github.com/erxes/erxes/compare/1.9.0-rc.1...1.9.0-rc.2) (2024-04-29)

### Bug Fixes

- **automations:** generateElkId of idtoCheck in isInSegment ([eb9e023](https://github.com/erxes/erxes/commit/eb9e02339ee7f2f08e7cefcce92cef02ae617fe8))
- **payment:** update query inside storepayCallbackHandler ([eaaf73a](https://github.com/erxes/erxes/commit/eaaf73a583936f4e86a741aa59e85ab67f4c4168))

## [1.9.0-rc.1](https://github.com/erxes/erxes/compare/1.9.0-rc.0...1.9.0-rc.1) (2024-04-26)

### Features

- **instagram:** add instagram post integration ([af364a1](https://github.com/erxes/erxes/commit/af364a1f0897b5a93071f3ebe5e8c7f5814c77bc))

## [1.8.3](https://github.com/erxes/erxes/compare/1.8.2...1.8.3) (2024-04-29)

### Bug Fixes

- **calls:** remove receiveCalls ([e1335d5](https://github.com/erxes/erxes/commit/e1335d531047639e0b64097930a2f0788b6256dc))
- **segments:** add await generateElkIds in associationPropertyFilter ([1b8ac09](https://github.com/erxes/erxes/commit/1b8ac0939b623cad9ba3677172d9dba620b41869))

## [1.9.0-rc.0](https://github.com/erxes/erxes/compare/1.9.0-rc.0...1.9.0-rc.1) (2024-04-17)

### Features

- **cars:** Cars improvement ([#5120](https://github.com/erxes/erxes/issues/5120)) ([0aded13](https://github.com/erxes/erxes/commit/0aded133515f4b76c0de8790ce9ae980d74e2196))
- **loans:** contractType with product and customField, and clientQuery ([#5128](https://github.com/erxes/erxes/issues/5128)) ([e1bd7ff](https://github.com/erxes/erxes/commit/e1bd7fffc34d39eb5b5a1a0648b7a6dfc3b0ff4a))
- msdynamics check synced sale orders ([#5123](https://github.com/erxes/erxes/issues/5123)) ([d807efa](https://github.com/erxes/erxes/commit/d807efa350d496b7dd023e8f6da2fb8ce007cf87))
- **syncpolaris:** non balance transaction && polaris fix ([#5121](https://github.com/erxes/erxes/issues/5121)) ([7272785](https://github.com/erxes/erxes/commit/727278541706bf827ba6312f5665c9e3bb6d41d7))
- **timeclock:** schedule config update ([2faf6cb](https://github.com/erxes/erxes/commit/2faf6cb74c4f179d932dc2f632989e95f0023079))

### Bug Fixes

- **calls:** fix duplicated conversations ([05680c2](https://github.com/erxes/erxes/commit/05680c28c440991797e5460afb9a5217d31cef88))
- **emailtemplates:** fix email templates ([6c39314](https://github.com/erxes/erxes/commit/6c3931468f8f27dfa41d92f6573320b552807e91))
- fix inbox report ([a8f54b3](https://github.com/erxes/erxes/commit/a8f54b3961ee51d12ad52995edf4f29a04e838ff))
- **imap:** message false showed ([0fa0993](https://github.com/erxes/erxes/commit/0fa09936e712b2bb8f73fefc08d3c4944f76ed6c))
- insight report bugs ([a2253e7](https://github.com/erxes/erxes/commit/a2253e78be17a1bd0c335843a43a6557ef0b3163))
- posclient login or currentConfig conflict ([d41eac0](https://github.com/erxes/erxes/commit/d41eac090d417044e02a1847f6c15bcf7fd7f425))
- with team member restrictions filter ([a396257](https://github.com/erxes/erxes/commit/a396257d0f60106b49f00b3082afb742ad8aa98a))

## [1.8.2](https://github.com/erxes/erxes/compare/1.9.0-rc.0...1.9.0-rc.1) (2024-04-25)

### Bug Fixes

- cancel pos order, use password logic ([4b1ea52](https://github.com/erxes/erxes/commit/4b1ea523a83a3e3d8ff424a846b786950b25b53e))
- **engages:** fix engages get aws config function (saas) ([ba9ba30](https://github.com/erxes/erxes/commit/ba9ba30803d5774802e7ee66d84bfa114114c382))
- **inbox:** resolve messenger loading issue for new customers ([716bc04](https://github.com/erxes/erxes/commit/716bc042f0e340c1ee4d3ea2136c284de2d0d975))

## [1.8.1](https://github.com/erxes/erxes/compare/1.9.0-rc.0...1.9.0-rc.1) (2024-04-18)

### Bug Fixes

- **custom domain:** fix saas custom domain config ([f74c50d](https://github.com/erxes/erxes/commit/f74c50dca9b97369a040879f8c12fa00d620cda5))

## [1.8.0](https://github.com/erxes/erxes/compare/1.9.0-rc.0...1.9.0-rc.1) (2024-04-17)

- **automations:** generateElkId of idtoCheck in isInSegment ([eb9e023](https://github.com/erxes/erxes/commit/eb9e02339ee7f2f08e7cefcce92cef02ae617fe8))
- **payment:** update query inside storepayCallbackHandler ([eaaf73a](https://github.com/erxes/erxes/commit/eaaf73a583936f4e86a741aa59e85ab67f4c4168))
- **segments:** add await generateElkIds in associationPropertyFilter ([1b8ac09](https://github.com/erxes/erxes/commit/1b8ac0939b623cad9ba3677172d9dba620b41869))

## [1.8.2](https://github.com/erxes/erxes/compare/1.8.1...1.8.2) (2024-04-25)

### Bug Fixes

- cancel pos order, use password logic ([4b1ea52](https://github.com/erxes/erxes/commit/4b1ea523a83a3e3d8ff424a846b786950b25b53e))
- **engages:** fix engages get aws config function (saas) ([ba9ba30](https://github.com/erxes/erxes/commit/ba9ba30803d5774802e7ee66d84bfa114114c382))
- **inbox:** resolve messenger loading issue for new customers ([716bc04](https://github.com/erxes/erxes/commit/716bc042f0e340c1ee4d3ea2136c284de2d0d975))

## [1.8.1](https://github.com/erxes/erxes/compare/1.8.0...1.8.1) (2024-04-18)

### Bug Fixes

- **custom domain:** fix saas custom domain config ([f74c50d](https://github.com/erxes/erxes/commit/f74c50dca9b97369a040879f8c12fa00d620cda5))

## [1.8.0](https://github.com/erxes/erxes/compare/1.8.0-rc.3...1.8.0) (2024-04-17)

### Bug Fixes

- **inbox:** RTE internal notes error fix ([5ad0b5e](https://github.com/erxes/erxes/commit/5ad0b5eddc430d936366f4851360a2365558553b))

## [1.8.0-rc.3](https://github.com/erxes/erxes/compare/1.8.0-rc.2...1.8.0-rc.3) (2024-04-15)

### Bug Fixes

- fix company filter, custom field chart & filter ([297108b](https://github.com/erxes/erxes/commit/297108b342e8941e6062677339e5dcc24a636858))

## [1.8.0-rc.2](https://github.com/erxes/erxes/compare/1.8.0-rc.1...1.8.0-rc.2) (2024-04-15)

### Bug Fixes

- **calls:** remove conversation owner ([9a30663](https://github.com/erxes/erxes/commit/9a306638797b500be018fece488fba57ec541a9d))

## [1.8.0-rc.1](https://github.com/erxes/erxes/compare/1.8.0-rc.1...1.8.0-rc.2) (2024-04-05)

## [1.8.0-rc.0](https://github.com/erxes/erxes/compare/1.8.0-rc.1...1.8.0-rc.2) (2024-04-03)

### Features

- **forms:** introduce new type 'Team members' as a new custom property option ([c992c1d](https://github.com/erxes/erxes/commit/c992c1d535886c973db280ec24914d2346fb7cb7))
- msDynamics get products remainder ([#5032](https://github.com/erxes/erxes/issues/5032)) ([fc09bc1](https://github.com/erxes/erxes/commit/fc09bc15a1f099e41d296cc7e001a66a76adcf40))

### Bug Fixes

- **calls:** add input action and fix many conversations and fix incoming call user ([9c41263](https://github.com/erxes/erxes/commit/9c4126335e315c79193458399643a5f64bfd1214))
- **ebarimt:** previously submitted ebarimt data has not yet been processed ([228164d](https://github.com/erxes/erxes/commit/228164d5031e3fa8b4f87f85c85212af3fb65386))
- **facebook:** fix login reload ([4e36459](https://github.com/erxes/erxes/commit/4e364595a0306d0d5456b5eb3a0530430749cc88))
- **instagram:** add reload ([7cbe389](https://github.com/erxes/erxes/commit/7cbe3897c64561134d48c5cb173ab91dd51aefe7))
- **instagram:** instagram reload ([adae6b9](https://github.com/erxes/erxes/commit/adae6b92dfddc44b6000684f7ce670803d0e1a37))
- internalnotes remove from main content remove ([cc4e452](https://github.com/erxes/erxes/commit/cc4e452df7d34c9566b6a43b5e4ffcf16e09f22b))
- multierkhet check deals render multi row ([66ef9a1](https://github.com/erxes/erxes/commit/66ef9a1537bd0d66689a12ffe3e2359a87954a6a))
- **posclient:** ebarimt waiting previous sending data ([9b9de6d](https://github.com/erxes/erxes/commit/9b9de6da56fd74b9132c06f4b5eac9af0fa9b7c4))
- products export filter by status ([955e8ba](https://github.com/erxes/erxes/commit/955e8bab01a96f564754d4a4b1d75b8ec14da071))
- **products:** filter segment data for tag and category options ([7d1cbbb](https://github.com/erxes/erxes/commit/7d1cbbbdbfdd37c608ae49ec0a80e607473546fc))
- **widgets:** fix country code select of phone input ([afce6e1](https://github.com/erxes/erxes/commit/afce6e134b025de1e54a87ab8e8972b2e59e42bd))

## [1.7.7](https://github.com/erxes/erxes/compare/1.8.0-rc.1...1.8.0-rc.2) (2024-04-15)

### Bug Fixes

- **broadcast:** fix client portal user middleware ([34c93a9](https://github.com/erxes/erxes/commit/34c93a9ead011410232b1d1c8597b5c5d8c579f0))
- **forms:** ensure default value is an Array if property type is file ([1d94a61](https://github.com/erxes/erxes/commit/1d94a616c3f365551ba0b615ff5e2d53c1884ff8))
- **instagram:** fix get config function ([0cb94c7](https://github.com/erxes/erxes/commit/0cb94c7372616c8f344a128438758d10e3cadef5))
- multierkhet billtype for company ([fbc57fb](https://github.com/erxes/erxes/commit/fbc57fb5016bcb6ea1135803e40609582fc780df))
- **payment:** updated invoice query contentType to handle 'cards' contentType ([af4a287](https://github.com/erxes/erxes/commit/af4a287f322263cc6997822cb23f7b86a4b01e88))
- products search input ([d6457be](https://github.com/erxes/erxes/commit/d6457be80e65ef696a29d9bc6372d609486b13e7))
- save convertDealId when pos order sync ([f5c8dfd](https://github.com/erxes/erxes/commit/f5c8dfd0e328002fbda532434fd986e4a6507dd7))

## [1.8.0-rc.1](https://github.com/erxes/erxes/compare/1.8.0-rc.0...1.8.0-rc.1) (2024-04-05)

## [1.8.0-rc.0](https://github.com/erxes/erxes/compare/1.8.0-rc.0...1.8.0-rc.1) (2024-04-03)

### Features

- **forms:** introduce new type 'Team members' as a new custom property option ([c992c1d](https://github.com/erxes/erxes/commit/c992c1d535886c973db280ec24914d2346fb7cb7))
- msDynamics get products remainder ([#5032](https://github.com/erxes/erxes/issues/5032)) ([fc09bc1](https://github.com/erxes/erxes/commit/fc09bc15a1f099e41d296cc7e001a66a76adcf40))

## [1.7.7](https://github.com/erxes/erxes/compare/1.7.6...1.7.7) (2024-04-15)

### Bug Fixes

- **calls:** add input action and fix many conversations and fix incoming call user ([9c41263](https://github.com/erxes/erxes/commit/9c4126335e315c79193458399643a5f64bfd1214))
- **ebarimt:** previously submitted ebarimt data has not yet been processed ([228164d](https://github.com/erxes/erxes/commit/228164d5031e3fa8b4f87f85c85212af3fb65386))
- **facebook:** fix login reload ([4e36459](https://github.com/erxes/erxes/commit/4e364595a0306d0d5456b5eb3a0530430749cc88))
- **instagram:** add reload ([7cbe389](https://github.com/erxes/erxes/commit/7cbe3897c64561134d48c5cb173ab91dd51aefe7))
- **instagram:** instagram reload ([adae6b9](https://github.com/erxes/erxes/commit/adae6b92dfddc44b6000684f7ce670803d0e1a37))
- internalnotes remove from main content remove ([cc4e452](https://github.com/erxes/erxes/commit/cc4e452df7d34c9566b6a43b5e4ffcf16e09f22b))
- multierkhet check deals render multi row ([66ef9a1](https://github.com/erxes/erxes/commit/66ef9a1537bd0d66689a12ffe3e2359a87954a6a))
- **posclient:** ebarimt waiting previous sending data ([9b9de6d](https://github.com/erxes/erxes/commit/9b9de6da56fd74b9132c06f4b5eac9af0fa9b7c4))
- products export filter by status ([955e8ba](https://github.com/erxes/erxes/commit/955e8bab01a96f564754d4a4b1d75b8ec14da071))
- **products:** filter segment data for tag and category options ([7d1cbbb](https://github.com/erxes/erxes/commit/7d1cbbbdbfdd37c608ae49ec0a80e607473546fc))
- **widgets:** fix country code select of phone input ([afce6e1](https://github.com/erxes/erxes/commit/afce6e134b025de1e54a87ab8e8972b2e59e42bd))

## [1.7.6](https://github.com/erxes/erxes/compare/1.8.0-rc.0...1.8.0-rc.1) (2024-04-05)

- **broadcast:** fix client portal user middleware ([34c93a9](https://github.com/erxes/erxes/commit/34c93a9ead011410232b1d1c8597b5c5d8c579f0))
- **forms:** ensure default value is an Array if property type is file ([1d94a61](https://github.com/erxes/erxes/commit/1d94a616c3f365551ba0b615ff5e2d53c1884ff8))
- **instagram:** fix get config function ([0cb94c7](https://github.com/erxes/erxes/commit/0cb94c7372616c8f344a128438758d10e3cadef5))
- multierkhet billtype for company ([fbc57fb](https://github.com/erxes/erxes/commit/fbc57fb5016bcb6ea1135803e40609582fc780df))
- **payment:** updated invoice query contentType to handle 'cards' contentType ([af4a287](https://github.com/erxes/erxes/commit/af4a287f322263cc6997822cb23f7b86a4b01e88))
- products search input ([d6457be](https://github.com/erxes/erxes/commit/d6457be80e65ef696a29d9bc6372d609486b13e7))
- save convertDealId when pos order sync ([f5c8dfd](https://github.com/erxes/erxes/commit/f5c8dfd0e328002fbda532434fd986e4a6507dd7))

## [1.7.6](https://github.com/erxes/erxes/compare/1.7.5...1.7.6) (2024-04-05)

### Bug Fixes

- **editor:** RTE related issues ([#5116](https://github.com/erxes/erxes/issues/5116)) ([7b580b8](https://github.com/erxes/erxes/commit/7b580b84100b6a6f6485510f441bfe542e3a7d7d))

## [1.8.0-rc.0](https://github.com/erxes/erxes/compare/1.7.5...1.8.0-rc.0) (2024-04-03)

### Features

- **forms:** introduce new type 'Team members' as a new custom property option ([c992c1d](https://github.com/erxes/erxes/commit/c992c1d535886c973db280ec24914d2346fb7cb7))
- msDynamics get products remainder ([#5032](https://github.com/erxes/erxes/issues/5032)) ([fc09bc1](https://github.com/erxes/erxes/commit/fc09bc15a1f099e41d296cc7e001a66a76adcf40))

## [1.7.6](https://github.com/erxes/erxes/compare/1.7.5...1.7.6) (2024-04-05)

### Bug Fixes

- **calls:** add input action and fix many conversations and fix incoming call user ([9c41263](https://github.com/erxes/erxes/commit/9c4126335e315c79193458399643a5f64bfd1214))
- **ebarimt:** previously submitted ebarimt data has not yet been processed ([228164d](https://github.com/erxes/erxes/commit/228164d5031e3fa8b4f87f85c85212af3fb65386))
- **facebook:** fix login reload ([4e36459](https://github.com/erxes/erxes/commit/4e364595a0306d0d5456b5eb3a0530430749cc88))
- **instagram:** add reload ([7cbe389](https://github.com/erxes/erxes/commit/7cbe3897c64561134d48c5cb173ab91dd51aefe7))
- **instagram:** instagram reload ([adae6b9](https://github.com/erxes/erxes/commit/adae6b92dfddc44b6000684f7ce670803d0e1a37))
- internalnotes remove from main content remove ([cc4e452](https://github.com/erxes/erxes/commit/cc4e452df7d34c9566b6a43b5e4ffcf16e09f22b))
- multierkhet check deals render multi row ([66ef9a1](https://github.com/erxes/erxes/commit/66ef9a1537bd0d66689a12ffe3e2359a87954a6a))
- **posclient:** ebarimt waiting previous sending data ([9b9de6d](https://github.com/erxes/erxes/commit/9b9de6da56fd74b9132c06f4b5eac9af0fa9b7c4))
- products export filter by status ([955e8ba](https://github.com/erxes/erxes/commit/955e8bab01a96f564754d4a4b1d75b8ec14da071))
- **products:** filter segment data for tag and category options ([7d1cbbb](https://github.com/erxes/erxes/commit/7d1cbbbdbfdd37c608ae49ec0a80e607473546fc))
- **widgets:** fix country code select of phone input ([afce6e1](https://github.com/erxes/erxes/commit/afce6e134b025de1e54a87ab8e8972b2e59e42bd))
- **editor:** RTE related issues ([#5116](https://github.com/erxes/erxes/issues/5116)) ([7b580b8](https://github.com/erxes/erxes/commit/7b580b84100b6a6f6485510f441bfe542e3a7d7d))

## [1.7.5](https://github.com/erxes/erxes/compare/1.7.4...1.7.5) (2024-04-02)

### Bug Fixes

- **xbuilder:** Entries list scroll not working ([#5084](https://github.com/erxes/erxes/issues/5084)) ([c4bc165](https://github.com/erxes/erxes/commit/c4bc165bc2c4f8a3e4a48a93577b85fc36b12e63))

## [1.7.4](https://github.com/erxes/erxes/compare/1.7.3...1.7.4) (2024-04-01)

### Bug Fixes

- segment count rabbitmq message ([ebf63a2](https://github.com/erxes/erxes/commit/ebf63a27c6c2c494598c119eff3f2dbfd27ef312))

## [1.7.3](https://github.com/erxes/erxes/compare/1.7.2...1.7.3) (2024-03-27)

### Bug Fixes

- **segment:** fix segment db connection string ([9519038](https://github.com/erxes/erxes/commit/9519038f3a9e69e6788ef68cb2d3dc97ba59cf19))

### Bug Fixes

- revert erxes request headers erxes-user to user ([cf0684b](https://github.com/erxes/erxes/commit/cf0684be5d2e7e8bceccd7bb47a4e79b7087a5f0))

## [1.7.2](https://github.com/erxes/erxes/compare/1.7.1...1.7.2) (2024-03-27)

### Bug Fixes

- customer render full name ([dc3aa68](https://github.com/erxes/erxes/commit/dc3aa68823e9abe6e9852451c66190ded2ca371e))

### Performance Improvements

- **calls:** increase session timers, fix call timer and add integration config ([ea49253](https://github.com/erxes/erxes/commit/ea49253ba53f08c03a86ac1cb3ad11b046d0a2d0))

## [1.7.1](https://github.com/erxes/erxes/compare/1.7.0...1.7.1) (2024-03-26)

### Features

- **calls:** check customer, add customer info on conversation and improved keypad ([9d7e363](https://github.com/erxes/erxes/commit/9d7e3636c1fcf896770c848d171b9b6ed121a32e))

### Bug Fixes

- customer render full name ([e4e454f](https://github.com/erxes/erxes/commit/e4e454f47e0ddba5b56e6084a1d65442c78acd0f))
- products filter by code condition regex ([df32b67](https://github.com/erxes/erxes/commit/df32b678e6c371fc4dacf506195fc7c6c0a325b2))

### Performance Improvements

- **facebook:** change facebook logs db collections ([a4e2b58](https://github.com/erxes/erxes/commit/a4e2b58ce2a8ec7a981946276de8b40ad65e64eb))

## [1.7.0](https://github.com/erxes/erxes/compare/1.7.0-rc.1...1.7.0) (2024-03-25)

### Features

- **calls:** improving calls ui ([2c53c42](https://github.com/erxes/erxes/commit/2c53c424e7be5560acea9e976429af9c7cf8faa2))

### Bug Fixes

- **coreui:** Update tiptap editor schema & make editor section resizable ([#5083](https://github.com/erxes/erxes/issues/5083)) ([8ea9c65](https://github.com/erxes/erxes/commit/8ea9c65c10b1afc20c447e958469a21908f34f5b))
- don't use frontend's getSubdomain function ([ac49388](https://github.com/erxes/erxes/commit/ac4938811b6e76301f8f69b12d3e939ed529d770))

## [1.7.0-rc.1](https://github.com/erxes/erxes/compare/1.7.0-rc.1...1.7.0) (2024-03-20)

## [1.7.0-rc.0](https://github.com/erxes/erxes/compare/1.7.0-rc.1...1.7.0) (2024-03-20)

### Features

- sync from polaris datas to erxes ([#5041](https://github.com/erxes/erxes/issues/5041)) ([9f894c1](https://github.com/erxes/erxes/commit/9f894c179f6616b0ecbb033826f78a8363135df7))
- add sale status on pos orders ([#5038](https://github.com/erxes/erxes/issues/5038)) ([561cda0](https://github.com/erxes/erxes/commit/561cda04faac0b4901a692ca8f2261183f15b43c))

### Bug Fixes

- hostname should be host. ([e540213](https://github.com/erxes/erxes/commit/e540213cf2e73b2ca538d67a10b93080407d3ade))
- **cards:** Stage probility not saving ([5a6847e](https://github.com/erxes/erxes/commit/5a6847e3127f9d1850e1c71e7cafc97bf87198e4))
- cars permission ([d551f73](https://github.com/erxes/erxes/commit/d551f732606133b776f2511f5ad115f77c0bf19a))
- **engage:** fix create tag bug of engage ([d312f24](https://github.com/erxes/erxes/commit/d312f24bbf361d747d76fa81eabbbebd8ab545a7))
- **erkhet:** Update main navigation names ([8bc57d2](https://github.com/erxes/erxes/commit/8bc57d2ddc78b96904258c19beb987f35ec7570d))
- exclude description from syncerkhet product update ([48eef48](https://github.com/erxes/erxes/commit/48eef481b03688723f2b71e9b7eeed6b86d92dc6))
- **inbox:** messenger integration preview is not visible because of erxes messenger ([fe88639](https://github.com/erxes/erxes/commit/fe8863944258125e1479686b7e4aa3b749994766))
- pageName proflePic token error on facebookt bots list ([906a13c](https://github.com/erxes/erxes/commit/906a13c34a476ea11cd520ae53fc0d6fa1e82c84))
- **posclient:** ordery by price and get delivery product price ([#5062](https://github.com/erxes/erxes/issues/5062)) ([092cbc7](https://github.com/erxes/erxes/commit/092cbc72271765c100de000e3eb814bd85dfa7dc))
- **products:** show alert uom required ([9d7c188](https://github.com/erxes/erxes/commit/9d7c188350827d4020c8f28e7b85ea003c243851))
- show archived product categories ([ade8d51](https://github.com/erxes/erxes/commit/ade8d5159d0959e2cf6d75c6fbd15d334420d0b8))
- sync polaris loan 's schedule ([#5064](https://github.com/erxes/erxes/issues/5064)) ([caf5036](https://github.com/erxes/erxes/commit/caf5036127ba582f3141c7276129f133f8b0f4a8))
- Syncpolaris update some query mutation and permission names ([#5070](https://github.com/erxes/erxes/issues/5070)) ([fb084ad](https://github.com/erxes/erxes/commit/fb084add4b4b3b80483ab3b6e7b383b64ed8f500))

### Performance Improvements

- products similarity group config filter by any field ([#5054](https://github.com/erxes/erxes/issues/5054)) ([c08436a](https://github.com/erxes/erxes/commit/c08436a002697cd90f320113c69d57711f3137c9))
- **settings:** Add confirmation modal when delete items ([e54a5e1](https://github.com/erxes/erxes/commit/e54a5e13ba5a9002937e31b781d2764ea9eceaa6))

## [1.6.4](https://github.com/erxes/erxes/compare/1.7.0-rc.1...1.7.0) (2024-03-21)

### [1.6.4](https://github.com/erxes/erxes/compare/1.6.3...1.6.4) (2024-03-21)

### [1.6.3](https://github.com/erxes/erxes/compare/1.6.3-rc.4...1.6.3) (2024-03-20)

### Features

- **ebarimt:** return bill for duplicated ([a5a7959](https://github.com/erxes/erxes/commit/a5a795929ec1fb2c6ca1bcd1859f7f10361a3af5))

### [1.6.3-rc.4](https://github.com/erxes/erxes/compare/1.6.3-rc.3...1.6.3-rc.4) (2024-03-18)

### Bug Fixes

- instagram-plugin login redirect url fix ([c17694e](https://github.com/erxes/erxes/commit/c17694e2750c9aef337cda68fb77d13af129214d))

### [1.6.3-rc.3](https://github.com/erxes/erxes/compare/1.6.3-rc.2...1.6.3-rc.3) (2024-03-18)

### Performance Improvements

- **calls:** improving calls ui & code refactor ([f052833](https://github.com/erxes/erxes/commit/f05283309004854dbdba93c55e3efe9dc7a769a4))
- **calls:** improving incoming call ui and code refactor ([6e5af5f](https://github.com/erxes/erxes/commit/6e5af5f6a8c5f002b1dbeb61463113f48a67ebdf))

### [1.6.3-rc.2](https://github.com/erxes/erxes/compare/1.6.3-rc.1...1.6.3-rc.2) (2024-03-13)

### Bug Fixes

- **timeclocks:** fix time clock list ui ([67196c9](https://github.com/erxes/erxes/commit/67196c9efe1f10ed7c60c2d3bea98619d54083fe))

### [1.6.3-rc.1](https://github.com/erxes/erxes/compare/1.6.3-rc.0...1.6.3-rc.1) (2024-03-07)

### Bug Fixes

- clean apolloClient timeout ([458ff06](https://github.com/erxes/erxes/commit/458ff06ce0470f581d4027e671a979c165f00d6c))

### [1.6.3-rc.0](https://github.com/erxes/erxes/compare/1.6.2...1.6.3-rc.0) (2024-03-06)

### Features

- **calls:** as widgets and solved connection ([030670f](https://github.com/erxes/erxes/commit/030670fba8bca7fa2baf1ee402cf356554b43d1f))
- **verifier:** Replace truemail with SendGrid Mail Verifier API ([d9d9cca](https://github.com/erxes/erxes/commit/d9d9cca852f400e271484e5d757670118b14810a))

### Bug Fixes

- (pos) posclient orders subscription update with subtoken ([7ad9ae8](https://github.com/erxes/erxes/commit/7ad9ae8708427d788f4f6a829a5a2073bc1b8252))
- **forms:** fix custom properties on contacts list ([#5046](https://github.com/erxes/erxes/issues/5046)) ([f63646e](https://github.com/erxes/erxes/commit/f63646ec7332578195f8c7b8cad87bc87e35aaa5))
- issue with the engage tag ([#5033](https://github.com/erxes/erxes/issues/5033)) ([e97e4d4](https://github.com/erxes/erxes/commit/e97e4d4b43cf81969c0767927107d566aa44bbe6))
- offline pos message uncheck queuename ([251bd41](https://github.com/erxes/erxes/commit/251bd415fa5ede6da1a4ae6531bac9227a139716))
- **payment:** Qpay quick qr credentials ([5def2ca](https://github.com/erxes/erxes/commit/5def2cab1688b4de9957b2a7ae4e2d01d978aa20))
- **saas:** case where db is shared between tenants ([85eeef1](https://github.com/erxes/erxes/commit/85eeef1bbebc4b95c32d024274cf7f8ea85e356a))

### Performance Improvements

- (pos) show items sum amount on market theme ([#5048](https://github.com/erxes/erxes/issues/5048)) ([f33340c](https://github.com/erxes/erxes/commit/f33340c0dd3ae143fd95bc28de0ffbcb750dd4ea))
- **engage:** updated manual engage, added engage notification count ([4a84007](https://github.com/erxes/erxes/commit/4a84007947ab3887705f2d3d6feaaa8ec4216263))
- product filter on the selected car deal depends on the car category ([#5037](https://github.com/erxes/erxes/issues/5037)) ([b42256d](https://github.com/erxes/erxes/commit/b42256de312f465ede0156094192a7c85089a4b5))

### [1.6.2](https://github.com/erxes/erxes/compare/1.6.2-rc.5...1.6.2) (2024-03-06)

### [1.6.2-rc.5](https://github.com/erxes/erxes/compare/1.6.2-rc.4...1.6.2-rc.5) (2024-03-05)

### Bug Fixes

- fix exmfeed,exm, chats plugins permssions not showing ([81318b5](https://github.com/erxes/erxes/commit/81318b5d2cf9c84f6a00f1b60434cb8b65c8ef0f))
- fix facebook get env function ([83dcb7a](https://github.com/erxes/erxes/commit/83dcb7a3dd92246d532d831b3c834853449d4aef))
- fix getEnv function for get domain ([b0c4f63](https://github.com/erxes/erxes/commit/b0c4f63a12ac75fb2e88cd459c371daf70f7c827))
- fix saas transaction emails ([e746ce8](https://github.com/erxes/erxes/commit/e746ce8f6c8e5cd2f551ef7a7f31e331b6de5e90))

### Performance Improvements

- **cards:** add assigneduserIds field in cards schema ([e7e1770](https://github.com/erxes/erxes/commit/e7e1770860277be73fcc90d7d1b6e97b73c62969))

## [1.6.2-rc.4](https://github.com/erxes/erxes/compare/1.6.2-rc.3...1.6.2-rc.4) (2024-02-29)

### Performance Improvements

- **respond box:** rich text editor performance ([b5848d6](https://github.com/erxes/erxes/commit/b5848d6a4836c0cc96f843df65092a7b7fc08679))

## [1.6.2-rc.3](https://github.com/erxes/erxes/compare/1.6.2-rc.2...1.6.2-rc.3) (2024-02-26)

### Bug Fixes

- **contacts:** add missing db index ([77c94a2](https://github.com/erxes/erxes/commit/77c94a2662544a5cfaa073bbd2c5378367399a7c))

## [1.6.2-rc.2](https://github.com/erxes/erxes/compare/1.6.2-rc.1...1.6.2-rc.2) (2024-02-24)

### Bug Fixes

- **facebook:** check comment id ([a8fc2e0](https://github.com/erxes/erxes/commit/a8fc2e003551a2cafebcdbb38c672ff11961abb7))
- **facebook:** check facebook comment id ([6675336](https://github.com/erxes/erxes/commit/6675336a34d74ab4782ce86ed51ec05dc0fb5017))
- **facebook:** debug Facebook ([f142462](https://github.com/erxes/erxes/commit/f142462d00cd960e82dd0e6189116fde54432b20))
- **facebook:** debug Facebook post ([2eca3a4](https://github.com/erxes/erxes/commit/2eca3a485d752a6e34e0c9471286e5b9576c6af9))
- **Facebook:** refactor Facebook ([5df6447](https://github.com/erxes/erxes/commit/5df6447deb87fbd7f88c8abfc391e1e89609c2ae))
- **facebook:** remove logs and refactor code ([df864b6](https://github.com/erxes/erxes/commit/df864b6f8b298270895bf2638ccacbb67f43132b))

## [1.6.2-rc.1](https://github.com/erxes/erxes/compare/1.6.2-rc.0...1.6.2-rc.1) (2024-02-23)

## [1.6.2-rc.0](https://github.com/erxes/erxes/compare/1.6.1...1.6.2-rc.0) (2024-02-22)

### Bug Fixes

- **exm:** Update feed ([#4967](https://github.com/erxes/erxes/issues/4967)) ([c25b5e5](https://github.com/erxes/erxes/commit/c25b5e511928a633309dabdfeeec424666adb80e))
- syncpolaris ([fc12fff](https://github.com/erxes/erxes/commit/fc12fff071c64669b7a9c1d1413b961869b5d2ae))
- **welcome:** Tutorial link ([#4960](https://github.com/erxes/erxes/issues/4960)) ([0ac29e9](https://github.com/erxes/erxes/commit/0ac29e90bc4c786ad78f1b26e3fadbcdb4d3fa72))

### Features

- **core:** merge saas with os ([202405a](https://github.com/erxes/erxes/commit/202405a505961811a97f6f26d48b34712325acbc))

### Performance Improvements

- **exm:** Update chat and feeds ([#4973](https://github.com/erxes/erxes/issues/4973)) ([58be121](https://github.com/erxes/erxes/commit/58be121d193708447967bbba09092b20775fe4e8))

## [1.6.1](https://github.com/erxes/erxes/compare/1.6.1-rc.2...1.6.1) (2024-02-22)

## [1.6.1-rc.2](https://github.com/erxes/erxes/compare/1.6.1-rc.1...1.6.1-rc.2) (2024-02-19)

### Reverts

- Revert "fix" ([d3603c4](https://github.com/erxes/erxes/commit/d3603c408a4faa51d34cd4c794ba46902489449f))
- Revert "fix" ([b186a6a](https://github.com/erxes/erxes/commit/b186a6ac18782613afd2d5b8a060165c192933a6))

## [1.6.1-rc.1](https://github.com/erxes/erxes/compare/1.6.1-rc.0...1.6.1-rc.1) (2024-02-08)

## [1.6.1-rc.0](https://github.com/erxes/erxes/compare/1.6.0...1.6.1-rc.0) (2024-02-08)

### Bug Fixes

- add index on logs ([0cf5818](https://github.com/erxes/erxes/commit/0cf5818f9fda4fba152c194016b3e22da9dfd08a))
- **clientportal:** fix sendSms function ([686c3fa](https://github.com/erxes/erxes/commit/686c3fa98d1a654843fb5e51c8f2e5c538394e78))
- **payment:** fix qpay quick qr api response & return qr_image instead of generate qrData from string ([c8377d0](https://github.com/erxes/erxes/commit/c8377d05f53e784db73ca8d317e5f8dd704ca7a2))

### Features

- add labelSelect customProperty with value and label selector ([64e27ee](https://github.com/erxes/erxes/commit/64e27ee31963b3aa62bd71bc46d14c6f4c7dc42e))
- add syncpolaris plugin ([#4941](https://github.com/erxes/erxes/issues/4941)) ([5ed2da9](https://github.com/erxes/erxes/commit/5ed2da99be80b001362ee08e73a7bbfcbe7313e0))
- auto fill deals bank amount when cards:deal invoices status change to paid ([2b5e47b](https://github.com/erxes/erxes/commit/2b5e47b7d8e9252119fd2a9dcbf94e775cf4154e))
- **clientportal:** send otp code via mail ([#4931](https://github.com/erxes/erxes/issues/4931)) ([975560f](https://github.com/erxes/erxes/commit/975560fa65113f388f4ebfffdf038a18fcb81b4c))

### Performance Improvements

- **editor:** Added toolbar control config props to editor component ([#4899](https://github.com/erxes/erxes/issues/4899)) ([56e4f65](https://github.com/erxes/erxes/commit/56e4f650dc85cdab061b4911410322fb52023e0a))

# [1.6.0](https://github.com/erxes/erxes/compare/1.6.0-rc.8...1.6.0) (2024-02-08)

# [1.6.0-rc.8](https://github.com/erxes/erxes/compare/1.6.0-rc.7...1.6.0-rc.8) (2024-02-05)

# [1.6.0-rc.7](https://github.com/erxes/erxes/compare/1.6.0-rc.6...1.6.0-rc.7) (2024-02-02)

# [1.6.0-rc.6](https://github.com/erxes/erxes/compare/1.6.0-rc.5...1.6.0-rc.6) (2024-02-02)

# [1.6.0-rc.5](https://github.com/erxes/erxes/compare/1.6.0-rc.4...1.6.0-rc.5) (2024-02-01)

# [1.6.0-rc.4](https://github.com/erxes/erxes/compare/1.6.0-rc.3...1.6.0-rc.4) (2024-02-01)

# [1.6.0-rc.2](https://github.com/erxes/erxes/compare/1.6.0-rc.1...1.6.0-rc.2) (2024-01-31)

# [1.6.0-rc.1](https://github.com/erxes/erxes/compare/1.6.0-rc.0...1.6.0-rc.1) (2024-01-29)

# [1.6.0-rc.0](https://github.com/erxes/erxes/compare/1.5.10...1.6.0-rc.0) (2024-01-25)

### Bug Fixes

- **core:** Enforce jpg file extension during Cloudflare Images upload if provided extension is .JPG or .JPEG ([9045a98](https://github.com/erxes/erxes/commit/9045a986f88e187cc2a8249508cfea84751c0e56))
- posclient products sort by unitPrice ([deacf8f](https://github.com/erxes/erxes/commit/deacf8fea0c02d3eedba72101404c5b5ff7a9eee))
- **viber:** save inbox conversationId on viber conversation ([#4903](https://github.com/erxes/erxes/issues/4903)) ([67d0a28](https://github.com/erxes/erxes/commit/67d0a288e770c728590df9e1014ef80a2ad06654))

### Features

- **engage:** introduce client portal notification type in engage plugin ([#4915](https://github.com/erxes/erxes/issues/4915)) ([c7999e8](https://github.com/erxes/erxes/commit/c7999e8c1b7171f1c83899210bae41a6bfbe7711))
- syncerkhet sync products with weight ([d86acf3](https://github.com/erxes/erxes/commit/d86acf3286d2a40f56b3f9bd5cbeffb2202eed29))
- **xyp:** set customer properties from xypdan data ([#4910](https://github.com/erxes/erxes/issues/4910)) ([b6abdf9](https://github.com/erxes/erxes/commit/b6abdf9df11d9b7c09414d5c792c07d157d15077))

## [1.5.10](https://github.com/erxes/erxes/compare/1.5.9...1.5.10) (2024-01-17)

## [1.5.9](https://github.com/erxes/erxes/compare/1.5.8...1.5.9) (2024-01-12)

### Bug Fixes

- **contacts:** fix empty trackedData of company ([f43f105](https://github.com/erxes/erxes/commit/f43f1058f64c30fef77085836a8e3667f7ecf238))

## [1.5.8](https://github.com/erxes/erxes/compare/1.5.7...1.5.8) (2024-01-09)

### Bug Fixes

- **businessportal:** fix cp user related cards ([49e4620](https://github.com/erxes/erxes/commit/49e4620a8ec2b8e03be4384d718181aa9a35302b))
- ebarimt per stage configure company name ([910e556](https://github.com/erxes/erxes/commit/910e556cbfe5cf947f8be0cee243de885a6d78f2))
- refactor tag order ([4623716](https://github.com/erxes/erxes/commit/46237168449d0a998f87b71e60d1fcfc4652d9d0))
- refactor tag order ([f25139b](https://github.com/erxes/erxes/commit/f25139b06d1f56444ccd172bf2477c5d99fe31ef))

### Performance Improvements

- **editor:** add table, mention & attribute plugins & replace respondBox editor ([#4861](https://github.com/erxes/erxes/issues/4861)) ([e0207f7](https://github.com/erxes/erxes/commit/e0207f79fafef6528c56fd99f132c6d7d916f37d))
- **products:** some refactor & update some UI in settings ([a27de3a](https://github.com/erxes/erxes/commit/a27de3a6d1dce65a46798bfb9720529d94817a91))

### Reverts

- Revert "simplify" ([f34977c](https://github.com/erxes/erxes/commit/f34977c1c051c1efdd7ae00a66dfd713c977a3b0))

## [1.5.7](https://github.com/erxes/erxes/compare/1.5.6...1.5.7) (2024-01-03)

### Bug Fixes

- **builder:** Replace linux specific shell commands ([dc3cb87](https://github.com/erxes/erxes/commit/dc3cb8711c1b443e651ddbf456c44f7f15bfb166))
- **calls:** fix multiple login ([#4874](https://github.com/erxes/erxes/issues/4874)) ([308806f](https://github.com/erxes/erxes/commit/308806f091fef2d5da3c2c0a81f56fa1fefe94ab))
- **form:** Group form row field ([#4869](https://github.com/erxes/erxes/issues/4869)) ([29dc6aa](https://github.com/erxes/erxes/commit/29dc6aa469d59a66114c7395fda07f30343f4b17))
- **gateway:** apollo router downloader ([1259526](https://github.com/erxes/erxes/commit/1259526b90817ded8a6ee1c538e3ed86503b1c83))
- **payment:** invoice permission ([#4864](https://github.com/erxes/erxes/issues/4864)) ([9e7a7d1](https://github.com/erxes/erxes/commit/9e7a7d1d670c68e79c5e9e1ab3d246aeaa882904))
- **polarissync:** add null check ([427a3c4](https://github.com/erxes/erxes/commit/427a3c40bf57e20bfd1dd058b527dd9c9f379ebf))

### Features

- add direct discount on pos ([#4865](https://github.com/erxes/erxes/issues/4865)) ([b2a7d0a](https://github.com/erxes/erxes/commit/b2a7d0a0a12e28c65e24ab0e0ee1859f65ceb075))
- create or update user sync erkhet ([98879f9](https://github.com/erxes/erxes/commit/98879f9d7b40ad344a7348c0cda5a9154acd5fa9))
- Purchase refactor and purchase sync erkhet ([#4877](https://github.com/erxes/erxes/issues/4877)) ([1d14b28](https://github.com/erxes/erxes/commit/1d14b28286237d675c745418c8280a77c9632a24))

# [1.6.0](https://github.com/erxes/erxes/compare/1.5.6...1.6.0) (2024-01-03)

### Bug Fixes

- **builder:** Replace linux specific shell commands ([dc3cb87](https://github.com/erxes/erxes/commit/dc3cb8711c1b443e651ddbf456c44f7f15bfb166))
- **calls:** fix multiple login ([#4874](https://github.com/erxes/erxes/issues/4874)) ([308806f](https://github.com/erxes/erxes/commit/308806f091fef2d5da3c2c0a81f56fa1fefe94ab))
- **form:** Group form row field ([#4869](https://github.com/erxes/erxes/issues/4869)) ([29dc6aa](https://github.com/erxes/erxes/commit/29dc6aa469d59a66114c7395fda07f30343f4b17))
- **gateway:** apollo router downloader ([1259526](https://github.com/erxes/erxes/commit/1259526b90817ded8a6ee1c538e3ed86503b1c83))
- **payment:** invoice permission ([#4864](https://github.com/erxes/erxes/issues/4864)) ([9e7a7d1](https://github.com/erxes/erxes/commit/9e7a7d1d670c68e79c5e9e1ab3d246aeaa882904))
- **polarissync:** add null check ([427a3c4](https://github.com/erxes/erxes/commit/427a3c40bf57e20bfd1dd058b527dd9c9f379ebf))

### Features

- add direct discount on pos ([#4865](https://github.com/erxes/erxes/issues/4865)) ([b2a7d0a](https://github.com/erxes/erxes/commit/b2a7d0a0a12e28c65e24ab0e0ee1859f65ceb075))
- create or update user sync erkhet ([98879f9](https://github.com/erxes/erxes/commit/98879f9d7b40ad344a7348c0cda5a9154acd5fa9))
- Purchase refactor and purchase sync erkhet ([#4877](https://github.com/erxes/erxes/issues/4877)) ([1d14b28](https://github.com/erxes/erxes/commit/1d14b28286237d675c745418c8280a77c9632a24))

## [1.5.6](https://github.com/erxes/erxes/compare/1.5.5...1.5.6) (2023-12-21)

### Bug Fixes

- **inbox:** can't choose filter by brand value in response template ([f90d983](https://github.com/erxes/erxes/commit/f90d98386f943a11310979977e7a34ac320b7a96))
- **inbox:** convert modal written values disappear when conversation updated ([c3f152c](https://github.com/erxes/erxes/commit/c3f152cabd1bf4cfcb3f7fae0524a283dcc0ed70))
- **inbox:** right sidebar glitch ([4d64275](https://github.com/erxes/erxes/commit/4d642753476ad3a2072ab9de6773fe67b63a79ab))

### Features

- deal productsData print to documents by brand ([3cb0aa2](https://github.com/erxes/erxes/commit/3cb0aa2e20a39bc1a6d2ed9d19b3c38309991fd1))

### Performance Improvements

- **assets:** fix layout and some refactor ([a174c25](https://github.com/erxes/erxes/commit/a174c255c8020dde0b3c7ee667f103e2759e6f4c))
- **modal:** Add possibility of show modal open or close in queryParam ([2a502d2](https://github.com/erxes/erxes/commit/2a502d20f686b4a756dbd9d0648a26432ee8ceb3))

# [1.6.0](https://github.com/erxes/erxes/compare/1.5.5...1.6.0) (2023-12-21)

### Bug Fixes

- **inbox:** can't choose filter by brand value in response template ([f90d983](https://github.com/erxes/erxes/commit/f90d98386f943a11310979977e7a34ac320b7a96))
- **inbox:** convert modal written values disappear when conversation updated ([c3f152c](https://github.com/erxes/erxes/commit/c3f152cabd1bf4cfcb3f7fae0524a283dcc0ed70))
- **inbox:** right sidebar glitch ([4d64275](https://github.com/erxes/erxes/commit/4d642753476ad3a2072ab9de6773fe67b63a79ab))

### Features

- deal productsData print to documents by brand ([3cb0aa2](https://github.com/erxes/erxes/commit/3cb0aa2e20a39bc1a6d2ed9d19b3c38309991fd1))

### Performance Improvements

- **assets:** fix layout and some refactor ([a174c25](https://github.com/erxes/erxes/commit/a174c255c8020dde0b3c7ee667f103e2759e6f4c))
- **modal:** Add possibility of show modal open or close in queryParam ([2a502d2](https://github.com/erxes/erxes/commit/2a502d20f686b4a756dbd9d0648a26432ee8ceb3))

## [1.5.5](https://github.com/erxes/erxes/compare/1.5.4...1.5.5) (2023-12-13)

### Bug Fixes

- **inbox:** fix integration resolvers ([06e6d6d](https://github.com/erxes/erxes/commit/06e6d6d3166db98e99a531181cb2dcb9f2811a87))
- **inbox:** fix integration resolvers ([c5a5efe](https://github.com/erxes/erxes/commit/c5a5efec3a8f2daeb3b8b21ae8d3e76bb3bc6b86))
- **inbox:** integrations loading bug when create ([b0e44da](https://github.com/erxes/erxes/commit/b0e44da907892097338742852499c344cbe8942f))
- **knowledgebase:** Background image preview not showing ([e721839](https://github.com/erxes/erxes/commit/e721839fd14be6cffd279fe74bb1edae64561df7))
- **knowledgebase:** fix count query ([#4843](https://github.com/erxes/erxes/issues/4843)) ([f887d1a](https://github.com/erxes/erxes/commit/f887d1a8ef92a5a28c94a44354a9e43cb1b70981))

### Features

- **cards:** show private cards to system user ([898741b](https://github.com/erxes/erxes/commit/898741b0a5919c9a1723433f007c2ccc56917268))

## [1.5.4](https://github.com/erxes/erxes/compare/1.5.3...1.5.4) (2023-12-08)

## [1.5.3](https://github.com/erxes/erxes/compare/1.5.2...1.5.3) (2023-12-08)

### Bug Fixes

- **cards:** fix forecast percentage in salespipeline ([4e3ce1a](https://github.com/erxes/erxes/commit/4e3ce1adef03cb203172124a564bf1def48ebea1))
- **settings:** commented loaders and fixed collapse content ui ([b2690ea](https://github.com/erxes/erxes/commit/b2690ea1a0c20d1581b1ba2289d695a2634d01e1))

## [1.5.2](https://github.com/erxes/erxes/compare/1.5.1...1.5.2) (2023-12-06)

### Features

- **instagram:** implement instagram integration ([9dca7a8](https://github.com/erxes/erxes/commit/9dca7a8c164c7870349631901a1d690b1486596b))

## [1.5.1](https://github.com/erxes/erxes/compare/1.5.0-alpha.2...1.5.1) (2023-12-04)

### Bug Fixes

- **exm:** bug ([1ef2069](https://github.com/erxes/erxes/commit/1ef2069c74bed010cad10c6c2f7ee429b72ac55c))
- **exm:** bug ([1866f44](https://github.com/erxes/erxes/commit/1866f449bf7f4f3b75dddf128fee4e9b5c117a14))
- **exm:** form bug ([f974f22](https://github.com/erxes/erxes/commit/f974f22bd14db1657b3405729f3951de8528839c))
- **exm:** notificatoin ([a216d27](https://github.com/erxes/erxes/commit/a216d2722448cb7bb0d0b317907e6d8f5432fa63))
- matching version of @types/node and node in CI yaml, Dockerfiles images and package.json ([d61639b](https://github.com/erxes/erxes/commit/d61639b9c11ee2f7761f3cd46408a195ff33328a))

### Features

- add extended display on pos ui ([#4783](https://github.com/erxes/erxes/issues/4783)) ([79c54b8](https://github.com/erxes/erxes/commit/79c54b81664ce198556e6503bb7907fdf2e56f14))
- add pricing rule filter by tag ([ba3aa16](https://github.com/erxes/erxes/commit/ba3aa16acafcd37d9f3ca7381515ee8c92ff778a))
- cards-stage print document with many cards ([#4827](https://github.com/erxes/erxes/issues/4827)) ([f1b511e](https://github.com/erxes/erxes/commit/f1b511e2bfca9d03071c3e35dbdf725e601bd044))
- option to enable inspector api through http endpoints ([1145c1b](https://github.com/erxes/erxes/commit/1145c1b6315feb50d4d3ee755eda2ef864f080d5))
- Products by brand and multi erkhet ([#4718](https://github.com/erxes/erxes/issues/4718)) ([bbf4fd8](https://github.com/erxes/erxes/commit/bbf4fd80546803d9fb714311b8fb877db8876947))
- products list bulk fix ([7944e6b](https://github.com/erxes/erxes/commit/7944e6bc187e3cbd5d40b8937e66ff77d4c74f3d))
- **verifier:** add email & phone verifier ([#4796](https://github.com/erxes/erxes/issues/4796)) ([5869545](https://github.com/erxes/erxes/commit/5869545d1a754f7abb984938af63ab4015ca4ad4))
- Zms receive ([#4788](https://github.com/erxes/erxes/issues/4788)) ([309b698](https://github.com/erxes/erxes/commit/309b6982cc7d03d1a84f87d06a30c31dc549f81d))

### Performance Improvements

- added more control props to editor component ([6a4af8d](https://github.com/erxes/erxes/commit/6a4af8dc69b28e32416bf648b251fd4f87dee495))

# [1.5.0-alpha.2](https://github.com/erxes/erxes/compare/1.5.0-alpha.1...1.5.0-alpha.2) (2023-11-23)

# [1.5.0-alpha.1](https://github.com/erxes/erxes/compare/1.5.0-alpha.0...1.5.0-alpha.1) (2023-11-17)

# [1.5.0-alpha.0](https://github.com/erxes/erxes/compare/1.4.0...1.5.0-alpha.0) (2023-11-16)

### Bug Fixes

- **activitylog:** Show internal note in facebook conversation activity log ([20f7fb1](https://github.com/erxes/erxes/commit/20f7fb16e7688473f8f2f9ef4cc1b3ad2a8cfc49))
- development environment try force copy supergraph.graphql.next into supergraph.graphql ([6c8171e](https://github.com/erxes/erxes/commit/6c8171e0f9a8b05272f972387b932517bb19ffcd))
- widgetsInsertMessage redis call ([dff55ce](https://github.com/erxes/erxes/commit/dff55ce58793acb6a9e5943585360389d9b1171c))

### Features

- **dailyco:** video call in inbox ([#4748](https://github.com/erxes/erxes/issues/4748)) ([6b2c6cb](https://github.com/erxes/erxes/commit/6b2c6cb772dd931472052ea129c35671a1622752))

### Performance Improvements

- **exm:** feed navbar ([#4730](https://github.com/erxes/erxes/issues/4730)) ([a3752f0](https://github.com/erxes/erxes/commit/a3752f0528d232e77406036aa0fd6820e0cd37b2))
- **exm:** post ([#4737](https://github.com/erxes/erxes/issues/4737)) ([60496bc](https://github.com/erxes/erxes/commit/60496bcb36f857a4142feafbc4deb365fbda4d10))
- **inbox:** Add skeleton loader in inbox conversation ([6ae4cb7](https://github.com/erxes/erxes/commit/6ae4cb7a78a4a2ea165e18dde90f941f3515c6d4))

# [1.5.0](https://github.com/erxes/erxes/compare/1.4.0...1.5.0) (2023-11-16)

### Bug Fixes

- **activitylog:** Show internal note in facebook conversation activity log ([20f7fb1](https://github.com/erxes/erxes/commit/20f7fb16e7688473f8f2f9ef4cc1b3ad2a8cfc49))
- development environment try force copy supergraph.graphql.next into supergraph.graphql ([6c8171e](https://github.com/erxes/erxes/commit/6c8171e0f9a8b05272f972387b932517bb19ffcd))
- widgetsInsertMessage redis call ([dff55ce](https://github.com/erxes/erxes/commit/dff55ce58793acb6a9e5943585360389d9b1171c))

### Features

- **dailyco:** video call in inbox ([#4748](https://github.com/erxes/erxes/issues/4748)) ([6b2c6cb](https://github.com/erxes/erxes/commit/6b2c6cb772dd931472052ea129c35671a1622752))

### Performance Improvements

- **exm:** feed navbar ([#4730](https://github.com/erxes/erxes/issues/4730)) ([a3752f0](https://github.com/erxes/erxes/commit/a3752f0528d232e77406036aa0fd6820e0cd37b2))
- **exm:** post ([#4737](https://github.com/erxes/erxes/issues/4737)) ([60496bc](https://github.com/erxes/erxes/commit/60496bcb36f857a4142feafbc4deb365fbda4d10))
- **inbox:** Add skeleton loader in inbox conversation ([6ae4cb7](https://github.com/erxes/erxes/commit/6ae4cb7a78a4a2ea165e18dde90f941f3515c6d4))

# [1.4.0](https://github.com/erxes/erxes/compare/1.4.0-alpha.7...1.4.0) (2023-11-16)

# [1.4.0-alpha.7](https://github.com/erxes/erxes/compare/1.4.0-alpha.6...1.4.0-alpha.7) (2023-11-16)

### Reverts

- Revert "update(clientportal): improve vendor portal & client portal (#4753)" (#4754) ([23f6b32](https://github.com/erxes/erxes/commit/23f6b324f4e63800adb9258a04dd071b6a752e10)), closes [#4753](https://github.com/erxes/erxes/issues/4753) [#4754](https://github.com/erxes/erxes/issues/4754)

# [1.4.0-alpha.6](https://github.com/erxes/erxes/compare/1.4.0-alpha.5...1.4.0-alpha.6) (2023-11-10)

# [1.4.0-alpha.5](https://github.com/erxes/erxes/compare/1.4.0-alpha.4...1.4.0-alpha.5) (2023-11-07)

# [1.4.0-alpha.4](https://github.com/erxes/erxes/compare/1.4.0-alpha.3...1.4.0-alpha.4) (2023-11-06)

# [1.4.0-alpha.3](https://github.com/erxes/erxes/compare/1.4.0-alpha.2...1.4.0-alpha.3) (2023-11-06)

# [1.4.0-alpha.2](https://github.com/erxes/erxes/compare/1.4.0-alpha.1...1.4.0-alpha.2) (2023-11-04)

### Bug Fixes

- **department:** cannot save department without parent ([dfecc06](https://github.com/erxes/erxes/commit/dfecc06fb13b64d169e6917292c27b97c1d39c02))

# [1.4.0-alpha.3](https://github.com/erxes/erxes/compare/1.4.0-alpha.2...1.4.0-alpha.3) (2023-11-04)

# [1.4.0-alpha.2](https://github.com/erxes/erxes/compare/1.4.0-alpha.1...1.4.0-alpha.2) (2023-11-04)

### Bug Fixes

- **department:** cannot save department without parent ([dfecc06](https://github.com/erxes/erxes/commit/dfecc06fb13b64d169e6917292c27b97c1d39c02))

# [1.4.0-alpha.1](https://github.com/erxes/erxes/compare/1.4.0-alpha.0...1.4.0-alpha.1) (2023-11-02)

# [1.4.0-alpha.0](https://github.com/erxes/erxes/compare/1.3.0...1.4.0-alpha.0) (2023-11-01)

### Bug Fixes

- add zalo message log ([9546cee](https://github.com/erxes/erxes/commit/9546cee637491664bbdfb632c54db540f38fee9e))
- anonymous user send & admin send reply from oa.zalo.me ([a936487](https://github.com/erxes/erxes/commit/a936487540c140af456a10ec0f7586590e0a7d54))
- **api:** can not send message cause of message_id ([8c2eddb](https://github.com/erxes/erxes/commit/8c2eddb898798ff90b68b42fd6ee01b419537a06))
- **calls:** add currentUser to the widget ([7bb5181](https://github.com/erxes/erxes/commit/7bb518126b1abd0735f1eb72deb3c5c09a30922c))
- **cards:** Show forecast preview in Sales pipeline ([#4683](https://github.com/erxes/erxes/issues/4683)) ([ad3c058](https://github.com/erxes/erxes/commit/ad3c0581d734adefd3adb3dce0a85cd80a2d5950))
- **cards:** Show total price amount of products in salespipeline item ([48faee0](https://github.com/erxes/erxes/commit/48faee0a12f2b0a7cdf7ba22fad0952bcac54212))
- **cards:** Show unused total amount in sales pipeline item ([c92c235](https://github.com/erxes/erxes/commit/c92c235a20a9e8908298760cd27cd34cd59aa712))
- **cli:** gateway - extra env ([e3f33fe](https://github.com/erxes/erxes/commit/e3f33fe17ba861df027ae36c7d4dcc45eaa93119))
- email inbox action buttons now operatable ([085bb13](https://github.com/erxes/erxes/commit/085bb13ba2f11f41f64b6bd8577c6a399f1dc113))
- fixed a bug where inbox required cards plugin ([fcc188e](https://github.com/erxes/erxes/commit/fcc188e29fdc803e1fe88d8da9cb9712634a8781))
- **forum:** content image upload ([f570905](https://github.com/erxes/erxes/commit/f570905abe877973b52a5c950844ccd8c8fb12d1))
- **forum:** sort ([9eea7c5](https://github.com/erxes/erxes/commit/9eea7c55d946fa79dae747cfdb784a80de955d6c))
- **goals:** CI workflow ([dcc219a](https://github.com/erxes/erxes/commit/dcc219a6336b6f5a9591f0fe74462e4f1c70629a))
- **imap:** added error handler in attachment download ([3cd68ba](https://github.com/erxes/erxes/commit/3cd68ba8f8221bbebf71d667c3fdea0298ad400c))
- **imap:** attachment double list fix ([2d1b072](https://github.com/erxes/erxes/commit/2d1b07227b10629b124fbc2818d958e92b7168fa))
- **imap:** calendar ([97e2d4f](https://github.com/erxes/erxes/commit/97e2d4fb3102f9b962110c292c7d0071543dd495))
- **imap:** download attachment fix ([9faee8d](https://github.com/erxes/erxes/commit/9faee8d0a90c3b1d558ed80b79ef6bee9f703207))
- **imap:** fixed get customer ([a228267](https://github.com/erxes/erxes/commit/a2282678eedcd5a86ed15469484626c4c6cd21b2))
- **imap:** fixed realtime sent update ([515274a](https://github.com/erxes/erxes/commit/515274acc63a4c5c4a2b76880fd100fa37f30142))
- **imap:** fixed related message error ([d28d3f7](https://github.com/erxes/erxes/commit/d28d3f75b5369b19ecc7539b767fb5e381b59f7f))
- **imap:** fixed to check ([b441183](https://github.com/erxes/erxes/commit/b44118347e91c46b1361b52f462772d40199706d))
- **imap:** fixed ui is no longer showing issue ([06631c6](https://github.com/erxes/erxes/commit/06631c6494aee795d589764f532e16c350f77cd5))
- **imap:** igoring the aliases ([8f69635](https://github.com/erxes/erxes/commit/8f69635be14819ef6152ec9ee0e10f2f2dcea4e4))
- **imap:** Implement Retry Logic for Robust IMAP Handling[#300](https://github.com/erxes/erxes/issues/300)) ([95f6dbb](https://github.com/erxes/erxes/commit/95f6dbb580369c07ae956c10adcd63393dfb7cdd))
- **inbox:** conversation messages not showing ([7996cbc](https://github.com/erxes/erxes/commit/7996cbc38a9739369a9c22f6c1f1e8d50ab6f553))
- **inbox:** fix custom field disappearing in inbox right sidebar ([#4698](https://github.com/erxes/erxes/issues/4698)) ([eac5a9a](https://github.com/erxes/erxes/commit/eac5a9a6e42ca556f291bef9a998e6109ac0eafa))
- **inbox:** fix default email template and assignee glitch error ([#4650](https://github.com/erxes/erxes/issues/4650)) ([7b89759](https://github.com/erxes/erxes/commit/7b89759c1125e848320291d0bba0440036632c84))
- **inbox:** refetch conversation when assign ([a89efae](https://github.com/erxes/erxes/commit/a89efae38cd66da0874cc9ed1d6e3e93f9fd6f47))
- **internalnote:** Internal note check disappear after conversation switch ([75c087b](https://github.com/erxes/erxes/commit/75c087bb6358d9b81996de469f4caac9030abb5a))
- localhost = ::1 related fix for local environment ([006e8d0](https://github.com/erxes/erxes/commit/006e8d03ae0b07777f9a63e552b4e1f1c81eb09b))
- **meetings:** add null check ([8d77027](https://github.com/erxes/erxes/commit/8d770279c16a6343a73e252a3b1748cd52c4af00))
- **meetings:** bug fixes after test cases ([#364](https://github.com/erxes/erxes/issues/364)) ([368e75c](https://github.com/erxes/erxes/commit/368e75c10ae53d19984d0640626dbf239a0681a8))
- **meetings:** fix deal search ([#359](https://github.com/erxes/erxes/issues/359)) ([e3369de](https://github.com/erxes/erxes/commit/e3369de526f84c6404ed700ba46c567befdd2bff))
- modal email view is closeable on outer clicks ([9d1197f](https://github.com/erxes/erxes/commit/9d1197f96d2347805b0dc8945ed2fac57a59f81a))
- **payment:** add deeplink support ([f40e551](https://github.com/erxes/erxes/commit/f40e55130c5de2c98f69d933026eb60f4b134fa1))
- **payment:** change payment data buffer to utf8 ([7853f80](https://github.com/erxes/erxes/commit/7853f8042504d2ce79d27111597d5ec989b7d2e4))
- **payment:** change payment data buffer to utf8 ([0b1a291](https://github.com/erxes/erxes/commit/0b1a291b3f7e20e0c98f478129d4d1873bf2eb5b))
- **payment:** fix mismatching invoice identifier ([c55adb5](https://github.com/erxes/erxes/commit/c55adb5666845376d11f0be4f47db406da3b6a93))
- **payment:** fix qpay bank buttons rerender, not generating socialpay qr code after invoice cancelation ([b2ac96f](https://github.com/erxes/erxes/commit/b2ac96ffb9e18347d9d6cdf623495990e7d34379))
- **properties:** date picker and custom properties UI in inbox sidebar ([#4649](https://github.com/erxes/erxes/issues/4649)) ([9f34ab6](https://github.com/erxes/erxes/commit/9f34ab6578e504820702b3e569dd95def6edfa74))
- **riskassessment:** add error handler ([e75e90b](https://github.com/erxes/erxes/commit/e75e90b66f2b9c40bf907bc0b7fe334ee0a7eb42))
- settings sidebar glitch ([#4635](https://github.com/erxes/erxes/issues/4635)) ([ca7df0c](https://github.com/erxes/erxes/commit/ca7df0c7366dfc9b57400e87d286de05eb42a0e0))
- **settings:** structure ([#4647](https://github.com/erxes/erxes/issues/4647)) ([eaaf0b0](https://github.com/erxes/erxes/commit/eaaf0b025de1f4e6e16d3f0d11e7daa0cbb954c8))
- **tags:** tag ui in inbox right sidebar ([#4688](https://github.com/erxes/erxes/issues/4688)) ([b67c430](https://github.com/erxes/erxes/commit/b67c430e4f97b29d207cc38e3c68f9159b2500ed))
- **ui:** update new configs.js ([e9d47e2](https://github.com/erxes/erxes/commit/e9d47e2215ca2491dd681a9250db775edbb83f26))
- **viber:** fixed subscription issue ([940116d](https://github.com/erxes/erxes/commit/940116d13e6e363209cd2c3082aab1075d0f10e8))
- **widgets:** Validate rules when displaying the form within Messenger. ([fb2e477](https://github.com/erxes/erxes/commit/fb2e477bfc3ee946a2902d8e7c575622c0329ff8))

### Features

- (payment) add manual check button for pending invoices ([83f3c9c](https://github.com/erxes/erxes/commit/83f3c9c468b169e0a613f77d6b830d5fd756c549))
- allow replica config for core ([dd3087b](https://github.com/erxes/erxes/commit/dd3087b3f7b6df4f3107743587068c5fd5d81510))
- **assets:** refactored knowledgebase logic ([21ae87e](https://github.com/erxes/erxes/commit/21ae87ecf7b86537bee764e2e28b53b0dd1baced))
- **calls:** Grand stream version 1.0.0([#4706](https://github.com/erxes/erxes/issues/4706)) ([0c30f4c](https://github.com/erxes/erxes/commit/0c30f4c1b0f1d5b7ac0f5d5aaf31dca7e3e97ff4))
- **chat:** Minor fix ([#102](https://github.com/erxes/erxes/issues/102)) ([b56c7a8](https://github.com/erxes/erxes/commit/b56c7a8fa06d54217166bcae6ed7bcef249fb307))
- **chats:** Focus bug fixed ([#96](https://github.com/erxes/erxes/issues/96)) ([7bcbb09](https://github.com/erxes/erxes/commit/7bcbb09a3809c0243e6a29349118fa4e3bf9006b))
- CLI - add image_tag configuration for essyncer ([43bc034](https://github.com/erxes/erxes/commit/43bc034d9ee3076eadd4f3f12843ac02024094c4))
- **filemanager:** added filemanager plugin ([a91cccd](https://github.com/erxes/erxes/commit/a91cccd3eee48494118bffd7466605c4e8c42440))
- **filemanager:** Show folder in file list ([e4c28bf](https://github.com/erxes/erxes/commit/e4c28bf3a05f67c4f189edd671ddd4ebba34e9af))
- fullscreen email view ([cc6e15f](https://github.com/erxes/erxes/commit/cc6e15f3606ad5de29fe2d66a57d7e55b82692a9))
- **imap:** added activity log ([75ba423](https://github.com/erxes/erxes/commit/75ba4232fdae61ec951c94bb1a05a1c58e1f5d5c))
- **imap:** added main authentication user feature ([6bf1542](https://github.com/erxes/erxes/commit/6bf1542a2c053ae86fa2e8089336e41be72ba3d4))
- **meetings:** add pinned user in meeting ([#340](https://github.com/erxes/erxes/issues/340)) ([d26cf02](https://github.com/erxes/erxes/commit/d26cf021aaf83ae5e7703243e46f6c2adb7a4902))
- **meetings:** new plugin ([#338](https://github.com/erxes/erxes/issues/338)) ([1fe97b1](https://github.com/erxes/erxes/commit/1fe97b12fc27277b3cdf2d54423c3025c47dc0aa))
- **product:** add meta property in category ([2f9f1db](https://github.com/erxes/erxes/commit/2f9f1dbe3903c9b63187e500a4dc9c93548e325b))
- **product:** add meta to category ([b41be74](https://github.com/erxes/erxes/commit/b41be74705a548d76a512a6adffc3c6348774b71))
- **timeclock:** add pagination and improve query filter ([#67](https://github.com/erxes/erxes/issues/67)) ([8affeea](https://github.com/erxes/erxes/commit/8affeeac19c4d73103c25eb195cf337c7ad26302))
- **timeclock:** add plugin named timeclock ([63f4ad0](https://github.com/erxes/erxes/commit/63f4ad0864f68c6e64b39caa9796973282acf22d))
- **timeclock:** add schedule config ([#77](https://github.com/erxes/erxes/issues/77)) ([cdebfb0](https://github.com/erxes/erxes/commit/cdebfb03d80084779de226ec78b0d1eaeecdd983))
- **timeclock:** calculation of late minute ([#104](https://github.com/erxes/erxes/issues/104)) ([920c298](https://github.com/erxes/erxes/commit/920c298ff4d3279a3464307042c3ab33504faae2))
- **timeclock:** export preliminary report into excel ([#83](https://github.com/erxes/erxes/issues/83)) ([ae7844d](https://github.com/erxes/erxes/commit/ae7844d7392ddbcfc7a1e6c22aacf2ba622103d5))
- **timeclock:** extract data improvement ([#79](https://github.com/erxes/erxes/issues/79)) ([c03c0f2](https://github.com/erxes/erxes/commit/c03c0f27095ae34326f0cd184e03b302dc1f5a8b))
- **timeclock:** fix find user's branches ([#114](https://github.com/erxes/erxes/issues/114)) ([394745a](https://github.com/erxes/erxes/commit/394745acd59d707970334911848a8724952347d6))
- **timeclock:** improve data fetching from Microsoft SQL server ([#66](https://github.com/erxes/erxes/issues/66)) ([7c9a397](https://github.com/erxes/erxes/commit/7c9a397d5ed88b9ed59d5e5170eb5239f5c4f964))
- **timeclock:** improvement ([a9fa3bb](https://github.com/erxes/erxes/commit/a9fa3bbf483183d381f88364b0f9826af3599a01))
- **timeclock:** improvement of device config ([#109](https://github.com/erxes/erxes/issues/109)) ([a85ed83](https://github.com/erxes/erxes/commit/a85ed83e9a2872fb8d303a853e6ee2232a24fc23))
- **timeclock:** refactor and add cron ([46c7faf](https://github.com/erxes/erxes/commit/46c7faf67d023eaef7898c6d839be1fde6707dc3))
- **timeclock:** report improvement ([#100](https://github.com/erxes/erxes/issues/100)) ([d345a71](https://github.com/erxes/erxes/commit/d345a713ba8079766901b7c0e243e683c406001d))
- **timeclock:** reports query & export report ([#85](https://github.com/erxes/erxes/issues/85)) ([f37f17f](https://github.com/erxes/erxes/commit/f37f17fe8f0f58a346e399ed0132f50ab9c32c8d))
- **timeclock:** time log ([#115](https://github.com/erxes/erxes/issues/115)) ([f8b5240](https://github.com/erxes/erxes/commit/f8b5240aaee9fc1cf0f54e39beea3df9e01dff4d))
- **xypdan:** xypdan alpha version ([#341](https://github.com/erxes/erxes/issues/341)) ([418fa49](https://github.com/erxes/erxes/commit/418fa499f9869c0f85c46e441444bc0a428e5187))

### Performance Improvements

- **cards:** add sales detail to boards and calendar ([#4679](https://github.com/erxes/erxes/issues/4679)) ([3c76fdd](https://github.com/erxes/erxes/commit/3c76fdd2f5be3de01d36d041774f146daf8cf996))
- **chats:** ui, and image resize ([6d7005c](https://github.com/erxes/erxes/commit/6d7005cb2bf2c8d360a975ba35f373452382a8bb))
- **emailTemplate:** update UI and add search of emailTemplate, reponseTemplate, widgetScript ([0a0f5f0](https://github.com/erxes/erxes/commit/0a0f5f02d9ea737af8eca103499dec91327b0cab))
- **filemanager:** add filemanager form in cards ([ae91768](https://github.com/erxes/erxes/commit/ae917680d32b9ea17882e21611298f9a29768306))
- **filemanager:** add related file list on cards detail ([dd50fe2](https://github.com/erxes/erxes/commit/dd50fe2a8340e1533d82bcfa920590254e88eb49))
- **filemanager:** add tree folder view ([7671d5a](https://github.com/erxes/erxes/commit/7671d5aac703a7272c71310aacd326d32e28a0b7))
- **filemanager:** move fileform to common component ([c602625](https://github.com/erxes/erxes/commit/c602625b84edaf0e524c45eeb05f87b19674bb73))
- **filemanager:** refactor ([4868a22](https://github.com/erxes/erxes/commit/4868a22d7dd45cb56a666fa519411a4051b8489e))
- **inbox:** add shortcuts ([#4670](https://github.com/erxes/erxes/issues/4670)) ([d1726bf](https://github.com/erxes/erxes/commit/d1726bfc23310c40534131972e391b6781f4c31e))
- **inbox:** improve email UX with email signature attachment ([9d7d2da](https://github.com/erxes/erxes/commit/9d7d2dadbd5d81ca82b08b6c600987b05600ca03))
- **inbox:** Improve inbox help shortcuts ([3b2a50c](https://github.com/erxes/erxes/commit/3b2a50c7a24e7658613eedb8928caa4613c75541))
- **inbox:** response templates ui update ([0c971e2](https://github.com/erxes/erxes/commit/0c971e2d73a3549fe90e90598c1834239775acea))
- **inbox:** response templates ui update ([93c4571](https://github.com/erxes/erxes/commit/93c4571d58a5c6a571bd5c8d0b084cc46b3f8402))
- **inbox:** response templates ui update ([bacd774](https://github.com/erxes/erxes/commit/bacd774327f29bb15b83510aa487fad4c7d14d92))
- **inbox:** response templates ui update ([d0bd22c](https://github.com/erxes/erxes/commit/d0bd22c2f5db78593126217965eb971ccfc8a898))
- **inbox:** update response & script ui ([851c811](https://github.com/erxes/erxes/commit/851c8118961e88eae10469e80547c795aa986870))
- **inbox:** update response & script ui ([ff20dbb](https://github.com/erxes/erxes/commit/ff20dbb55464df2455e9ea3106a17490a4f3380b))
- **response template:** Update UI ([aeb9491](https://github.com/erxes/erxes/commit/aeb94918549d7d02cd0f27091900bb17edd28c8f))
- **tag:** add loadMore in tagger popover ([#4699](https://github.com/erxes/erxes/issues/4699)) ([28f9dc5](https://github.com/erxes/erxes/commit/28f9dc599ae2c8cc479ff0cd92d36e76945f5bf4))

### Reverts

- Revert "ignores error and prints error like it used to" ([908f58a](https://github.com/erxes/erxes/commit/908f58ad8514fbc2be9a14867ed89db5b1aba62d))
- Revert "use 127.0.0.1 instead of localhost" ([f6f98d3](https://github.com/erxes/erxes/commit/f6f98d3f2890c1c9e9b4f88ea287a19d3a513a54))

# [1.3.0](https://github.com/erxes/erxes/compare/1.2.3...1.3.0) (2023-09-20)

### Bug Fixes

- **cards:** comment ([#4458](https://github.com/erxes/erxes/issues/4458)) ([a2ffa44](https://github.com/erxes/erxes/commit/a2ffa447dba36efb47d16cc6d07291d0df541cc4))
- **cards:** conversation convert trigger ([ba059ce](https://github.com/erxes/erxes/commit/ba059ce3461ae87a5e13c5d8ae1f65c227f03ac6))
- **client portal:** cards filter params ([#4449](https://github.com/erxes/erxes/issues/4449)) ([a2a55e9](https://github.com/erxes/erxes/commit/a2a55e9ec5152a9e1fc2aece40312dbdad1e7fd2))
- **clientportal:** cards filter ([c3894b1](https://github.com/erxes/erxes/commit/c3894b162c764e1a706f7f99a7d5319f8247a58d))
- **clientportal:** currentuser null error ([bedf91e](https://github.com/erxes/erxes/commit/bedf91ea695082b792b47d88600758bc718eaff3))
- **clientportal:** list bugs ([086658d](https://github.com/erxes/erxes/commit/086658de6d2cd0fd92b660cfc4947803dddc4566))
- **clientportal:** notifications ([083b23e](https://github.com/erxes/erxes/commit/083b23e22aad0fb950e4c88996dbb8b43696fc41))
- **core:** currentUser query cache miss ([7acf8cd](https://github.com/erxes/erxes/commit/7acf8cd6d1413b2288de0c10dfc6e20cb42b0272))
- **core:** file upload not recognizing csv mime type ([7ab7cec](https://github.com/erxes/erxes/commit/7ab7cec5cfce368fa11cecaef770b8445814c33a))
- **emailWidget:** search bar of email template chooser ([#4622](https://github.com/erxes/erxes/issues/4622)) ([5e6dd99](https://github.com/erxes/erxes/commit/5e6dd992aaa1fee6b5da959f4a1688ca8f3d32ac))
- **inbox:** conversation messages not showing ([7877416](https://github.com/erxes/erxes/commit/787741657db061e3bb6b846e8b7801628de66774))
- **inbox:** play video attachment of conversation ([9bcd1d6](https://github.com/erxes/erxes/commit/9bcd1d66b8d3956914f7c0b710c66d7d98d0b077))
- **inbox:** play video attachment of conversation ([2d27610](https://github.com/erxes/erxes/commit/2d27610276bf43eb839d3d9322ff3f094d66be2a))
- **integration:** messenger form select ([#4620](https://github.com/erxes/erxes/issues/4620)) ([0b75e92](https://github.com/erxes/erxes/commit/0b75e92cf72431c22cbbeae886454a6dd0f0e6f4))
- **nav:** more button style ([#4455](https://github.com/erxes/erxes/issues/4455)) ([63cd926](https://github.com/erxes/erxes/commit/63cd9265bc67a6a1c5cc66ab5ecfc690d568dd66))
- **permission:** member avatar ([#4627](https://github.com/erxes/erxes/issues/4627)) ([5a703d3](https://github.com/erxes/erxes/commit/5a703d3e7fef3ce4f08362f67e133b7d2bc9937e))
- products category ([4fa853e](https://github.com/erxes/erxes/commit/4fa853ee39d07ddca5239a1a4016fa68d0bce768))
- **products:** import barcodes and subuoms ([b54acc4](https://github.com/erxes/erxes/commit/b54acc4f766473fc283fe20a1aa1a94a7c6ccb07))
- rpc timeout ([125eef5](https://github.com/erxes/erxes/commit/125eef5bc63aedb13f8ec9b13ce487825b1e1805))
- **widgets:** change asterisk color of required field ([9953a7f](https://github.com/erxes/erxes/commit/9953a7f3c30d975e6af9a150fe75f984333f8d04))
- **widgets:** continue if form field type is productCategory and not required ([62324c0](https://github.com/erxes/erxes/commit/62324c0212bf8a7d202c16a4c70c787bfe23308f))
- **widgets:** improve subfields css ([a587176](https://github.com/erxes/erxes/commit/a587176a0630fb8df965ec23b88f705457813bd5))

- perf:(products) products uom related to uomCode (#4502) ([08c37ad](https://github.com/erxes/erxes/commit/08c37ada997d566f65fcc8a5b6376ecc701f52ff)), closes [#4502](https://github.com/erxes/erxes/issues/4502)

### Features

- **core:** add cloudflare images & stream ([#4606](https://github.com/erxes/erxes/issues/4606)) ([0669abf](https://github.com/erxes/erxes/commit/0669abf2d16a5c72704895a653bac9e8ea3fb3ae))
- **core:** integrate cloudflare r2 as a file upload ([#4592](https://github.com/erxes/erxes/issues/4592)) ([c921114](https://github.com/erxes/erxes/commit/c9211146d819fc715579f24f08d1ebda4fbae310))

### Performance Improvements

- **clientportal:** add avatar upload ([751dccd](https://github.com/erxes/erxes/commit/751dccd3b610d7a800c7a1d0435dbffbe5919869))
- **clientportal:** fix responsive ([7a983f9](https://github.com/erxes/erxes/commit/7a983f90268d0b4637bfe5e1e4ac416f99153bd3))
- **clientportal:** improve cards detail ([913c37e](https://github.com/erxes/erxes/commit/913c37e1958045c221cb94f02fb2808096ace118))
- **clientportal:** update cards ([a7387fe](https://github.com/erxes/erxes/commit/a7387fe5a7f611acb4684aa5fa90fd2f37d85f9f))
- **clientportal:** update cards ([1c7c541](https://github.com/erxes/erxes/commit/1c7c541427500b105441ab76d0d731e3f503825a))
- **clientportal:** update notification ([56d9344](https://github.com/erxes/erxes/commit/56d93441828b68daf5102c3e92586f784e280818))
- **core:** resize image using Jimp ([768485a](https://github.com/erxes/erxes/commit/768485a8cc81e19fa9e3141bde2c871414f095ff))
- **core:** resize image using Jimp ([b7dc498](https://github.com/erxes/erxes/commit/b7dc4983605da0469f6ed876e28754feda406c52))
- **inbox:** email send popup improvement ([#4433](https://github.com/erxes/erxes/issues/4433)) ([105ca0f](https://github.com/erxes/erxes/commit/105ca0f0b644282c2f55305698910ec965295177))
- **inbox:** improve inbox sidebar loading state ([0cb0eae](https://github.com/erxes/erxes/commit/0cb0eae2465bafad446abe45fc064c653ec27bb6))
- **inbox:** optimize user and customer avatar sizes ([7e9ad5b](https://github.com/erxes/erxes/commit/7e9ad5b9d07d7cd1a0156b2a54c7fc7a9192a24a))
- index conversations by tagIds ([60bace9](https://github.com/erxes/erxes/commit/60bace946cd3b7c7dc5c085faf4189110d41642d))

### Reverts

- Revert "fix Date custom scalar" ([e49904b](https://github.com/erxes/erxes/commit/e49904b52d8bc2994f4dc574e871909bf53d06fc))

### BREAKING CHANGES

- must run plugin-product-api/src/command/migrateUom.js

## [1.2.3](https://github.com/erxes/erxes/compare/1.2.0...1.2.3) (2023-06-06)

### Bug Fixes

- **clientportal:** change apollo import ([c090b32](https://github.com/erxes/erxes/commit/c090b32618b053bb2267064e70536c988a63ff66))
- **clientportal:** update settings ([3b4da72](https://github.com/erxes/erxes/commit/3b4da722290c9d74b684773782535c775f92a056))
- **coreui:** fix core ui input ([0396524](https://github.com/erxes/erxes/commit/0396524ef392fa953b295130b4ba8e57b7f1680e))
- **inbox:** facebook messenger text overlapping ([8290402](https://github.com/erxes/erxes/commit/82904020a0854c6d1543f3f9dbc019cfbc8c80ed))
- **knowledgebase:** category form([#4400](https://github.com/erxes/erxes/issues/4400)) ([01eaddf](https://github.com/erxes/erxes/commit/01eaddf42f721c2821f39e30f6e06f56ae462efc))
- **knowledgebase:** category form ([#4404](https://github.com/erxes/erxes/issues/4404)) ([7db8279](https://github.com/erxes/erxes/commit/7db82793f4ec40a359de0e7f685e3d49f8491b37))
- **knowledgebase:** show selected parent category when add article ([#4398](https://github.com/erxes/erxes/issues/4398)) ([0f12836](https://github.com/erxes/erxes/commit/0f128364b49ee24b6924b2376e3e46b2c57765f3))
- **modaltrigger:** hotfix ([#4431](https://github.com/erxes/erxes/issues/4431)) ([7ba46e1](https://github.com/erxes/erxes/commit/7ba46e1046ecf884f7fd10dcba6e6505c9fa419e))
- **navigation:** fix navigation more button ([06f54a2](https://github.com/erxes/erxes/commit/06f54a2f13d2c02f00053260a66115ca0f837680))
- trying to mutate immutable array ([c696c71](https://github.com/erxes/erxes/commit/c696c71c30a9b509d86f2e1eb4928f9114a3b2bd))

### Performance Improvements

- **clientportal:** huge refactor ([1c44630](https://github.com/erxes/erxes/commit/1c44630700ab1e2e326f2a2ed58f688b837ff37c))
- **clientportal:** merge cards and some refactor ([7584571](https://github.com/erxes/erxes/commit/758457194039dbd6fc192f3f1ca654143ce3208b))
- **clientportal:** update cp user ([275dd6e](https://github.com/erxes/erxes/commit/275dd6ebbf36a2c1e362630926e1ed664bfd7944))
- **clientportal:** Update UI([#4403](https://github.com/erxes/erxes/issues/4403)) ([625f0ac](https://github.com/erxes/erxes/commit/625f0aca54ac83829ce9920cc9e25a899c6c4601))

### Reverts

- Revert "try without webpack - singleton" ([df78bf6](https://github.com/erxes/erxes/commit/df78bf60e43e1d3bfa31d2bcd825c3efcc818e3f))

## [1.2.1](https://github.com/erxes/erxes/compare/1.2.0...1.2.1) (2023-06-06)

### Bug Fixes

- **clientportal:** change apollo import ([c090b32](https://github.com/erxes/erxes/commit/c090b32618b053bb2267064e70536c988a63ff66))
- **clientportal:** update settings ([3b4da72](https://github.com/erxes/erxes/commit/3b4da722290c9d74b684773782535c775f92a056))
- **coreui:** fix core ui input ([0396524](https://github.com/erxes/erxes/commit/0396524ef392fa953b295130b4ba8e57b7f1680e))
- **inbox:** facebook messenger text overlapping ([8290402](https://github.com/erxes/erxes/commit/82904020a0854c6d1543f3f9dbc019cfbc8c80ed))
- **knowledgebase:** category form([#4400](https://github.com/erxes/erxes/issues/4400)) ([01eaddf](https://github.com/erxes/erxes/commit/01eaddf42f721c2821f39e30f6e06f56ae462efc))
- **knowledgebase:** category form ([#4404](https://github.com/erxes/erxes/issues/4404)) ([7db8279](https://github.com/erxes/erxes/commit/7db82793f4ec40a359de0e7f685e3d49f8491b37))
- **knowledgebase:** show selected parent category when add article ([#4398](https://github.com/erxes/erxes/issues/4398)) ([0f12836](https://github.com/erxes/erxes/commit/0f128364b49ee24b6924b2376e3e46b2c57765f3))
- **modaltrigger:** hotfix ([#4431](https://github.com/erxes/erxes/issues/4431)) ([7ba46e1](https://github.com/erxes/erxes/commit/7ba46e1046ecf884f7fd10dcba6e6505c9fa419e))
- **navigation:** fix navigation more button ([06f54a2](https://github.com/erxes/erxes/commit/06f54a2f13d2c02f00053260a66115ca0f837680))
- trying to mutate immutable array ([c696c71](https://github.com/erxes/erxes/commit/c696c71c30a9b509d86f2e1eb4928f9114a3b2bd))

### Performance Improvements

- **clientportal:** huge refactor ([1c44630](https://github.com/erxes/erxes/commit/1c44630700ab1e2e326f2a2ed58f688b837ff37c))
- **clientportal:** merge cards and some refactor ([7584571](https://github.com/erxes/erxes/commit/758457194039dbd6fc192f3f1ca654143ce3208b))
- **clientportal:** update cp user ([275dd6e](https://github.com/erxes/erxes/commit/275dd6ebbf36a2c1e362630926e1ed664bfd7944))
- **clientportal:** Update UI([#4403](https://github.com/erxes/erxes/issues/4403)) ([625f0ac](https://github.com/erxes/erxes/commit/625f0aca54ac83829ce9920cc9e25a899c6c4601))

### Reverts

- Revert "try without webpack - singleton" ([df78bf6](https://github.com/erxes/erxes/commit/df78bf60e43e1d3bfa31d2bcd825c3efcc818e3f))

# [1.2.0](https://github.com/erxes/erxes/compare/1.0.1...1.2.0) (2023-05-01)

### Bug Fixes

- add zalo message log ([9546cee](https://github.com/erxes/erxes/commit/9546cee637491664bbdfb632c54db540f38fee9e))
- anonymous user send & admin send reply from oa.zalo.me ([a936487](https://github.com/erxes/erxes/commit/a936487540c140af456a10ec0f7586590e0a7d54))
- **api:** can not send message cause of message_id ([8c2eddb](https://github.com/erxes/erxes/commit/8c2eddb898798ff90b68b42fd6ee01b419537a06))
- **cards:** closeDate notification fix ([a9164c8](https://github.com/erxes/erxes/commit/a9164c8d19e4183e757561164e3ff1b202e2bad0))
- **cards:** fixed growthHack template duplicate ([db0c2d8](https://github.com/erxes/erxes/commit/db0c2d87f48b39fef1f444babb78d32415ed2a6b))
- **cards:** private stage crash ([#4277](https://github.com/erxes/erxes/issues/4277)) ([8cf1b0a](https://github.com/erxes/erxes/commit/8cf1b0a066222018fc680638e4c63b662f86923c))
- **cards:** reduce card timer font size ([#4251](https://github.com/erxes/erxes/issues/4251)) ([3a8600a](https://github.com/erxes/erxes/commit/3a8600ad06b85d251b0668f3437264892183fbf4))
- **cards:** subscription data fetching with errors in cards ([#3973](https://github.com/erxes/erxes/issues/3973)) ([5bd9832](https://github.com/erxes/erxes/commit/5bd9832c3d3af009e036d9f4c24595a006b99129))
- **clientportal:** topic search ([7e02d9c](https://github.com/erxes/erxes/commit/7e02d9c0bf82518dc7998c3e5c0c052a49b8b3ad))
- **core:** fixed user base64 issue when app token ([adedada](https://github.com/erxes/erxes/commit/adedada45e4bf3a60b1d2c8f68f3ebea8759f575))
- **engages:** read attachment bug ([#3915](https://github.com/erxes/erxes/issues/3915)) ([5166379](https://github.com/erxes/erxes/commit/5166379ad6cfc731b2246f0300c90d82f3f203d2))
- **forum:** content image upload ([f570905](https://github.com/erxes/erxes/commit/f570905abe877973b52a5c950844ccd8c8fb12d1))
- **forum:** sort ([9eea7c5](https://github.com/erxes/erxes/commit/9eea7c55d946fa79dae747cfdb784a80de955d6c))
- **imap:** fixed get customer ([a228267](https://github.com/erxes/erxes/commit/a2282678eedcd5a86ed15469484626c4c6cd21b2))
- **imap:** fixed related message error ([d28d3f7](https://github.com/erxes/erxes/commit/d28d3f75b5369b19ecc7539b767fb5e381b59f7f))
- **imap:** fixed ui is no longer showing issue ([06631c6](https://github.com/erxes/erxes/commit/06631c6494aee795d589764f532e16c350f77cd5))
- **nav:** spacing bug ([#4030](https://github.com/erxes/erxes/issues/4030)) ([6a2fa2b](https://github.com/erxes/erxes/commit/6a2fa2b62a9329b19bb4eccf965019636ba1aef2))
- **riskassessment:** add error handler ([e75e90b](https://github.com/erxes/erxes/commit/e75e90b66f2b9c40bf907bc0b7fe334ee0a7eb42))
- **segments:** fixed cards 2 Stage field ([522a7a4](https://github.com/erxes/erxes/commit/522a7a4607a16054f0c5ffe9767b64cd4e20ea2c))
- **ui:** update new configs.js ([e9d47e2](https://github.com/erxes/erxes/commit/e9d47e2215ca2491dd681a9250db775edbb83f26))
- **users:** customFieldsData replace fix when userEdit ([0c4b05d](https://github.com/erxes/erxes/commit/0c4b05d4cfb47212cb4a250ffcccd1f4b480b2a0))
- **widgets:** date-time input ([#4296](https://github.com/erxes/erxes/issues/4296)) ([11584fb](https://github.com/erxes/erxes/commit/11584fb2aa4e43106b22ceb8aef89ae8811d7a45))

### Features

- **assets:** refactored knowledgebase logic ([21ae87e](https://github.com/erxes/erxes/commit/21ae87ecf7b86537bee764e2e28b53b0dd1baced))
- **cards:** added edit, move permission in pipeline stage setting ([7c79c4c](https://github.com/erxes/erxes/commit/7c79c4c187401fe36f62b6a6f2cd15556e27d3db))
- **chat:** Minor fix ([#102](https://github.com/erxes/erxes/issues/102)) ([b56c7a8](https://github.com/erxes/erxes/commit/b56c7a8fa06d54217166bcae6ed7bcef249fb307))
- **chats:** Focus bug fixed ([#96](https://github.com/erxes/erxes/issues/96)) ([7bcbb09](https://github.com/erxes/erxes/commit/7bcbb09a3809c0243e6a29349118fa4e3bf9006b))
- **clientportal:** add clientPortalUpdateUser mutation ([d97eb55](https://github.com/erxes/erxes/commit/d97eb55e1d8294b47ab8fc45d494b3e2aa13ab42))
- **clientportal:** Add comment section ([#4014](https://github.com/erxes/erxes/issues/4014)) ([e251a36](https://github.com/erxes/erxes/commit/e251a36f52e6d15d1c6b28d6b266df9d710170bc))
- **emailtemplates:** fix search bug ([#3994](https://github.com/erxes/erxes/issues/3994)) ([a3890f1](https://github.com/erxes/erxes/commit/a3890f125ff3146d553bc7ce56c9248cc1194266))
- **filemanager:** added filemanager plugin ([a91cccd](https://github.com/erxes/erxes/commit/a91cccd3eee48494118bffd7466605c4e8c42440))
- **filemanager:** Show folder in file list ([e4c28bf](https://github.com/erxes/erxes/commit/e4c28bf3a05f67c4f189edd671ddd4ebba34e9af))
- **imap:** added activity log ([75ba423](https://github.com/erxes/erxes/commit/75ba4232fdae61ec951c94bb1a05a1c58e1f5d5c))
- **inbox:** fix cards add bug ([#3970](https://github.com/erxes/erxes/issues/3970)) ([840d4e2](https://github.com/erxes/erxes/commit/840d4e2301aa987f78862d529b345327ac496640))
- **inbox:** readded incoming webhook ([73ec0a4](https://github.com/erxes/erxes/commit/73ec0a46724203a1e4ffe04d3a76aeecf1dfacf8))
- **knowledgebase:** added notification segment in topic ([95fb244](https://github.com/erxes/erxes/commit/95fb244f95ef0b763299f2893cc46e8665832bf5))
- **product:** add meta property in category ([2f9f1db](https://github.com/erxes/erxes/commit/2f9f1dbe3903c9b63187e500a4dc9c93548e325b))
- **product:** add meta to category ([b41be74](https://github.com/erxes/erxes/commit/b41be74705a548d76a512a6adffc3c6348774b71))
- **timeclock:** add pagination and improve query filter ([#67](https://github.com/erxes/erxes/issues/67)) ([8affeea](https://github.com/erxes/erxes/commit/8affeeac19c4d73103c25eb195cf337c7ad26302))
- **timeclock:** add schedule config ([#77](https://github.com/erxes/erxes/issues/77)) ([cdebfb0](https://github.com/erxes/erxes/commit/cdebfb03d80084779de226ec78b0d1eaeecdd983))
- **timeclock:** calculation of late minute ([#104](https://github.com/erxes/erxes/issues/104)) ([920c298](https://github.com/erxes/erxes/commit/920c298ff4d3279a3464307042c3ab33504faae2))
- **timeclock:** export preliminary report into excel ([#83](https://github.com/erxes/erxes/issues/83)) ([ae7844d](https://github.com/erxes/erxes/commit/ae7844d7392ddbcfc7a1e6c22aacf2ba622103d5))
- **timeclock:** extract data improvement ([#79](https://github.com/erxes/erxes/issues/79)) ([c03c0f2](https://github.com/erxes/erxes/commit/c03c0f27095ae34326f0cd184e03b302dc1f5a8b))
- **timeclock:** fix find user's branches ([#114](https://github.com/erxes/erxes/issues/114)) ([394745a](https://github.com/erxes/erxes/commit/394745acd59d707970334911848a8724952347d6))
- **timeclock:** improve data fetching from Microsoft SQL server ([#66](https://github.com/erxes/erxes/issues/66)) ([7c9a397](https://github.com/erxes/erxes/commit/7c9a397d5ed88b9ed59d5e5170eb5239f5c4f964))
- **timeclock:** improvement ([a9fa3bb](https://github.com/erxes/erxes/commit/a9fa3bbf483183d381f88364b0f9826af3599a01))
- **timeclock:** improvement of device config ([#109](https://github.com/erxes/erxes/issues/109)) ([a85ed83](https://github.com/erxes/erxes/commit/a85ed83e9a2872fb8d303a853e6ee2232a24fc23))
- **timeclock:** refactor and add cron ([46c7faf](https://github.com/erxes/erxes/commit/46c7faf67d023eaef7898c6d839be1fde6707dc3))
- **timeclock:** report improvement ([#100](https://github.com/erxes/erxes/issues/100)) ([d345a71](https://github.com/erxes/erxes/commit/d345a713ba8079766901b7c0e243e683c406001d))
- **timeclock:** reports query & export report ([#85](https://github.com/erxes/erxes/issues/85)) ([f37f17f](https://github.com/erxes/erxes/commit/f37f17fe8f0f58a346e399ed0132f50ab9c32c8d))
- **timeclock:** time log ([#115](https://github.com/erxes/erxes/issues/115)) ([f8b5240](https://github.com/erxes/erxes/commit/f8b5240aaee9fc1cf0f54e39beea3df9e01dff4d))
- **webbuilder:** improvements of templates and sites ([#3960](https://github.com/erxes/erxes/issues/3960)) ([6fc25bf](https://github.com/erxes/erxes/commit/6fc25bf8cce2c14567c944670ae85f485f3b7103))

### Performance Improvements

- **core:** used `apollo/router` and `@apollo/rover` in the gateway instead of `@apollo/gateway` ([7465169](https://github.com/erxes/erxes/commit/74651691bc8f0e45089007508c3b91fe631e3cba))
- **documents:** refactor ([f198c62](https://github.com/erxes/erxes/commit/f198c62ed3d04b2bb6500aa7971e20234e6dc362))
- **filemanager:** add filemanager form in cards ([ae91768](https://github.com/erxes/erxes/commit/ae917680d32b9ea17882e21611298f9a29768306))
- **filemanager:** add related file list on cards detail ([dd50fe2](https://github.com/erxes/erxes/commit/dd50fe2a8340e1533d82bcfa920590254e88eb49))
- **filemanager:** add tree folder view ([7671d5a](https://github.com/erxes/erxes/commit/7671d5aac703a7272c71310aacd326d32e28a0b7))
- **filemanager:** move fileform to common component ([c602625](https://github.com/erxes/erxes/commit/c602625b84edaf0e524c45eeb05f87b19674bb73))
- **filemanager:** refactor ([4868a22](https://github.com/erxes/erxes/commit/4868a22d7dd45cb56a666fa519411a4051b8489e))
- **webbuilder:** refactor templates ([60d521b](https://github.com/erxes/erxes/commit/60d521b72ffb2f4c3ce9fff5e087a833d82c252b))
- **webbuilder:** update webbuilder ([#4331](https://github.com/erxes/erxes/issues/4331)) ([6c8c074](https://github.com/erxes/erxes/commit/6c8c07451f5035c727ab2a31bafa4eab403a63b9))

## [1.0.1](https://github.com/erxes/erxes/compare/1.0.0...1.0.1) (2022-12-20)

### Bug Fixes

- **automations:** customFieldsData empty value check in isDiffValue ([f47a817](https://github.com/erxes/erxes/commit/f47a8179486fab38016840095d04908ff2a1baf2))
- **engages:** removed invalid visitor segmentType ([e21a411](https://github.com/erxes/erxes/commit/e21a4110abe798f9783afcf845de076b2e42a330))
- **engages:** removed invalid visitor segmentType ([f986cdb](https://github.com/erxes/erxes/commit/f986cdbb93ef85acd4e350984c6ec7ccc161f004))
- **imap:** fixed to check ([b441183](https://github.com/erxes/erxes/commit/b44118347e91c46b1361b52f462772d40199706d))
- **imap:** igoring the aliases ([8f69635](https://github.com/erxes/erxes/commit/8f69635be14819ef6152ec9ee0e10f2f2dcea4e4))
- **inbox:** Fix convert to form reloading when conversation updated ([8ecfece](https://github.com/erxes/erxes/commit/8ecfecefca5daea5aeaa432ad3579e121e107e7c))

### enhancement

- **cli:** improve create plugin cli and add create integration cli ([58165a5](https://github.com/erxes/erxes/commit/58165a5a407c8d429dd3e1199e3b3015d3bdd78a))

### Features

- **cards:** added ability to create new child card on cards ([#3905](https://github.com/erxes/erxes/issues/3905)) ([505256e](https://github.com/erxes/erxes/commit/505256ef10efeba061f830ace9f5e2235ef38cc2))
- **documents:** added documents feature ([1091ae9](https://github.com/erxes/erxes/commit/1091ae959633639a6cd362e9e99aebc249c16b10))
- **forms:** added ability to add extra fields in custom properties ([b361ece](https://github.com/erxes/erxes/commit/b361ece28768d60a2c5f90cc848e2be437ae03e9))
- **imap:** added main authentication user feature ([6bf1542](https://github.com/erxes/erxes/commit/6bf1542a2c053ae86fa2e8089336e41be72ba3d4))
- **theme:** added alibity to change logo, color, background, description of login page ([c284f6e](https://github.com/erxes/erxes/commit/c284f6e30687ac8a9c7c61682c3bb9517ed3855b))
- **timeclock:** add plugin named timeclock ([63f4ad0](https://github.com/erxes/erxes/commit/63f4ad0864f68c6e64b39caa9796973282acf22d))

### Performance Improvements

- **product/service:** Update product edit form ([829fe3d](https://github.com/erxes/erxes/commit/829fe3d185ddae4d2b8e8908a267105b8cba7330))
- **webbuilder:** Update webbuilder UI([#3925](https://github.com/erxes/erxes/issues/3925)) ([e848cff](https://github.com/erxes/erxes/commit/e848cff032b047d00b19737e3e1f44e4691a17d1))

### BREAKING CHANGES

- **cli:** The hot reloader dependency added in plugin-ui's webpack config. Need to enter a command yarn install-deps on every plugin-ui that you are working on to install that dependency.

## [1.0.1](https://github.com/erxes/erxes/compare/1.0.0...1.0.1) (2022-12-20)

### Bug Fixes

- **automations:** customFieldsData empty value check in isDiffValue ([f47a817](https://github.com/erxes/erxes/commit/f47a8179486fab38016840095d04908ff2a1baf2))
- **command:** remove plugin-empty-template [#3668](https://github.com/erxes/erxes/issues/3668) ([e247809](https://github.com/erxes/erxes/commit/e247809fda45b979ec44cf6e09133293bc81ef1e))
- **contacts:** fixed email, phone verification action ([1d0c7f0](https://github.com/erxes/erxes/commit/1d0c7f092645cc36e0967233cd32b111c8029925))
- **engages:** removed invalid visitor segmentType ([e21a411](https://github.com/erxes/erxes/commit/e21a4110abe798f9783afcf845de076b2e42a330))
- **engages:** removed invalid visitor segmentType ([f986cdb](https://github.com/erxes/erxes/commit/f986cdbb93ef85acd4e350984c6ec7ccc161f004))
- **inbox:** Fix convert to form reloading when conversation updated ([8ecfece](https://github.com/erxes/erxes/commit/8ecfecefca5daea5aeaa432ad3579e121e107e7c))
- **marketplace:** some styling on plugin detail ([6907000](https://github.com/erxes/erxes/commit/690700071249428851d84f926fb33f75f89dceda))
- **navigation:** fix some height ([94fe633](https://github.com/erxes/erxes/commit/94fe6332542fa7555c81e8afe1e3bbf453e4e65e))
- **plugins:** remove unused imports and fix ts error ([#3744](https://github.com/erxes/erxes/issues/3744)) ([00034e6](https://github.com/erxes/erxes/commit/00034e6b9f0a3a13b6760feec961d9c513b3c679))
- **workers:** fixed large amount of data importing error ([#3786](https://github.com/erxes/erxes/issues/3786)) ([456bc7b](https://github.com/erxes/erxes/commit/456bc7baf7ec02eb2fe3ccae35ab51645f89b9e8))

### enhancement

- **cli:** improve create plugin cli and add create integration cli ([58165a5](https://github.com/erxes/erxes/commit/58165a5a407c8d429dd3e1199e3b3015d3bdd78a))

### Features

- **automations:** refactor and make triggers and actions dynamic. ([#3721](https://github.com/erxes/erxes/issues/3721)) ([fdae34e](https://github.com/erxes/erxes/commit/fdae34eca9f9b93b577153678afd10fc68584a58))
- **cards:** added ability to create new child card on cards ([#3905](https://github.com/erxes/erxes/issues/3905)) ([505256e](https://github.com/erxes/erxes/commit/505256ef10efeba061f830ace9f5e2235ef38cc2))
- **cli:** added docker-compose feature in installation ([589ff93](https://github.com/erxes/erxes/commit/589ff938b09c982775957eb27efe7d57552e1486))
- **documents:** added documents feature ([1091ae9](https://github.com/erxes/erxes/commit/1091ae959633639a6cd362e9e99aebc249c16b10))
- **forms:** added ability to add extra fields in custom properties ([b361ece](https://github.com/erxes/erxes/commit/b361ece28768d60a2c5f90cc848e2be437ae03e9))
- **inbox:** added ability to integrate new integration to inbox easyly ([7f19de3](https://github.com/erxes/erxes/commit/7f19de3cc7aa7b8a07448735ba4a469853285f0a)), closes [#3672](https://github.com/erxes/erxes/issues/3672)
- **marketplace:** delete constant data in plugin detail ([346dccd](https://github.com/erxes/erxes/commit/346dccd9e8f035186d3c855c876b5ddcb77bc7b7))
- **marketplace:** fix breadcrumb and some spacing ([abdd6ef](https://github.com/erxes/erxes/commit/abdd6ef47fde69927ba6f6e85faa19d47faf8ea1))
- **marketplace:** fix searchbar ([#3740](https://github.com/erxes/erxes/issues/3740)) ([c5889e7](https://github.com/erxes/erxes/commit/c5889e79a7f8267b26ae452803deaf5325bc1777))
- **marketplace:** fix some image ([b43176a](https://github.com/erxes/erxes/commit/b43176a1720d32626107ca9063ba28cca9146803))
- **marketplace:** init ([#3703](https://github.com/erxes/erxes/issues/3703)) ([269aec1](https://github.com/erxes/erxes/commit/269aec16af2e76ab89d209f94088e5aabad80840))
- **marketplace:** remove addons ([392b237](https://github.com/erxes/erxes/commit/392b237a62f670487cf877239748dee11de5805f))
- **marketplace:** some fix in plugin detail ([40d651b](https://github.com/erxes/erxes/commit/40d651be34aca39e03f41b0db71c83b20a1f3111))
- **marketplace:** update some styling in plugin detail ([321a584](https://github.com/erxes/erxes/commit/321a5847463c5e08600f6529ee7d9249903ac109))
- **martketplace:** fix maintype ([8c8d431](https://github.com/erxes/erxes/commit/8c8d43170103d631820f97750e718eb009e06064))
- **store:** fix service duplications ([#3729](https://github.com/erxes/erxes/issues/3729)) ([68cb4fc](https://github.com/erxes/erxes/commit/68cb4fc3aa146990c430bb4fe20733c16191b9b3))
- **theme:** added alibity to change logo, color, background, description of login page ([c284f6e](https://github.com/erxes/erxes/commit/c284f6e30687ac8a9c7c61682c3bb9517ed3855b))

### Performance Improvements

- **forms:** add dateTime to add properties validation ([#3727](https://github.com/erxes/erxes/issues/3727)) ([33c71c3](https://github.com/erxes/erxes/commit/33c71c3c48f05d7c2486edb2f5287561a4364476))
- **message-broker:** waiting rpc message for 10sec by default ([01715ff](https://github.com/erxes/erxes/commit/01715ffd0d33f3cf5ba5364ee926a29207601a97))
- **product/service:** Update product edit form ([829fe3d](https://github.com/erxes/erxes/commit/829fe3d185ddae4d2b8e8908a267105b8cba7330))
- **webbuilder:** Update webbuilder UI([#3925](https://github.com/erxes/erxes/issues/3925)) ([e848cff](https://github.com/erxes/erxes/commit/e848cff032b047d00b19737e3e1f44e4691a17d1))
- **widget:** Add some improvement in datetime input ([ddddd6f](https://github.com/erxes/erxes/commit/ddddd6f4eff95a67d68b2560704cf26b61de061f))

### BREAKING CHANGES

- **cli:** The hot reloader dependency added in plugin-ui's webpack config. Need to enter a command yarn install-deps on every plugin-ui that you are working on to install that dependency.

## [0.3.39](https://github.com/erxes/erxes/compare/0.24.2...v0.3.39) (2022-10-01)

### Bug Fixes

- **automations:** cards chooser bug ([#3620](https://github.com/erxes/erxes/issues/3620)) ([205ac91](https://github.com/erxes/erxes/commit/205ac91a4141f01ae357e45deefc16135f10c504))
- **automations:** fixed set-property action with customFieldsData and trackedData ([40f9e1e](https://github.com/erxes/erxes/commit/40f9e1e357d0386904ecbede7da9c14a2c6ac18c)), closes [#3611](https://github.com/erxes/erxes/issues/3611)
- **forms:** form description cannot editable ([b76cb1a](https://github.com/erxes/erxes/commit/b76cb1a0cf230fc919ec42e84ab0daa0d3438710))
- **inbox:** change input type of name in convertTo form ([#3572](https://github.com/erxes/erxes/issues/3572)) ([2bb7808](https://github.com/erxes/erxes/commit/2bb7808aecf448113efdce8b12c186368e058585))
- **inbox:** segments integrationId filter ([2e85502](https://github.com/erxes/erxes/commit/2e8550211a3892caa22cb9784daca09dc59ed19e))
- **inbox:** Some fix in mail chooser ([18960d8](https://github.com/erxes/erxes/commit/18960d82829fd3e985edf2c3d890737326ba4c51))
- **navigation:** update more menu ([6f5e336](https://github.com/erxes/erxes/commit/6f5e336c763d839282b8a50c251e0e2c025cade5))

### Features

- **store:** update plugin detail ([#3557](https://github.com/erxes/erxes/issues/3557)) ([9b255ed](https://github.com/erxes/erxes/commit/9b255edd9a45a1608f3e09877633a320432f5072))

### Performance Improvements

- **rabbitmq:** implemented connection retry logic ([1185a1b](https://github.com/erxes/erxes/commit/1185a1b825a9231b686b9db35e2d742425db296a))

## [1.0.1](https://github.com/erxes/erxes/compare/1.0.0...1.0.1) (2022-12-20)

### Bug Fixes

- **automations:** customFieldsData empty value check in isDiffValue ([f47a817](https://github.com/erxes/erxes/commit/f47a8179486fab38016840095d04908ff2a1baf2))
- **command:** remove plugin-empty-template [#3668](https://github.com/erxes/erxes/issues/3668) ([e247809](https://github.com/erxes/erxes/commit/e247809fda45b979ec44cf6e09133293bc81ef1e))
- **contacts:** fixed email, phone verification action ([1d0c7f0](https://github.com/erxes/erxes/commit/1d0c7f092645cc36e0967233cd32b111c8029925))
- **engages:** removed invalid visitor segmentType ([e21a411](https://github.com/erxes/erxes/commit/e21a4110abe798f9783afcf845de076b2e42a330))
- **engages:** removed invalid visitor segmentType ([f986cdb](https://github.com/erxes/erxes/commit/f986cdbb93ef85acd4e350984c6ec7ccc161f004))
- **inbox:** Fix convert to form reloading when conversation updated ([8ecfece](https://github.com/erxes/erxes/commit/8ecfecefca5daea5aeaa432ad3579e121e107e7c))
- **marketplace:** some styling on plugin detail ([6907000](https://github.com/erxes/erxes/commit/690700071249428851d84f926fb33f75f89dceda))
- **navigation:** fix some height ([94fe633](https://github.com/erxes/erxes/commit/94fe6332542fa7555c81e8afe1e3bbf453e4e65e))
- **plugins:** remove unused imports and fix ts error ([#3744](https://github.com/erxes/erxes/issues/3744)) ([00034e6](https://github.com/erxes/erxes/commit/00034e6b9f0a3a13b6760feec961d9c513b3c679))
- **workers:** fixed large amount of data importing error ([#3786](https://github.com/erxes/erxes/issues/3786)) ([456bc7b](https://github.com/erxes/erxes/commit/456bc7baf7ec02eb2fe3ccae35ab51645f89b9e8))

### enhancement

- **cli:** improve create plugin cli and add create integration cli ([58165a5](https://github.com/erxes/erxes/commit/58165a5a407c8d429dd3e1199e3b3015d3bdd78a))

### Features

- **automations:** refactor and make triggers and actions dynamic. ([#3721](https://github.com/erxes/erxes/issues/3721)) ([fdae34e](https://github.com/erxes/erxes/commit/fdae34eca9f9b93b577153678afd10fc68584a58))
- **cards:** added ability to create new child card on cards ([#3905](https://github.com/erxes/erxes/issues/3905)) ([505256e](https://github.com/erxes/erxes/commit/505256ef10efeba061f830ace9f5e2235ef38cc2))
- **cli:** added docker-compose feature in installation ([589ff93](https://github.com/erxes/erxes/commit/589ff938b09c982775957eb27efe7d57552e1486))
- **documents:** added documents feature ([1091ae9](https://github.com/erxes/erxes/commit/1091ae959633639a6cd362e9e99aebc249c16b10))
- **forms:** added ability to add extra fields in custom properties ([b361ece](https://github.com/erxes/erxes/commit/b361ece28768d60a2c5f90cc848e2be437ae03e9))
- **inbox:** added ability to integrate new integration to inbox easyly ([7f19de3](https://github.com/erxes/erxes/commit/7f19de3cc7aa7b8a07448735ba4a469853285f0a)), closes [#3672](https://github.com/erxes/erxes/issues/3672)
- **marketplace:** delete constant data in plugin detail ([346dccd](https://github.com/erxes/erxes/commit/346dccd9e8f035186d3c855c876b5ddcb77bc7b7))
- **marketplace:** fix breadcrumb and some spacing ([abdd6ef](https://github.com/erxes/erxes/commit/abdd6ef47fde69927ba6f6e85faa19d47faf8ea1))
- **marketplace:** fix searchbar ([#3740](https://github.com/erxes/erxes/issues/3740)) ([c5889e7](https://github.com/erxes/erxes/commit/c5889e79a7f8267b26ae452803deaf5325bc1777))
- **marketplace:** fix some image ([b43176a](https://github.com/erxes/erxes/commit/b43176a1720d32626107ca9063ba28cca9146803))
- **marketplace:** init ([#3703](https://github.com/erxes/erxes/issues/3703)) ([269aec1](https://github.com/erxes/erxes/commit/269aec16af2e76ab89d209f94088e5aabad80840))
- **marketplace:** remove addons ([392b237](https://github.com/erxes/erxes/commit/392b237a62f670487cf877239748dee11de5805f))
- **marketplace:** some fix in plugin detail ([40d651b](https://github.com/erxes/erxes/commit/40d651be34aca39e03f41b0db71c83b20a1f3111))
- **marketplace:** update some styling in plugin detail ([321a584](https://github.com/erxes/erxes/commit/321a5847463c5e08600f6529ee7d9249903ac109))
- **martketplace:** fix maintype ([8c8d431](https://github.com/erxes/erxes/commit/8c8d43170103d631820f97750e718eb009e06064))
- **store:** fix service duplications ([#3729](https://github.com/erxes/erxes/issues/3729)) ([68cb4fc](https://github.com/erxes/erxes/commit/68cb4fc3aa146990c430bb4fe20733c16191b9b3))
- **theme:** added alibity to change logo, color, background, description of login page ([c284f6e](https://github.com/erxes/erxes/commit/c284f6e30687ac8a9c7c61682c3bb9517ed3855b))

### Performance Improvements

- **forms:** add dateTime to add properties validation ([#3727](https://github.com/erxes/erxes/issues/3727)) ([33c71c3](https://github.com/erxes/erxes/commit/33c71c3c48f05d7c2486edb2f5287561a4364476))
- **message-broker:** waiting rpc message for 10sec by default ([01715ff](https://github.com/erxes/erxes/commit/01715ffd0d33f3cf5ba5364ee926a29207601a97))
- **product/service:** Update product edit form ([829fe3d](https://github.com/erxes/erxes/commit/829fe3d185ddae4d2b8e8908a267105b8cba7330))
- **webbuilder:** Update webbuilder UI([#3925](https://github.com/erxes/erxes/issues/3925)) ([e848cff](https://github.com/erxes/erxes/commit/e848cff032b047d00b19737e3e1f44e4691a17d1))
- **widget:** Add some improvement in datetime input ([ddddd6f](https://github.com/erxes/erxes/commit/ddddd6f4eff95a67d68b2560704cf26b61de061f))

### BREAKING CHANGES

- **cli:** The hot reloader dependency added in plugin-ui's webpack config. Need to enter a command yarn install-deps on every plugin-ui that you are working on to install that dependency.

## [0.3.39](https://github.com/erxes/erxes/compare/0.24.2...v0.3.39) (2022-10-01)

### Bug Fixes

- **automations:** cards chooser bug ([#3620](https://github.com/erxes/erxes/issues/3620)) ([205ac91](https://github.com/erxes/erxes/commit/205ac91a4141f01ae357e45deefc16135f10c504))
- **automations:** fixed set-property action with customFieldsData and trackedData ([40f9e1e](https://github.com/erxes/erxes/commit/40f9e1e357d0386904ecbede7da9c14a2c6ac18c)), closes [#3611](https://github.com/erxes/erxes/issues/3611)
- **forms:** form description cannot editable ([b76cb1a](https://github.com/erxes/erxes/commit/b76cb1a0cf230fc919ec42e84ab0daa0d3438710))
- **inbox:** change input type of name in convertTo form ([#3572](https://github.com/erxes/erxes/issues/3572)) ([2bb7808](https://github.com/erxes/erxes/commit/2bb7808aecf448113efdce8b12c186368e058585))
- **inbox:** segments integrationId filter ([2e85502](https://github.com/erxes/erxes/commit/2e8550211a3892caa22cb9784daca09dc59ed19e))
- **inbox:** Some fix in mail chooser ([18960d8](https://github.com/erxes/erxes/commit/18960d82829fd3e985edf2c3d890737326ba4c51))
- **navigation:** update more menu ([6f5e336](https://github.com/erxes/erxes/commit/6f5e336c763d839282b8a50c251e0e2c025cade5))

### Features

- **store:** update plugin detail ([#3557](https://github.com/erxes/erxes/issues/3557)) ([9b255ed](https://github.com/erxes/erxes/commit/9b255edd9a45a1608f3e09877633a320432f5072))

### Performance Improvements

- **rabbitmq:** implemented connection retry logic ([1185a1b](https://github.com/erxes/erxes/commit/1185a1b825a9231b686b9db35e2d742425db296a))

# [1.0.0](https://github.com/erxes/erxes/compare/0.24.2...1.0.0) (2022-11-07)

# [1.0.0](https://github.com/erxes/erxes/compare/0.24.2...1.0.0) (2022-11-07)

## [0.22.3](https://github.com/erxes/erxes/compare/0.22.2...0.22.3) (2021-05-19)

## [0.22.2](https://github.com/erxes/erxes/compare/0.22.1...0.22.2) (2021-05-19)

## [0.22.1](https://github.com/erxes/erxes/compare/0.22.0...0.22.1) (2021-05-19)

# [0.22.0](https://github.com/erxes/erxes/compare/0.21.1...0.22.0) (2021-05-19)

### Bug Fixes

- **board:** show active board, pipeline in dropdown list ([6e79ce7](https://github.com/erxes/erxes/commit/6e79ce7edd013085eb0b22ebe1f5a6c28bcd5a1a))

### Features

- **knowledgebase:** added parent category ([8c84485](https://github.com/erxes/erxes/commit/8c844852f262c8726648cf3eb299bc0d982b8482))

### BREAKING CHANGES

- **knowledgebase:** need to run migrateKnowledgeBase command

## [0.21.1](https://github.com/erxes/erxes/compare/0.21.0...0.21.1) (2021-04-30)

# [0.21.0](https://github.com/erxes/erxes/compare/0.20.16...0.21.0) (2021-04-30)

### Bug Fixes

- widgetsGetEngageMessage ([c732c78](https://github.com/erxes/erxes/commit/c732c78e3999de35ee75d57bc397ee6a6f0461cb))
- **conversation:** ignored non messenger conversation from notification ([4f6471a](https://github.com/erxes/erxes/commit/4f6471a9b514b568054d20bb08bbc51621341863))
- **deal:** fix bug to close popup when click add product/service button ([134925f](https://github.com/erxes/erxes/commit/134925f9881847b8af8b9ddd5a5a4f9c07e9dfb8))
- **deal/task/ticket:** the order of the added items is at the beginning of the list ([779cfcb](https://github.com/erxes/erxes/commit/779cfcb6c98baa8deae1ed4e7a4641ef8c701317))
- **engage:** change email template content ([fe20114](https://github.com/erxes/erxes/commit/fe20114cb82ee95bf8879ecac1c1a76a898bf3c7))
- **export-template:** downloading template with single column issue ([4e27622](https://github.com/erxes/erxes/commit/4e27622de10f0b93e4a0ea517a57e3f7f9cdd550))
- **forms:** fix pagination ([24154f5](https://github.com/erxes/erxes/commit/24154f5f08e35e726b833787f969df894de77d70))
- **growthHack:** fix dissappearing edit template button ([0f5d670](https://github.com/erxes/erxes/commit/0f5d670273c1e534880a71ad1f14ee805770e391))
- **inbox:** fixed offline customer mask issue ([0b9c97d](https://github.com/erxes/erxes/commit/0b9c97d375918f3cd0c43682f457b5b04a5bdd8b))
- **segments:** fixed month relative filter issue ([c5c1d0a](https://github.com/erxes/erxes/commit/c5c1d0abc17279075db2de97f6a859c09b6a55ed))
- **version:** fixed current version change log link ([e3adc09](https://github.com/erxes/erxes/commit/e3adc097fa4415ffa09e81b84b21d27e5295627b))

### Features

- **deal/task/ticket:** add sort options ([e47f1f3](https://github.com/erxes/erxes/commit/e47f1f3777ee346f4d46f472bfda722d95fbd882))
- **editor:** auto save ([f2fd625](https://github.com/erxes/erxes/commit/f2fd6252634c198814de806d4f631211e6cfdce8))
- **engages:** added board item segments in engage ([089efbc](https://github.com/erxes/erxes/commit/089efbcb88b66b70765dc44549a6522d05c3d155))
- **invite:** added channel options in invite form ([85ed407](https://github.com/erxes/erxes/commit/85ed40704c764a974110a7af952693149879890b))
- **product and service:** add field vendor ([7a8acb8](https://github.com/erxes/erxes/commit/7a8acb823742a1631631db9cef7e8b5fc59a99fb))
- **segments:** added ability to distinguish segments via board, pipeline ([f5ef4d2](https://github.com/erxes/erxes/commit/f5ef4d26775f27e952d6cb65cb7679b4b45ed410))
- **segments:** added segment feature in deals, tickets, tasks ([f4771b4](https://github.com/erxes/erxes/commit/f4771b4569e171ca841272fbd0d29fda27ac8463))
- **simulate:** added simulate feature in messenger, form, knowledgebase ([b930ead](https://github.com/erxes/erxes/commit/b930eadaa4c6890cec42c3cb500fca30290d2ba6))
- **tags:** added merge feature in tags ([1fc7a33](https://github.com/erxes/erxes/commit/1fc7a339763b55978505cd45d2c70dce8af0906c))
- **task,ticket:** added calendar view ([caa0fca](https://github.com/erxes/erxes/commit/caa0fcadd66b1ab2d2e7384a85d0d37941372dcc))

### Performance Improvements

- **board:** no longer using custom resolvers in board item list queries ([cf11027](https://github.com/erxes/erxes/commit/cf11027a19868b4cd3888b4ed46c70776b60f62a))
- **boards:** boards query get pipelines exclude resolver ([918c5b2](https://github.com/erxes/erxes/commit/918c5b25b7d0952859f15825992f02b2786684a1))
- **conformities:** using es for conformities when es available ([466eff5](https://github.com/erxes/erxes/commit/466eff508d260499924ed545d891dd0c5b470540))
- **engages:** added option elksyncer in engage visitor message ([490d752](https://github.com/erxes/erxes/commit/490d7528dbe9433f2aa3da49f9ba144516e23b75))
- **tags:** dettaching connected items when tag remove ([db6b309](https://github.com/erxes/erxes/commit/db6b309f15fd2063f6cb7bb5c68d32f0c610aed6))
- **users/integrations/brands/channels:** read from cache ([8b2d61d](https://github.com/erxes/erxes/commit/8b2d61d09cdf5eddc1fec1f9f6ad8fe80cadf654)), closes [#2715](https://github.com/erxes/erxes/issues/2715)

## [0.20.16](https://github.com/erxes/erxes/compare/0.20.15...0.20.16) (2021-03-05)

### Bug Fixes

- **elasticsearch:** checked some index not found cases in inbox, search ([9f54797](https://github.com/erxes/erxes/commit/9f547974ed3f56715232b6a81130ca1398094178))
- **tags:** sub tag and tag count related bug fixes ([2bafe0f](https://github.com/erxes/erxes/commit/2bafe0ff2bd7548e0c1b88d007654199121f5219))

## [0.20.15](https://github.com/erxes/erxes/compare/0.20.14...0.20.15) (2021-03-03)

### Bug Fixes

- **contacts:** fixed little null check in customer detail ([9f264d3](https://github.com/erxes/erxes/commit/9f264d32437726c6d563d1930653b0fa4823f35b))

## [0.20.14](https://github.com/erxes/erxes/compare/0.20.13...0.20.14) (2021-03-03)

### Bug Fixes

- **migrations:** readded db-migrate-store ([747c6f4](https://github.com/erxes/erxes/commit/747c6f48eda9f9a8bc511412d4be66645007013b))

## [0.20.13](https://github.com/erxes/erxes/compare/0.20.12...0.20.13) (2021-03-03)

### Bug Fixes

- **migrations:** fixed migrations ([b37bb7a](https://github.com/erxes/erxes/commit/b37bb7a5938e554bf0016ca78056d17cd19cc71f))

## [0.20.12](https://github.com/erxes/erxes/compare/0.20.11...0.20.12) (2021-03-02)

### Bug Fixes

- **campaign:** Fix campaign preview height without an email template ([d887c1e](https://github.com/erxes/erxes/commit/d887c1e65146fa77543742187fa23a7784384850))
- **deal/task/ticket:** fix real-time issue while clicks "Archive all carts in this list" ([332804e](https://github.com/erxes/erxes/commit/332804e0fcb64e78822060b37e44a970390f3827)), closes [#2629](https://github.com/erxes/erxes/issues/2629)
- **deal/tast/ticket:** fix pipeline, board chooser dropdown scrolling issue ([34e190e](https://github.com/erxes/erxes/commit/34e190e1e7ae5127422075b0194a6bb16aec0209))
- **skills:** fix can not disable skills on messenger ([fb79088](https://github.com/erxes/erxes/commit/fb7908819563413c814b9a5469d89f493c130382))
- **widget:** fix confirmation dialog, description text placement ([bec10a1](https://github.com/erxes/erxes/commit/bec10a1868fa251b404f5471c257a19c3b3f40c4))
- **widget:** fix displaying wrong social link ([df84f64](https://github.com/erxes/erxes/commit/df84f64a888ee623f32fecb59902fdfff74e4088))
- **workers:** fixed check duplication issue ([7607f43](https://github.com/erxes/erxes/commit/7607f432daff417b3733e2c0a11ebc89569cfd91))
- **workers:** not removing import history when there is no customer ids ([bdccfa6](https://github.com/erxes/erxes/commit/bdccfa651018254158fcb09afaeaa70101ba1e67))
- **workers:** not removing import history when there is no customer ids ([2db3580](https://github.com/erxes/erxes/commit/2db35800367a21559f6f15df46e0e3b8aeb8f65d))

### Features

- **search:** added global search feature ([9709185](https://github.com/erxes/erxes/commit/97091852822d38e1dbf98c1649b8fe1b40ac9370)), closes [#2655](https://github.com/erxes/erxes/issues/2655)
- **segments:** added related integrations filter ([8db1316](https://github.com/erxes/erxes/commit/8db13169ba276d3450cfbdb9f4932891598f18f0))

### Performance Improvements

- **tag:** add ability to create subtag ([607e92d](https://github.com/erxes/erxes/commit/607e92d11aee5a7a11f667c4ca43a934110b447b)), closes [#2612](https://github.com/erxes/erxes/issues/2612)

## [0.20.11](https://github.com/erxes/erxes/compare/0.20.10...0.20.11) (2021-01-29)

### Bug Fixes

- **api-utils:** fixed notification template not found error ([344e4c4](https://github.com/erxes/erxes/commit/344e4c41a6330dddfa47ec15a54067ebf1bb7b94))

## [0.20.10](https://github.com/erxes/erxes/compare/0.20.9...0.20.10) (2021-01-19)

## [0.20.9](https://github.com/erxes/erxes/compare/0.20.8...0.20.9) (2021-01-19)

### Bug Fixes

- incoming webhook customFieldsData ([45da6be](https://github.com/erxes/erxes/commit/45da6bef2b36af97edb7e3f9d4d490edb1638b33))
- **board:** fix drag drop preblems when loading ([18aaa6a](https://github.com/erxes/erxes/commit/18aaa6a48cf63213024b8d55d2511ad2f3bfdf0c))
- **board:** fix overlapping description in board detail ([15df78a](https://github.com/erxes/erxes/commit/15df78a863a72c2d5dcd0a26e1d8c924bc3a26ee))
- **common:** fix not showing editor attribute ([0850b3a](https://github.com/erxes/erxes/commit/0850b3a80ca814b4d5f3d245953808c3e01aa48d))
- **customers:** exclude deleted customers from list ([3ea5eb8](https://github.com/erxes/erxes/commit/3ea5eb84e6d409188c3a2eef6680e8256b20e4ed))
- **engage:** fix next button not workin properly, fix console error ([47a82d8](https://github.com/erxes/erxes/commit/47a82d82616c5abdc4bd76285aa79cd4bce10650))
- **engages:** fixed lead segments count in engages ([f051e41](https://github.com/erxes/erxes/commit/f051e416a57b62bb2d03cfe468a33d4046e437f6))
- **popups:** fixed thank content email attributes ([a4ae030](https://github.com/erxes/erxes/commit/a4ae03016e6326e73448b6761ee127e907062c45))
- **popups:** hide archived popups from widgets ([0a724aa](https://github.com/erxes/erxes/commit/0a724aa1a97cbcdd1e10d51de7d1ac7f496a1457))

### Features

- **brand:** add email config settings for each brand ([cec2b09](https://github.com/erxes/erxes/commit/cec2b09756796d8d4ba7c19b792db3e8817933cf))
- **common:** separate common components as node modules to npm ([a24baa1](https://github.com/erxes/erxes/commit/a24baa1406d409dc5ce35ff268a480528f7b5b04))
- **dashboard:** add filter on conversations report ([fdb6775](https://github.com/erxes/erxes/commit/fdb6775d4dce166a2e3efe23ac0581f728d385cc))
- **dashboard:** add filter on dashboard report ([9519479](https://github.com/erxes/erxes/commit/9519479670f702c41398d377a342604644e0d83c)), closes [close#2551](https://github.com/close/issues/2551)
- **engage:** added pre schedule option ([4073a07](https://github.com/erxes/erxes/commit/4073a070d6b0eee3ecdb93733b9f428236d4e47b))
- **inbox:** skills-based route in messenger ([c6aaa14](https://github.com/erxes/erxes/commit/c6aaa142a64d7133c72218502248e832889a6220)), closes [#2540](https://github.com/erxes/erxes/issues/2540)
- **plugins:** added plugin base ([0932b03](https://github.com/erxes/erxes/commit/0932b03838494a4b4950a6d2736ec7746d12dcce))
- **release:** add new release notifier in robot ([c6d1ddd](https://github.com/erxes/erxes/commit/c6d1dddb1c3e79943884cd429cdb8a53787c6746))
- **schedule:** added schedule feature on calendar using nylas ([465ff77](https://github.com/erxes/erxes/commit/465ff771717522b83f58e1901a939d00dac8045a))

### Performance Improvements

- **cron:** added notification delete cron ([c9c2391](https://github.com/erxes/erxes/commit/c9c23912b92136d3d0006e73aabe8d674e0bf452))
- **import:** improve performance of import ([6df39ba](https://github.com/erxes/erxes/commit/6df39baf0239e677302821eef0942175b432d0b9)), closes [#2557](https://github.com/erxes/erxes/issues/2557)
- **inbox:** add subject when convert to pipeline in inbox ([8356ecc](https://github.com/erxes/erxes/commit/8356ecc83469dc74b1f6141cdd7bdecc6ea52bf9))
- **webhook:** added origin verification method ([d99ed28](https://github.com/erxes/erxes/commit/d99ed28b30e5fb02681519ec81d4f72023ff2b43))

## [0.20.8](https://github.com/erxes/erxes/compare/0.20.7...0.20.8) (2020-12-07)

### Bug Fixes

- **inbox:** fix email send button, email subject can editable ([2b501ca](https://github.com/erxes/erxes/commit/2b501cae5b4c7b22beae92be0e3296cc720e6b6f))
- **messenger:** fix integration social url close [#2501](https://github.com/erxes/erxes/issues/2501) ([2c67034](https://github.com/erxes/erxes/commit/2c670346f6da2ec4f5705e30e1ae080da150b523))
- **nylas:** enable account ([b75701e](https://github.com/erxes/erxes/commit/b75701e94a474502d2982085c9013b42f21b6c83))
- **search:** fixed multiple word search with space in customers, companies list ([0acf074](https://github.com/erxes/erxes/commit/0acf074be31afde93dffaee608cc641c9b0086cd))
- **select-multi:** added fetchExtra option to solve reopen autocompletion issue ([2c07ac1](https://github.com/erxes/erxes/commit/2c07ac1f7533ece45044ae316ae22c1e2a15a5e6))
- **select-multi:** applied SelectWithSearch fixes in SelectCompanies, SelectCustomers, ([abd1b31](https://github.com/erxes/erxes/commit/abd1b3196d6d7ca2b9844cf21f600db080d82e96))

### Features

- **segments:** added tags on contact segment ([17b748e](https://github.com/erxes/erxes/commit/17b748e5a7b526842fe50a7d358bc9b63b3cae67)), closes [#2518](https://github.com/erxes/erxes/issues/2518)

### Performance Improvements

- **calendar:** move calendar header to sidebar ([d522efb](https://github.com/erxes/erxes/commit/d522efb940651a65ff39412782800b90dd559e4c))
- **contacts:** make table shrinkable and expandable ([0a491f9](https://github.com/erxes/erxes/commit/0a491f9cc5942f036cb9ab5d4fc89e056e4edebc))

## [0.20.7](https://github.com/erxes/erxes/compare/0.20.6...0.20.7) (2020-11-26)

### Bug Fixes

- **botpress:** create conversation when user respond ([3ee59e9](https://github.com/erxes/erxes/commit/3ee59e9655f78d9de1911d7d5f1c57ab846f43f8)), closes [#2492](https://github.com/erxes/erxes/issues/2492)
- **chunks:** implemented retry machanism to prevent from loading chunk failed error ([8886593](https://github.com/erxes/erxes/commit/888659347eb9a1f7beac8e0fed8db031dbd47882))
- **nylas:** revoke google account ([69480dc](https://github.com/erxes/erxes/commit/69480dc14b29902421472dbf9c8fa3c55158f268)), closes [#2494](https://github.com/erxes/erxes/issues/2494)

### Reverts

- Revert "update" ([1b7a23f](https://github.com/erxes/erxes/commit/1b7a23f55d5d909f5fbaee4d495b0a6534230bfb))

## [0.20.6](https://github.com/erxes/erxes/compare/0.20.5...0.20.6) (2020-11-18)

### Features

- **calendar:** added calendar feature ([a30a1e2](https://github.com/erxes/erxes/commit/a30a1e2cfbfb21a2c2fb81b5a6a5415988abad7f))

## [0.20.5](https://github.com/erxes/erxes/compare/0.20.4...0.20.5) (2020-11-13)

## [0.20.4](https://github.com/erxes/erxes/compare/0.20.3...0.20.4) (2020-11-13)

### Features

- **dashboard:** using elasticsearch in cubejs backend ([b9ae06c](https://github.com/erxes/erxes/commit/b9ae06c0652a92383325031b9146339f87fbb425))

## [0.20.5](https://github.com/erxes/erxes/compare/0.20.4...0.20.5) (2020-11-13)

## [0.20.4](https://github.com/erxes/erxes/compare/0.20.3...0.20.4) (2020-11-13)

### Features

- **dashboard:** using elasticsearch in cubejs backend ([b9ae06c](https://github.com/erxes/erxes/commit/b9ae06c0652a92383325031b9146339f87fbb425))

## [0.20.4](https://github.com/erxes/erxes/compare/0.20.3...0.20.4) (2020-11-13)

### Features

- **dashboard:** using elasticsearch in cubejs backend ([b9ae06c](https://github.com/erxes/erxes/commit/b9ae06c0652a92383325031b9146339f87fbb425))

## [0.20.4](https://github.com/erxes/erxes/compare/0.20.3...0.20.4) (2020-11-13)

### Features

- **dashboard:** using elasticsearch in cubejs backend ([b9ae06c](https://github.com/erxes/erxes/commit/b9ae06c0652a92383325031b9146339f87fbb425))

## [0.20.3](https://github.com/erxes/erxes/compare/0.20.1...0.20.3) (2020-11-12)

### Features

- **engage:** added rule in messenger engage ([b05022b](https://github.com/erxes/erxes/commit/b05022b2b8ae4b0ce0e7b66eaa0a60082736fc8b))
- **language:** updated spanish translation ([6e0a95e](https://github.com/erxes/erxes/commit/6e0a95e7259280d4592c0cb7fa5039150154e403)), closes [#2455](https://github.com/erxes/erxes/issues/2455)

## [0.20.3](https://github.com/erxes/erxes/compare/0.20.1...%s) (2020-11-12)

### Features

- **engage:** added rule in messenger engage ([b05022b](https://github.com/erxes/erxes/commit/b05022b2b8ae4b0ce0e7b66eaa0a60082736fc8b))
- **language:** updated spanish translation ([6e0a95e](https://github.com/erxes/erxes/commit/6e0a95e7259280d4592c0cb7fa5039150154e403)), closes [#2455](https://github.com/erxes/erxes/issues/2455)

## [0.20.2](https://github.com/erxes/erxes/compare/0.20.1...%s) (2020-11-12)

### Features

- **engage:** added rule in messenger engage ([b05022b](https://github.com/erxes/erxes/commit/b05022b2b8ae4b0ce0e7b66eaa0a60082736fc8b))
- **language:** updated spanish translation ([6e0a95e](https://github.com/erxes/erxes/commit/6e0a95e7259280d4592c0cb7fa5039150154e403)), closes [#2455](https://github.com/erxes/erxes/issues/2455)

## [0.20.1](https://github.com/erxes/erxes/compare/0.20.0...0.20.1) (2020-11-09)

## [0.20.1](https://github.com/erxes/erxes/compare/0.20.0...0.20.1) (2020-11-09)

## [0.20.1](https://github.com/erxes/erxes/compare/0.20.0...0.20.1) (2020-11-09)

## [0.20.1](https://github.com/erxes/erxes/compare/0.20.0...0.20.1) (2020-11-09)

## [0.20.3](https://github.com/erxes/erxes/compare/0.20.2...0.20.3) (2020-11-09)

## [0.20.2](https://github.com/erxes/erxes/compare/0.20.1...0.20.2) (2020-11-09)

## [0.20.1](https://github.com/erxes/erxes/compare/0.20.0...0.20.1) (2020-11-09)

# [0.20.0](https://github.com/erxes/erxes/compare/0.19.3...0.20.0) (2020-11-09)

### Bug Fixes

- **board:** fix confirmation message when archive list. close [#2424](https://github.com/erxes/erxes/issues/2424) ([9deb3a5](https://github.com/erxes/erxes/commit/9deb3a5f160e9cda3ee6e7a8396f0acd8417775c))
- **forms:** fixed edit form field bug ([379b14e](https://github.com/erxes/erxes/commit/379b14e902d0f168a570e22eb2d65dc3c606e180))
- **messenger:** fix not updating website addon ([a3b04b9](https://github.com/erxes/erxes/commit/a3b04b9b049b86ac8ee67fd22096ed267b98ee0b))

### Features

- **botpress:** integrated botpress in messenger ([e1317da](https://github.com/erxes/erxes/commit/e1317dacd6d733807aa6f2fa1888e69ecf6ac1a2))
- **cli:** added erxes cli ([199eea3](https://github.com/erxes/erxes/commit/199eea319c49224465ffcfa99c8e144e06fe7f2a))
- **customer,company:** auto completion ([28f74cc](https://github.com/erxes/erxes/commit/28f74ccc3e20f976601a0fea07218539baaccced)), closes [#2413](https://github.com/erxes/erxes/issues/2413)
- **customers:** added ability to change email, phone validation status ([3104b6e](https://github.com/erxes/erxes/commit/3104b6e843a9589633f17367b0c6e521cc200bdc))
- **settings:** Add AddOn step when creating or editing Messenger. close [#2383](https://github.com/erxes/erxes/issues/2383) ([e05918d](https://github.com/erxes/erxes/commit/e05918d7396183a0f432440e1235fae99d3adf85))

### Performance Improvements

- **main:** merge all repos ([87775fb](https://github.com/erxes/erxes/commit/87775fb1a003b0b8e8992dea552a4c2474758e0e))

# [0.20.0](https://github.com/erxes/erxes/compare/0.19.3...0.20.0) (2020-11-09)

### Bug Fixes

- **board:** fix confirmation message when archive list. close [#2424](https://github.com/erxes/erxes/issues/2424) ([9deb3a5](https://github.com/erxes/erxes/commit/9deb3a5f160e9cda3ee6e7a8396f0acd8417775c))
- **forms:** fixed edit form field bug ([379b14e](https://github.com/erxes/erxes/commit/379b14e902d0f168a570e22eb2d65dc3c606e180))
- **messenger:** fix not updating website addon ([a3b04b9](https://github.com/erxes/erxes/commit/a3b04b9b049b86ac8ee67fd22096ed267b98ee0b))

### Features

- **botpress:** integrated botpress in messenger ([e1317da](https://github.com/erxes/erxes/commit/e1317dacd6d733807aa6f2fa1888e69ecf6ac1a2))
- **cli:** added erxes cli ([199eea3](https://github.com/erxes/erxes/commit/199eea319c49224465ffcfa99c8e144e06fe7f2a))
- **customer,company:** auto completion ([28f74cc](https://github.com/erxes/erxes/commit/28f74ccc3e20f976601a0fea07218539baaccced)), closes [#2413](https://github.com/erxes/erxes/issues/2413)
- **customers:** added ability to change email, phone validation status ([3104b6e](https://github.com/erxes/erxes/commit/3104b6e843a9589633f17367b0c6e521cc200bdc))
- **settings:** Add AddOn step when creating or editing Messenger. close [#2383](https://github.com/erxes/erxes/issues/2383) ([e05918d](https://github.com/erxes/erxes/commit/e05918d7396183a0f432440e1235fae99d3adf85))

### Performance Improvements

- **main:** merge all repos ([87775fb](https://github.com/erxes/erxes/commit/87775fb1a003b0b8e8992dea552a4c2474758e0e))

## [0.19.3](https://github.com/erxes/erxes/compare/0.19.2...0.19.3) (2020-10-06)

### Bug Fixes

- **board:** fix overlapping description text and improve appearance. close [#2295](https://github.com/erxes/erxes/issues/2295) ([4e3c7cf](https://github.com/erxes/erxes/commit/4e3c7cfc662d199f8a7baff8f46601b783b34132))
- **board:** fix realtime changes when adding and deleting board piplenes and stages close [#2312](https://github.com/erxes/erxes/issues/2312) ([99346cb](https://github.com/erxes/erxes/commit/99346cb817e1051f1271c4c385bc970858f2a27f))
- **channel:** new created channel and brand does not show up in inbox filter close [#2311](https://github.com/erxes/erxes/issues/2311) ([13b5515](https://github.com/erxes/erxes/commit/13b5515cda1ef712d53e915175236a6722f20ead))
- **contacts:** fix reactive changes when delete, tag ([3352ef8](https://github.com/erxes/erxes/commit/3352ef86dad4f2c507190dacd5864a7d07802b71))
- **contacts:** fix reactive changes when delete, tag company, customer ([7cdea63](https://github.com/erxes/erxes/commit/7cdea63e785d0192fc776405a168fc70ef1623ef))
- **editor:** fix overlaping editor tools over inbox editor close [#2318](https://github.com/erxes/erxes/issues/2318) ([a6a30c5](https://github.com/erxes/erxes/commit/a6a30c5075038178e89bce65ca49b849dbca7a1c))
- **onboard:** fix appearing empty white box prompt close [#2261](https://github.com/erxes/erxes/issues/2261) ([734fad6](https://github.com/erxes/erxes/commit/734fad6669a8ec1889a14bd680c54d29f8b7a7ce))

### Features

- **board:** possible to change board from pipeline form ([0c9be7b](https://github.com/erxes/erxes/commit/0c9be7bdeaf2ba6a59c692a154d6213139e5aaf9))
- **conversation:** added resolve all button ([2e289bd](https://github.com/erxes/erxes/commit/2e289bd5acfcbc4cc4c811b8d29b30d33e353954))
- **editor:** added auto save ability ([16e0066](https://github.com/erxes/erxes/commit/16e006636ae8b7935158398ebfe50d4bd962b872))
- **email-deliveries:** adeed dashboard for email deliveries ([a79db45](https://github.com/erxes/erxes/commit/a79db45ea2873126df22493447215ff31151c640))
- **inbox:** added awaiting response filter ([22d5c75](https://github.com/erxes/erxes/commit/22d5c75a11c552a6ff4d1c2c3bf225df6f8aa646))
- **integration:** refactored gmail integration ([ddab6bb](https://github.com/erxes/erxes/commit/ddab6bb5db2c4e0f6110a2ae7bf7255250af0b80)), closes [#2291](https://github.com/erxes/erxes/issues/2291)
- **popups:** added submit once option ([97480da](https://github.com/erxes/erxes/commit/97480dad2b19c6b561b2cf5cad61832fa070c789)), closes [#2303](https://github.com/erxes/erxes/issues/2303)
- **teamInbox:** convert typed or pasted url text to clickable link. close [#2302](https://github.com/erxes/erxes/issues/2302) ([a57672f](https://github.com/erxes/erxes/commit/a57672f0ba69c7b26b0ae118556a1ce5740dacf4))
- **webhooks:** added incoming and outgoing webhooks ([398e35b](https://github.com/erxes/erxes/commit/398e35bbc1d6904b76cbcd35478674ec0c759d94))

### Performance Improvements

- **email:** add email template ([751fa5e](https://github.com/erxes/erxes/commit/751fa5e3ad3b85b4760c8a0536a5a1fbc2c4d387)), closes [#2287](https://github.com/erxes/erxes/issues/2287)
- **test:** added cypress tests ([97364ac](https://github.com/erxes/erxes/commit/97364ac3dc992b4f08fa30c69b8e6f2264556b74))

## [0.18.2](https://github.com/erxes/erxes/compare/0.18.1...0.18.2) (2020-09-07)

## [0.18.1](https://github.com/erxes/erxes/compare/0.18.0...0.18.1) (2020-09-04)

# [0.18.0](https://github.com/erxes/erxes/compare/0.17.6...0.18.0) (2020-09-04)

### Bug Fixes

- **avatar:** fixed avatar in inbox left sidebar ([e3e61cb](https://github.com/erxes/erxes/commit/e3e61cbc0d3c0114995f1fc47f646e70b629f98c))
- **system-status:** fixed system status ([7049489](https://github.com/erxes/erxes/commit/70494899ed04c793bb748b0cedb6baf7ee54c0f9))
- **teamInbox:** fix showing unverified phone status ([dbb06d1](https://github.com/erxes/erxes/commit/dbb06d13099a67ae88bb4242185fba72d54ef313))
- **widget:** fix not working reaction button ([957d862](https://github.com/erxes/erxes/commit/957d862c4bf3b4f91346fce6ddb724469f5760dc))
- **widget:** fix position of popup's close button ([0caebf6](https://github.com/erxes/erxes/commit/0caebf61f42ae19d100677ee415c92b5022ed642))

### Features

- **board:** add guide content when there is no board/pipeline ([5b1f2f5](https://github.com/erxes/erxes/commit/5b1f2f548f0728b7811a9b785485a806d3602219))
- **common:** add empty content to engage, messenger, scriptManager ([1661efa](https://github.com/erxes/erxes/commit/1661efa630884cacd3f2456622c5e655d7580b62))
- **common:** add some step content when empty ([ff27a8b](https://github.com/erxes/erxes/commit/ff27a8b547e34549f80dc9778d4584d3d693e902))
- **contacts:** add step content when empty ([ecc2e49](https://github.com/erxes/erxes/commit/ecc2e49fdd853e54081ca66ddc73421b733dd828))
- **deal/task/ticket:** add editor on note textarea ([ce60a75](https://github.com/erxes/erxes/commit/ce60a7534919d6cb731da5a88289cd9636075439))
- **deal/task/ticket:** made checklist items sortable ([116bf26](https://github.com/erxes/erxes/commit/116bf264200e02016d28ad677fabeea9b27a2a8c))
- **integration:** two way sms ([74435f1](https://github.com/erxes/erxes/commit/74435f189728af61b65753efddc1f8a3e062fe04))
- **knowledgeBase:** add step content when empty ([6380a3d](https://github.com/erxes/erxes/commit/6380a3decde8207d35c86910d64887bd8d6476c0))
- **language:** added turkish language ([67e22cc](https://github.com/erxes/erxes/commit/67e22cc96958a7305800f1f523ca9e8d004caae5))
- **popup:** add step content when empty ([0939533](https://github.com/erxes/erxes/commit/093953347ea8a99405e170a3209fc3252fe8be6d))
- **setup:** added initial admin user creation step ([276f5e9](https://github.com/erxes/erxes/commit/276f5e90b133fe4a4c0c60f75fb2c569411424a4))
- **tasks:** added timer ([f7d80a4](https://github.com/erxes/erxes/commit/f7d80a47444698a25a1d718314fc0e6fb43f8c2e))

### Performance Improvements

- **customer:** show actions in editform of task and deal ([852e707](https://github.com/erxes/erxes/commit/852e707c0443472ceca5825bfcc7f4c38f2618c7)), closes [close#2247](https://github.com/close/issues/2247)

## [0.17.6](https://github.com/erxes/erxes/compare/0.17.4...0.17.6) (2020-08-20)

## [0.17.4](https://github.com/erxes/erxes/compare/0.17.3...0.17.4) (2020-08-20)

### Bug Fixes

- **bug:** edit internal note ([579b0bc](https://github.com/erxes/erxes/commit/579b0bca36a9fb4ec24ec54a2e7a1c064a97621d)), closes [Close#2131](https://github.com/Close/issues/2131)
- **user:** fixed avatar image when local file upload ([352ea74](https://github.com/erxes/erxes/commit/352ea74df78b402c7b4520322ed62f995fd3549b))

## [0.17.3](https://github.com/erxes/erxes/compare/0.17.2...0.17.3) (2020-08-20)

### Bug Fixes

- **popup:** fix Popup alert message. close [#2219](https://github.com/erxes/erxes/issues/2219) ([09867a1](https://github.com/erxes/erxes/commit/09867a164784d5a066a6558a2e884599647a98ed))
- **teamInbox:** fix Chat preview shows the same for all conversations. close [#2228](https://github.com/erxes/erxes/issues/2228) ([349712d](https://github.com/erxes/erxes/commit/349712d5d20abdafd47ad2fb177913adefde2d2c))

### Features

- **popup:** Display install code after popup creation ([7045e54](https://github.com/erxes/erxes/commit/7045e546f59fdc70cf84dfb24df725798abbb8f9))
- **teamInbox:** Increase Visibility of Unread Messages ([fff9273](https://github.com/erxes/erxes/commit/fff92738aea18b5b486779c8ac868103140fe76c))

## [0.17.2](https://github.com/erxes/erxes/compare/0.17.1...0.17.2) (2020-08-20)

## [0.17.1](https://github.com/erxes/erxes/compare/0.17.0...0.17.1) (2020-08-20)

# [0.17.0](https://github.com/erxes/erxes/compare/0.16.0...0.17.0) (2020-08-17)

### Bug Fixes

- **auth:** remove iOS app download prompt. close [#2113](https://github.com/erxes/erxes/issues/2113) ([9ed9040](https://github.com/erxes/erxes/commit/9ed9040fef9b4bc0503bbfabd7253ee22d4ffa26))
- **board:** fix load more button works incorrectly ([dbfa5fe](https://github.com/erxes/erxes/commit/dbfa5fe05c2a7ba6cf0bdf907b8b940c5d99fbd3))
- **common:** fix import buttons looks messy ([11a2e0b](https://github.com/erxes/erxes/commit/11a2e0b6933b6997173c0940de6fbaf855a242b8))
- **common:** fix overlapping custom logo ([6c87057](https://github.com/erxes/erxes/commit/6c870576b0a484b27560cd24bc14840af38e9fac))
- **common:** fix typo, refactor code, fix some responsive issue ([c366c8f](https://github.com/erxes/erxes/commit/c366c8fde95c66722eff3af0942a8f73c06226d2))
- **emailAppearance:** fix not allow modification. close [#2195](https://github.com/erxes/erxes/issues/2195) ([1a6736e](https://github.com/erxes/erxes/commit/1a6736ef9f8213e66ca8c8f627188064641b137c))
- **integration:** fix modal open key ([a929662](https://github.com/erxes/erxes/commit/a929662e278c670bed619b59556464fc1a87bcd8))
- **popup:** fix not working install code ([f4be791](https://github.com/erxes/erxes/commit/f4be79131281428f3fb45b4540c4091a946a7711))
- **widget:** can widget icon color ([48723a7](https://github.com/erxes/erxes/commit/48723a7e365b23d9002d87e45ef1e1205f38e4f9))
- **widget:** fix appearing scroll next to attachment button in firefox ([92daf99](https://github.com/erxes/erxes/commit/92daf99a5bd9eb60cff11631eb6e98da18f51ff8))

### Features

- **chatWidget:** can change text color of chat from messenger integration form ([75e87fa](https://github.com/erxes/erxes/commit/75e87faf50d5c3b123a2c012105ea7071bc343e6))
- **common:** can validate username close [#1901](https://github.com/erxes/erxes/issues/1901) ([21bcb0f](https://github.com/erxes/erxes/commit/21bcb0fec7f3b3bf66a0fe2b83a398ce3e597bb0))
- **common:** fix common navigation, board navigation elements in smaller screens. fix [#2105](https://github.com/erxes/erxes/issues/2105) ([d7040ce](https://github.com/erxes/erxes/commit/d7040ce38b77f9e2635f6cb8014c04b5733d8e84))
- **inbox:** product board ([6fd75db](https://github.com/erxes/erxes/commit/6fd75dba4b68567a6c9d87fcf38fbbc405340d83)), closes [#2172](https://github.com/erxes/erxes/issues/2172)
- **inbox:** show some action buttons when inbox has no content ([b883806](https://github.com/erxes/erxes/commit/b883806253b9e5e588aa84caf02db2bd000f494b))
- **integration:** add channel selection to all integration form, refactor code, remove duplicate, add autofocus to first input, add cancel button to popup ([e62c636](https://github.com/erxes/erxes/commit/e62c636cf463258b2a9421ee06412cc0a4ae3554))
- **integration:** can go to integration create pages from inbox page ([45f6a2a](https://github.com/erxes/erxes/commit/45f6a2aa2352f28d840fdf020cff998963e38e62))
- **onboard:** can change selected onboarding features ([2ae907c](https://github.com/erxes/erxes/commit/2ae907c8ae4f7b2f8491d1e0a6cab915ec11b257))
- **security:** add click-jack defense ([9eeca16](https://github.com/erxes/erxes/commit/9eeca166e92ed92ac343c4f0ec8ef2ad31ee3452)), closes [#2199](https://github.com/erxes/erxes/issues/2199)
- **widget:** show server time & online status ([a4636d1](https://github.com/erxes/erxes/commit/a4636d13c2fab024895548520cac3207e67c8e0b)), closes [#2191](https://github.com/erxes/erxes/issues/2191)

### Performance Improvements

- **dependencies:** made rabbitmq, redis optional ([885f871](https://github.com/erxes/erxes/commit/885f87197ff18632d39f2b9ab71d76ad05da7fab))

# [0.16.0](https://github.com/erxes/erxes/compare/0.15.5...0.16.0) (2020-07-28)

### Bug Fixes

- **activityLog:** fix activity log in inbox sidebar ([bcc768d](https://github.com/erxes/erxes/commit/bcc768d8715d92c452ce8ded223f44af27c73de7))
- **activityLog:** fix activity log in inbox sidebar (close [#2120](https://github.com/erxes/erxes/issues/2120)) ([48f153b](https://github.com/erxes/erxes/commit/48f153b097af987dfcab2847131ab30ba590eb2c))
- **deal:** price input for "Create New Product" is not allowing non-whole numbers. ([d76c52d](https://github.com/erxes/erxes/commit/d76c52d10031dac419069eacf2e3198a8d0afeeb)), closes [#2134](https://github.com/erxes/erxes/issues/2134)
- **integration:** fix broken account text ([f9334c5](https://github.com/erxes/erxes/commit/f9334c56efd7a11016ad8e63752d742052f49924))
- **knowledgebase:** fix can not insert hex-code ([8cf7817](https://github.com/erxes/erxes/commit/8cf781713f7fd3feccf465aeb22f9df046fc05ff))
- **task:** can't assign a team member to a task from the contact profile ([0f4f778](https://github.com/erxes/erxes/commit/0f4f7780e58cbc9db16d3b2d4102601505947883)), closes [#2155](https://github.com/erxes/erxes/issues/2155)

### Features

- **uploader:** added option to upload files locally ([9bf5855](https://github.com/erxes/erxes/commit/9bf5855a76e8567da920d7de17c61ec9d22237bc)), closes [#2122](https://github.com/erxes/erxes/issues/2122)

## [0.15.5](https://github.com/erxes/erxes/compare/0.15.4...0.15.5) (2020-07-15)

## [0.15.4](https://github.com/erxes/erxes/compare/0.15.3...0.15.4) (2020-07-08)

## [0.15.3](https://github.com/erxes/erxes/compare/0.15.2...0.15.3) (2020-07-08)

## [0.15.2](https://github.com/erxes/erxes/compare/0.15.1...0.15.2) (2020-07-07)

### Features

- **language:** add dutch language ([ba0e88f](https://github.com/erxes/erxes/commit/ba0e88f6de7d1659808f2bdd475eb0c2e991b980)), closes [#2088](https://github.com/erxes/erxes/issues/2088)

## [0.15.1](https://github.com/erxes/erxes/compare/0.15.0...0.15.1) (2020-07-07)

### Features

- **constants:** ability to configure constant choices ([b27024d](https://github.com/erxes/erxes/commit/b27024db062fa3f34bc5ccc6b1a751b9d8c663c9)), closes [#2096](https://github.com/erxes/erxes/issues/2096)

# [0.15.0](https://github.com/erxes/erxes/compare/0.14.2...0.15.0) (2020-07-07)

### Performance Improvements

- **ci:** upload compiled version to github release assets ([07019a1](https://github.com/erxes/erxes/commit/07019a1bf1202ed6edfe37abde15bb2bb8745394))

## [0.14.2](https://github.com/erxes/erxes/compare/0.14.1...0.14.2) (2020-07-06)

### Bug Fixes

- **activity-log:** activity log tab in inbox right sidebar ([b7600bf](https://github.com/erxes/erxes/commit/b7600bf62775c9c10b71974f7fa147fc8127e578)), closes [#2068](https://github.com/erxes/erxes/issues/2068)
- **common:** fix color picker bug, change some text ([a4fd856](https://github.com/erxes/erxes/commit/a4fd856ad0a4cd6c35fd42105a32654d2141ef3c))
- **contacts:** customize columns in customer, company list is saving orders correctly ([48de2c3](https://github.com/erxes/erxes/commit/48de2c34cca38c42d5eda5deaae52df1d33f485f)), closes [#2028](https://github.com/erxes/erxes/issues/2028)
- **customer:** fix not working email in activity log ([56a4866](https://github.com/erxes/erxes/commit/56a4866295ce97389af98ba6af217d2e7ebb7798))
- **deal/ticket/task:** first stage has recursive refresh on pipeline, click notification but couldn't open deal item ([9855f26](https://github.com/erxes/erxes/commit/9855f26236371e47fb4e684ec68a86ad96ba10be)), closes [#2062](https://github.com/erxes/erxes/issues/2062) [#2061](https://github.com/erxes/erxes/issues/2061) [#2060](https://github.com/erxes/erxes/issues/2060) [#2059](https://github.com/erxes/erxes/issues/2059)
- **deal/ticket/task/growthHack:** Showing all pipelines when there is no board ([6642b53](https://github.com/erxes/erxes/commit/6642b5344723f8c7c285cae5cc02735f9f459709)), closes [#2023](https://github.com/erxes/erxes/issues/2023)
- **docs:** fix some text, spacing ([53276cb](https://github.com/erxes/erxes/commit/53276cbd159514c824135b8f51071324ebefe4da))
- **engages:** save & draft button is not working ([d00a97a](https://github.com/erxes/erxes/commit/d00a97ac3cd8c690932ba58de032cd853254e59e)), closes [#2038](https://github.com/erxes/erxes/issues/2038)
- **growthhack:** show stage name in growth name funnel ([95a9aa8](https://github.com/erxes/erxes/commit/95a9aa81566d4d0246f8be7b1ca0f737c9c9ed04)), closes [#2042](https://github.com/erxes/erxes/issues/2042)
- **inbox:** fix properties visibility, add urlVisits on inbox sidebar ([106eba3](https://github.com/erxes/erxes/commit/106eba3ae2e949b90fd28e0b298f7102c88f57ad))
- **locale:** use day.js instead of moment and show correct locale ([5868c77](https://github.com/erxes/erxes/commit/5868c7758a123af0854e8c2f504b46c5d79971a1)), closes [#1854](https://github.com/erxes/erxes/issues/1854)
- **permission:** fix dropdown height ([ee8bb7d](https://github.com/erxes/erxes/commit/ee8bb7dbb9446dd9c432b0bd7c7ed4b226298901))
- **settings:** fix dropdown content being cut off ([c0b8767](https://github.com/erxes/erxes/commit/c0b87678f91444c16bff44d6650cd988bd6452c3))
- **users:** confirmation link is not working for logged in users ([6cb66fe](https://github.com/erxes/erxes/commit/6cb66fe7af78c6b5b0e3929bc0b4788ddde66bde)), closes [#2069](https://github.com/erxes/erxes/issues/2069)
- **widgets:** creating multiple messenger iframes on static sites ([1b06f89](https://github.com/erxes/erxes/commit/1b06f8918faaa5525eaeaf28ddfd1a385c4911c4)), closes [#2080](https://github.com/erxes/erxes/issues/2080)

### Features

- **bulk-validation:** bulk email, phone validation ([d0b7112](https://github.com/erxes/erxes/commit/d0b7112c4b1c3626d92e731296da21e29268d538)), closes [#2077](https://github.com/erxes/erxes/issues/2077)
- **dashboard:** add dashboard feature ([3080ef4](https://github.com/erxes/erxes/commit/3080ef4003b84fc86b4e155fbbce6d2ef2d58fa5)), closes [#2006](https://github.com/erxes/erxes/issues/2006)
- **widget:** can minimize and expand daylyco video call ([fbb0757](https://github.com/erxes/erxes/commit/fbb07573d8e20776a6e38b61e28cd72f9e13476e))

### Performance Improvements

- **confirm:** ask to delete and update confirm in pipeline board stage ([09984ee](https://github.com/erxes/erxes/commit/09984ee43df9e726458ddbf671e9f5df0adedeea)), closes [#2005](https://github.com/erxes/erxes/issues/2005)

## [0.14.1](https://github.com/erxes/erxes/compare/0.14.0...%s) (2020-05-19)

### Bug Fixes

- **customer:** fix can not insert hyperlink in email form ([5ef5582](https://github.com/erxes/erxes/commit/5ef558292480c6a5b805e65e2e8e0c8d23b2acda))
- Not working search deal, task, ticket on Customer sidebar ([#1980](https://github.com/erxes/erxes/issues/1980)) ([a586790](https://github.com/erxes/erxes/commit/a586790f9af9c770c149f5af5968a34f9230d605))
- **customers:** not displaying trackedData, customFields data in customer list ([0fbd6b0](https://github.com/erxes/erxes/commit/0fbd6b065c4c7631752197ef6cd7dd0185c9b286)), closes [#1999](https://github.com/erxes/erxes/issues/1999)
- **emailTemplate:** fix conflict and revert change ([4445434](https://github.com/erxes/erxes/commit/4445434f8367c49830f6644347d183dbb57ad648))
- **engae:** fix not showing all email templates, improve select ui (close [#1962](https://github.com/erxes/erxes/issues/1962)) ([7aced58](https://github.com/erxes/erxes/commit/7aced583bf5603be74097e21cc59eeda9fd39f04))
- **tutorial:** complete and fix video tutorial ([6b61bf9](https://github.com/erxes/erxes/commit/6b61bf9ecb8f94258c97d96ef11b1eec241f6187))
- **widgets:** not displaying multiple website apps ([1992f27](https://github.com/erxes/erxes/commit/1992f27c0e21b0bef1822c50bcc01326bafaac4a)), closes [#1996](https://github.com/erxes/erxes/issues/1996)

### Performance Improvements

- **node:** update node-sass and package.json ([341a9b3](https://github.com/erxes/erxes/commit/341a9b3453f147569e4969817678e4817b11b37b)), closes [#1993](https://github.com/erxes/erxes/issues/1993)
- **segment:** add select options to segment condition ([95a7932](https://github.com/erxes/erxes/commit/95a793218fc12357bec36bd497ddcb49482c39d2)), closes [#1960](https://github.com/erxes/erxes/issues/1960)

# [0.14.0](https://github.com/erxes/erxes/compare/0.13.0...%s) (2020-04-25)

### Bug Fixes

- add userId in uploadHandler ([d0a6813](https://github.com/erxes/erxes/commit/d0a681303f091fb3893c75e2fe007e73b9156ecb))
- edit in troubleshooting doc ([1347b9b](https://github.com/erxes/erxes/commit/1347b9b45411503c84e9e16f046dbf39d7377858))
- mail optimistic response ([a4552a4](https://github.com/erxes/erxes/commit/a4552a4e8339a1cda1a5145ccda07ea9f86edc16))
- on open reload search with values ([b278c83](https://github.com/erxes/erxes/commit/b278c83a491cba65c804d4acb4dec0fd35bbd9c1))
- **contacts:** add default value to integrations in LeadFilter ([045b453](https://github.com/erxes/erxes/commit/045b45311bae56f746bfc4c151576fd05d61ef7a)), closes [#1945](https://github.com/erxes/erxes/issues/1945)
- refetch list in lead ([8b60c9e](https://github.com/erxes/erxes/commit/8b60c9eb9b9854d2a513b9c9c25af94e8b5d18fd))
- show clear filter button only for search filters ([d725c2b](https://github.com/erxes/erxes/commit/d725c2bbc33495d3d69bf5eb4c76fafcfe8fcbdd))
- **engage:** typo link in engage config ([5e22544](https://github.com/erxes/erxes/commit/5e22544159bdad17b40ff8b3ff5c380ecc4d5b48)), closes [#1938](https://github.com/erxes/erxes/issues/1938)
- **segments:** wrong preview count for the segment with parent segment ([1ca4272](https://github.com/erxes/erxes/commit/1ca427280f2deda938666185ee610c7cbeefb91a)), closes [#1906](https://github.com/erxes/erxes/issues/1906)
- typo in general settings google ([043972b](https://github.com/erxes/erxes/commit/043972b38ab7ebfd74a4768bbab3b6fbb1f1da0d))
- update engage list after create and edit ([7a45f5b](https://github.com/erxes/erxes/commit/7a45f5be8abcbdfd68eda323531b7c2b90552d78))

### Features

- nylas exchange provider ([538caf7](https://github.com/erxes/erxes/commit/538caf7b4359e462bf892c80c91d1f78a27330a1))
- **activity log:** show archive history on activity log (deal,ticket,task,growthHack) ([5dff5d4](https://github.com/erxes/erxes/commit/5dff5d49966eaf58df2fb15aea93021f3efd11de)), closes [#1952](https://github.com/erxes/erxes/issues/1952)
- **integration:** integrated Viber, Telegram, Line, Twilio Sms using Sunshine Conversation API ([bdf5e0f](https://github.com/erxes/erxes/commit/bdf5e0f9fb3d3913f1321b3bc733928f598096e0)), closes [#1851](https://github.com/erxes/erxes/issues/1851)
- **integration:** integration whatsapp ([cca738e](https://github.com/erxes/erxes/commit/cca738eda90e50c0b83d66f56949321bacb2663b)), closes [#1105](https://github.com/erxes/erxes/issues/1105)
- **segments:** new rules ([ba2a9a7](https://github.com/erxes/erxes/commit/ba2a9a7d4656d71a42d3cb344051767779a8b7e1)), closes [#1915](https://github.com/erxes/erxes/issues/1915)

### Performance Improvements

- **appstore:** fix confirmation message when delete, archive ([0cd9f51](https://github.com/erxes/erxes/commit/0cd9f5139d97b74a56b96faf1a980268ff81402c))
- **appStore:** fix typo (close [#1845](https://github.com/erxes/erxes/issues/1845)) ([2f48751](https://github.com/erxes/erxes/commit/2f4875195d92708f1ae1ab499f45ae0a2659b471))
- **common:** improve uploader component ([3b5ef8e](https://github.com/erxes/erxes/commit/3b5ef8eb95aa0cd431a8d8677501c7f6d74987b8))
- **common:** remove lead status filter from customer, update icons ([1d8cf84](https://github.com/erxes/erxes/commit/1d8cf8475457ee530f604f099bce9a0bf0c18f07))
- **common:** update icon package, change some new icons, show attachment file type as icon. (close [#1848](https://github.com/erxes/erxes/issues/1848) [#1843](https://github.com/erxes/erxes/issues/1843)) ([97e390f](https://github.com/erxes/erxes/commit/97e390f6704e6bee640e677f4f48dc2488e6b50f))
- **customers:** added lead logic ([e4046dc](https://github.com/erxes/erxes/commit/e4046dc57c19137d8dfcbebe83b153fa84d7c0dd)), closes [#1850](https://github.com/erxes/erxes/issues/1850)
- **deal:** improve performance when deal item dragging ([72a6617](https://github.com/erxes/erxes/commit/72a66173e68d0e48db0a4ef9f81052da8ba2f109))
- **firebase:** add google credential field ([b283626](https://github.com/erxes/erxes/commit/b28362667e1e1f27adb8ec54be3f868e0d7b8453)), closes [#1907](https://github.com/erxes/erxes/issues/1907)
- **growthhack:** fix arviched growth hack list ([#1842](https://github.com/erxes/erxes/issues/1842)) ([523bb0d](https://github.com/erxes/erxes/commit/523bb0d017cacedca8a1ae721f933c6b85333aaf))
- **knowledgebase:** fix can not write rgb color or hex ([fcdc096](https://github.com/erxes/erxes/commit/fcdc0968931183b800a0d647d0ebe8a68901f1b9))
- **segments:** added lead, visitor content types ([7ce200c](https://github.com/erxes/erxes/commit/7ce200c10eb5c9d5d9a6e874f39fbf275b9d1e36)), closes [#1920](https://github.com/erxes/erxes/issues/1920)
- **settings:** email appearance menu has been removed because it is unused ([8eec36d](https://github.com/erxes/erxes/commit/8eec36dfa6d2856c918b32e1481c0d76f1b78d04))
- **teaminbox:** add file preview on file from popup ([d6b8c30](https://github.com/erxes/erxes/commit/d6b8c3002135203e36357cc49b056077631ffc48))
- **teaminbox:** can download or view a file from popups ([cea4312](https://github.com/erxes/erxes/commit/cea4312d43f3f15998a1f366e09ca42cc70a1134))
- **teaminbox:** convert text to link (close [#1820](https://github.com/erxes/erxes/issues/1820)) ([06b4180](https://github.com/erxes/erxes/commit/06b418042221f19ffe859af8debad87111e3197d))
- **teaminbox:** implemented escape to dismiss response templates ([e2f892f](https://github.com/erxes/erxes/commit/e2f892fcff0e5f7e1f61599a954d61483709653c))
- **widget:** add allow attribute on video call iframe ([3d148ac](https://github.com/erxes/erxes/commit/3d148ac3a27eef8505a86ac88ae7f0883ba1b42b))
- **widget:** ask to allow access when video chat starts in widget. close [#1858](https://github.com/erxes/erxes/issues/1858) ([4a964d6](https://github.com/erxes/erxes/commit/4a964d687755d7985548da94ab3cc2551e3989ab))
- **widget:** fix full message bug when send engage message (close [#1944](https://github.com/erxes/erxes/issues/1944)) ([8b25b08](https://github.com/erxes/erxes/commit/8b25b084313dc8eb599ff0bea4104d90e1120a8e))
- **widget:** fix widget search bar (close [#1862](https://github.com/erxes/erxes/issues/1862)) ([7e3aeb9](https://github.com/erxes/erxes/commit/7e3aeb9c99356c85a37c4262bc20aa7313116024))

# [0.13.0](https://github.com/erxes/erxes/compare/0.12.1...0.13.0) (2020-03-17)

### Bug Fixes

- **deal/task/ticket/growthHack:** not copying labels ([7f99cf9](https://github.com/erxes/erxes/commit/7f99cf948df86a38b0754aba456a8b5c9e5b1e4d)), closes [#1598](https://github.com/erxes/erxes/issues/1598)
- **docker:** fix dockerfile permission error ([68ef0b3](https://github.com/erxes/erxes/commit/68ef0b387e61b174f5e408c4d16ce7fdb2b53e52))
- **drone:** workaround for wrong version information showing on version.json ([ea0aa9f](https://github.com/erxes/erxes/commit/ea0aa9f3ca3794c4081b56916b8a1c9ba0d71679))
- **form:** checkbox error ([4b64aa5](https://github.com/erxes/erxes/commit/4b64aa573fdb2464fd309582b09631ec4720610f)), closes [#157](https://github.com/erxes/erxes/issues/157)
- **form:** multiple submit bug ([e04e206](https://github.com/erxes/erxes/commit/e04e2063a45abfcfa12206f6d5816c4b15aa30fd)), closes [#160](https://github.com/erxes/erxes/issues/160)
- little fix in nylas doc ([e9dd5bd](https://github.com/erxes/erxes/commit/e9dd5bd46a2c6aa82bec8c438bf5d64c76945d89))
- **typo:** url to push-notifications in overview ([#1719](https://github.com/erxes/erxes/issues/1719)) ([48f4a45](https://github.com/erxes/erxes/commit/48f4a451c6871749928827b3eb2c26a52a31fb40))
- **upload:** forbidden error ([2c84ad5](https://github.com/erxes/erxes/commit/2c84ad5d889a47f2a8e801069791a6f260e9dec4)), closes [#156](https://github.com/erxes/erxes/issues/156)
- merge with master and fix conflict ([01eb251](https://github.com/erxes/erxes/commit/01eb25150e0aa5330922e1b0d051a8d3f6a14fba))
- reset submit state after fail mutation ([aa62e8a](https://github.com/erxes/erxes/commit/aa62e8a69e4511560146861a409a9804731a5f73))
- send missing argument in onSubmitResolve ([0bc5201](https://github.com/erxes/erxes/commit/0bc52017e6e4e7b1a60ec49f87624005e78648ab))
- **widget:** fix popup can not cancelling (close [#1672](https://github.com/erxes/erxes/issues/1672)) ([b9fefdf](https://github.com/erxes/erxes/commit/b9fefdf41e2a47bcba0bf160a9d0f10756a433e3))

### Features

- **customers:** added birthdate & gender ([f5af3e7](https://github.com/erxes/erxes/commit/f5af3e7011c31a1ee614e1c41a83d8562973fdd5)), closes [#1641](https://github.com/erxes/erxes/issues/1641)
- **deal/task/ticket:** add load more on archived list ([75a0d50](https://github.com/erxes/erxes/commit/75a0d50c286562fda824ef90f2ac31afd3e30061)), closes [#1739](https://github.com/erxes/erxes/issues/1739)
- **deal/task/ticket:** assignee, checklist activity log ([b7fad20](https://github.com/erxes/erxes/commit/b7fad2020baf8767c93efb349dbcbd16eff8e8be)), closes [#1594](https://github.com/erxes/erxes/issues/1594)
- **env:** store env variables to database ([a4fa05f](https://github.com/erxes/erxes/commit/a4fa05f96f247b42d1ea37e25693b52d6ab56c52)), closes [#1700](https://github.com/erxes/erxes/issues/1700)
- **form:** ability call submit action from parent website ([dbb252c](https://github.com/erxes/erxes/commit/dbb252cf65f75eb8c0a20f2b45a1f023ee51efbe)), closes [#158](https://github.com/erxes/erxes/issues/158)
- **form:** ability to change css from parent ([d833901](https://github.com/erxes/erxes/commit/d8339011af1b039c5d2bab531b680f6f224e4313)), closes [#159](https://github.com/erxes/erxes/issues/159)
- **growthhack:** change UI of growthhack page entirely (close [#1634](https://github.com/erxes/erxes/issues/1634)) ([78ca651](https://github.com/erxes/erxes/commit/78ca651c3f2eb4b721b9c059e4fe35f4e4e27215))
- **heroku:** added heroku deployment ([b313681](https://github.com/erxes/erxes/commit/b313681bfdf07660875d3fe432a39afbc682ecb1)), closes [#848](https://github.com/erxes/erxes/issues/848)
- **installation:** quick install on debian 10 ([5568719](https://github.com/erxes/erxes/commit/55687192fbbccf7409a47637f0ad0f19d886879d)), closes [#1649](https://github.com/erxes/erxes/issues/1649)
- **knowledgebase:** ability run without iframe ([1652c28](https://github.com/erxes/erxes/commit/1652c280ba6e1f6729c1d14526c34590d0de6bfc)), closes [#126](https://github.com/erxes/erxes/issues/126)
- **knowledgebase:** add article reactions ([27d3f21](https://github.com/erxes/erxes/commit/27d3f21315728517add2f51362a6207528856d04)), closes [#128](https://github.com/erxes/erxes/issues/128)
- **language:** add italian language ([0b1a38e](https://github.com/erxes/erxes/commit/0b1a38e63dc1d11b580964ddd289aa45c4eb7cfb))
- **messenger:** ability to hide launcher from admin ([3d72041](https://github.com/erxes/erxes/commit/3d7204149b0393e72e05546ff8d6baf7f6104e4d)), closes [#123](https://github.com/erxes/erxes/issues/123)
- nylas-gmail doc ([78aa297](https://github.com/erxes/erxes/commit/78aa29784d1cb825e5e9c88ebeafe5dd8ffd6983))
- **messenger:** added showErxesMessenger trigger ([80469cc](https://github.com/erxes/erxes/commit/80469cc80f5ab1ca0840e516979d44751bbe60de)), closes [#148](https://github.com/erxes/erxes/issues/148)
- **segments:** reimplemented using elk ([016aa66](https://github.com/erxes/erxes/commit/016aa667e1f9f476130838e3e61d63ac9f72fd59)), closes [#1686](https://github.com/erxes/erxes/issues/1686)
- **settings:** add engage environment variables ([5f3a595](https://github.com/erxes/erxes/commit/5f3a5956f1a908601632339c25af8d689c53d7ee)), closes [#1724](https://github.com/erxes/erxes/issues/1724)
- **settings:** improve UI of channel, brands page (close [#1597](https://github.com/erxes/erxes/issues/1597)) ([0a76eb7](https://github.com/erxes/erxes/commit/0a76eb7e5f000032b3980bdfd17a3b8f5edc8698))
- **translation:** add indonesia lang ([2a893c8](https://github.com/erxes/erxes/commit/2a893c868383942655a52a46690270d6a11a3d9b))
- **videoCall:** add video call ([3397802](https://github.com/erxes/erxes/commit/3397802ea46e7ccfb6625e9ad5ac1f2c10bcfc84))

### Performance Improvements

- **board:** change UI of board pipeline, campaign & projects (close [#1612](https://github.com/erxes/erxes/issues/1612)) ([316fad8](https://github.com/erxes/erxes/commit/316fad80a2fff4e2ca3b6ff118df5f473d518f85))
- **common:** choosing the same file doesn't trigger onChange (close [#1571](https://github.com/erxes/erxes/issues/1571)) ([9848226](https://github.com/erxes/erxes/commit/9848226131ba61c716f66cc106e186cb389f443a))
- **common:** show confirmation when clear team members (close [#1677](https://github.com/erxes/erxes/issues/1677)) ([c5d0fe7](https://github.com/erxes/erxes/commit/c5d0fe7083e5fdb3fef335e5f8e48ecd47bb466d))
- **contacts:** fix page menu or breadcrumb not positioned properly when import contacts (close [#1741](https://github.com/erxes/erxes/issues/1741)) ([93a34e8](https://github.com/erxes/erxes/commit/93a34e8ea4b16aa0ceb7f8f4d5adeff2ac914e5a))
- **contacts:** show gender, birthday in customerDetails (close [#1670](https://github.com/erxes/erxes/issues/1670)) ([61c6532](https://github.com/erxes/erxes/commit/61c6532d2875a7b7074b687a3f7550bfd21705a3))
- **customer:** add new customer and not email visitorContactInfo to open email input field (close [#1573](https://github.com/erxes/erxes/issues/1573)) ([ed89d77](https://github.com/erxes/erxes/commit/ed89d778f9fd5d375d2cd8225f86cf35649d3e14))
- **customer:** change user indicator (close [#1689](https://github.com/erxes/erxes/issues/1689)) ([9c10b86](https://github.com/erxes/erxes/commit/9c10b86c154e4c8f5a06c52ac63c070b30dd575e))
- **customer:** export pop-ups data for customer list when filtering by pop ups ([a62308b](https://github.com/erxes/erxes/commit/a62308b27d104ecc6638b507a2276faecad79fc0)), closes [#1674](https://github.com/erxes/erxes/issues/1674)
- **deal:** improve UI of deal products (close [#1629](https://github.com/erxes/erxes/issues/1629)) ([8da4cb3](https://github.com/erxes/erxes/commit/8da4cb32199eb8a9ef48b96fa763706f277830e8))
- **editor:** show default avatar when user has an invalid avatar (close [#1619](https://github.com/erxes/erxes/issues/1619)) ([a6f2963](https://github.com/erxes/erxes/commit/a6f2963286b944e0b7e6d19d7a6d53c5d27fd848))
- **inbox:** add inbox assign loader (close [#1754](https://github.com/erxes/erxes/issues/1754)) ([1e4c4b8](https://github.com/erxes/erxes/commit/1e4c4b829972a7469c1b605e223569562d97f3c2))
- **integration:** improve integration view in App store ([2f7a16e](https://github.com/erxes/erxes/commit/2f7a16e780baf3af8e0664e43795d4b363517bb7)), closes [#1583](https://github.com/erxes/erxes/issues/1583)
- **knowledgebase:** change UI of knowledge base (close [#1611](https://github.com/erxes/erxes/issues/1611)) ([43497e3](https://github.com/erxes/erxes/commit/43497e3ff62bafd7c7559dacba0f5b6fb0b4c8b7))
- **logs:** enhancement logs ([af6b1fe](https://github.com/erxes/erxes/commit/af6b1fe709025c9c92042b412f7d3fed685c147e)), closes [#1576](https://github.com/erxes/erxes/issues/1576)
- **notification:** add recent, unread tab on notification popup (close [#1560](https://github.com/erxes/erxes/issues/1560)) ([7895e09](https://github.com/erxes/erxes/commit/7895e09e8f4b20f1940c20168af23d4826b5d5c0))
- **onboard:** add video to onboarding robot (close [#1693](https://github.com/erxes/erxes/issues/1693)) ([e9d7dce](https://github.com/erxes/erxes/commit/e9d7dceba5c071141ec11d4d1bc902d9069d2e3e))
- **onboard:** fix onboard youtube url ([26e1a9b](https://github.com/erxes/erxes/commit/26e1a9b47389c7761711d1b1860cf3b83a27cf62))
- **permission:** improve ui of permission, logs page ([c22239a](https://github.com/erxes/erxes/commit/c22239a8d0bc16b4dde0ab817310f7ce0ed58c70))
- **product:** change UI of product and services (close [#1613](https://github.com/erxes/erxes/issues/1613)) ([929c56d](https://github.com/erxes/erxes/commit/929c56d15d5c2e0080649cb838497f2b6b778b11))
- **product:** first registered values of UOM and the currency selected automatically in the deal (close [#1627](https://github.com/erxes/erxes/issues/1627)) ([645e5c5](https://github.com/erxes/erxes/commit/645e5c5d31e8cefd778cebbdf396f0809f31c1dc))
- **product:** fix currency and uom dropdown (close [#1703](https://github.com/erxes/erxes/issues/1703)) ([dbc5c66](https://github.com/erxes/erxes/commit/dbc5c661614497b080c6b8e6d4cad9cc8499b6f7))
- **product:** fix style of manage product service (close [#1680](https://github.com/erxes/erxes/issues/1680)) ([b1b7027](https://github.com/erxes/erxes/commit/b1b7027efcb58dccb80c485bb88b10174781bae1))
- **product:** make it easy to navigate from the Deal edit window to the product service selection window (close [#1675](https://github.com/erxes/erxes/issues/1675)) ([79cbbbe](https://github.com/erxes/erxes/commit/79cbbbef28cf4016c740bd51db6e324d0588844f))
- **properties:** improve ui of properties page ([b27f9e3](https://github.com/erxes/erxes/commit/b27f9e3e527fe3e6c9bcf5edf64b4b6f36572084))
- **settings:** change google button (close [#1694](https://github.com/erxes/erxes/issues/1694)) ([9b428da](https://github.com/erxes/erxes/commit/9b428da31420a427991717b63de86860150cd554))
- **settings:** display no channel, brand even though there are few (close [#1621](https://github.com/erxes/erxes/issues/1621)) ([99a4cd8](https://github.com/erxes/erxes/commit/99a4cd875a90cca8649221a03c54f8efe411d140))
- **settings:** fix integration search in app store (close [#1673](https://github.com/erxes/erxes/issues/1673)) ([9ea09ef](https://github.com/erxes/erxes/commit/9ea09efc896dc35215d9f53cfd56d618ce041d29))
- **tags:** improve ui of tags ([b70ab3f](https://github.com/erxes/erxes/commit/b70ab3f9627007debb00e2f21d3c5648843e686c))
- **teaminbox:** fix overlapping image in editor (close [#1667](https://github.com/erxes/erxes/issues/1667)) ([2e95430](https://github.com/erxes/erxes/commit/2e95430f45cbca6466b9db80122b471ee7f08235))
- **teaminbox:** fix response template not sent when press enter (close [#1642](https://github.com/erxes/erxes/issues/1642)) ([f2f18a4](https://github.com/erxes/erxes/commit/f2f18a410eea4df295ccb1e5a7e0ff2ee63a526e))
- **teaminbox:** overlapping big image in message item (close [#1668](https://github.com/erxes/erxes/issues/1668)) ([ee10d9e](https://github.com/erxes/erxes/commit/ee10d9ef7f7c3921454720f3a33426421bf7c43f))
- **translation:** loading all locales ([20bb930](https://github.com/erxes/erxes/commit/20bb930ef82e144cac8025b26d0c2848ee580656)), closes [#130](https://github.com/erxes/erxes/issues/130)

### BREAKING CHANGES

- **translation:** renamed some language codes (np -> hi, jp -> ja, kr -> ko, ptBr -> pt-br, vn -> vi, zh -> zh-cn)

## [0.12.1](https://github.com/erxes/erxes/compare/0.12.0...0.12.1) (2020-03-09)

### Bug Fixes

- **integrations:** invalid check in conversations gmail kind ([0e8cacd](https://github.com/erxes/erxes/commit/0e8cacd))

# [0.12.0](https://github.com/erxes/erxes/compare/0.11.2...0.12.0) (2020-01-08)

### Bug Fixes

- able to add cc bcc in reply ([#1528](https://github.com/erxes/erxes/issues/1528)) ([8af13a0](https://github.com/erxes/erxes/commit/8af13a0))

### Features

- **checklist:** add possibility to convert checklist item to card and remove close [#1562](https://github.com/erxes/erxes/issues/1562) ([fa7a9a0](https://github.com/erxes/erxes/commit/fa7a9a0))
- **email:** nylas forward feature ([#1526](https://github.com/erxes/erxes/issues/1526)) ([50dd13a](https://github.com/erxes/erxes/commit/50dd13a))
- **engage:** show active process logs ([9f6de8c](https://github.com/erxes/erxes/commit/9f6de8c)), closes [#1538](https://github.com/erxes/erxes/issues/1538)
- **engage:** verification management ([509c32d](https://github.com/erxes/erxes/commit/509c32d)), closes [#1539](https://github.com/erxes/erxes/issues/1539)
- **integration:** added web kinded messenger app ([a29ce77](https://github.com/erxes/erxes/commit/a29ce77)), closes [#1507](https://github.com/erxes/erxes/issues/1507)
- **permissions:** improved filter ([58ebf77](https://github.com/erxes/erxes/commit/58ebf77)), closes [#1512](https://github.com/erxes/erxes/issues/1512)

### Performance Improvements

- **checklist:** can not add checklist item sometimes close [#1566](https://github.com/erxes/erxes/issues/1566) ([db39ba4](https://github.com/erxes/erxes/commit/db39ba4))
- **engage:** show sent content close [#1523](https://github.com/erxes/erxes/issues/1523) ([f5d3c50](https://github.com/erxes/erxes/commit/f5d3c50))
- **growthHack:** show all campaign ([60cc9e8](https://github.com/erxes/erxes/commit/60cc9e8))
- **inbox:** improve attachment view in inbox (close [#1568](https://github.com/erxes/erxes/issues/1568)) ([c45de57](https://github.com/erxes/erxes/commit/c45de57))
- **upload:** warning when upload large file ([09bceda](https://github.com/erxes/erxes/commit/09bceda))
- **upload:** warning when upload large file ([d66222d](https://github.com/erxes/erxes/commit/d66222d))

## [0.11.2](https://github.com/erxes/erxes/compare/0.11.1...0.11.2) (2019-12-15)

## [0.11.1](https://github.com/erxes/erxes/compare/0.11.0...0.11.1) (2019-12-15)

### Bug Fixes

- **board:** improve checklist ([0571565](https://github.com/erxes/erxes/commit/0571565)), closes [#1489](https://github.com/erxes/erxes/issues/1489) [#1490](https://github.com/erxes/erxes/issues/1490) [#1491](https://github.com/erxes/erxes/issues/1491) [#1492](https://github.com/erxes/erxes/issues/1492)
- **customer:** add save and continue button close [#1451](https://github.com/erxes/erxes/issues/1451) ([5a3e949](https://github.com/erxes/erxes/commit/5a3e949))
- **customers:** use renderFullName in SelectCustomers ([67aa25d](https://github.com/erxes/erxes/commit/67aa25d)), closes [#1466](https://github.com/erxes/erxes/issues/1466)
- **date:** displaying numbers as date ([657eabb](https://github.com/erxes/erxes/commit/657eabb)), closes [#1460](https://github.com/erxes/erxes/issues/1460)
- **deal/ticket/task:** saving labels on click ([dc33631](https://github.com/erxes/erxes/commit/dc33631)), closes [#1462](https://github.com/erxes/erxes/issues/1462)
- **inbox:** overlapping text in sidebar ([ed5fddf](https://github.com/erxes/erxes/commit/ed5fddf))
- **inbox:** show email subject close [#1468](https://github.com/erxes/erxes/issues/1468) ([dac6466](https://github.com/erxes/erxes/commit/dac6466))
- **integration:** add ability to edit common fields ([fef660a](https://github.com/erxes/erxes/commit/fef660a)), closes [#1434](https://github.com/erxes/erxes/issues/1434)
- **labels:** saving labels even no labels changed ([fb1e221](https://github.com/erxes/erxes/commit/fb1e221)), closes [#1461](https://github.com/erxes/erxes/issues/1461)
- **select-with-search:** implemented logic to cancel prev queries ([dbda70c](https://github.com/erxes/erxes/commit/dbda70c)), closes [#1458](https://github.com/erxes/erxes/issues/1458)

### Features

- **common:** add help popover ([072c9a1](https://github.com/erxes/erxes/commit/072c9a1))
- **dea/task/ticket:** add ability to restrict users by assigned & created users ([17fe9f8](https://github.com/erxes/erxes/commit/17fe9f8)), closes [#1428](https://github.com/erxes/erxes/issues/1428)
- **users:** change password from admin ([da05b50](https://github.com/erxes/erxes/commit/da05b50)), closes [#1505](https://github.com/erxes/erxes/issues/1505)

### Performance Improvements

- **contacts:** save & new possibility on customer form. close [#1485](https://github.com/erxes/erxes/issues/1485), Not showing search result if not on the first page. close [#1486](https://github.com/erxes/erxes/issues/1486) ([1c1ca21](https://github.com/erxes/erxes/commit/1c1ca21))
- **contacts:** show action buttons in detail page ([44692de](https://github.com/erxes/erxes/commit/44692de)), closes [#1497](https://github.com/erxes/erxes/issues/1497)
- **integrations:** auto appear install code after saving messenger integration ([2fedfbc](https://github.com/erxes/erxes/commit/2fedfbc))
- **mail:** improve dropdown of from email ([12c0fa7](https://github.com/erxes/erxes/commit/12c0fa7))

# [0.11.0](https://github.com/erxes/erxes/compare/0.10.1...0.11.0) (2019-11-01)

### Bug Fixes

- **attachment:** fix attachment view ([#1265](https://github.com/erxes/erxes/issues/1265)) ([3c83b20](https://github.com/erxes/erxes/commit/3c83b20)), closes [#1257](https://github.com/erxes/erxes/issues/1257)
- **deal/ticket/task/growthHack:** fix copy bug with attachment ([1cce81b](https://github.com/erxes/erxes/commit/1cce81b)), closes [#1268](https://github.com/erxes/erxes/issues/1268)
- **inbox:** some team members are not showing in assign component ([3f894fb](https://github.com/erxes/erxes/commit/3f894fb)), closes [#1236](https://github.com/erxes/erxes/issues/1236)
- **insights:** conversation insight UI improvement ([6d72db1](https://github.com/erxes/erxes/commit/6d72db1)), closes [#1215](https://github.com/erxes/erxes/issues/1215)
- **notes:** add mutation loading in note ([a872401](https://github.com/erxes/erxes/commit/a872401)), closes [#1181](https://github.com/erxes/erxes/issues/1181)
- **notification:** icon not showing, broken date in list ([c0030e3](https://github.com/erxes/erxes/commit/c0030e3)), closes [#1255](https://github.com/erxes/erxes/issues/1255) [#1254](https://github.com/erxes/erxes/issues/1254)

### Features

- **conformity:** generalized deal, ticket, task, company, customer relations ([c5014a9](https://github.com/erxes/erxes/commit/c5014a9)), closes [#1200](https://github.com/erxes/erxes/issues/1200)
- **deal/task/ticket:** improve due date reminder ([e2f8561](https://github.com/erxes/erxes/commit/e2f8561)), closes [#1210](https://github.com/erxes/erxes/issues/1210)
- **growth-hack:** add feature growth hack ([c905f0e](https://github.com/erxes/erxes/commit/c905f0e)), closes [#1113](https://github.com/erxes/erxes/issues/1113) [#1113](https://github.com/erxes/erxes/issues/1113)
- **imap:** add imap feature by nylus ([cf89f7e](https://github.com/erxes/erxes/commit/cf89f7e)), closes [#1367](https://github.com/erxes/erxes/issues/1367)
- **integration:** add chatfuel ([910adbb](https://github.com/erxes/erxes/commit/910adbb)), closes [#1358](https://github.com/erxes/erxes/issues/1358)
- **integrations:** facebook post ([3e377e0](https://github.com/erxes/erxes/commit/3e377e0)), closes [#1108](https://github.com/erxes/erxes/issues/1108)
- **language:** add italian language ([2328f18](https://github.com/erxes/erxes/commit/2328f18))
- **notification:** improve the color of the updated cards of deal / task / ticket ([ec45d95](https://github.com/erxes/erxes/commit/ec45d95)), closes [#1230](https://github.com/erxes/erxes/issues/1230)
- **twitter-dm:** add twitter direct message feature ([9c3f01c](https://github.com/erxes/erxes/commit/9c3f01c)), closes [#1127](https://github.com/erxes/erxes/issues/1127)

### Performance Improvements

- **test:** tested some components ([6bc276b](https://github.com/erxes/erxes/commit/6bc276b)), closes [#1242](https://github.com/erxes/erxes/issues/1242)

## [0.10.1](https://github.com/erxes/erxes/compare/0.10.0...0.10.1) (2019-08-31)

### Bug Fixes

- **notification:** widget and notification popover being out of sync. ([#1223](https://github.com/erxes/erxes/issues/1223)) ([1fdcc25](https://github.com/erxes/erxes/commit/1fdcc25))

### Features

- **deal/task/ticket:** auto save ([51fe182](https://github.com/erxes/erxes/commit/51fe182)), closes [#637](https://github.com/erxes/erxes/issues/637)
- **deal/ticket/task:** added notification color on item ([e7f9f7c](https://github.com/erxes/erxes/commit/e7f9f7c)), closes [#1232](https://github.com/erxes/erxes/issues/1232) [#1209](https://github.com/erxes/erxes/issues/1209)
- **notification:** add desktop notification ([8d4097f](https://github.com/erxes/erxes/commit/8d4097f)), closes [#1093](https://github.com/erxes/erxes/issues/1093)
- **translation:** add some translations ([b964af3](https://github.com/erxes/erxes/commit/b964af3)), closes [#1144](https://github.com/erxes/erxes/issues/1144)

### Performance Improvements

- **segment:** refactored edit form segment count ([afcde0b](https://github.com/erxes/erxes/commit/afcde0b)), closes [#1131](https://github.com/erxes/erxes/issues/1131)

# [0.10.0](https://github.com/erxes/erxes/compare/0.9.17...0.10.0) (2019-08-15)

### Bug Fixes

- **activity-log:** fix segment log message ([b9bb9bb](https://github.com/erxes/erxes/commit/b9bb9bb)), closes [#1172](https://github.com/erxes/erxes/issues/1172)
- **board:** fix board and stage scroll issue ([980e158](https://github.com/erxes/erxes/commit/980e158))
- **channels:** remove user query and add members to channels ([310e6e1](https://github.com/erxes/erxes/commit/310e6e1)), closes [#1183](https://github.com/erxes/erxes/issues/1183)
- **config:** move config to app store. close [#663](https://github.com/erxes/erxes/issues/663) ([d02a742](https://github.com/erxes/erxes/commit/d02a742))
- **deal/task/ticket:** new boards in the deal tab ([ff02695](https://github.com/erxes/erxes/commit/ff02695))
- **deal/task/ticket:** new boards in the deal tab ([eca30b8](https://github.com/erxes/erxes/commit/eca30b8)), closes [#1038](https://github.com/erxes/erxes/issues/1038)
- **editor:** fix footer buttons position ([2167f88](https://github.com/erxes/erxes/commit/2167f88)), closes [#1133](https://github.com/erxes/erxes/issues/1133)
- **engage:** Show alert when kind is auto ([08410e3](https://github.com/erxes/erxes/commit/08410e3)), closes [#1164](https://github.com/erxes/erxes/issues/1164)
- **engage:** show alert when some field is empty ([aaf0eb9](https://github.com/erxes/erxes/commit/aaf0eb9))
- **form:** fixed common form get value selector ([813acf6](https://github.com/erxes/erxes/commit/813acf6)), closes [#1178](https://github.com/erxes/erxes/issues/1178)
- **inbox:** inbox sidebar counts are not changing reactivity ([0ac81ce](https://github.com/erxes/erxes/commit/0ac81ce)), closes [#1128](https://github.com/erxes/erxes/issues/1128)
- **knowledgebase:** Add kb script description and additional tag ([#1150](https://github.com/erxes/erxes/issues/1150)) ([d326044](https://github.com/erxes/erxes/commit/d326044)), closes [#1143](https://github.com/erxes/erxes/issues/1143)
- **lead:** add description ([6ba5686](https://github.com/erxes/erxes/commit/6ba5686)), closes [#1147](https://github.com/erxes/erxes/issues/1147)
- **lead:** move save button to top ([a2ff78b](https://github.com/erxes/erxes/commit/a2ff78b))
- **lead/engage/messenger:** Fix some naming and Move step save button to top ([#1102](https://github.com/erxes/erxes/issues/1102)) ([72643fb](https://github.com/erxes/erxes/commit/72643fb))
- **logs:** show all team members and little refactor in logs ([5bd970a](https://github.com/erxes/erxes/commit/5bd970a)), closes [#1184](https://github.com/erxes/erxes/issues/1184)
- **messenger:** add description in messenger toggle ([7c80da3](https://github.com/erxes/erxes/commit/7c80da3)), closes [#1179](https://github.com/erxes/erxes/issues/1179)
- **notification:** show notification option enabled by default ([3d792e8](https://github.com/erxes/erxes/commit/3d792e8)), closes [#1125](https://github.com/erxes/erxes/issues/1125)
- **status:** erxes status will show correct information ([75d6352](https://github.com/erxes/erxes/commit/75d6352))
- **version:** status page will show correct branch ([3003935](https://github.com/erxes/erxes/commit/3003935))

### Features

- **contacts:** add messenger preview on quick message close [#1041](https://github.com/erxes/erxes/issues/1041) ([9589e44](https://github.com/erxes/erxes/commit/9589e44))
- **deal/task/ticket:** save itemId in querystring ([27a8b26](https://github.com/erxes/erxes/commit/27a8b26)), closes [#1103](https://github.com/erxes/erxes/issues/1103)
- **integration:** reimplement gmail ([090f434](https://github.com/erxes/erxes/commit/090f434)), closes [#1135](https://github.com/erxes/erxes/issues/1135)
- **knowledgebase:** add article reactions ([d283d72](https://github.com/erxes/erxes/commit/d283d72)), closes [#1036](https://github.com/erxes/erxes/issues/1036)
- **messenger:** Add ios, android, single app install description ([24636a2](https://github.com/erxes/erxes/commit/24636a2)), closes [#1132](https://github.com/erxes/erxes/issues/1132)
- **notification:** add real time ([caf3a9c](https://github.com/erxes/erxes/commit/caf3a9c)), closes [#1121](https://github.com/erxes/erxes/issues/1121)
- **translation:** add indonesian lang ([5afae50](https://github.com/erxes/erxes/commit/5afae50))

### Performance Improvements

- **common:** replace moment with day.js ([2cc59e1](https://github.com/erxes/erxes/commit/2cc59e1)), closes [#449](https://github.com/erxes/erxes/issues/449) [#1039](https://github.com/erxes/erxes/issues/1039)
- **deal/ticket/task:** add attachment field ([6995687](https://github.com/erxes/erxes/commit/6995687)), closes [#1029](https://github.com/erxes/erxes/issues/1029)
- **inbox:** Add animated loader in inbox ([#1160](https://github.com/erxes/erxes/issues/1160)) ([aa67923](https://github.com/erxes/erxes/commit/aa67923)), closes [#1099](https://github.com/erxes/erxes/issues/1099)
- **rule:** add description on rule close [#1156](https://github.com/erxes/erxes/issues/1156) ([28519b0](https://github.com/erxes/erxes/commit/28519b0))

### BREAKING CHANGES

- **integration:** remove REACT_APP_INTEGRATIONS_API_URL env
- **common:** renamed some language codes (np -> hi, jp -> ja, kr -> ko, ptBr -> pt-br, vn -> vi, zh -> zh-cn)

## [0.9.17](https://github.com/erxes/erxes/compare/0.9.16...0.9.17) (2019-07-09)

### Bug Fixes

- **board:** fix drag and drop bug ([7d03d14](https://github.com/erxes/erxes/commit/7d03d14)), closes [#1023](https://github.com/erxes/erxes/issues/1023)
- **brands:** fix refetch integration lists in brands Close [#1016](https://github.com/erxes/erxes/issues/1016) ([#1017](https://github.com/erxes/erxes/issues/1017)) ([0ebb928](https://github.com/erxes/erxes/commit/0ebb928))

### Features

- **deal:** change deal, task, ticket background from settings ([70300c7](https://github.com/erxes/erxes/commit/70300c7))
- **deal/ticket/task:** Add watch option for deal, ticket, task and pipeline ([28bfb87](https://github.com/erxes/erxes/commit/28bfb87)), closes [#1013](https://github.com/erxes/erxes/issues/1013)
- **integration:** add show launcher option in messenger ([f5e00d4](https://github.com/erxes/erxes/commit/f5e00d4)), closes [#1015](https://github.com/erxes/erxes/issues/1015)
- **kb:** add background image ([aa2025a](https://github.com/erxes/erxes/commit/aa2025a)), closes [#1021](https://github.com/erxes/erxes/issues/1021)
- **ticket:** add priority indicator circle on list and priority select ([7a8e9ce](https://github.com/erxes/erxes/commit/7a8e9ce))

### Performance Improvements

- **deal:** remove some editor buttons ([cdc0ff8](https://github.com/erxes/erxes/commit/cdc0ff8))

## [0.9.16](https://github.com/erxes/erxes/compare/0.9.15...0.9.16) (2019-07-03)
