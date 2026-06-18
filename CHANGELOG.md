

## [3.0.39](https://github.com/erxes/erxes/compare/3.0.38...3.0.39) (2026-06-18)


### Bug Fixes

* **agent-ui:** chat streaming correctness — message identity, send guard, scroll ([#8106](https://github.com/erxes/erxes/issues/8106)) ([df855ae](https://github.com/erxes/erxes/commit/df855ae0756f6e6da129255fbe44538f016fe17e))
* **agent-ui:** make settings pages scrollable ([#8102](https://github.com/erxes/erxes/issues/8102)) ([8862931](https://github.com/erxes/erxes/commit/88629313441bdc8c794fc1be1a4248b1f639338e))
* **agent:** new chat sessions appear immediately and survive a mid-run reload ([#8089](https://github.com/erxes/erxes/issues/8089)) ([5f49e1a](https://github.com/erxes/erxes/commit/5f49e1aa7feb80cf31848a4e0d2eb01b37ed0e68))
* **content:** return to correct post type tab after publishing ([#7971](https://github.com/erxes/erxes/issues/7971)) ([635b09c](https://github.com/erxes/erxes/commit/635b09c2081e21128fe7ca05d9422014b15eca7f))
* **core:** make customer CSV import idempotent and prevent row loss ([57d187b](https://github.com/erxes/erxes/commit/57d187b051e2472424a7845404fd6b93ed83ba26))
* **core:** write customer migration error report to a writable dir ([468e547](https://github.com/erxes/erxes/commit/468e54788291f0b525cbdd8c314d0953bda8ef6e))
* **gateway:** propagate user customPermissions so per-user grants work ([#8037](https://github.com/erxes/erxes/issues/8037)) ([59122ac](https://github.com/erxes/erxes/commit/59122acca1c7860d01e3699abbc8a07725eee414))
* **payment:** persist transaction response and tdbOrderId on invoice ([b1b70a7](https://github.com/erxes/erxes/commit/b1b70a71866735d112180ccbf2191544a49cdae1))
* **payment:** widget GraphQL routing, build, and invoice URL ([#8048](https://github.com/erxes/erxes/issues/8048)) ([da380b5](https://github.com/erxes/erxes/commit/da380b50988ea5e32765df0648ea768662037635))
* record-table-cell ([#8079](https://github.com/erxes/erxes/issues/8079)) ([5e1bd83](https://github.com/erxes/erxes/commit/5e1bd83903a69f40bd5b407d0804d6ab2f84c2cd))
* update import paths for handleTrigger and generateModels in triggerWorker and handleTrigger files ([356fd22](https://github.com/erxes/erxes/commit/356fd22bbd33b8c8b16c351c014051c63aa8f910))
* use readImage for member avatar urls in permission ([#8025](https://github.com/erxes/erxes/issues/8025)) ([0a3b073](https://github.com/erxes/erxes/commit/0a3b0730fa0927f76b09eab7f5af7ff3fe80f4e0))


### Features

* add inline similarity edit and create from product detail ([6ad6832](https://github.com/erxes/erxes/commit/6ad6832a7de2c19470a110daca9d9a5b759d0552))
* add isSimilarity filter to cp products query ([d206cbd](https://github.com/erxes/erxes/commit/d206cbda66c80b13f9da5e5db9e88a61440b6a1b))
* **agent-chat:** in-chat agent editor + per-conversation thinking level ([#8104](https://github.com/erxes/erxes/issues/8104)) ([8e839a4](https://github.com/erxes/erxes/commit/8e839a4234280d1eafd6b927fa0352a5aaebc138)), closes [#8068](https://github.com/erxes/erxes/issues/8068)
* **core:** add customer migration ([605b549](https://github.com/erxes/erxes/commit/605b54974a17eb71c2b52aa6c7202f572a9d64e7))
* **core:** add customer migration  ([4072547](https://github.com/erxes/erxes/commit/4072547023c8c466cdef767d9fab3c1cfe6dd6e7))
* **core:** automation message pro  ([c59f13b](https://github.com/erxes/erxes/commit/c59f13b095d0e63146bd0906bf9c70f7cb6f2a8f))
* **erxes-agent:** agent evaluation + native knowledge dataset ([#8063](https://github.com/erxes/erxes/issues/8063)) ([c5a595d](https://github.com/erxes/erxes/commit/c5a595d312c47475fc694e63a9a17e7828653546))
* **erxes-agent:** permission-control every action ([#8091](https://github.com/erxes/erxes/issues/8091)) ([7340c97](https://github.com/erxes/erxes/commit/7340c9743f13156ef1a122a73acc52e321ad78da))
* feat add invited members, everyone can access to cms options on… ([#8076](https://github.com/erxes/erxes/issues/8076)) ([282670f](https://github.com/erxes/erxes/commit/282670f456e530e5f5b1d5c354584b78201bbbac))
* **frontline:** add ticket custom properties report ([5838c46](https://github.com/erxes/erxes/commit/5838c464cfd9734ef10d6f4f050913300b03a99c))
* **frontline:** re-authenticate Facebook/Instagram before repairing unhealthy integrations ([ef3d308](https://github.com/erxes/erxes/commit/ef3d3085430fad513d07be344f96f67b478214a7))
* **frontline:** reflect SIP status in call widget button color ([f3e2e20](https://github.com/erxes/erxes/commit/f3e2e2067650fa03a5f8b0004c1de6563c171886))
* implement reusable context menu component ([69efbf4](https://github.com/erxes/erxes/commit/69efbf4149dd976879f7bb33b5a708979b5c658f))
* **mongolian:** improve check products ui and fix msdynamics config ([#8029](https://github.com/erxes/erxes/issues/8029)) ([d2b4191](https://github.com/erxes/erxes/commit/d2b41912a6c28a27c0948e6eab35366b81268553))

## [3.0.38](https://github.com/erxes/erxes/compare/3.0.37...3.0.38) (2026-06-16)


### Bug Fixes

* brand-duplicated ([#8050](https://github.com/erxes/erxes/issues/8050)) ([dc9cb6c](https://github.com/erxes/erxes/commit/dc9cb6cf1a15e05a634e25ed282d856118beef06))
* call history ([722d984](https://github.com/erxes/erxes/commit/722d98413890bf1ee65b67c97ca23f66b9314cc6))
* **posclient:** login with username ([5496153](https://github.com/erxes/erxes/commit/54961535c09a5e47934d3da770d630029271ef78))
* some improvement ([#8030](https://github.com/erxes/erxes/issues/8030)) ([df087be](https://github.com/erxes/erxes/commit/df087beaa83cd5ca4bfa13000c3dec60aba9d129))


### Features

* enhance call history retrieval with optimized aggregation pipeline and additional indexes ([0ee4e7d](https://github.com/erxes/erxes/commit/0ee4e7dd02c4a26dc8c974534b58fd06be8ec12c))
* enhance call session handling and CDR processing logic ([08b07c0](https://github.com/erxes/erxes/commit/08b07c054bc7f54d9fc7c93dd556ef9f76d81f33))
* **erxes-agent:** Mastra Studio dev bridge ([#8059](https://github.com/erxes/erxes/issues/8059)) ([6af7875](https://github.com/erxes/erxes/commit/6af7875f910770a37aff2d3bf387b77e603bb6e9))
* implement handleTrigger function and refactor trigger handling in triggerWorker and TRPC router ([70cf06b](https://github.com/erxes/erxes/commit/70cf06b11d85ae35010edd95f8bbdb823c60a99f))
* make documents available without OS restriction ([246ef9f](https://github.com/erxes/erxes/commit/246ef9f19688c55e9401e7a8bf2966e6e425f1a0))

## [3.0.37](https://github.com/erxes/erxes/compare/3.0.36...3.0.37) (2026-06-16)


### Bug Fixes

* add module-specific permissions to import/export types ([#8032](https://github.com/erxes/erxes/issues/8032)) ([39842fe](https://github.com/erxes/erxes/commit/39842fe87d70b88bfea041ad18aa5a1da0f9fe35))
* correct import/export permission gates and content types ([#8038](https://github.com/erxes/erxes/issues/8038)) ([f1320d8](https://github.com/erxes/erxes/commit/f1320d8a05d1fbe942a0cf0f0f0aa12e6bb84527))
* enable scroll in safe remainder detail tables ([a17096e](https://github.com/erxes/erxes/commit/a17096e3215b2c771aa5f12f36eb34320588984f))
* **payment-widget:** resolve paymentsPublic empty result due to GraphQL variable mismatch  ([d96a875](https://github.com/erxes/erxes/commit/d96a875468753dff045c22e8ba852262be859b92))
* **payment:** check public ([b94c7d4](https://github.com/erxes/erxes/commit/b94c7d4b1a3c6a65c5f4b5d99c4bc4c01cac3815))
* **payment:** check public1 ([6dafa19](https://github.com/erxes/erxes/commit/6dafa197a7e7786ad950b07e4db1d26a55ff041d))
* **payment:** check public2 ([2e1297d](https://github.com/erxes/erxes/commit/2e1297dbb75ecf715ab186fca38ec0f135ad6cc7))
* **payment:** check public3 ([52c6744](https://github.com/erxes/erxes/commit/52c6744b08b68a69f2277034236826f5a3a643f0))
* **payment:** check public4 ([b7875b4](https://github.com/erxes/erxes/commit/b7875b45449c81407dff5b3c5d03541dc0e3bff0))
* **payment:** generate invoice url up ([e413c8b](https://github.com/erxes/erxes/commit/e413c8b1649f4453c7a4cb2a231b92f9b1414b57))
* **payment:** widget with env and saas ([5d63766](https://github.com/erxes/erxes/commit/5d637666bbeb206b5147ca0ea682bf56f9531538))
* posclient-front entrypoint ([12e1027](https://github.com/erxes/erxes/commit/12e10272c4781cec3a65efeb21407cac9841b388))
* products filter by status ([#8034](https://github.com/erxes/erxes/issues/8034)) ([57bf82c](https://github.com/erxes/erxes/commit/57bf82c8ec48fca6421f1e082dcb1a049794275f))
* release with posclient-front ([3e3c4d4](https://github.com/erxes/erxes/commit/3e3c4d4726637929289f939f40c62305ed763166))
* remove duplicate brand list rendering in SelectBrandContent ([#8053](https://github.com/erxes/erxes/issues/8053)) ([eccf1c2](https://github.com/erxes/erxes/commit/eccf1c26ef08b17ef3f362bdaeda88ac3643f343))
* subscription ([#8028](https://github.com/erxes/erxes/issues/8028)) ([d1fff7d](https://github.com/erxes/erxes/commit/d1fff7d576dcb5542034f6e4bbf20a7e11a8e3ba))
* TypeError: Cannot read properties of undefined (reading 'replace') ([#8043](https://github.com/erxes/erxes/issues/8043)) ([#8044](https://github.com/erxes/erxes/issues/8044)) ([0458a7b](https://github.com/erxes/erxes/commit/0458a7bc5353a80aa6e5722a8f26caee4b257f5d))


### Features

* add bulk generation product by similarity ([#8024](https://github.com/erxes/erxes/issues/8024)) ([0026948](https://github.com/erxes/erxes/commit/0026948712993f0342d562b6aaa3059899fbf538))
* add bulk tag add/remove to ProductCommandBar ([#7999](https://github.com/erxes/erxes/issues/7999)) ([f09c64a](https://github.com/erxes/erxes/commit/f09c64a4a589cbc16675481d3ece12a0359ed4b6))
* add reference extension metadata and placeholder resolution ([#8046](https://github.com/erxes/erxes/issues/8046)) ([120d4da](https://github.com/erxes/erxes/commit/120d4da0eb9d2204c4de943afe521173dad68ecd))
* **core:** add POS migration command ([3a9e7c4](https://github.com/erxes/erxes/commit/3a9e7c48d035dbac1ff2ce15e8ecdfa9c63b7f1b))
* **erxes-agent:** index Company Knowledge as the requesting user ([#8040](https://github.com/erxes/erxes/issues/8040)) ([72acb7a](https://github.com/erxes/erxes/commit/72acb7a5f48db813706c3ddd8652684652047f10))
* implement before resolver functionality and integrate into product deletion process ([#8039](https://github.com/erxes/erxes/issues/8039)) ([e96fa06](https://github.com/erxes/erxes/commit/e96fa06bdb88eda0c4541037dcf92fb04f761407))
* **mongolian:** improved MSdynamic synced order check workflow ui ([#7989](https://github.com/erxes/erxes/issues/7989)) ([927fc49](https://github.com/erxes/erxes/commit/927fc49e25e0b141d85284d9de28fb93c10e5291))
* point-in-time revert (undo) for any DB change — dynamic capture, engine & UI ([#8045](https://github.com/erxes/erxes/issues/8045)) ([09127c4](https://github.com/erxes/erxes/commit/09127c4772fbb9bf04d07ff19aac3df173789a1a))
* show members in side sheet on userCount click ([#7959](https://github.com/erxes/erxes/issues/7959)) ([81b4aa5](https://github.com/erxes/erxes/commit/81b4aa5c691d3298546729cdcb2e640caf2c21a9))
* similarity group swap existing products & detail tab ([fb2aedd](https://github.com/erxes/erxes/commit/fb2aedd80f1345781fd8614977613473d4d1871e))


### Performance Improvements

* improve payment plugin ci ([c60cacc](https://github.com/erxes/erxes/commit/c60cacc5c24c0aa726f1cdb623cc0f9b9a0d1197))


### Reverts

* Revert "feat: add file upload support and fix image persistence in BlockNote editor (#7946)" ([102cda1](https://github.com/erxes/erxes/commit/102cda13052dfce500f4d5b9b12f9d75be229443)), closes [#7946](https://github.com/erxes/erxes/issues/7946)

## [3.0.36](https://github.com/erxes/erxes/compare/3.0.35...3.0.36) (2026-06-14)

## [3.0.34](https://github.com/erxes/erxes/compare/3.0.33...3.0.34) (2026-06-12)


### Bug Fixes

* **core:** filter team members by unit/branch/department and add conversation list indexes ([483ec7d](https://github.com/erxes/erxes/commit/483ec7d87f839451b50a81e970d2dc3d88908f4c))
* fix empty state layout overflow in record table ([#7974](https://github.com/erxes/erxes/issues/7974)) ([0fac23e](https://github.com/erxes/erxes/commit/0fac23e0fb874eb0f478dba01caa1a759447afd2))
* **frontline:** add conversation id to mobile chat notifications ([1675b0e](https://github.com/erxes/erxes/commit/1675b0e70987d34e0da01f87c8a70a00c7f1e5c1))
* **frontline:** improve call CDR selection and handle internal conversation messages  ([368e888](https://github.com/erxes/erxes/commit/368e8889fb8d09bd9674c48b29e468adc48e53a7))
* **frontline:** refine CDR selection to prioritize answered Queue legs ([c7b3b64](https://github.com/erxes/erxes/commit/c7b3b6457c2a248f6a8c426e97b2ce8f9cb72ed2))
* resolve DeepSource JavaScript findings (agent plugin, contacts) ([#7990](https://github.com/erxes/erxes/issues/7990)) ([9c460ee](https://github.com/erxes/erxes/commit/9c460ee21b207e0ddbfdda366e4d1d66046d1af9))
* send UOM code instead of name to prevent duplicate ([#7973](https://github.com/erxes/erxes/issues/7973)) ([fb155a2](https://github.com/erxes/erxes/commit/fb155a21eed1860989f93569aea85884ab609c05))
* sync customer and clientportal ([#7977](https://github.com/erxes/erxes/issues/7977)) ([e77b132](https://github.com/erxes/erxes/commit/e77b1329e4e5ce238834a81d6f3e60f66f0b8f66))


### Features

* add agents ([f71adc7](https://github.com/erxes/erxes/commit/f71adc71689fc8429f216b64a84a271cf3bc7b96))
* add property-based filtering ([#7984](https://github.com/erxes/erxes/issues/7984)) ([c62532f](https://github.com/erxes/erxes/commit/c62532f1a542fd3425b63ff40ccec08d158f2291))
* **core:** add product data migration script between SaaS orgs  ([ad540a1](https://github.com/erxes/erxes/commit/ad540a1c84db31a30aa11f3a9988c99f1d0db47a))
* **core:** migrate products  ([dca2bc7](https://github.com/erxes/erxes/commit/dca2bc757a45cc65f88c8e586cb7d97e2e28f4cc))
* erxes AI Agents plugin — Mastra-powered agents, chat, workflows, and company-knowledge RAG ([#7985](https://github.com/erxes/erxes/issues/7985)) ([83ff2c3](https://github.com/erxes/erxes/commit/83ff2c3a0c5cfc336824be8989098082042c5a09))
* **erxes-agent:** configurable temperature per agent ([#7997](https://github.com/erxes/erxes/issues/7997)) ([5f8da46](https://github.com/erxes/erxes/commit/5f8da469b65120792b00d4da6e039b99a4c79a29))
* **operation:** add import/export to task and project command bars ([#7975](https://github.com/erxes/erxes/issues/7975)) ([1c68862](https://github.com/erxes/erxes/commit/1c688624224aafdce1486025534800df92c0e1d1))

# Changelog

## [3.0.33](https://github.com/erxes/erxes/compare/3.0.32...3.0.33) (2026-06-11)


### Bug Fixes

* **content:** generate Mongolian-aware CMS slugs from title ([#7962](https://github.com/erxes/erxes/issues/7962)) ([4b57c26](https://github.com/erxes/erxes/commit/4b57c26dda3f77decdc626c2659da07b0bc64d3a))
* **content:** preserve CMS page slug on edit ([#7969](https://github.com/erxes/erxes/issues/7969)) ([84852a3](https://github.com/erxes/erxes/commit/84852a36140342094572c8acdf1719aa2053f5a8))
* cp link ([#7963](https://github.com/erxes/erxes/issues/7963)) ([16e0889](https://github.com/erxes/erxes/commit/16e088962840e356405e7f8e0fa0c3edf5b3d33c))
* date range filter, company edit and target a sales deal in Give Score with name/number search ([#7947](https://github.com/erxes/erxes/issues/7947)) ([ed9384b](https://github.com/erxes/erxes/commit/ed9384b0c37b3881aa092b09a335c62e694bd2a5))
* filter with sessionkey ([#7961](https://github.com/erxes/erxes/issues/7961)) ([bf9426d](https://github.com/erxes/erxes/commit/bf9426d3df73b95c930f24e6ef67cee5bea71237))
* **frontline:** fix report pagination, chart data limits, and smooth page transitions  ([94fe486](https://github.com/erxes/erxes/commit/94fe486d6b8185784c196496aef09101aa5b03a6))
* **frontline:** settings layout overflow and response template breadcrumbs ([cb31d5d](https://github.com/erxes/erxes/commit/cb31d5d59be93142ac757f1646be0124ec6fe91f))
* sales checklist ([#7966](https://github.com/erxes/erxes/issues/7966)) ([10cc29a](https://github.com/erxes/erxes/commit/10cc29a33581de94951f9181d80fa9bc433dc212))
* **sales:** improved ([#7954](https://github.com/erxes/erxes/issues/7954)) ([78ab14d](https://github.com/erxes/erxes/commit/78ab14d4cec55b4b349ddc289e5a27e05535bb5e))
* **sales:** sales stage query bug ([#7965](https://github.com/erxes/erxes/issues/7965)) ([7ea1131](https://github.com/erxes/erxes/commit/7ea1131f7eba83c1b63965cbc1acf879e64751fe))
* some trpc check ([236c514](https://github.com/erxes/erxes/commit/236c514065d16066c9bc129de3f1bfa349b5f6b8))


### Features

* add brand select to Add/Edit Call integration form ([c1fc409](https://github.com/erxes/erxes/commit/c1fc40983c9258762a2897f74cbead5e57fdcc44))
* add file upload support and fix image persistence in BlockNote editor ([#7946](https://github.com/erxes/erxes/issues/7946)) ([55ae0c9](https://github.com/erxes/erxes/commit/55ae0c96f7002dcc70fec67f4af7e04e0f1e2682))
* **automations:** add loyalty actions, flow direction support, and automation builder enhancements ([#7952](https://github.com/erxes/erxes/issues/7952)) ([002a6d0](https://github.com/erxes/erxes/commit/002a6d07be4c13bdf724e3bc90bbfa84eca71140))
* **core:** add branch, department, unit filters and columns to team members table  ([0b2adff](https://github.com/erxes/erxes/commit/0b2adff952e113baa2e563e042c426c7947ea4cf))
* **mongolian:** improved MS Dynamics sync history table  ([#7934](https://github.com/erxes/erxes/issues/7934)) ([ff7213b](https://github.com/erxes/erxes/commit/ff7213b36dd7fe039776eae445b6eccd7c03be6b))
* show members tab in permission group details dialog ([#7957](https://github.com/erxes/erxes/issues/7957)) ([108f6af](https://github.com/erxes/erxes/commit/108f6aff3f60285e3ad3ca85faefe4f57768d1bd))

## [3.0.32](https://github.com/erxes/erxes/compare/3.0.31...3.0.32) (2026-06-09)


### Bug Fixes

* FetchError: request to https://asd/api failed, reason: getaddrinfo ENOTFOUND asd ([#7944](https://github.com/erxes/erxes/issues/7944)) ([#7945](https://github.com/erxes/erxes/issues/7945)) ([b1cd2b0](https://github.com/erxes/erxes/commit/b1cd2b07c9d696a78b1a79269140d5f7da250c0f))
* **frontline:** fix timezone-aware day grouping and default call report range to last 3 months ([59092fd](https://github.com/erxes/erxes/commit/59092fdcd28d0fcfe618a40e2d2f5534fa5543e0))
* **loyalty:** refactor and commands and runtime ([#7933](https://github.com/erxes/erxes/issues/7933)) ([39edb09](https://github.com/erxes/erxes/commit/39edb094780ef6dd448a676b4385892c451b227b))


### Features

* **frontline:** add admin permission to call integration queries  ([70c5580](https://github.com/erxes/erxes/commit/70c55804b49d1bdc35e1bfc6030be8d475120b78))
* **frontline:** call report ,  report ui refactor  ([23e0b32](https://github.com/erxes/erxes/commit/23e0b3272e919ebe821a80b01560f746b9139860))
* **frontline:** conversation report export, pagination, and perf fixes  ([01c2a75](https://github.com/erxes/erxes/commit/01c2a75a3bb39fdd2a1b33daed649cbca93084a1))
* **frontline:** improve inbox brand sidebar UX ([7a8f466](https://github.com/erxes/erxes/commit/7a8f466d5277e8a25380de33cca12950514bd017))
* **frontline:** make response template search fully dynamic ([225c04b](https://github.com/erxes/erxes/commit/225c04b560866951f0f837b234c857f26ed2a0f7))

## [3.0.31](https://github.com/erxes/erxes/compare/3.0.30...3.0.31) (2026-06-08)


### Bug Fixes

* **content:** Fixing CMS post translations ([#7890](https://github.com/erxes/erxes/issues/7890)) ([ed23ae9](https://github.com/erxes/erxes/commit/ed23ae91e72b43564e9b3e0e3eb46b46c6e71040))
* exchange-rates-currency-fix ([#7919](https://github.com/erxes/erxes/issues/7919)) ([81f2d8f](https://github.com/erxes/erxes/commit/81f2d8fa249c7cf21fd0edd518aa857eb84f7bf0))
* **frontline:** use Facebook Private Reply API for new comment-triggered conversations ([997e630](https://github.com/erxes/erxes/commit/997e630df50bd35bb786c97c10faed8656785245))
* **frontline:** widgets ([#7884](https://github.com/erxes/erxes/issues/7884)) ([32bdf81](https://github.com/erxes/erxes/commit/32bdf817cf52db3b398e243defe6f576792fd9a2))
* loyalty-score-filter-fix ([#7921](https://github.com/erxes/erxes/issues/7921)) ([9f74343](https://github.com/erxes/erxes/commit/9f7434378a1debd80cbfeec572b3dfd2ab2520e7))
* loyalty-score-record-table-refactor ([#7887](https://github.com/erxes/erxes/issues/7887)) ([499f6e1](https://github.com/erxes/erxes/commit/499f6e1e9a1f8d96e9c6ebb85e6954c3637d9ea0))
* **mongolian:** replace MS Dynamics settings form with config management table ([#7905](https://github.com/erxes/erxes/issues/7905)) ([aaa08cc](https://github.com/erxes/erxes/commit/aaa08ccedb8539918df3cc5d66b522ae71937675))
* **operations:** migrationTask ([c81201f](https://github.com/erxes/erxes/commit/c81201fdc889a943013b053bf1cd02c9a07df3da))
* provide default icon fallback in property forms ([#7616](https://github.com/erxes/erxes/issues/7616)) ([a8445ae](https://github.com/erxes/erxes/commit/a8445aef32edfb08bd8f98de37e05245b6ddbd66))
* route conversation push notifications to CP users  ([53d6806](https://github.com/erxes/erxes/commit/53d68063d1df1558363b812a71acc43e7cdd9dd4))
* sales to transaction sync update and loyalty score correct ([#7894](https://github.com/erxes/erxes/issues/7894)) ([1ca7d7a](https://github.com/erxes/erxes/commit/1ca7d7af1b1ddca9a126e3a5a8ca26a22d87c7d4))
* skip Claude Code Action on PRs from read-only contributors ([#7911](https://github.com/erxes/erxes/issues/7911)) ([d266978](https://github.com/erxes/erxes/commit/d2669785223d121d89022acf759a4b45e0fc74d3))
* some trpc ([9edbb68](https://github.com/erxes/erxes/commit/9edbb685070b8603bf82cb9c3a89be7e154b1074))


### Features

* add client portal ticket notes support and unify ticket search filter ([1722480](https://github.com/erxes/erxes/commit/17224802f658a7b651a3d7ae1389dd6df1ced769))
* add issue webhook dispatcher for auto-fix listener ([856099f](https://github.com/erxes/erxes/commit/856099f17bf08d715151feb51ec3fb3aeb124cdf))
* add module-specific import/export permissions ([#7913](https://github.com/erxes/erxes/issues/7913)) ([03e7fb0](https://github.com/erxes/erxes/commit/03e7fb00dca35930c070fe2f2fd09ff6e00a47f5))
* add tag filtering and inline tag editing for packages ([9bc89a9](https://github.com/erxes/erxes/commit/9bc89a9461674d310d9955db5680df189305a5cd))
* add tag support to packages ([fe65934](https://github.com/erxes/erxes/commit/fe65934f2eb19258751a7fe33bcc785b106a9f7a))
* add tags column to projects table ([#7918](https://github.com/erxes/erxes/issues/7918)) ([35db2b6](https://github.com/erxes/erxes/commit/35db2b6d8ff78f65790b12635e56bf6aedcdb980))
* add webhook action for bug/sentry issue auto-fix ([#7897](https://github.com/erxes/erxes/issues/7897)) ([014da90](https://github.com/erxes/erxes/commit/014da90b7f645b78b0d104e67bb7cac9743da974))
* **content:** Add CMS public post links, view count, and author ([17a081b](https://github.com/erxes/erxes/commit/17a081bcf9db059a2dcacef63087b2b6f099ef94))
* **core:** product customProperty  ([e9250c9](https://github.com/erxes/erxes/commit/e9250c9304b93db59278d771ea3255cf273a41d9))
* cpDealsChange mutation ([e0e914a](https://github.com/erxes/erxes/commit/e0e914ab92dbba0f0dcde30eecb20b4aa5843eed))
* federate plugin locale through gateway ([#7900](https://github.com/erxes/erxes/issues/7900)) ([ae53ad7](https://github.com/erxes/erxes/commit/ae53ad74bb703dc0a59f5249dac06d8bee1322e6))
* **frontline:** Erxes messenger automation ([#7929](https://github.com/erxes/erxes/issues/7929)) ([d2fa6c5](https://github.com/erxes/erxes/commit/d2fa6c5df3105734a150db827862ef47b8e1f16b))
* **frontline:** restrict inbox channel list to user's own channels ([9e20df3](https://github.com/erxes/erxes/commit/9e20df3609bcd9244abcf31619ad4105eb847cab))
* implement file upload for property field type ([#7899](https://github.com/erxes/erxes/issues/7899)) ([1673f76](https://github.com/erxes/erxes/commit/1673f76631d678f9c721319d85fc5e43b3510120))
* **payment:** integrate TDB card  payment method ([#7904](https://github.com/erxes/erxes/issues/7904)) ([baafb55](https://github.com/erxes/erxes/commit/baafb559dad640e6c5d44377ec3911d1f29d29fd))
* Sentry error monitoring (frontend + backend) with expected-error classification ([#7907](https://github.com/erxes/erxes/issues/7907)) ([23f4024](https://github.com/erxes/erxes/commit/23f4024eae7870800ffcf2dcf57dd9ea26923f6a))

## [3.0.30](https://github.com/erxes/erxes/compare/3.0.29...3.0.30) (2026-06-04)


### Bug Fixes

* **core:** fix export field selection modal layout and pluralized titles  ([c60e0cc](https://github.com/erxes/erxes/commit/c60e0cc1419bef79e3d6f71bdeeb9a7e8e3e2326))
* **frontline:** ticket export ([f7e7433](https://github.com/erxes/erxes/commit/f7e74334d15fed6dfea0673b81d63d374cdecf47))
* sales product scroll ([#7879](https://github.com/erxes/erxes/issues/7879)) ([7e1a242](https://github.com/erxes/erxes/commit/7e1a242cf877d86980529144b9b229e9cdd10bdf))


### Features

* add error classifier and Sentry filtering for expected errors ([#7865](https://github.com/erxes/erxes/issues/7865)) ([c2ede97](https://github.com/erxes/erxes/commit/c2ede97ceac69a243db62449baefa5357a555693))
* **frontline:** add client portal queries, mutations, and subscriptions  ([bc1f1c9](https://github.com/erxes/erxes/commit/bc1f1c9fd2e1fb18d10eee9d612b057cd1cde14e))
* **frontline:** forms and messenger widget ui ([#7869](https://github.com/erxes/erxes/issues/7869)) ([06a764d](https://github.com/erxes/erxes/commit/06a764d53ee5a177bb2bfd696a688a298bceb519))

## [3.0.29](https://github.com/erxes/erxes/compare/3.0.28...3.0.29) (2026-06-03)


### Bug Fixes

* add status field to Department GraphQL type ([#7861](https://github.com/erxes/erxes/issues/7861)) ([be4644b](https://github.com/erxes/erxes/commit/be4644b3e64cbc185d69506ccad6816aa76d2d3c))
* Exchange rates UI enhancement ([#7860](https://github.com/erxes/erxes/issues/7860)) ([07dbb4e](https://github.com/erxes/erxes/commit/07dbb4e8b02348348d629b1216ddb31a0d190622))
* loyalty-score-statistics with filter param ([#7864](https://github.com/erxes/erxes/issues/7864)) ([a313341](https://github.com/erxes/erxes/commit/a313341cf2e376070583410e8acc5040a99f1356))
* loyalty-scores-detail-sheet ([#7852](https://github.com/erxes/erxes/issues/7852)) ([50ec649](https://github.com/erxes/erxes/commit/50ec649fd761761770307f13c915a068ffb36db6))
* **operation:** enforce ObjectId types for all cross-document reference fields ([d95a060](https://github.com/erxes/erxes/commit/d95a060b049d9d3b3301d953c6f4557c03f49a39))
* **operation:** migration task ([ef52a0a](https://github.com/erxes/erxes/commit/ef52a0afc1147c71a67874530507ecc9fdd3bedd))
* **operation:** patch legacy nanoid teamIds to ObjectId in migrateTasks ([70c32d3](https://github.com/erxes/erxes/commit/70c32d3c5f90dc6f6e95404ceda8b9530e53b703))
* **operation:** use string IDs for schema relations and add task migration  ([1a06638](https://github.com/erxes/erxes/commit/1a066384dffddb45b1c30566bed6570c04d55e9b))
* restrict export button to users with exportsManage permission ([#7862](https://github.com/erxes/erxes/issues/7862)) ([02fb5cb](https://github.com/erxes/erxes/commit/02fb5cbf12a9e278009c28242f4c58cbdc4738c4))
* schema return ([#7863](https://github.com/erxes/erxes/issues/7863)) ([b2badf6](https://github.com/erxes/erxes/commit/b2badf6aae8eb0cdfcb7d61f3047b40a1b59bfb9))


### Features

* **core:** add custom field import/export for core and tickets; add load more for frontline response templates; fix inbox image preview, ([0677927](https://github.com/erxes/erxes/commit/0677927a9d58863484d5fe16c2b2bbb70d58c130))

## [3.0.28](https://github.com/erxes/erxes/compare/3.0.27...3.0.28) (2026-06-02)


### Bug Fixes

* Accounting reverse tax and syncerkhet improve ([#7804](https://github.com/erxes/erxes/issues/7804)) ([e2f5a09](https://github.com/erxes/erxes/commit/e2f5a09c1fc8f5be79c64f7c97abbf495bb0c701))
* allow core app admins to read oauth clients ([#7849](https://github.com/erxes/erxes/issues/7849)) ([9fcacbf](https://github.com/erxes/erxes/commit/9fcacbfd9e07ab23223b7285877ae5bdb2c8ecc8))
* cp password change ([#7822](https://github.com/erxes/erxes/issues/7822)) ([12d7853](https://github.com/erxes/erxes/commit/12d7853df77fd01d22fde0293969bc041ca0604b))
* **frontline:** migrate forms, permissions, and file upload handling  ([59c27e3](https://github.com/erxes/erxes/commit/59c27e3885284773f3717df6fad83b7613243788))
* **loyalty:** score list to normalize ([#7817](https://github.com/erxes/erxes/issues/7817)) ([0c81bc8](https://github.com/erxes/erxes/commit/0c81bc85dd9732d767f1ebc9148c5bf08c553074))
* **mongolian:** ebarimt productGroup list ([a71b61a](https://github.com/erxes/erxes/commit/a71b61a7062c7171b394ca30f164742b6f651438))
* remove missing sentry.instrument.cjs references from Dockerfiles ([68a25bf](https://github.com/erxes/erxes/commit/68a25bf6b5abfc30eb390cbb3e2d41f8849fc84f))
* sales bugs ([#7847](https://github.com/erxes/erxes/issues/7847)) ([766e342](https://github.com/erxes/erxes/commit/766e3423a13d59bdea0732ebb25bb94957c4f4f4))
* **sales:** deal detail with stages shortcut ([#7840](https://github.com/erxes/erxes/issues/7840)) ([8371418](https://github.com/erxes/erxes/commit/83714181bc0a0141cb62f497282322f154281be3))
* **sales:** some improve    ([#7797](https://github.com/erxes/erxes/issues/7797)) ([5ade01b](https://github.com/erxes/erxes/commit/5ade01bb45478b64263d6187d03932d58b35f801))
* update .agents system - fix missing references and skill contracts ([#7829](https://github.com/erxes/erxes/issues/7829)) ([0bea2b1](https://github.com/erxes/erxes/commit/0bea2b1c318770a1886794507e3f04c4bcbe1d0f))


### Features

* add 3 options to confidential oauth ([#7846](https://github.com/erxes/erxes/issues/7846)) ([01c7074](https://github.com/erxes/erxes/commit/01c707448444b76fc2f7318a96d16d47dc06879b))
* add detect-scope skill with pre-flight validation ([#7821](https://github.com/erxes/erxes/issues/7821)) ([51ad42c](https://github.com/erxes/erxes/commit/51ad42c98b43dcc84df7ec8d4b5fd2a5bf249ea9))
* add package management module ([#7830](https://github.com/erxes/erxes/issues/7830)) ([7850f77](https://github.com/erxes/erxes/commit/7850f7768ed51381c1f3ba9a2d9c4c6438ca9eed))
* add ticket sort control by latest updated/created ([ed17ef1](https://github.com/erxes/erxes/commit/ed17ef18c3167b141dc521a3da31a4a2e033abdc))
* ai agents rules  ([a5b4f05](https://github.com/erxes/erxes/commit/a5b4f050f811d6fad1d3370b32953ac617815019))
* **core-ui:** add editor gallery and image floating ([#7831](https://github.com/erxes/erxes/issues/7831)) ([d83ff5a](https://github.com/erxes/erxes/commit/d83ff5a0470b5e245556843f7444f511a8397cc9))
* enhance Sentry OpenCode automation with .agents protocol ([#7837](https://github.com/erxes/erxes/issues/7837)) ([771fe8a](https://github.com/erxes/erxes/commit/771fe8a386045ff0da94ebfd0513c71150a68300))
* **import-export:** implement custom property handling and enhance import functionality ([542a53e](https://github.com/erxes/erxes/commit/542a53e691019ed71fc863eddd996e22e89bf8f8))
* **loyalty:** register loyalty permissions in permission groups (meta) ([#7851](https://github.com/erxes/erxes/issues/7851)) ([0199170](https://github.com/erxes/erxes/commit/0199170cdc80f6e39a5f98af25113949aded0f0d))
* **mongolian:** add permission group support ([#7823](https://github.com/erxes/erxes/issues/7823)) ([7f0963d](https://github.com/erxes/erxes/commit/7f0963d9fb11565d388e5e990abaf82141c18c5b))
* **structure:** add status filter and restore deleted records ([#7815](https://github.com/erxes/erxes/issues/7815)) ([3750f6c](https://github.com/erxes/erxes/commit/3750f6c4f06ca25c8b2ecb76e1e927f23f11a834))


### Reverts

* revert sentry setup ([3b41d63](https://github.com/erxes/erxes/commit/3b41d630208bba00b4b65b20cfaf996499b5d023))

## [3.0.27](https://github.com/erxes/erxes/compare/3.0.26...3.0.27) (2026-05-28)


### Bug Fixes

* account add and edit ui ([c4f29a0](https://github.com/erxes/erxes/commit/c4f29a03146b7b3f210e358a526e018e02c1d59d))
* **accounting:** improve safeRem to transaction and ctax some bug ([#7798](https://github.com/erxes/erxes/issues/7798)) ([688da3d](https://github.com/erxes/erxes/commit/688da3d56302ce96b8c94a94fedf92d992fabf7f))
* **accounting:** safe-remainders-filter-enhancement ([#7793](https://github.com/erxes/erxes/issues/7793)) ([ec9b564](https://github.com/erxes/erxes/commit/ec9b5640e1aaa8535f58b08fcc04f6409b3b5b50))
* **accounting:** safeRemainder to transction ([3ac3a21](https://github.com/erxes/erxes/commit/3ac3a210d82dd2fc726eaaf2c7221c04ed2d1d14))
* bugs ([8e67716](https://github.com/erxes/erxes/commit/8e67716e7e9487e681a990ea57a0ac42339e36bc))
* clean selectProductCategory and ebarimt taxRule ([#7795](https://github.com/erxes/erxes/issues/7795)) ([e5e67ab](https://github.com/erxes/erxes/commit/e5e67ab6c6a5ceadb265a8f0b906f55213e350f2))
* **content:** cp user edit, password reset permission ([#7805](https://github.com/erxes/erxes/issues/7805)) ([a27a1a0](https://github.com/erxes/erxes/commit/a27a1a0ca3bbbb7f343947f217740d93e27ea8ef))
* **content:** fix cms menu page target ([#7766](https://github.com/erxes/erxes/issues/7766)) ([f5f774d](https://github.com/erxes/erxes/commit/f5f774dd3482e9f1730fd9a47e1f26977d6b96dc))
* **content:** move CMS deletion to settings with confirmation ([da80f0b](https://github.com/erxes/erxes/commit/da80f0ba71640445a00e4e9206501ec72a30d1bc))
* edit form use textField reactive ([2b7dcdf](https://github.com/erxes/erxes/commit/2b7dcdf850643261fdf2c5c35685369f477fb27d))
* feature-loyalty-widget-and-score-refactor ([#7791](https://github.com/erxes/erxes/issues/7791)) ([fad07c4](https://github.com/erxes/erxes/commit/fad07c430be6556e2a472d18905272b8a93e9d9a))
* **frontline:** fix integrationsGetUsedTypes returning empty array ([930b360](https://github.com/erxes/erxes/commit/930b36042f1cd04b194aded73043dd8205dadfff))
* **frontline:** response template search via backend searchValue ([#7807](https://github.com/erxes/erxes/issues/7807)) ([1be7fcc](https://github.com/erxes/erxes/commit/1be7fcc82b3e3dd2f6b206a4023a434d978e66d3))
* handle null user in cpSalesPipelines client portal query ([#7783](https://github.com/erxes/erxes/issues/7783)) ([2fe0106](https://github.com/erxes/erxes/commit/2fe0106d70709ea32e05d98e33c0e55eb9ab0abf))
* **logs:** try afterProcesses ([89ff810](https://github.com/erxes/erxes/commit/89ff810110316cac4db911d189b992dc9ae180ea))
* loyalty score some bugs ([#7772](https://github.com/erxes/erxes/issues/7772)) ([f026365](https://github.com/erxes/erxes/commit/f026365fbb094a75a786e21cc214fdefbadc7713))
* loyalty-scores-list-bug ([a0eeeec](https://github.com/erxes/erxes/commit/a0eeeecbf33bdd3480bf354786aa9dcbffb32cbd))
* **loyalty:** loyalties change score fix and set score  ([#7774](https://github.com/erxes/erxes/issues/7774)) ([9a56765](https://github.com/erxes/erxes/commit/9a567651efed6a78e8934be8b360325d4b1ddb61))
* **loyalty:** Loyalty widget ([#7786](https://github.com/erxes/erxes/issues/7786)) ([af743b0](https://github.com/erxes/erxes/commit/af743b032ca25230a04849140b10f7292214953a))
* **mongolian:** ebarimt settings reverse tax rule with array ([#7800](https://github.com/erxes/erxes/issues/7800)) ([5d5a81d](https://github.com/erxes/erxes/commit/5d5a81dd8e004bdeb60b445d0cecfdfc397bf116))
* **mongolian:** syncerkhet config on posOrder improve ([fa721f4](https://github.com/erxes/erxes/commit/fa721f439490879d9bbbf6f3c80d0f02538f4aa4))
* **mongolian:** syncerkhet resync ([#7803](https://github.com/erxes/erxes/issues/7803)) ([be95c1a](https://github.com/erxes/erxes/commit/be95c1a41068b7a37fe246ac82c91ea8dec37f3f))
* posorder to loyalties score ([#7775](https://github.com/erxes/erxes/issues/7775)) ([e133071](https://github.com/erxes/erxes/commit/e13307104bde436d74c00554abd5ab3760812c1a))
* preserve userType when creating cpUsers ([b20ba5b](https://github.com/erxes/erxes/commit/b20ba5bee29819ee536f1de01b7b052a6cfbcffa))
* sales form editor debounce ([6d4c612](https://github.com/erxes/erxes/commit/6d4c612930d89673885e36539db6d1b47a1112dc))
* sales products changed then vibration ([66d92db](https://github.com/erxes/erxes/commit/66d92db33518caf672a500c21a9b28acd451db76))
* **sales:** add common search and go to settings ([7f31ccd](https://github.com/erxes/erxes/commit/7f31ccd694f8a3864cdd5c32238733cf9593a173))
* **sales:** deal detail productsData dont miss ([f159a97](https://github.com/erxes/erxes/commit/f159a97d784b503e0e319078cbadc2d93ce0484f))
* **sales:** deals filter with number ([5bddb08](https://github.com/erxes/erxes/commit/5bddb089a45c0fc893e0b4641ebeca858d993517))
* SalesFormField desc fix ([e2aa474](https://github.com/erxes/erxes/commit/e2aa47429494d392a323c09d37b7cbb9738d2867))
* **sales:** limit deal notifications to assigned users and remove duplicate notification creation ([#7778](https://github.com/erxes/erxes/issues/7778)) ([48a8363](https://github.com/erxes/erxes/commit/48a8363047d8e767d220f6e3666fdc9b9201a383))
* some trpc result and input improve ([#7765](https://github.com/erxes/erxes/issues/7765)) ([586e015](https://github.com/erxes/erxes/commit/586e0158d958e3823e0946fd13570b3a0b36f624))
* syncerkhet check deals filter by without board and pipeline ([e26f026](https://github.com/erxes/erxes/commit/e26f026f38ef4d83bf0b87ca9ba4972a2a6f4eb4))
* use username for company primaryName in client portal contact service ([434b706](https://github.com/erxes/erxes/commit/434b706e478b51e86616f099018f3f2cb15d29ca))


### Features

* add invoice relation widget for relation detail ([8ec2c58](https://github.com/erxes/erxes/commit/8ec2c582f8571d3dd82e611a8e61168095960db7))
* attachments & submission details view ([f7f69f9](https://github.com/erxes/erxes/commit/f7f69f97cf732806a77481ea18a02d529b0f9c27))
* **content:** add CMS menu reordering drag and drop ([ebe8137](https://github.com/erxes/erxes/commit/ebe813727639ded14990c43cc6bfd238601e9cd3))
* **content:** improve single CMS navigation ([#7771](https://github.com/erxes/erxes/issues/7771)) ([589169c](https://github.com/erxes/erxes/commit/589169cd6d14c19326b2d6e8064df8a8762a3b2b))
* **core-ui:** add parent/status filters and total count to product  ([#7768](https://github.com/erxes/erxes/issues/7768)) ([0fbaa73](https://github.com/erxes/erxes/commit/0fbaa73a3ffb67747920613acebccd70e888f3c3))
* **core:** add change state (lead ↔ customer) for customers ([#7790](https://github.com/erxes/erxes/issues/7790)) ([c87cc96](https://github.com/erxes/erxes/commit/c87cc9611cbd0e615a57db1ae0b0a7cc32ab90c2))
* **frontline:** ticket number/name config, pipeline attribution,migrations update ([4ee9291](https://github.com/erxes/erxes/commit/4ee92910aa63d605e2544a040ff4d2715bce1827))
* implement pdfattachments feature, fix cpInvoiceCreate ([25266ef](https://github.com/erxes/erxes/commit/25266ef7057be119d494950eabb88515cb4d186d))
* **operation:** add project relation widget and inbox notifications ([fe3750c](https://github.com/erxes/erxes/commit/fe3750c69837a01a8081183c6dfda592be114d52))
* **operation:** add project relation widget and inbox notifications  ([c2daae4](https://github.com/erxes/erxes/commit/c2daae4e334b13e7deb23b930ef08b8267c379a0))
* **sales:** add cpDealsEdit and cpDealsCreateProductsData ([660d5ce](https://github.com/erxes/erxes/commit/660d5ce38f25f46c2c06cb9e1c937af276a32797))

## [3.0.26](https://github.com/erxes/erxes/compare/3.0.25...3.0.26) (2026-05-22)


### Bug Fixes

* **loyalty:** pricing trpc without status ([#7755](https://github.com/erxes/erxes/issues/7755)) ([9234d59](https://github.com/erxes/erxes/commit/9234d5956191b672dc2d82f8e6087cf700910666))
* sales pipeline card enhancement ([#7754](https://github.com/erxes/erxes/issues/7754)) ([8ffcee5](https://github.com/erxes/erxes/commit/8ffcee51ef348e65ea957f22171951e3e0041a3a))
* scoreCampaign refactor and  products and productCategories trpc([#7757](https://github.com/erxes/erxes/issues/7757)) ([3f55f9c](https://github.com/erxes/erxes/commit/3f55f9cc75424f4f7f7f74609f09a0a565d6bdc9))
* syncerkhet first end ([#7748](https://github.com/erxes/erxes/issues/7748)) ([b93cdb8](https://github.com/erxes/erxes/commit/b93cdb8b0d3bcc0dfd049763a9e3eecf2c5d3d34))


### Features

* **content:** cms menu has types for web ([8eac54d](https://github.com/erxes/erxes/commit/8eac54d81c57b83c7f3a42b7c6d4bbf8bfc3f2eb))
* **payment:** add QR code generation  ([d3827af](https://github.com/erxes/erxes/commit/d3827af3ad9292b0d6fd9ebc12c218a1874965c2))
* **pos:** add QZ Tray printing and improve report receipts ([#7749](https://github.com/erxes/erxes/issues/7749)) ([d475479](https://github.com/erxes/erxes/commit/d47547969d2e6f62481eb325a8f9de231c710c56))

## [3.0.25](https://github.com/erxes/erxes/compare/3.0.24...3.0.25) (2026-05-21)


### Bug Fixes

* **accounting:** transaction status improve ([#7737](https://github.com/erxes/erxes/issues/7737)) ([af56792](https://github.com/erxes/erxes/commit/af567922f06e6f55d06b1ad7e913a6de2c4f1739))
* **content:** CMS tag and category pagination ([#7741](https://github.com/erxes/erxes/issues/7741)) ([b86aa27](https://github.com/erxes/erxes/commit/b86aa27fe71c3cbd72d753e564a5726e42d61bb5))
* **loyalty:** clean code on pricing ([#7733](https://github.com/erxes/erxes/issues/7733)) ([5f89038](https://github.com/erxes/erxes/commit/5f890381c023e213f21c76da0a01ea238f73f7b5))
* sessioncode on new tab new code ([#7739](https://github.com/erxes/erxes/issues/7739)) ([a104273](https://github.com/erxes/erxes/commit/a104273254d69abef0659be28891642a3a961d10))
* update product handling and improve product type display in sale and deal move from detail([#7740](https://github.com/erxes/erxes/issues/7740)) ([d084ef0](https://github.com/erxes/erxes/commit/d084ef059b815625358e8327fd1e2c1c24ee22ba))


### Features

* add bulk permission change ([c0bc83d](https://github.com/erxes/erxes/commit/c0bc83dbe5ca6593f3bc740ec616caf6b87dd539))
* add permission popup to invite members flow  ([c9000b5](https://github.com/erxes/erxes/commit/c9000b51574fe2b40fb01e5c2bd7d158d808abc1))
* **content:** cms category translation, fix tag translation and more ([#7727](https://github.com/erxes/erxes/issues/7727)) ([7af0aa1](https://github.com/erxes/erxes/commit/7af0aa18ee73f270b5fb5a1361a3f27f4ae24484))
* **frontline:** submissions & customer related fields ([#7747](https://github.com/erxes/erxes/issues/7747)) ([c6fd6a6](https://github.com/erxes/erxes/commit/c6fd6a6765901fc422296e737b98d365b0779ee8))
* **mongolian:** Add checkPermission to mongolian resolvers ,meta permissions, add event logging for ProductRule and ProductGroup models ([#7735](https://github.com/erxes/erxes/issues/7735)) ([ddeac80](https://github.com/erxes/erxes/commit/ddeac80d0986d34288cd4e6f808516f804264b22))

## [3.0.24](https://github.com/erxes/erxes/compare/3.0.23...3.0.24) (2026-05-19)


### Bug Fixes

* **accounting:** branch department is allow null ([#7731](https://github.com/erxes/erxes/issues/7731)) ([3308492](https://github.com/erxes/erxes/commit/330849236f22bb7516eea4cd2836b8424bcfc549))
* **accounting:** Document transaction print ([#7715](https://github.com/erxes/erxes/issues/7715)) ([173d395](https://github.com/erxes/erxes/commit/173d39527dc62725b30423fe4c550ffdca66eae6))
* **accounting:** improve ux by ptrInfo and subscription transaction ([#7711](https://github.com/erxes/erxes/issues/7711)) ([ecbea2c](https://github.com/erxes/erxes/commit/ecbea2cb927e533a4eef4eee0bebc976fe5b8cac))
* check gateway graphql proxy ([93d4b43](https://github.com/erxes/erxes/commit/93d4b434ca0c82628835faf7694fed31f65e9eec))
* **clientportal:** switch CallPro SMS to v1 JSON endpoint ([c5c60d4](https://github.com/erxes/erxes/commit/c5c60d46cfded5a747cfc11380a2577628d66b0f))
* company and customer chooser with a add event and some bugs ([#7713](https://github.com/erxes/erxes/issues/7713)) ([1683d08](https://github.com/erxes/erxes/commit/1683d083bc4cef5e5225eb440f9607ee38e8d417))
* cp remove ([#7723](https://github.com/erxes/erxes/issues/7723)) ([d9c98f5](https://github.com/erxes/erxes/commit/d9c98f5b04c161aae14dcc3249e55efb6555fd68))
* **frontline:** remove 16-character limit on ticket status name  ([efb1f02](https://github.com/erxes/erxes/commit/efb1f0268dca1aa2c7e93df38540cf8a605a73e5))
* gateway reconnect apollo router ([50f27e3](https://github.com/erxes/erxes/commit/50f27e3e80eb52728b4cb04eb598dc40956c7960))
* loyalty cp queries ([c16c2ba](https://github.com/erxes/erxes/commit/c16c2ba972a2dde89138fc93f805c12a652d994d))
* loyalty cp queries ([d72805d](https://github.com/erxes/erxes/commit/d72805d2b5fda21438ee26884d24e46bfa653237))
* loyalty cp queries ([922cb77](https://github.com/erxes/erxes/commit/922cb7773f10f023de39bc6a3bf9c49c8d949052))
* loyalty full cycle with sales ([#7712](https://github.com/erxes/erxes/issues/7712)) ([3eef375](https://github.com/erxes/erxes/commit/3eef37530c8693721652e4972ae02424a2230326))
* loyalty score logs paginate by cursor ([#7729](https://github.com/erxes/erxes/issues/7729)) ([84334f6](https://github.com/erxes/erxes/commit/84334f6ea8e0dff8e5bdfdc00c3e692e68768f0c))
* loyalty score with pagenate ([#7726](https://github.com/erxes/erxes/issues/7726)) ([0e61f97](https://github.com/erxes/erxes/commit/0e61f97676aa6f192d7f10d25de4bd9667463886))
* **loyalty:** improve, score ([#7724](https://github.com/erxes/erxes/issues/7724)) ([ac28bf3](https://github.com/erxes/erxes/commit/ac28bf3776ff84c8acec044e71b0d0ca7d51afc2))
* mongolian getconfig from mnconfigs and branch department default filter ([#7730](https://github.com/erxes/erxes/issues/7730)) ([1767be7](https://github.com/erxes/erxes/commit/1767be7a929af2aafd97a7a7b1b08f004dbd5619))
* resetpassword fix ([#7717](https://github.com/erxes/erxes/issues/7717)) ([0f9c030](https://github.com/erxes/erxes/commit/0f9c030fa7ce027bbdcb9dc3708a40defbca20fa))
* **sales:** add cpSalesCheckFreeTimes and fix cpSalesBoards pipelines and loyalty([#7707](https://github.com/erxes/erxes/issues/7707)) ([aa28679](https://github.com/erxes/erxes/commit/aa28679fdb072598e7c9158283a7d5ff6e1ca386))
* sync skip permission, and acctransactionByCOntent ([#7700](https://github.com/erxes/erxes/issues/7700)) ([2a6e778](https://github.com/erxes/erxes/commit/2a6e778940a8ed7296cb504bfd3b8beb04d65309))
* use active status for published score campaigns ([#7725](https://github.com/erxes/erxes/issues/7725)) ([d5f057c](https://github.com/erxes/erxes/commit/d5f057c53bd0765c9d9983cad43bfba78d3ed446))


### Features

* add checkPermission to all loyalty resolvers and define permiss ([#7622](https://github.com/erxes/erxes/issues/7622)) ([4b728af](https://github.com/erxes/erxes/commit/4b728af8036d7464ef16d571639507c7d2a48e6b))
* add cpGetRelationsByEntity query for client portal ([#7716](https://github.com/erxes/erxes/issues/7716)) ([54bbb58](https://github.com/erxes/erxes/commit/54bbb58aeefce1567c0b7e8dabfcd2b5dc90e445))
* add cpManageRelations mutation for client portal ([#7714](https://github.com/erxes/erxes/issues/7714)) ([0876bae](https://github.com/erxes/erxes/commit/0876bae4f9c6c5218a502fef1532cfcd4a16b1aa))
* add cpSalesBoardDetail query for client portal ([#7721](https://github.com/erxes/erxes/issues/7721)) ([af23d5d](https://github.com/erxes/erxes/commit/af23d5dbfe360e7c2a5ebee008d8cbe2fc5d6228))
* add cpShareScore mutation and cpDonateCampaigns query for client portal ([#7718](https://github.com/erxes/erxes/issues/7718)) ([49ed0e0](https://github.com/erxes/erxes/commit/49ed0e081226cfd79b29622107a19a356fcb6e48))
* add pos.create tRPC mutation with owner fallback ([0045d0c](https://github.com/erxes/erxes/commit/0045d0c6817c6c69d7b0d95ea4a9f637a7e933d2))
* **content:** cpCurrentOrder checks pos-user but dont need on cp ([#7720](https://github.com/erxes/erxes/issues/7720)) ([8f4c322](https://github.com/erxes/erxes/commit/8f4c3224330a2dde728f15db0c8e16bf345189b2))
* sync pos to client on trpc create and gate by ALLOW_OFFLINE_POS ([31eff65](https://github.com/erxes/erxes/commit/31eff655bbee9feb53aed7135be816fa7a1a5bda))

## [3.0.23](https://github.com/erxes/erxes/compare/3.0.22...3.0.23) (2026-05-18)


### Bug Fixes

* accounting sales plugins relations ([#7698](https://github.com/erxes/erxes/issues/7698)) ([96c18aa](https://github.com/erxes/erxes/commit/96c18aa6e457f0c0ec183f78b8ee595a5e3474ec))
* **accounting:** check perm on transactions ([#7699](https://github.com/erxes/erxes/issues/7699)) ([5ff3de9](https://github.com/erxes/erxes/commit/5ff3de954ba8b76e5d680a4dca935f46f6d549d7))
* **accounting:** transaction order by ptrNumber ([28bc9ba](https://github.com/erxes/erxes/commit/28bc9bad4c4bf4aefa3452a42881baa9cb29bf6e))
* **accounting:** transaction status other validations ([#7676](https://github.com/erxes/erxes/issues/7676)) ([7ba4aa6](https://github.com/erxes/erxes/commit/7ba4aa63ca1681c6f2835cd49363469ee7005fdc))
* ci ([f4768cd](https://github.com/erxes/erxes/commit/f4768cd9e03019ee433b4ac1482422b4e63347b6))
* gateway restart and not consumed core on gateway ([#7688](https://github.com/erxes/erxes/issues/7688)) ([0dc4afd](https://github.com/erxes/erxes/commit/0dc4afd92f02f7c7aee0ce0fce565b5b6ccaefdd))
* index of cms_categories ([e040d60](https://github.com/erxes/erxes/commit/e040d60c24ba2f823b9226eb6fe45002269d6518))
* **loyalty:** score campaign improve ([#7671](https://github.com/erxes/erxes/issues/7671)) ([2f06ead](https://github.com/erxes/erxes/commit/2f06eadce0e6c300ceff06aba459568d2c5bda84))
* products remainder synced on posclient and some clean ([#7697](https://github.com/erxes/erxes/issues/7697)) ([51fa973](https://github.com/erxes/erxes/commit/51fa973752b985a78948dbbd59e63fe14a551d99))
* sales and products some bugs ([#7696](https://github.com/erxes/erxes/issues/7696)) ([9f354af](https://github.com/erxes/erxes/commit/9f354af3a6174e5217daab1fb45e3ca67a586865))
* **sales:** add cpSalesPipelines GraphQL query schema ([#7694](https://github.com/erxes/erxes/issues/7694)) ([5988508](https://github.com/erxes/erxes/commit/5988508c9b56de83b4f3609f62212a6a07f27b61))
* **sales:** deal payment form with loyalty score ([#7684](https://github.com/erxes/erxes/issues/7684)) ([c8592bf](https://github.com/erxes/erxes/commit/c8592bf6171645616e01a70494ef28a9605698e2))
* **sales:** fix cpDeals crash when user is null in getItemList ([d66a559](https://github.com/erxes/erxes/commit/d66a5596ed95257e6ed3dedaf6324baf53f80b9c))
* **sales:** fix cpDeals crashing and skip internal user permission check for client portal ([870278b](https://github.com/erxes/erxes/commit/870278b52a1a2324f5672b542f8fda19136b5441))
* some customFieldsData to propertiesData ([#7685](https://github.com/erxes/erxes/issues/7685)) ([22525d4](https://github.com/erxes/erxes/commit/22525d4d382d54df96920ee1745c07fb6911294a))
* tour plugin category query ([f95e2e9](https://github.com/erxes/erxes/commit/f95e2e9ff41a6c0da2bafca075b1e18c8ba360b7))
* **tourism:** improve custom fields inputs and layout ([#7669](https://github.com/erxes/erxes/issues/7669)) ([c04701f](https://github.com/erxes/erxes/commit/c04701f39f646a49024fec91b859953461c69cf6))
* update Docker build platforms to only include linux/amd64 ([d011a79](https://github.com/erxes/erxes/commit/d011a792cca65120d7b4bef772119cb3ad6f47ca))
* update Docker build platforms to only include linux/amd64 ([2b8116a](https://github.com/erxes/erxes/commit/2b8116afe4998fd7b30f36151cf55ee7b6fd213d))
* update gateway continue from PR[#7688](https://github.com/erxes/erxes/issues/7688) ([d566752](https://github.com/erxes/erxes/commit/d5667521f7f0971814cef15c6b7c4068e268f862))


### Features

* **accounting:** Accounting permission front ([#7677](https://github.com/erxes/erxes/issues/7677)) ([6c9ae17](https://github.com/erxes/erxes/commit/6c9ae174750f7eb4fd39f4716c80e3703c1b2fb9))
* add beforeResolvers hook for plugins to mutate or reject resolver args ([#7660](https://github.com/erxes/erxes/issues/7660)) ([68809db](https://github.com/erxes/erxes/commit/68809dbcd70c436c66eb622bccf20537878b39a9))
* add clientPortal to checkOwnerScore, donatesMain, and scoreLogList queries ([#7686](https://github.com/erxes/erxes/issues/7686)) ([f513181](https://github.com/erxes/erxes/commit/f513181132d5fc26a86698964aa28ea7c045de23))
* add cms permissions  ([f980ca0](https://github.com/erxes/erxes/commit/f980ca0b0a3729203c75a4c1f773d2092cfaa50a))
* add cpSalesBoards and cpPricingPlans client portal queries ([#7678](https://github.com/erxes/erxes/issues/7678)) ([71137e3](https://github.com/erxes/erxes/commit/71137e3910052e7c23d3259bdd0b9a6aec12076c))
* add Kimi Coding integration and knowledge chunking functionality ([bc75f25](https://github.com/erxes/erxes/commit/bc75f2586fa41767af69d66373e523c589831444))
* add safe remainder bulk edit and import functionality ([#7644](https://github.com/erxes/erxes/issues/7644)) ([b437bc3](https://github.com/erxes/erxes/commit/b437bc3cc3ac03ccc34ba145fbd275a48def3b79))
* add scroll integration configuration ([c45cf4a](https://github.com/erxes/erxes/commit/c45cf4a2f53734b4fec659eb89e15304f511ccbf))
* gate customer widget write actions behind access prop ([b151163](https://github.com/erxes/erxes/commit/b1511633b3bdba6da5b2208fcf7132cd4f7580f1))
* refactor AI agent utilities and enhance connection secret management ([dfcfdcf](https://github.com/erxes/erxes/commit/dfcfdcf0e68ac50ebbb14150347ceaaf829c6e61))


### Reverts

* tourism turn off cron ([e721a33](https://github.com/erxes/erxes/commit/e721a33fce18dfb714b867c350d2eb7ec1488c93))

## [3.0.22](https://github.com/erxes/erxes/compare/3.0.21...3.0.22) (2026-05-13)


### Bug Fixes

* **accounting:** transaction status and ptrNumber ([#7658](https://github.com/erxes/erxes/issues/7658)) ([6b239ba](https://github.com/erxes/erxes/commit/6b239ba98f310e11b846d3632c4da5b8bb24e44e))
* **payment:** align paymentRemove mutation with schema using _ids ([#7668](https://github.com/erxes/erxes/issues/7668)) ([80c2463](https://github.com/erxes/erxes/commit/80c24634a48d6576370082a092d7d4d95309302f))


### Features

* **content:** settings page in cms ([#7614](https://github.com/erxes/erxes/issues/7614)) ([f6af24b](https://github.com/erxes/erxes/commit/f6af24bad252c38d377116d31ae21bbff4580c57))

## [3.0.21](https://github.com/erxes/erxes/compare/3.0.20...3.0.21) (2026-05-13)


### Bug Fixes

* **accounting:** products remainder filter ([#7633](https://github.com/erxes/erxes/issues/7633)) ([42d4f03](https://github.com/erxes/erxes/commit/42d4f034a3f3f3780769149f163647dfc95879c6))
* **accounting:** settings with sheet ([#7567](https://github.com/erxes/erxes/issues/7567)) ([0eae376](https://github.com/erxes/erxes/commit/0eae3764023b12557a7d64b5766853eb1eb36ce9))
* added index internalNote activityLog ([ecc068e](https://github.com/erxes/erxes/commit/ecc068e1593a2b5b3d3cb66eb8376937e69ae247))
* added products filter some fields ([#7634](https://github.com/erxes/erxes/issues/7634)) ([f21cd47](https://github.com/erxes/erxes/commit/f21cd479106160136ec32a4de449319f79c52bc9))
* check customer widget customerId ([b9d319d](https://github.com/erxes/erxes/commit/b9d319d94077a85f2c4aafab2639ca85052d9ab0))
* clean pos.type ([#7635](https://github.com/erxes/erxes/issues/7635)) ([4b362ea](https://github.com/erxes/erxes/commit/4b362ea02075280502367b73bcb028ac5b119ed8))
* **content:** custom field ui, add field drawer selector search ([#7612](https://github.com/erxes/erxes/issues/7612)) ([b215a23](https://github.com/erxes/erxes/commit/b215a23dd26be356ad2065c6a2026f3a6da0597f))
* **content:** custom fields mapping and file upload ([#7603](https://github.com/erxes/erxes/issues/7603)) ([19b3cbc](https://github.com/erxes/erxes/commit/19b3cbc5d1d71711af32c72222fe78418b66d6cc))
* ebarimt responded per opened tab and set sessioncode on core([#7650](https://github.com/erxes/erxes/issues/7650)) ([79f3753](https://github.com/erxes/erxes/commit/79f3753d696ba068d3a3b7533ee42ba8a05bbdb6))
* **frontline:** widgetsSaveLead crash and form query type errors  ([81881c0](https://github.com/erxes/erxes/commit/81881c0dbb2d59ab9a74872abdd53df37d5b0a26))
* get activity exchange rate from mongolina ([daf6371](https://github.com/erxes/erxes/commit/daf63710f53848c5163845bce2bc6ae143ac343e))
* import template file with unicode ([2578ece](https://github.com/erxes/erxes/commit/2578ececcb935aad0f4a7bc882710b243628247a))
* **mongolian:** Sync erkhet front settings enhancement ([#7582](https://github.com/erxes/erxes/issues/7582)) ([e955132](https://github.com/erxes/erxes/commit/e955132c824da483adb609ac098c0935ec694887))
* Pos order with afterProcesses to transaction ([#7610](https://github.com/erxes/erxes/issues/7610)) ([dc8ae5f](https://github.com/erxes/erxes/commit/dc8ae5f462c6eae7634fb0ece13f997647c91a55))
* **posclient:** improve pos and sales ([#7554](https://github.com/erxes/erxes/issues/7554)) ([c2079cf](https://github.com/erxes/erxes/commit/c2079cf667024cbdfd39fa194a87e423727a111d))
* reduced and optimized the backend Docker image size during build ([#7584](https://github.com/erxes/erxes/issues/7584)) ([1031010](https://github.com/erxes/erxes/commit/1031010c3c78dbe3e7a5b9300289c42373752741))
* sales pos order sync posclient ([#7608](https://github.com/erxes/erxes/issues/7608)) ([9163765](https://github.com/erxes/erxes/commit/9163765c3024b150f9bb6064a368887bfb104637))
* **sales:** extradata field added in deal query ([#7645](https://github.com/erxes/erxes/issues/7645)) ([8a4a3a4](https://github.com/erxes/erxes/commit/8a4a3a464463e3d710fa12293b86b8220e88cd6d))
* transaction to products inventories with costs ([#7613](https://github.com/erxes/erxes/issues/7613)) ([ce00dc9](https://github.com/erxes/erxes/commit/ce00dc98825c6562fb86de28cb740f8c51faac00))


### Features

* **accounting:** account permission with level read write ([#7609](https://github.com/erxes/erxes/issues/7609)) ([c35855f](https://github.com/erxes/erxes/commit/c35855fe75f9b13de46f8c415053085b9dc98c32))
* add AI provider connection support and enhance automation components ([#7648](https://github.com/erxes/erxes/issues/7648)) ([bd7b2a3](https://github.com/erxes/erxes/commit/bd7b2a3d2a4e7db5ae27c2e58d0f5fd6bdb81673))
* add client portal ticket status query ([1474ab8](https://github.com/erxes/erxes/commit/1474ab8aaaae96f4aaef124f6f30db8294d0bae9))
* add getConfigByToken tRPC query to posclient API ([d131d72](https://github.com/erxes/erxes/commit/d131d72e98e8d2da1df3610bc982a7ce582b1a7d))
* add Kimi and Grok agent connection interfaces and update AI agent connection type ([c1fb2a7](https://github.com/erxes/erxes/commit/c1fb2a7b41c65ea860b10b585ed47c8feb54a79e))
* add payment invoices find tRPC procedure ([e774bf3](https://github.com/erxes/erxes/commit/e774bf31fff07bcaf3e3d3273c80150cb6265d15))
* add permission checks to all POS resolvers and pos to meta/permission.ts ([#7585](https://github.com/erxes/erxes/issues/7585)) ([6f88b60](https://github.com/erxes/erxes/commit/6f88b60d0ced4a965818240f2ab5bf9f2521b288))
* add trpc product lookup by token to posclient ([4abdbad](https://github.com/erxes/erxes/commit/4abdbad8824bda5212b2503a13b1c4fbbfcbf6da))
* cms main fields, cms_menu ([#7611](https://github.com/erxes/erxes/issues/7611)) ([1a81e8c](https://github.com/erxes/erxes/commit/1a81e8c6846d3f77de3e42eb96d0c9916e34f868))
* **content:** add editor custom field in cms ([f68f38c](https://github.com/erxes/erxes/commit/f68f38caf5a047e174ca5a95c01baf82a2795f17))
* **content:** cms menu mapping  (page, category, post , post type, tag) ([#7604](https://github.com/erxes/erxes/issues/7604)) ([4ec3bac](https://github.com/erxes/erxes/commit/4ec3bac214f3c88c984339471bf68fb8b9fc9725))
* **content:** list order and category parent tree in selector ([28739c5](https://github.com/erxes/erxes/commit/28739c56b48bb2cadd79b9f0ea8428aff7655beb))
* edit tour with multi-date creates additional tours ([#7619](https://github.com/erxes/erxes/issues/7619)) ([d7c006f](https://github.com/erxes/erxes/commit/d7c006f27e76c941c996c5709037a9de7fdba197))
* expose saas organization bundle details ([d7d66ea](https://github.com/erxes/erxes/commit/d7d66ea1a1c52af425ae1a270072d25e08e9b801))
* **frontline:** add markResolvers and clean up inbox resolvers  ([603037d](https://github.com/erxes/erxes/commit/603037d59b6e68b4b0aa1ed770c6cabe1036423b))
* **payment:** implement cursor-based pagination for invoices ([1c7e834](https://github.com/erxes/erxes/commit/1c7e834d39a0f8da5b8f4e58a523299daa71e862))
* **tourism:** add tour crew assignments (leader/driver/guide) ([a79abbf](https://github.com/erxes/erxes/commit/a79abbf00330129ef585325706780e978e56a833))

## [3.0.20](https://github.com/erxes/erxes/compare/3.0.19...3.0.20) (2026-04-30)


### Bug Fixes

* **accounting:** products remainder recalc remainder params ([#7574](https://github.com/erxes/erxes/issues/7574)) ([4d98874](https://github.com/erxes/erxes/commit/4d98874cb701061cb7016c368f00273b0d9a200f))
* **accounting:** translate to only mongolia ([#7580](https://github.com/erxes/erxes/issues/7580)) ([7d5c53a](https://github.com/erxes/erxes/commit/7d5c53a8d24e68c3ec7031489a40be75ab9358ff))
* **frontline:** type and fix conversationProgress API and UI  ([60929bc](https://github.com/erxes/erxes/commit/60929bc6fcccb5041f1d4669d4c6e47ab01f5221))


### Features

* **accounting:** remainder detail ([#7576](https://github.com/erxes/erxes/issues/7576)) ([b5b316a](https://github.com/erxes/erxes/commit/b5b316a54f2cb04c0cc3f925bbbb5ab2f4461e25))

## [3.0.19](https://github.com/erxes/erxes/compare/3.0.18...3.0.19) (2026-04-30)


### Bug Fixes

* **accounting:** follow transaction state up and sub table hotkeys fix ([#7573](https://github.com/erxes/erxes/issues/7573)) ([1421729](https://github.com/erxes/erxes/commit/1421729b70421ab8984c0631c0636ac4791f6537))
* **accounting:** table hotkey ([df97a0a](https://github.com/erxes/erxes/commit/df97a0a8ca01734ffec00bb4e5d3d72c92c2f727))
* forms-widget css ([#7568](https://github.com/erxes/erxes/issues/7568)) ([f76c0cf](https://github.com/erxes/erxes/commit/f76c0cf53d0082275367764bfb661b6799b5b63d))
* **frontline:** fix createdBy null on widget ticket and internal message conversation mismatch  ([e56e0c9](https://github.com/erxes/erxes/commit/e56e0c9bb03267f456c2c766043eed2155a3f776))
* **frontline:** fix customer state incorrectly set to lead when creating messenger tickets  ([36d5812](https://github.com/erxes/erxes/commit/36d581273e93fc7c829c6ae009410b262f020f18))
* **frontline:** skip channel query when channelId is undefined and add fields to ConversationMemberProgress  ([73e9d76](https://github.com/erxes/erxes/commit/73e9d766ae354cd1a13e140aa5f141053649bc59))
* logic of customfieldsMap for content ([#7563](https://github.com/erxes/erxes/issues/7563)) ([4ba02bc](https://github.com/erxes/erxes/commit/4ba02bc4e7bf60d43b34773f669c45f4cbfa07ce))
* **loyalty:** clean up pricing rule and options ui ([#7561](https://github.com/erxes/erxes/issues/7561)) ([559d8e6](https://github.com/erxes/erxes/commit/559d8e6968cee4e30f0640514ee2b42de99e3e03))


### Features

* enhance products form on deal, and some improve([#7558](https://github.com/erxes/erxes/issues/7558)) ([fa22b22](https://github.com/erxes/erxes/commit/fa22b2226e80bf14fe53744ab25301e2c78b2bce))

## [3.0.18](https://github.com/erxes/erxes/compare/3.0.17...3.0.18) (2026-04-28)


### Bug Fixes

* **loyalty:** go to settings and action ([#7562](https://github.com/erxes/erxes/issues/7562)) ([d1c9899](https://github.com/erxes/erxes/commit/d1c9899006c025a9a90a6e0ba945ec4407015582))
* **mongolin:** product-places-ui-enhancement ([#7539](https://github.com/erxes/erxes/issues/7539)) ([5641427](https://github.com/erxes/erxes/commit/5641427782559f5ee7113b1489fe3f14d8f1a123))


### Reverts

* revert tags logic ([5567dd9](https://github.com/erxes/erxes/commit/5567dd9795ea9ebc4733f2771fd6034ab74b003f))
* tags ui ([eb66ca3](https://github.com/erxes/erxes/commit/eb66ca31a45e04f5ea2f0510cb9bc287b3dccb5e))

## [3.0.17](https://github.com/erxes/erxes/compare/3.0.16...3.0.17) (2026-04-27)


### Bug Fixes

*  imap saas  ([5d11c00](https://github.com/erxes/erxes/commit/5d11c00cac86c257a77b5c6cdee5532adbf54177))
* **accounting:** transaction table-actions ([#7157](https://github.com/erxes/erxes/issues/7157)) ([e77bddb](https://github.com/erxes/erxes/commit/e77bddb26e18624ac4b75f1afc39e3ba5e89b6c5))
* **core-api:** guard entityType against type confusion in download-template ([#7499](https://github.com/erxes/erxes/issues/7499)) ([8aa4689](https://github.com/erxes/erxes/commit/8aa468957ad634bb64c3044aad72f92d5a64d598))
* **frontline-widgets:** defer embed form iframe creation until placeholder is ready ([#7538](https://github.com/erxes/erxes/issues/7538)) ([66b299c](https://github.com/erxes/erxes/commit/66b299c1e5745488850e96e0c86ca4ece5786dd2))
* **frontline-widgets:** improve form embed initialization ([19c8eda](https://github.com/erxes/erxes/commit/19c8eda7dcdeac1bbe4011aa9d3cc9901a0861b5))
* **gateway:** add generous global rate limit ([#7465](https://github.com/erxes/erxes/issues/7465)) ([1f65f16](https://github.com/erxes/erxes/commit/1f65f16af6f2c1dcb5a56a6698cd9f7b17fc85ae))
* **logging:** add console logs for debugging in afterProcess handlers ([a4246f8](https://github.com/erxes/erxes/commit/a4246f8447a3d7216250e4b82162072ca139465e))
* **mongolian:** define ProductPlacesResponse type for productPlacesResponded ([#7552](https://github.com/erxes/erxes/issues/7552)) ([1b7aad5](https://github.com/erxes/erxes/commit/1b7aad5ee38b0df270e4b63770297497cf9e6060))
* **mongolian:** fix ebarimt ([#7521](https://github.com/erxes/erxes/issues/7521)) ([e559e89](https://github.com/erxes/erxes/commit/e559e8995c804523d845da61fe246760c1b97b01))
* **product:** display all selected scope brands  ([d37534b](https://github.com/erxes/erxes/commit/d37534b0bb81e4673231f1b98ec5ba38e5f713cb))
* **sales:** empty table bug after editing cell in ProductsTable in Sales/Deal ([#7540](https://github.com/erxes/erxes/issues/7540)) ([3c23e41](https://github.com/erxes/erxes/commit/3c23e41b27b215dcc7db241754ea9278184e1f24))
* **sales:** enhance drag-and-drop functionality with custom collision detection ([#7502](https://github.com/erxes/erxes/issues/7502)) ([e66a86e](https://github.com/erxes/erxes/commit/e66a86e401bcfff18fc5c9a46e3405d98e3131c4))
* **sales:** pos config resolve slots detail double scroll and improve slot creation ([#7543](https://github.com/erxes/erxes/issues/7543)) ([80cc4c6](https://github.com/erxes/erxes/commit/80cc4c60fa77113a172dff26eebdcb169e72b778))
* **tour:** update itinerary selection ([#7524](https://github.com/erxes/erxes/issues/7524)) ([3b29cef](https://github.com/erxes/erxes/commit/3b29cefe27b4100abc9a72499aa8e6b06ed91f52))


### Features

* **accounting:** import transactions ([#7542](https://github.com/erxes/erxes/issues/7542)) ([4b1f448](https://github.com/erxes/erxes/commit/4b1f448b3f43136f4d06f1b040b354b3a645d55f))
* add cp mutations on cms  ([246559b](https://github.com/erxes/erxes/commit/246559b9171af157b0c817fe4932d0043f472680))
* add cp queries on BMSitinerary ([#7526](https://github.com/erxes/erxes/issues/7526)) ([694811f](https://github.com/erxes/erxes/commit/694811f2154560cafdcea86f99667bdacdb0dd18))
* add cpDetail  ([e851b55](https://github.com/erxes/erxes/commit/e851b5514a44ec9cc5648c946da54220caf1d721))
* add cppost count argument ([#7553](https://github.com/erxes/erxes/issues/7553)) ([9f4aee6](https://github.com/erxes/erxes/commit/9f4aee618c06d79bc46285ae753e3908db93e5b6))
* expand conversation date filtering to include updatedAt ([72bfa00](https://github.com/erxes/erxes/commit/72bfa00b786309d72eb5634bede6a124eefe8ec0))
* frontline  imap ([e1a27e6](https://github.com/erxes/erxes/commit/e1a27e6a4afa3ce12af1bb136884462824c07ed1))
* frontline  imap ([3e1b41f](https://github.com/erxes/erxes/commit/3e1b41ffce7de8e432d9dce9cb74898757246510))
* frontline imap saas ([56faf41](https://github.com/erxes/erxes/commit/56faf41edb7b112014d0a6430f4bbb24ff89afcd))
* frontline imap saas ([84453f8](https://github.com/erxes/erxes/commit/84453f88745afc2792d2dd760b1d9a01589fb4a1))
* frontline instagram ([b0df872](https://github.com/erxes/erxes/commit/b0df87244e6a718fe3c6ec9d3bba0be9594701b5))
* **frontline:** integrate Instagram API for messaging ([54fbc93](https://github.com/erxes/erxes/commit/54fbc93fc736026c0fd730d845ae754c85fad01f))
* navigate to create brand sheet when brand search is empty and fix status name ([#7520](https://github.com/erxes/erxes/issues/7520)) ([613f7fc](https://github.com/erxes/erxes/commit/613f7fcc1f96b6a060a4e7725bf1218b955e0519))
* **pos:** refactor pos(settings) module ([6af4174](https://github.com/erxes/erxes/commit/6af4174e74901a202e2adde0a4492942a7d85105))
* translation of cms(category,tag,menu), cronjob for tour ([a88579b](https://github.com/erxes/erxes/commit/a88579b36adf5f20e9f33fd0499089d3a5935f1a))

## [3.0.16](https://github.com/erxes/erxes/compare/3.0.15...3.0.16) (2026-04-21)


### Bug Fixes

* **accounting:** account category import ([#7501](https://github.com/erxes/erxes/issues/7501)) ([d57ac90](https://github.com/erxes/erxes/commit/d57ac907a0f77342f0665c22dbaa777b02177672))
* add missing dependencies installation in Dockerfile for runtime stage ([6a62f30](https://github.com/erxes/erxes/commit/6a62f3005bb46489843d3322c27de05ce39c1c2e))
* disable hotkeys on form tags by default ([#7478](https://github.com/erxes/erxes/issues/7478)) ([dd5cb6f](https://github.com/erxes/erxes/commit/dd5cb6fe1b7a9a93b7ab05556471b9cf404257be))
* form widget ([c8377b9](https://github.com/erxes/erxes/commit/c8377b9db3aaab11144741c879bc21ea7173497c))
* make models property optional in IMainContext interface ([c4acd30](https://github.com/erxes/erxes/commit/c4acd302a469574203e6d63e9f9264f0b2db57d1))
* pms room queries to use a single date range and return rooms overlapping that range ([#7519](https://github.com/erxes/erxes/issues/7519)) ([8d86470](https://github.com/erxes/erxes/commit/8d864707a279b8ed8f72cb09c7ad16630fbfcb44))
* specify type for orderQueries to enhance type safety ([360c83d](https://github.com/erxes/erxes/commit/360c83d937943d103051ce96aa779be1f429d165))


### Features

* **accounting:** import accounts and some fix upload and read file([#7491](https://github.com/erxes/erxes/issues/7491)) ([a453c5c](https://github.com/erxes/erxes/commit/a453c5cb0c01251df13f837468ed6114138f1830))
* add cpPageList query  ([14f4168](https://github.com/erxes/erxes/commit/14f41689b371a5614f6138bcd62af632161123f6))
* hide verify button and disable email validation status based on version ([#7504](https://github.com/erxes/erxes/issues/7504)) ([a4c852f](https://github.com/erxes/erxes/commit/a4c852f52a0d42939da1905d35c61e360dad8dbd))
* imap conversation ([d31fa35](https://github.com/erxes/erxes/commit/d31fa350bfc0a78a5666ff24949993ed60da36a9))
* implements pos order item export support and refines multiple pos-related UIs ([#7486](https://github.com/erxes/erxes/issues/7486)) ([1547427](https://github.com/erxes/erxes/commit/15474275348302c0567106f7bb224e77411f10c2))
* show paymentTypes in erkhet config with account mapping ([#7495](https://github.com/erxes/erxes/issues/7495)) ([a1d6bd6](https://github.com/erxes/erxes/commit/a1d6bd6087d854a8b9cacfb7e7bf7852f2cc0ab6))
* **tourism:** add amenity-specific icon picker matching base design  ([0d98a75](https://github.com/erxes/erxes/commit/0d98a753a29adde6f0693e4582ffa9653aa0cdc1))
* **tour:** support adult/child/infant pricing per package ([b90e952](https://github.com/erxes/erxes/commit/b90e95273435c31d38e3d1a6d09bc0ede85ee73e))
* update resolver types to include IContext and refactor AI agent components ([3fad7a0](https://github.com/erxes/erxes/commit/3fad7a0dd02a21c821d9af5b4c478350bfb172fe))



## [3.0.15](https://github.com/erxes/erxes/compare/3.0.14...3.0.15) (2026-04-19)


### Bug Fixes

* build error ([688ff89](https://github.com/erxes/erxes/commit/688ff89088b7c1abd9c80150cfb714088d2b3f87))
* **content:** category list by alphabetical order ([#7494](https://github.com/erxes/erxes/issues/7494)) ([6c33c78](https://github.com/erxes/erxes/commit/6c33c789403424ea7a45b502e3b78ea62a8fbd4c))
* frontline forms ([#7471](https://github.com/erxes/erxes/issues/7471)) ([f21cb87](https://github.com/erxes/erxes/commit/f21cb87e2b30aa1f71875ca77bb3bfc0c74b81d5))
* **frontline:** add propertiesData argument to updateTicket mutation ([6a5a6e8](https://github.com/erxes/erxes/commit/6a5a6e8cc2edd5bd88d2875edd50b3f081491943))
* **loyalty:** loyalties-change-query ([#7469](https://github.com/erxes/erxes/issues/7469)) ([39bda14](https://github.com/erxes/erxes/commit/39bda145a680ff2a0a806afce6d02bef63d83811))
* **pdf:** downgrade react-pdf to stable version ([#7475](https://github.com/erxes/erxes/issues/7475)) ([3c9a89c](https://github.com/erxes/erxes/commit/3c9a89c986bb1c85621aff3d5274ba94ab7b624f))
* **pos:** fix build error by syncing radix ui dependencies ([#7482](https://github.com/erxes/erxes/issues/7482)) ([7a1d1fd](https://github.com/erxes/erxes/commit/7a1d1fd62da1dd1cecb839b1ca77593eae8b2d70))
* products sync to posclient ([#7497](https://github.com/erxes/erxes/issues/7497)) ([453f9ae](https://github.com/erxes/erxes/commit/453f9ae42c710d24afc6d9da9ab5e619fee2286d))
* **tourism:** improve grouped tour display and add quick add action  ([4373a09](https://github.com/erxes/erxes/commit/4373a09a52aa89bb7e459ecbad40857d6b51a894))
* update @react-pdf/renderer to 4.3.2 ([6ce740c](https://github.com/erxes/erxes/commit/6ce740c3326ccb55ab52d7b9329dcfea3ce7b1ee))
* update pnpm-lock.yml ([bbe844e](https://github.com/erxes/erxes/commit/bbe844e059c0da4e4d5ca16e7fc5d815289fac14))


### Features

* add a client-portal tour categories GraphQL query that supports optional filtering and language-aware translations. ([#7489](https://github.com/erxes/erxes/issues/7489)) ([18459a0](https://github.com/erxes/erxes/commit/18459a00a82dcf772a02678bdf02b5329614c5a9))
* improve properties empty state and extend columns in org tables ([#7492](https://github.com/erxes/erxes/issues/7492)) ([da97631](https://github.com/erxes/erxes/commit/da97631a7d4ede3a72434de0eacc207cb6b3d8db))
* **pos:** implement new features in pos 3.0 ([#7477](https://github.com/erxes/erxes/issues/7477)) ([3c24790](https://github.com/erxes/erxes/commit/3c24790ff58fa69694870b422770ea089fe58be1))
* refactor import/export flow and add OAuth client management ([#7498](https://github.com/erxes/erxes/issues/7498)) ([c146aaa](https://github.com/erxes/erxes/commit/c146aaaa578bc7934ba5410c209223cd34050f5a))
* **tourism:** enable tour and itinerary pdf section and label customization  ([3d51ced](https://github.com/erxes/erxes/commit/3d51ced0eff4bc0d913187933e5c655d267ffec3))

## [3.0.14](https://github.com/erxes/erxes/compare/3.0.13...3.0.14) (2026-04-14)


### Bug Fixes

* **accounting:** tr side, details with branch department and manage relAccounts ([#7458](https://github.com/erxes/erxes/issues/7458)) ([6d8f9e9](https://github.com/erxes/erxes/commit/6d8f9e96aff7d1ee67784dd5135d5e54ca800ada))
* **content-ui:** harden html text extraction in post submission ([#7463](https://github.com/erxes/erxes/issues/7463)) ([72dab53](https://github.com/erxes/erxes/commit/72dab53bf286496c45146db9f3f4b6f9c99ed14c))
* improve email broadcasting batching, tracing, and attachment URL handling ([829bd9a](https://github.com/erxes/erxes/commit/829bd9ab6ef883fc1922e8b9de4094d34806ac82))
* missing authorization on multiple mutations ([#7240](https://github.com/erxes/erxes/issues/7240)) ([e817366](https://github.com/erxes/erxes/commit/e817366aecc2944512c86dac4112d6701cac9d48)), closes [#7032](https://github.com/erxes/erxes/issues/7032)
* **payment:** remove clear-text logging of sensitive data in Toki API ([#7452](https://github.com/erxes/erxes/issues/7452)) ([3dbc493](https://github.com/erxes/erxes/commit/3dbc493e2d6520958e499c3721e4dcfa122b196c)), closes [#1062](https://github.com/erxes/erxes/issues/1062) [#7365](https://github.com/erxes/erxes/issues/7365) [#7365](https://github.com/erxes/erxes/issues/7365)
* replace eval() with safe arithmetic parser in score campaign ([#7242](https://github.com/erxes/erxes/issues/7242)) ([3dcc78d](https://github.com/erxes/erxes/commit/3dcc78ded995717bfca4d9cd2dfdef156819adb4)), closes [#6968](https://github.com/erxes/erxes/issues/6968)
* sanitize Facebook conversation inputs to prevent NoSQL injection ([#7456](https://github.com/erxes/erxes/issues/7456)) ([e4b2777](https://github.com/erxes/erxes/commit/e4b2777252024e32ba4743f6ff91f7bfef687666)), closes [#1175](https://github.com/erxes/erxes/issues/1175)
* Security Fix (XSS) and Refactoring for Content CMS - Alert 1151 ([#7461](https://github.com/erxes/erxes/issues/7461)) ([8292ec5](https://github.com/erxes/erxes/commit/8292ec5ab45d301c8b9b37f7508513f762dbdbd8))
* SSRF in Facebook integration uploadMedia ([#7376](https://github.com/erxes/erxes/issues/7376)) ([2d7eac4](https://github.com/erxes/erxes/commit/2d7eac4c0a8f4aab747a33e7514ff8f37f6e8b5c)), closes [#1012](https://github.com/erxes/erxes/issues/1012)
* streamline UI components with improved layout, scrolling, and toast notifications ([9381344](https://github.com/erxes/erxes/commit/9381344a43dbda091570e10e8dfef7c84de9663c))


### Features

* **accounting:** transaction with documents at bank ([#6852](https://github.com/erxes/erxes/issues/6852)) ([ec574d3](https://github.com/erxes/erxes/commit/ec574d3f29ffccf7e36f8cb35626c3d0e7e16329))
* add broadcast traces logging ([#7464](https://github.com/erxes/erxes/issues/7464)) ([110ea1d](https://github.com/erxes/erxes/commit/110ea1da0c066d6713dddb25361f619b0b8b40bc))
* add score field and FieldPhone component with inline editing support ([3bea49c](https://github.com/erxes/erxes/commit/3bea49c3272a08e2180275c306ad4c29666a0857))
* Document update ([#7285](https://github.com/erxes/erxes/issues/7285)) ([53c96be](https://github.com/erxes/erxes/commit/53c96beaea4d3efcce6ee7bf7971d10cdd326eda))
* enhance automation UI with internationalization support ([fbbc25f](https://github.com/erxes/erxes/commit/fbbc25f1a9c90ce26f3ef60351622acf2b54158c))
* **pos:** tax flag, table refresh, print fixes ([#7323](https://github.com/erxes/erxes/issues/7323)) ([3282faf](https://github.com/erxes/erxes/commit/3282faf500e06b11a3b64783df335d35ee070431))
* rename sales queries for consistency and clarity ([c0ba511](https://github.com/erxes/erxes/commit/c0ba5119342615df27d822a67774c60242bddd69))



## [3.0.13](https://github.com/erxes/erxes/compare/3.0.12...3.0.13) (2026-04-13)


### Bug Fixes

* cp user searchText bug and broadcast tag group select ([#7446](https://github.com/erxes/erxes/issues/7446)) ([5a01386](https://github.com/erxes/erxes/commit/5a01386352a3dba33c497be1fe9c59a5a7330c23))
* improve broadcast subdomain handling in email utilities ([0849ede](https://github.com/erxes/erxes/commit/0849ede93a5379883a19572c80000aaba913abeb))
* simplify Checkbox onCheckedChange handling in MessageTriggerConditionCard ([73adec3](https://github.com/erxes/erxes/commit/73adec3f813298066e08eb1762440fb76a2195f1))

## [3.0.12](https://github.com/erxes/erxes/compare/3.0.11...3.0.12) (2026-04-12)


### Bug Fixes

* account edit and ebarimt sidebar improve ([#7447](https://github.com/erxes/erxes/issues/7447)) ([12def55](https://github.com/erxes/erxes/commit/12def55b74f6f9a7e6e0d6a759597c07db110fa0))
* **accounting:** account edit from ([3d3b45a](https://github.com/erxes/erxes/commit/3d3b45a9e2dcb14bc0bdc3c75dad22dab2447096))
* **activity-logs:** stop redundant refetching on scroll ([#7445](https://github.com/erxes/erxes/issues/7445)) ([0d2800d](https://github.com/erxes/erxes/commit/0d2800d8845de803eaf1877246b990adf86cd824))
* add error handling for Cloudflare Images upload ([18f670d](https://github.com/erxes/erxes/commit/18f670dc032f9d68977132f14a858636c2cd4203))
* call cookie related issues ([25cf054](https://github.com/erxes/erxes/commit/25cf054daa4219c0101e26d4a541862bfa294971))
* enhance error handling in file upload and reading processes ([ac7cfb0](https://github.com/erxes/erxes/commit/ac7cfb05b73dbefc638ce8caef7a9cd7806d61b2))
* improve error handling for Cloudflare Images upload ([fae0ebb](https://github.com/erxes/erxes/commit/fae0ebb871a11bab4d3776be98954b48fc97a801))
* improve loyalty ([#7451](https://github.com/erxes/erxes/issues/7451)) ([3463884](https://github.com/erxes/erxes/commit/3463884415da853865b28f61ff68ce61e7f33e3a))
* improve nullable field handling, assignee notifications, and batch user status updates ([7551118](https://github.com/erxes/erxes/commit/75511184eabe102eecf5027265947325e309845b))
* improve Product places  ([#7035](https://github.com/erxes/erxes/issues/7035)) ([20654b2](https://github.com/erxes/erxes/commit/20654b26226ac5fdbcda5e56602f2bdb57aa601b))
* normalize broadcast config keys and config update flow ([2e9985c](https://github.com/erxes/erxes/commit/2e9985c8ad180eea25072323d6a0ecfae49b4dc2))


### Features

* **accounting:** census detail with keyboard shortcut ([#7385](https://github.com/erxes/erxes/issues/7385)) ([e19988f](https://github.com/erxes/erxes/commit/e19988f9813b25f548944ee31b5dd22183492d47))
* add broadcast trace logging for email worker ([a8caf82](https://github.com/erxes/erxes/commit/a8caf824bc4cfda62f8c9123b62acc8ae5de83a1))
* Added field logic and required attributes in detail, chore: minor ux improvements ([cf193f3](https://github.com/erxes/erxes/commit/cf193f36d38ccc4df76230fb2009d700ae0cc1ab))
* **automations:** enhance builder UX, AI agent tooling, and core actions ([#7441](https://github.com/erxes/erxes/issues/7441)) ([ff28842](https://github.com/erxes/erxes/commit/ff28842074422a7c5dae6f0f27ff0101f451a853))
* cms posts view and reaction  ([17e7436](https://github.com/erxes/erxes/commit/17e7436632f0c45afc7cef1a2c21207cb45ec257))
* implement applyTrustProxy in multiple services and utilities ([d9040a2](https://github.com/erxes/erxes/commit/d9040a2b2512b3bcd3191b766298259660b28d45))
* **tms:** add additional improvements and enhancements ([#7399](https://github.com/erxes/erxes/issues/7399)) ([cc452d1](https://github.com/erxes/erxes/commit/cc452d17283fa21cdb54091d61af7646481830b1))
* **tourism:** improve tour and itinerary pdf generation ([#7423](https://github.com/erxes/erxes/issues/7423)) ([e943256](https://github.com/erxes/erxes/commit/e9432563f9be03470e129f153f8de519dab3d2fe))

## [3.0.11](https://github.com/erxes/erxes/compare/3.0.10...3.0.11) (2026-04-08)


### Bug Fixes

* accounting return deal and some refactors ([#7398](https://github.com/erxes/erxes/issues/7398)) ([7d93f82](https://github.com/erxes/erxes/commit/7d93f82a1dbfd7b2454d04df8883bf9d6aa9eaed))
* **core-api:** sanitize chunkIndex and uploadId in chunked upload to prevent path traversal ([#7364](https://github.com/erxes/erxes/issues/7364)) ([37e0bc4](https://github.com/erxes/erxes/commit/37e0bc41a80b38d6a54b093995f31322479ea04a)), closes [#1063](https://github.com/erxes/erxes/issues/1063) [#1072](https://github.com/erxes/erxes/issues/1072)
* **core-api:** use escapeRegExp before applying wildcard replacements in product similarities ([#7366](https://github.com/erxes/erxes/issues/7366)) ([539842c](https://github.com/erxes/erxes/commit/539842cbeca3b90970ec33494722dff563b62fde))


### Features

* **accounting:** inventory sale return transaction ([#7388](https://github.com/erxes/erxes/issues/7388)) ([407bed8](https://github.com/erxes/erxes/commit/407bed8c780b42625ad03517c80ed848d99af1d8))
* add cms url options, cp categories fix, bmtoursgroup, bmtoursgr ([4f40020](https://github.com/erxes/erxes/commit/4f400208b375b0fb8f88ed56375ff7522b94061d))
* add cpProductDetail client portal product query ([2bebb20](https://github.com/erxes/erxes/commit/2bebb208f16cf79c04564124b32eb85b52ac2526))
* add properties ([cc372d0](https://github.com/erxes/erxes/commit/cc372d075bb86759ea6e22c9fa8ae8d63a956b9a))
* add translations for tourism ui tms ([#7392](https://github.com/erxes/erxes/issues/7392)) ([03b64a7](https://github.com/erxes/erxes/commit/03b64a70980f3acc3dba04b562756930f416c0c3))
* add travel insurance, regions, tiered pricing & multi-traveler support ([#7375](https://github.com/erxes/erxes/issues/7375)) ([1e73ef9](https://github.com/erxes/erxes/commit/1e73ef987e698acef8ca59f1d78e7249ad15e9ed))
* add webbuilder logs  ([b31bbba](https://github.com/erxes/erxes/commit/b31bbba4f4fac96b62077a2ed20d4cd935f358ef))
* **sales:** add posItems export  ([#7316](https://github.com/erxes/erxes/issues/7316)) ([7b2168e](https://github.com/erxes/erxes/commit/7b2168eb6518d02d3c931f866d791d8bdbb1863d))

## [3.0.10](https://github.com/erxes/erxes/compare/3.0.9...3.0.10) (2026-04-03)


### Bug Fixes

* **accounting:** improve remainders ([#7379](https://github.com/erxes/erxes/issues/7379)) ([3c73f18](https://github.com/erxes/erxes/commit/3c73f184a798edcfe55e45abc2fbbd4cc0dc465d))
* **posclient:** clean graphql ([1ab47da](https://github.com/erxes/erxes/commit/1ab47dada0920491dc4ee9cd2a71f306fb14556c))


### Features

* add custom field in page and cat, remove audio and video field … ([#7358](https://github.com/erxes/erxes/issues/7358)) ([9d600d3](https://github.com/erxes/erxes/commit/9d600d369de997bf02ecf9c5540f46f7da693388))
* add per-module access control to relation widget side tabs ([0700e3d](https://github.com/erxes/erxes/commit/0700e3de89a9021d3e2529a1cbe771540c05f8f2))
* implement translation support for amenities and elements ([#7378](https://github.com/erxes/erxes/issues/7378)) ([e1c10c9](https://github.com/erxes/erxes/commit/e1c10c9b018a9b65328d6dbba571f87ae645af8c))
* **payment:** introduce toki as payment option ([#7363](https://github.com/erxes/erxes/issues/7363)) ([0bec208](https://github.com/erxes/erxes/commit/0bec208d3af6d183213aa12b8f58ce1c5ecc1ad5))
* **sales:** add checkDiscount query in 3.0 with loyalties integration ([#7368](https://github.com/erxes/erxes/issues/7368)) ([cce538c](https://github.com/erxes/erxes/commit/cce538c2905de1f02b64a69a98396945132087b6))

## [3.0.9](https://github.com/erxes/erxes/compare/3.0.8...3.0.9) (2026-04-01)


### Bug Fixes

* **accounting:** census bug, syncdeal config ([#7353](https://github.com/erxes/erxes/issues/7353)) ([abfc64e](https://github.com/erxes/erxes/commit/abfc64e0a4be13005dab69cce26a908bc6d21185))
* **core-ui:** truncate permission group text ([#7361](https://github.com/erxes/erxes/issues/7361)) ([08a3684](https://github.com/erxes/erxes/commit/08a3684379baea6c8efee07ff226082120d756bb))
* fix duplicated import ([d5f53e5](https://github.com/erxes/erxes/commit/d5f53e5f811286611bac09b0f6917304d1ada1bf))
* **posclient:** pos choose config is public ([1963dc1](https://github.com/erxes/erxes/commit/1963dc1da3eeceed8183e889e15f09ed801805da))
* products remainder improve ([#7344](https://github.com/erxes/erxes/issues/7344)) ([aa94f10](https://github.com/erxes/erxes/commit/aa94f10bfdc8db7818e8776930c993559e086587))
* remove activity header ([7dbb2ee](https://github.com/erxes/erxes/commit/7dbb2ee723e4a17a685886d860c0e2078f4d1564))
* sonar resolve frontend/module/logs ([#7341](https://github.com/erxes/erxes/issues/7341)) ([6c9f4b7](https://github.com/erxes/erxes/commit/6c9f4b761475748855ee7ff1f5600c05adc809a2))


### Features

* add branchId to tour categories ([#7346](https://github.com/erxes/erxes/issues/7346)) ([572e0d0](https://github.com/erxes/erxes/commit/572e0d0dc3fbafaa5ac1b42d36e951840a48b3ae))
* add logging for collectionType in checkCustomTrigger ([22c12bf](https://github.com/erxes/erxes/commit/22c12bf1f160a0911ea775cc09817eede2804019))
* **core-ui:** guard core actions with can ([485a44d](https://github.com/erxes/erxes/commit/485a44d6a1ac61d8686e722a7224d12378770a14))
* implement Facebook bot health notification system and update notification types ([#7349](https://github.com/erxes/erxes/issues/7349)) ([90c8410](https://github.com/erxes/erxes/commit/90c84107fcf9597145a0bd57abc8b38af9a0a484))
* **logs:** enhance log detail view and add new filters ([#7357](https://github.com/erxes/erxes/issues/7357)) ([918916d](https://github.com/erxes/erxes/commit/918916d0432b29b4b00818d4772b61515892ab01))
* **tms:** improve tourism components and layout ([#7350](https://github.com/erxes/erxes/issues/7350)) ([4f9cd48](https://github.com/erxes/erxes/commit/4f9cd489434d9c1db5ccbc1348062a121fc13e70))
* update checkCustomTrigger to log arguments and return false ([4c42eb1](https://github.com/erxes/erxes/commit/4c42eb196f337da0580b42a73801ea62c328df56))


### Performance Improvements

* remove activity from contact overview ([de25831](https://github.com/erxes/erxes/commit/de258317124d47d5953a063baa79e869191a9ead))



## [3.0.8](https://github.com/erxes/erxes/compare/3.0.7...3.0.8) (2026-03-30)


### Bug Fixes

* posProducts pagination bug ([#7200](https://github.com/erxes/erxes/issues/7200)) ([47c8a0e](https://github.com/erxes/erxes/commit/47c8a0ee00b024c2617333dd574ab2de420789c2))


### Features

* implement health check and verification for Facebook bots ([#7339](https://github.com/erxes/erxes/issues/7339)) ([b92d558](https://github.com/erxes/erxes/commit/b92d5584d71cfa815b70699bc4ca272d94585a66))

## [3.0.7](https://github.com/erxes/erxes/compare/3.0.6...3.0.7) (2026-03-30)


### Bug Fixes

* census detail improvement ([#7329](https://github.com/erxes/erxes/issues/7329)) ([87ce0e9](https://github.com/erxes/erxes/commit/87ce0e9f10ad17fd3eb7a776248009c5ee0c8c27))
* resolve pdf image not displaying issue ([#7324](https://github.com/erxes/erxes/issues/7324)) ([87edaec](https://github.com/erxes/erxes/commit/87edaeca6950ee4776f1ddae094059d86f0e6d35))
* show fallback text in BroadcastSettingsVerifiedEmail when no search query ([faa9082](https://github.com/erxes/erxes/commit/faa9082c210dce10cd362dbad3c65a073b3454b0))


### Features

* frontline ticket report and export ([d3a4ea5](https://github.com/erxes/erxes/commit/d3a4ea58f25bed2b76ae3fcfbd545c98d08469b3))
* **pdf:** use itinerary color instead of branch primarycolor ([#7334](https://github.com/erxes/erxes/issues/7334)) ([b41a792](https://github.com/erxes/erxes/commit/b41a7923efc0d7e8d803fe6d412590f9d223bcda))
* **tour:** add attachment field to form and apply improvements ([#7330](https://github.com/erxes/erxes/issues/7330)) ([2ab20f8](https://github.com/erxes/erxes/commit/2ab20f88e65c6aa1f00f28a1bf24f92446708380))
* **tour:** add itinerary color field ([#7333](https://github.com/erxes/erxes/issues/7333)) ([238cbc4](https://github.com/erxes/erxes/commit/238cbc4e3b4879efcce48bfd058448cbe6042319))
* **tour:** add mongolian cyrillic support in pdf export ([#7332](https://github.com/erxes/erxes/issues/7332)) ([3e96a27](https://github.com/erxes/erxes/commit/3e96a273aaa5a538f07605f3320a4fa2b29658c0))
* **tour:** add variable to elements ([#7335](https://github.com/erxes/erxes/issues/7335)) ([e284433](https://github.com/erxes/erxes/commit/e284433846c8349a90d45a16cacece98155659dd))
* **validation:** prevent duplicates in tour, itinerary, elements and amenities ([#7338](https://github.com/erxes/erxes/issues/7338)) ([f212452](https://github.com/erxes/erxes/commit/f212452c4c16d019bdf806df531840b2cf55140b))

## [3.0.6](https://github.com/erxes/erxes/compare/3.0.5...3.0.6) (2026-03-27)


### Bug Fixes

* allow unicode letters in sanitizeKey ([95965b3](https://github.com/erxes/erxes/commit/95965b37e44abb289d8e7a6d1fbc057f77b0cd93))
* handle optional customer ID in buildCustomerTarget function ([1de6dc4](https://github.com/erxes/erxes/commit/1de6dc41f0d6ab15e69047d352cff973b73ffa6c))
* loyalty improve ([#7303](https://github.com/erxes/erxes/issues/7303)) ([6f83af2](https://github.com/erxes/erxes/commit/6f83af20378280354edb843d85e1ec23acf3a448))
* restore broadcast, template, and import/export routes ([68bd7aa](https://github.com/erxes/erxes/commit/68bd7aa07969bae72d0e0eac59bcd333e4835d07))
* show uploaded image on editor ([#7320](https://github.com/erxes/erxes/issues/7320)) ([7131f00](https://github.com/erxes/erxes/commit/7131f00a8f1f9e96d96e2556d87102af3b52c4bd))
* sonar resolve be/erxes-api-shared/utils ([#7299](https://github.com/erxes/erxes/issues/7299)) ([703a9b7](https://github.com/erxes/erxes/commit/703a9b779611b79b1e0482be8edf741aee00c5f3))
* sonar resolve be/frontline/modules/inbox/graphql/resolvers/mutations ([#7301](https://github.com/erxes/erxes/issues/7301)) ([45acdd1](https://github.com/erxes/erxes/commit/45acdd13896b1249844a0b21dd7b2572044011e5))


### Features

* **core:** guard contact actions with can ([#7282](https://github.com/erxes/erxes/issues/7282)) ([c04c76f](https://github.com/erxes/erxes/commit/c04c76f61cf0eff73ed03d9a792724b563dc5205))
* enhance sales deal overview, activity logs, and configurable record-table columns ([#7315](https://github.com/erxes/erxes/issues/7315)) ([07f1f74](https://github.com/erxes/erxes/commit/07f1f74fc3d3f17465904eab0a7564c65ecf62a4))
* lang switcher in detail page, no content indicator ([#7296](https://github.com/erxes/erxes/issues/7296)) ([74ecf3c](https://github.com/erxes/erxes/commit/74ecf3cf46b342402ffcbe6a57133606a0adb4e8))
* **tms:** add language fields and remove preview page from create form ([#7283](https://github.com/erxes/erxes/issues/7283)) ([7698e6a](https://github.com/erxes/erxes/commit/7698e6aefe544e4b3a4ed54317002a3a1114717b))

## [3.0.5](https://github.com/erxes/erxes/compare/3.0.4...3.0.5) (2026-03-25)

## [3.0.4](https://github.com/erxes/erxes/compare/3.0.3...3.0.4) (2026-03-25)


### Bug Fixes

* core use dynamic import for file-type to resolve ESM compatibility error  ([867d0d7](https://github.com/erxes/erxes/commit/867d0d7fcf426120505ef6c396a17c4d83785a8f))

## [3.0.3](https://github.com/erxes/erxes/compare/3.0.2...3.0.3) (2026-03-25)

## [3.0.2](https://github.com/erxes/erxes/compare/3.0.1...3.0.2) (2026-03-25)


### Features

* read version from each plugins env ([90c9f6a](https://github.com/erxes/erxes/commit/90c9f6a23512241410b324c80a722c00e5b13482))
* read version from each plugins env ([14762dd](https://github.com/erxes/erxes/commit/14762ddb16f7b4b919f2ccab06cd4b8034d3139f))

## [3.0.1](https://github.com/erxes/erxes/compare/3.0.0...3.0.1) (2026-03-25)


### Bug Fixes

*  add organization handling when IMAP SAAS mode is detected  ([76c46d8](https://github.com/erxes/erxes/commit/76c46d816d58fc1b15c1474c97e295c0639722ae))
*  typing bug on customers,companies ([#6885](https://github.com/erxes/erxes/issues/6885)) ([dd29e87](https://github.com/erxes/erxes/commit/dd29e87484582edf0f0b250121882644b5dc0da0))
* accounting configs upgrade ([ef10a3a](https://github.com/erxes/erxes/commit/ef10a3a6c3983e4f3971627fd10b3304512b9314))
* accounting sync deal config ([f227060](https://github.com/erxes/erxes/commit/f22706016e3868c535df7c371c28ec08d6f64ef8))
* accounting-ui some bug ([#6802](https://github.com/erxes/erxes/issues/6802)) ([77ce65e](https://github.com/erxes/erxes/commit/77ce65ed13603ca4297709525a607f51d4bc13bc))
* add [@key](https://github.com/key) directive to Channel type for federation ([f7c975f](https://github.com/erxes/erxes/commit/f7c975f948d628edef6325a6336b8144668baac4))
* add error logging to empty catch blocks ([#6991](https://github.com/erxes/erxes/issues/6991)) ([c1b9979](https://github.com/erxes/erxes/commit/c1b9979768cccf1ea7f4afb1bcbf86fdb2b9ca74))
* add git, ca-certificates, and curl to content_api Docker image ([56215ef](https://github.com/erxes/erxes/commit/56215ef32aad1fe9b58694b3ce7b8c9b38f0ac45))
* add global flag to regex patterns in sanitize utils ([ce9df37](https://github.com/erxes/erxes/commit/ce9df3749b04e0c3b72c97fb7a48c258bfce631a))
* add missing newline at end of Colors.ts file ([#6996](https://github.com/erxes/erxes/issues/6996)) ([33c23a4](https://github.com/erxes/erxes/commit/33c23a446bc149905cba19f131ffbbfdd7ab9f94))
* add missing newline at end of file-upload/types.ts ([#7007](https://github.com/erxes/erxes/issues/7007)) ([4c4c57a](https://github.com/erxes/erxes/commit/4c4c57a970e4388e72000d72fc24856fe5b6ef6e))
* add missing newline at end of i18n/config.ts ([#7003](https://github.com/erxes/erxes/issues/7003)) ([6106820](https://github.com/erxes/erxes/commit/6106820fed5e307cb00ad94022aababfc0740064))
* add missing newline at end of settings/constants/data.ts ([#7004](https://github.com/erxes/erxes/issues/7004)) ([a13a15a](https://github.com/erxes/erxes/commit/a13a15a6246be1b28b5f4affa03ce798bf0a3681))
* add missing newlines at end of team-member files ([#7028](https://github.com/erxes/erxes/issues/7028)) ([87a864a](https://github.com/erxes/erxes/commit/87a864a46d2882114c00e7f4fb8db0fe6fea59bb))
* add propertiesData field to ticket query ([9356568](https://github.com/erxes/erxes/commit/9356568fb172f9407ec2cf924c4279eccfb4e13d))
* add proxy agent & pool settings ong apollo router ([2612ad8](https://github.com/erxes/erxes/commit/2612ad8232b3fc79451d35c400d55cde7158d461))
* add redis caching for active plugins list ([f4ea37c](https://github.com/erxes/erxes/commit/f4ea37c19a24b0f1326ac74e8cf0194324610ea8))
* added board movement component & fix archive ([#6803](https://github.com/erxes/erxes/issues/6803)) ([55cff2a](https://github.com/erxes/erxes/commit/55cff2a361e0f73234663c44a18793c0bd343af7))
* added customer, company widget ([48dc5ab](https://github.com/erxes/erxes/commit/48dc5ab27c225fd05226e31a2977cfef5b7a2577))
* added filter by product on sales ([#6936](https://github.com/erxes/erxes/issues/6936)) ([4ca6f10](https://github.com/erxes/erxes/commit/4ca6f1027c47f535dd69dada35a721e28eb1681e))
* added sales common board, pipeline, stage chooser ([#6931](https://github.com/erxes/erxes/issues/6931)) ([28fd88c](https://github.com/erxes/erxes/commit/28fd88c0d60f4c16e4a561b0a80609e61967cfbb))
* align personCost schema and ts types with the new object-based structure ([#7121](https://github.com/erxes/erxes/issues/7121)) ([dd88c0d](https://github.com/erxes/erxes/commit/dd88c0de1699313840cac785cdc15d51311232a5))
* build ([ce89fed](https://github.com/erxes/erxes/commit/ce89fed84d1557dbd8b934c65536f4010e1f5b81))
* build ([c46cce7](https://github.com/erxes/erxes/commit/c46cce7e20a1388ac04adf6bb262cc625f988f57))
* build, delete posclient-front of eslintrc ([35e22fc](https://github.com/erxes/erxes/commit/35e22fc31e32b6996eef587b621e4d9cbf5592d5))
* categories and pagination bug ([#7189](https://github.com/erxes/erxes/issues/7189)) ([31cef1a](https://github.com/erxes/erxes/commit/31cef1a39e3b082623d21e658e1da5933b5a937a))
* claude-code ci ([1dcc9de](https://github.com/erxes/erxes/commit/1dcc9de6bf1740e18c83d8e5066646055d7c4b09))
* clean code conformities on sales_ui ([#6865](https://github.com/erxes/erxes/issues/6865)) ([27c5beb](https://github.com/erxes/erxes/commit/27c5beb98557c8cd15e1b8ae3c58ff435bae0fc0))
* clean some code ([d581719](https://github.com/erxes/erxes/commit/d5817197d9e0f473be8081c5a603b81b8052f519))
* clientportal comments ([#6855](https://github.com/erxes/erxes/issues/6855)) ([b9d3e7d](https://github.com/erxes/erxes/commit/b9d3e7d98e43410d2f96c21e89b81bba232ffed6))
* clientportal trpc ([#6924](https://github.com/erxes/erxes/issues/6924)) ([af26886](https://github.com/erxes/erxes/commit/af26886e8d2d73690707926f5179e5bb004c0d5a))
* **clientportal:** standardize userType field and expose registration code ([cbfa5df](https://github.com/erxes/erxes/commit/cbfa5df27b40f6a5c8cbbd421e1bf50bcfa61904))
* **cms:** content  archive ([#6788](https://github.com/erxes/erxes/issues/6788)) ([fdada95](https://github.com/erxes/erxes/commit/fdada95e681545352642879bc422044412e83772))
* cmspages  ([869cb41](https://github.com/erxes/erxes/commit/869cb4168bd380634e904be558c7b2ee8a67f5b8))
* cmstags ([#7150](https://github.com/erxes/erxes/issues/7150)) ([da00571](https://github.com/erxes/erxes/commit/da00571556d625b7725db1d352b37d5b692392c6))
* conformities to relations ([80689c3](https://github.com/erxes/erxes/commit/80689c3eae4a0775a9dbc04042b7dacc6769b797))
* content module remove webids except content plugin  ([442c093](https://github.com/erxes/erxes/commit/442c0931b5042c5ba5c9d2b9c917ab2d3a30c346))
* content navigation  ([#6826](https://github.com/erxes/erxes/issues/6826)) ([6a9375d](https://github.com/erxes/erxes/commit/6a9375d9028ad3579b76eac91ec0a1c5e5f3cc71))
* **content:** tag remove error, refactor page detail page with parent id  ([1f5c294](https://github.com/erxes/erxes/commit/1f5c294284ff9390e1709515ee006b8b89f97523))
* core build ([6ff44a4](https://github.com/erxes/erxes/commit/6ff44a4e8983bacf6a15056c5aa59d19c52f05ba))
* correct additional 'occured' to 'occurred' typos in backend files ([#6990](https://github.com/erxes/erxes/issues/6990)) ([dad0eb0](https://github.com/erxes/erxes/commit/dad0eb0df14b2089e24aea2dcce9f7251ffeb0e6))
* correct all typos across the codebase (17 fixes) ([#7069](https://github.com/erxes/erxes/issues/7069)) ([8d3502e](https://github.com/erxes/erxes/commit/8d3502ee48ef3867a037e871326686126b7bdaa5))
* correct arrow function expression in DeepSource skip coverage ([3246171](https://github.com/erxes/erxes/commit/32461718faa3addcac8d8bd802c4f03926d8749c))
* correct notification read status check in useNotification hook ([b480b9a](https://github.com/erxes/erxes/commit/b480b9a57517988942285bfcc011de0a030abcbe))
* correct typo 'dont' to 'don't' in comment ([#7025](https://github.com/erxes/erxes/issues/7025)) ([08c8c8e](https://github.com/erxes/erxes/commit/08c8c8e30dfc570c6930242ad892f08f3645e740))
* correct typo 'dont' to 'don't' in migratePropertiesData.ts ([#7024](https://github.com/erxes/erxes/issues/7024)) ([8043ed7](https://github.com/erxes/erxes/commit/8043ed7d3a9c87fac3380aa5deff55c310b9bc88))
* correct typo 'occured_at' to 'occurred_at' in factories.ts ([#7018](https://github.com/erxes/erxes/issues/7018)) ([d5d62e2](https://github.com/erxes/erxes/commit/d5d62e21633fe2f47ba883fa7583c8ae448cf242))
* correct typo 'occured' to 'occurred' in backend files and add error detail ([21f67ce](https://github.com/erxes/erxes/commit/21f67ce50fccdb7264b5546e23a15b69f1ba2fb8))
* correct typo 'occured' to 'occurred' in backend files and add error detail ([#6987](https://github.com/erxes/erxes/issues/6987)) ([0f1494b](https://github.com/erxes/erxes/commit/0f1494ba69d38d99371cb0fa8e620772f6648fe0))
* correct typo 'occured' to 'occurred' in broadcast common utils ([#7001](https://github.com/erxes/erxes/issues/7001)) ([9b6dfce](https://github.com/erxes/erxes/commit/9b6dfce3eef52a885bafbb10114da9a42a5493c1))
* correct typo 'occured' to 'occurred' in eventLogHandler.ts ([#6998](https://github.com/erxes/erxes/issues/6998)) ([59b54d1](https://github.com/erxes/erxes/commit/59b54d1205e24b89454ee228eb796c82a7c4b80a))
* correct typo 'occured' to 'occurred' in eventLogHandler.ts ([#7098](https://github.com/erxes/erxes/issues/7098)) ([9bc61a4](https://github.com/erxes/erxes/commit/9bc61a41bb394474cca4c32e8c30ebee8d3bab18))
* correct typo 'occured' to 'occurred' in facebook helpers ([#6999](https://github.com/erxes/erxes/issues/6999)) ([ea7fdf0](https://github.com/erxes/erxes/commit/ea7fdf0532dacaffd81587ea6859c4f08a23fe6f))
* correct typo 'occured' to 'occurred' in Fields model ([#7000](https://github.com/erxes/erxes/issues/7000)) ([796b5ed](https://github.com/erxes/erxes/commit/796b5ed380244e4a3ed3c7d893fb67b21b19d062))
* correct typo 'occured' to 'occurred' in Fields.ts ([#7021](https://github.com/erxes/erxes/issues/7021)) ([4c955bf](https://github.com/erxes/erxes/commit/4c955bfb2ff8b530907f3299c9d8c6503c81aad5))
* correct typo 'occured' to 'occurred' in POS client components ([00b5cfa](https://github.com/erxes/erxes/commit/00b5cfa437d48e8491efae13b5c40cdb6a6ace94))
* correct typo 'occured' to 'occurred' in POS client components ([#6988](https://github.com/erxes/erxes/issues/6988)) ([d2e89c7](https://github.com/erxes/erxes/commit/d2e89c718f29247160d0f653f6d6596ebfbd53a1))
* correct typo 'occured' to 'occurred' in useUsersInvite.tsx ([f605176](https://github.com/erxes/erxes/commit/f60517635c8336ad98b80141e140695a72ef1d0a))
* correct typo 'occured' to 'occurred' in useUsersInvite.tsx ([#6985](https://github.com/erxes/erxes/issues/6985)) ([43607be](https://github.com/erxes/erxes/commit/43607be816956cd724564112d045268646b8967d))
* correct typo 'occured' to 'occurred' in useUsersInvite.tsx ([#7011](https://github.com/erxes/erxes/issues/7011)) ([ee71403](https://github.com/erxes/erxes/commit/ee71403e86a72e1ca69bd30771c7e4045523f434))
* correct typo 'seperate' to 'separate' in translation files and component ([709c15f](https://github.com/erxes/erxes/commit/709c15f6e147efbd8af48581e4fefd9155091923))
* correct typo 'seperate' to 'separate' in translation files and component ([#6986](https://github.com/erxes/erxes/issues/6986)) ([f8aecaf](https://github.com/erxes/erxes/commit/f8aecaf5ce45e9bf57f09a2739440ab0419b6430))
* correct typo 'seperate' to 'separate' in translation files and component ([#7010](https://github.com/erxes/erxes/issues/7010)) ([d1d3f15](https://github.com/erxes/erxes/commit/d1d3f157fee08de6ad6e934249441ea03ee37282))
* correct typo 'seperate' to 'separate' in translation files and component ([#7099](https://github.com/erxes/erxes/issues/7099)) ([978e738](https://github.com/erxes/erxes/commit/978e738dd82b03eb544fcae9d3e355e15f2fec4e))
* correct typos 'Cant' to 'Can't' in Fields.ts ([#7026](https://github.com/erxes/erxes/issues/7026)) ([abb318b](https://github.com/erxes/erxes/commit/abb318b7b7fc189ac1003d246627b2da4d15d427))
* correct typos 'cant' to 'can't' in Transactions.ts ([#7023](https://github.com/erxes/erxes/issues/7023)) ([d0a6b3a](https://github.com/erxes/erxes/commit/d0a6b3aecc156934c0422741e097f0b272dd46e5))
* correct typos 'occured' to 'occurred' in common.ts ([#7020](https://github.com/erxes/erxes/issues/7020)) ([3c0196f](https://github.com/erxes/erxes/commit/3c0196f86319c47f367797932da275a9cb7e4249))
* correct wrong logical operators causing runtime errors and broken validation ([#6994](https://github.com/erxes/erxes/issues/6994)) ([39a220f](https://github.com/erxes/erxes/commit/39a220f75c824b9cd4d44d372fad9fae681d7a3d))
* cp config overwrite ([#7184](https://github.com/erxes/erxes/issues/7184)) ([f88630e](https://github.com/erxes/erxes/commit/f88630e4475f411a20e45a61b0cbee8cd2582530))
* cp otp code ([#7041](https://github.com/erxes/erxes/issues/7041)) ([d0c84ac](https://github.com/erxes/erxes/commit/d0c84ac7f899477b5e254e502290343167f36ed4))
* cpNotificaiton result ([#6913](https://github.com/erxes/erxes/issues/6913)) ([a3716e3](https://github.com/erxes/erxes/commit/a3716e385c3bb90969951c34abf001aedd6382ac))
* create-owner ([0959a40](https://github.com/erxes/erxes/commit/0959a40d2297fb9ba8f1c500e3ab124f7a87192c))
* custom field add on custom field group fix  ([1df852d](https://github.com/erxes/erxes/commit/1df852d49ff58c8639a0e242c45e4709f2cf41bc))
* customer company note ([7b4b100](https://github.com/erxes/erxes/commit/7b4b100c42b839695a8853312b408388d19a802d))
* deal activity logs ([#6849](https://github.com/erxes/erxes/issues/6849)) ([9bac7b8](https://github.com/erxes/erxes/commit/9bac7b874637869e2bb9cfa8d90924c22657db50))
* deal list detail some bug ([dcf7dca](https://github.com/erxes/erxes/commit/dcf7dca10d451c40150b2211d1ca9a523cfa9145))
* deals default ordery by ([5195d5c](https://github.com/erxes/erxes/commit/5195d5cc4bac27d251a915d65fcbe45108d41bb3))
* edit related contacts for cp user ([#7060](https://github.com/erxes/erxes/issues/7060)) ([1ce17f7](https://github.com/erxes/erxes/commit/1ce17f7a1510589c415667645b7472a8b4ddec5d))
* EM bugs ([#6903](https://github.com/erxes/erxes/issues/6903)) ([02f21ad](https://github.com/erxes/erxes/commit/02f21ad0808f9fc4d6c2778f178571d7fae99da8))
* enable broadcast feature for all editions ([2b5e0c2](https://github.com/erxes/erxes/commit/2b5e0c2ad51f6b3135588da83e78f31dbb536c88))
* enable early return in client portal token middleware ([372f6fe](https://github.com/erxes/erxes/commit/372f6fe859d02e69839fd09922416b090358a7e9))
* enhance client portal token handling and error management ([b1934db](https://github.com/erxes/erxes/commit/b1934dbc1d685de02fd1617b072562ea07e12dff))
* error fallback revert ([0d656da](https://github.com/erxes/erxes/commit/0d656da3028a65636ac9de564567077be7a7c633))
* erxes-ui -> colors.ts ([#6880](https://github.com/erxes/erxes/issues/6880)) ([7b6a0ca](https://github.com/erxes/erxes/commit/7b6a0ca0e019341cb751ab0a7b757af50c99072c))
* eventlog validation error ([78e9736](https://github.com/erxes/erxes/commit/78e973600737e9761f2a48c4b3412dd95038ced0))
* extend client-auth-token time ([#7074](https://github.com/erxes/erxes/issues/7074)) ([91f2fa9](https://github.com/erxes/erxes/commit/91f2fa959ffe24bd3a90a5d47e11d3a75095a0d8))
* fix build ([8df228d](https://github.com/erxes/erxes/commit/8df228d636ab858bb2ab31160873562091238ea6))
* fix build of content ([f28bee5](https://github.com/erxes/erxes/commit/f28bee5ce07a43c799a1b69d02d027de072a8065))
* fix customer eventlog ([fdc39ff](https://github.com/erxes/erxes/commit/fdc39ffe1cc52fe41a0989542639a578310f624a))
* frontline inbox report and ticket permission  ([9161a46](https://github.com/erxes/erxes/commit/9161a46b76dbb1e6960db756a09335bee8f5a4a2))
* frontline report source filter  ([5f3c247](https://github.com/erxes/erxes/commit/5f3c247658dfdda6e026d9a53b29dac95a781281))
* frontline resolve scroll issue in pipeline permissions on production ([237f71f](https://github.com/erxes/erxes/commit/237f71f049609ff526c54b5fa9da6320493487f1))
* frontline resolve scroll issue in pipeline permissions on production  ([eb04d97](https://github.com/erxes/erxes/commit/eb04d97cb6b37829146f2fdf43bc20b83201c2c3))
* **frontline-ticket:** fix remove functionality in UI and API  ([e3216c9](https://github.com/erxes/erxes/commit/e3216c9c5a417d295f969a1d87f27e61c70b5378))
* import missing import for frontline ([b485833](https://github.com/erxes/erxes/commit/b4858332d587100917c1330b1e6046d7296af3ed))
* improve broadcast config email input and form layout ([#6872](https://github.com/erxes/erxes/issues/6872)) ([fe0c9a2](https://github.com/erxes/erxes/commit/fe0c9a277ed2e0b48b64437b5be1bcacbd960a00))
* improve form field handling and validation ([9860359](https://github.com/erxes/erxes/commit/986035990a2331e1dfed2b8b0f1edff3780d357d))
* improve insurance frontend robustness and type safety across multiple pages ([#7138](https://github.com/erxes/erxes/issues/7138)) ([195dc08](https://github.com/erxes/erxes/commit/195dc08bf499568ce5867c8dc5c242ace95e0a70))
* improve layout and styling in MemberDetail, ActivityLogRow, and FieldsInDetail components ([033141a](https://github.com/erxes/erxes/commit/033141ab62ee4506e13866ffc07aaa65a16a54df))
* include excludeWorkspaceTags parameter to tagsMain query ([242227d](https://github.com/erxes/erxes/commit/242227d12dd571b0d93d451339f1be477694d7ec))
* kimi code analysis and review automation ([af200bd](https://github.com/erxes/erxes/commit/af200bd7af37d4b2f72fada5d94c0f4dbf04a8ef))
* logo and icon issues in payment settings ([#6979](https://github.com/erxes/erxes/issues/6979)) ([58242cd](https://github.com/erxes/erxes/commit/58242cd1d24d03618eb615f9fc15b79e3af59cfb))
* **loyalty:** add serviceName binding ([#6972](https://github.com/erxes/erxes/issues/6972)) ([49349b1](https://github.com/erxes/erxes/commit/49349b1ae52bccc1081a444f99d932e52e5b8d73))
* missing manager IDs in branch resolvers and correct general manager user lookup queries ([#7107](https://github.com/erxes/erxes/issues/7107)) ([4d39fe3](https://github.com/erxes/erxes/commit/4d39fe38a7c819efd2c8f0879a012ff5cfca1c7b))
* modify client portal token verification flow ([725f7b7](https://github.com/erxes/erxes/commit/725f7b75c2fd4a53179b6d7044bc74931c3ef70a))
* mongolian:ebarimt improvement ([#6863](https://github.com/erxes/erxes/issues/6863)) ([c06d7fc](https://github.com/erxes/erxes/commit/c06d7fcb1a54be8960b0c215ddd9870e088c1e90))
* move cards bug ([#6966](https://github.com/erxes/erxes/issues/6966)) ([68aefff](https://github.com/erxes/erxes/commit/68aeffffb599b0aee6ea9f43f4f69c03fd153741))
* move deals search input ([#6841](https://github.com/erxes/erxes/issues/6841)) ([c83d15e](https://github.com/erxes/erxes/commit/c83d15e614d498fc0147fa1021ae991d7042a53c))
* new afterMutations, mongolian/product-places, and Product places configs saved list  ([#6871](https://github.com/erxes/erxes/issues/6871)) ([cab7ede](https://github.com/erxes/erxes/commit/cab7ede2f1950a7d21ffecb71df4cf5c07d3437b))
* only fetch existing group when code is being updated ([e51df6d](https://github.com/erxes/erxes/commit/e51df6dde7345f01a5ab9ea140ecaa377c8128c3))
* operation bugfixes ([#6768](https://github.com/erxes/erxes/issues/6768)) ([1a9ee78](https://github.com/erxes/erxes/commit/1a9ee78e87e4c9eee9949a189ebc7a118b82d346))
* operation build ([a9b224e](https://github.com/erxes/erxes/commit/a9b224e67b19d97e45c04f68c122e521a976ea4e))
* operation fixes v2 ([#6832](https://github.com/erxes/erxes/issues/6832)) ([5be046b](https://github.com/erxes/erxes/commit/5be046b7f0b730a74c856ed6eb5e2989f28574c8))
* optimize event handling and fix Facebook integration ([4893280](https://github.com/erxes/erxes/commit/48932808dd7b0588b5cbc934894469a12881fc7b))
* otp limit bug & customer switch for cpuser ([#6929](https://github.com/erxes/erxes/issues/6929)) ([df06547](https://github.com/erxes/erxes/commit/df0654767f995f2a5575ec45afdd058658d5fd30))
* payment bug ([#6944](https://github.com/erxes/erxes/issues/6944)) ([0da71ef](https://github.com/erxes/erxes/commit/0da71ef791a434c097f26151920d67aa9c73b12e))
* payment invoices routing and payment integrations ([#6951](https://github.com/erxes/erxes/issues/6951)) ([cabff1e](https://github.com/erxes/erxes/commit/cabff1e7730c92e08821b1c662ac61e09614829c))
* payment worker timeout error ([#7141](https://github.com/erxes/erxes/issues/7141)) ([c96d5f9](https://github.com/erxes/erxes/commit/c96d5f984a59785eea9ca5d565fe59fe138ffb95))
* payment worker timeout in invoicesCheck  ([#7135](https://github.com/erxes/erxes/issues/7135)) ([9a3e5aa](https://github.com/erxes/erxes/commit/9a3e5aa2311076b7ffdd852832a08bd0fdf9ac21))
* payments invcoice detail query skip permission ([e1f084b](https://github.com/erxes/erxes/commit/e1f084b31711a5122751fa7f75ba10028dcfb12f))
* permission posclient ([#7289](https://github.com/erxes/erxes/issues/7289)) ([d768b6d](https://github.com/erxes/erxes/commit/d768b6dc0e23d40795178a754899944eaa9d5efd))
* pipeline product config button, sales product other payment ([#6866](https://github.com/erxes/erxes/issues/6866)) ([dbdd6c6](https://github.com/erxes/erxes/commit/dbdd6c685313fd19f33d6ab5058acefb4cfc60dd))
* pipeline stage order in settings ([#6767](https://github.com/erxes/erxes/issues/6767)) ([5602eda](https://github.com/erxes/erxes/commit/5602eda7ae242bf8acbcd27a97957c3793f13107))
* pos order remove and some bugs ([#6760](https://github.com/erxes/erxes/issues/6760)) ([3893b5f](https://github.com/erxes/erxes/commit/3893b5fda09c956920ee2ff437353e245163841e))
* pos: moved the pos page to the settings and new features ([#6728](https://github.com/erxes/erxes/issues/6728)) ([bd8fe0e](https://github.com/erxes/erxes/commit/bd8fe0e1dede2c6c729877d00f796161738a7a81))
* posts published date filter and published date automatically applied when not specified ([#7239](https://github.com/erxes/erxes/issues/7239)) ([99a1c74](https://github.com/erxes/erxes/commit/99a1c747331cb616d057b417b12181a1cc1f8ce9))
* product infos, company, customer filter, update boards in sales ([#6772](https://github.com/erxes/erxes/issues/6772)) ([a41bbe8](https://github.com/erxes/erxes/commit/a41bbe8b038325a379d033313c54e960084398e4))
* products filter by pipline config ([e43c30d](https://github.com/erxes/erxes/commit/e43c30d4caa6acf4e63d2a7c74536e9d3967791d))
* products list vendor ([17fabb5](https://github.com/erxes/erxes/commit/17fabb59cd0f4b08b84e492b646833911bddbccd))
* products list with tags ([a71468a](https://github.com/erxes/erxes/commit/a71468a3ad9fc634ad939184ff0ac50f50c2baef))
* products navigation ([87ef51d](https://github.com/erxes/erxes/commit/87ef51dce5330a84136567dd3b7ee08ecb932de1))
* realtime sales product ([#6812](https://github.com/erxes/erxes/issues/6812)) ([c3eac00](https://github.com/erxes/erxes/commit/c3eac00abc3cbada096a256a89d96a4e5f4a048f))
* remove check role ([ec5d509](https://github.com/erxes/erxes/commit/ec5d5095fb1675c4a125aec961a8827be7e5f757))
* remove debug console.log from Export component ([#7030](https://github.com/erxes/erxes/issues/7030)) ([9b0198a](https://github.com/erxes/erxes/commit/9b0198a2e042165cbd2cd4ba4e989440636f1c19))
* remove debug console.log from useTags.tsx ([#7031](https://github.com/erxes/erxes/issues/7031)) ([792eb42](https://github.com/erxes/erxes/commit/792eb423cf6e81ad25ff9a603890340dac64526d))
* remove debug console.log statements and extra blank lines ([#7029](https://github.com/erxes/erxes/issues/7029)) ([4257e64](https://github.com/erxes/erxes/commit/4257e6475d9bb327b23bbe88859a6ec0c2220645))
* remove debug console.log statements and extra blank lines ([#7102](https://github.com/erxes/erxes/issues/7102)) ([79b4a00](https://github.com/erxes/erxes/commit/79b4a00b52f84f109917980af51e50e1d54ce00d))
* remove debug console.log statements from broadcast components ([#7100](https://github.com/erxes/erxes/issues/7100)) ([1319671](https://github.com/erxes/erxes/commit/1319671dbc012a4229a699ad9c10c115a225b8bc))
* remove debug console.log statements from production code ([#6992](https://github.com/erxes/erxes/issues/6992)) ([015de12](https://github.com/erxes/erxes/commit/015de124095a2fdc607174b76bcf32ab6517fa58))
* remove debug console.log statements from production code ([#7012](https://github.com/erxes/erxes/issues/7012)) ([b548f5e](https://github.com/erxes/erxes/commit/b548f5e534700b4e237ace37c03d539c9e213df6))
* remove debug console.log statements from sales module ([#7027](https://github.com/erxes/erxes/issues/7027)) ([5cbd1c1](https://github.com/erxes/erxes/commit/5cbd1c1395be130fe6184da94d51b603d58bf439))
* remove debug console.log statements from structure hooks ([#7019](https://github.com/erxes/erxes/issues/7019)) ([6019457](https://github.com/erxes/erxes/commit/601945755b86ee50f1645f24bd2698b0fe3b992d))
* remove eval() usage to prevent RCE vulnerability ([#6837](https://github.com/erxes/erxes/issues/6837)) ([4ce7ddc](https://github.com/erxes/erxes/commit/4ce7ddcbb67cb5b6dc4a7b39ca72744d71042745))
* remove permission check ([2b5dc85](https://github.com/erxes/erxes/commit/2b5dc85c5902596e2a82e06dfdf471ebf4cdd649))
* remove pool from apollo ([70c3105](https://github.com/erxes/erxes/commit/70c31056008075c339e4e618802166beed473b09))
* remove renderFullname from sales card ([95a2dfe](https://github.com/erxes/erxes/commit/95a2dfe6779c7465d826e413e7a4a1819a4ce12e))
* remove trailing whitespace in descriptionTypes.ts ([#7103](https://github.com/erxes/erxes/issues/7103)) ([6d881c1](https://github.com/erxes/erxes/commit/6d881c16409ee0d1b0b4f52a08b1ef8564c39af9))
* remove trailing whitespace in GraphQL query file ([#7005](https://github.com/erxes/erxes/issues/7005)) ([230068a](https://github.com/erxes/erxes/commit/230068a2a47188fa778af80316245ce6a3336bef))
* remove trailing whitespace in NotificationContent.tsx ([#7014](https://github.com/erxes/erxes/issues/7014)) ([2e85ccf](https://github.com/erxes/erxes/commit/2e85ccf43967dfb78f6b1496b58ddcccd407bae8))
* remove trailing whitespace in TopicDrawer.tsx ([#7002](https://github.com/erxes/erxes/issues/7002)) ([229e708](https://github.com/erxes/erxes/commit/229e708f8a54154ae2c5e3f6e2c0057fa0430cd1))
* remove unused import from usePositionActions.tsx ([#7009](https://github.com/erxes/erxes/issues/7009)) ([7409c90](https://github.com/erxes/erxes/commit/7409c908025644d215ef85765635e6c930b05aa8))
* remove widgetsave browser info mutation ([dd13707](https://github.com/erxes/erxes/commit/dd13707f2c17b32d06e4de41ca7b7d922598b531))
* replace Object.assign with object spread syntax ([#6900](https://github.com/erxes/erxes/issues/6900)) ([d8d7ca1](https://github.com/erxes/erxes/commit/d8d7ca18db24f868541effeb1cb87261f08a1f94))
* replace tabs with spaces for consistency ([#7015](https://github.com/erxes/erxes/issues/7015)) ([ad77c7f](https://github.com/erxes/erxes/commit/ad77c7fc946fd9f7faf3a26711573d26e99fdf4a))
* replace var with const in script injection code ([#6993](https://github.com/erxes/erxes/issues/6993)) ([56243f3](https://github.com/erxes/erxes/commit/56243f33ab616df357da4207716025043a745aa9))
* report API conversation report queries and pipelines ([7f8fb0f](https://github.com/erxes/erxes/commit/7f8fb0f7eceaa436bd84d879a1e7ca2436b476b5))
* report release date filtering and correct fallback skeletons  ([7bfc407](https://github.com/erxes/erxes/commit/7bfc407f28e2bde1309594cfe0420fcb8bf237f1))
* reset websocket queue state on reconnection and increase HTTP server keep-alive and headers timeouts. ([1e3e624](https://github.com/erxes/erxes/commit/1e3e624fab00f663ccd6df6da9d6ea5ba93945bc))
* resolve TODO by renaming assignedTo to createdBy in documents filter ([#6925](https://github.com/erxes/erxes/issues/6925)) ([622b4aa](https://github.com/erxes/erxes/commit/622b4aa6be162cd2e6570d4b770a6d0dc3fdc588))
* response template require login for response template queries and mutations  ([9905d2b](https://github.com/erxes/erxes/commit/9905d2b0a9bfd43f0699d6feb3bfef8cad278b63))
* restore notifcation archive functionality ([75ccf11](https://github.com/erxes/erxes/commit/75ccf11b3284731d9cb3418b50991ba63ccd1208))
* rever content enhancement ([cf0ea2f](https://github.com/erxes/erxes/commit/cf0ea2ffd54f9d01eb22735ab46bf9343772c354))
* router urls ([#6831](https://github.com/erxes/erxes/issues/6831)) ([6a47c44](https://github.com/erxes/erxes/commit/6a47c449395660ebeb76d5310bd6ffc4553350bf))
* router urls in payment ([#6838](https://github.com/erxes/erxes/issues/6838)) ([736f5f0](https://github.com/erxes/erxes/commit/736f5f0fd30ddeb2b38fbadc7d122a46c3327e34))
* sales customers and companies with relations and dataloader ([#6858](https://github.com/erxes/erxes/issues/6858)) ([835240f](https://github.com/erxes/erxes/commit/835240f24c74de97b16a224a96b34b6af1be2ca9))
* sales deal change subscription with refetch ([ff9e8d6](https://github.com/erxes/erxes/commit/ff9e8d6b03ba212a5f29c42f8904056fcfdf3722))
* sales deal labels with subscription ([45aded8](https://github.com/erxes/erxes/commit/45aded8112cd6dc0bfb64c032678e5d2da434c0d))
* sales deal stages probability ([49baf58](https://github.com/erxes/erxes/commit/49baf586d33d4ab52324db6b3edc6ee69c0fb086))
* sales deals update ([#6844](https://github.com/erxes/erxes/issues/6844)) ([aec8c40](https://github.com/erxes/erxes/commit/aec8c40b66e0255d6d79e41b09ea720eb79aaee9))
* sales fixes ([#7039](https://github.com/erxes/erxes/issues/7039)) ([2dc67f6](https://github.com/erxes/erxes/commit/2dc67f65c94a54a98776a533111fb62d1cc37438))
* sales label bug ([#6822](https://github.com/erxes/erxes/issues/6822)) ([5ed8abf](https://github.com/erxes/erxes/commit/5ed8abf2f5f5340fb2dd7ebebfe84fd70376f892))
* sales overview ([#6850](https://github.com/erxes/erxes/issues/6850)) ([7cac331](https://github.com/erxes/erxes/commit/7cac331d216363e620fb6d701a1a8640c23a5631))
* sales pipeline age ([#6843](https://github.com/erxes/erxes/issues/6843)) ([89fe0c1](https://github.com/erxes/erxes/commit/89fe0c11b649f13bbeddd2476532bdbb36a56ed5))
* sales router ([b7d71c7](https://github.com/erxes/erxes/commit/b7d71c77aae9620554495188211f121a41b27d8c))
* sales settings  router ([1150694](https://github.com/erxes/erxes/commit/1150694adaa5a647999ea073c61e0dc008bce515))
* sales settings, bulk remove pipelines ([#7159](https://github.com/erxes/erxes/issues/7159)) ([afdc230](https://github.com/erxes/erxes/commit/afdc2303eae9502cf27c23803f19e333786409d0))
* sales stages sortby and document actions ([#6800](https://github.com/erxes/erxes/issues/6800)) ([d3f62f1](https://github.com/erxes/erxes/commit/d3f62f147a1dfe983da11fd5d4199ecf257d04a7))
* sales subscription and some refactor ([#6848](https://github.com/erxes/erxes/issues/6848)) ([90d1208](https://github.com/erxes/erxes/commit/90d1208bfbdab11c8e2648d1152901b16e37728e))
* sales to ebarimt ([#6809](https://github.com/erxes/erxes/issues/6809)) ([f83d5b5](https://github.com/erxes/erxes/commit/f83d5b54a38568a8c9c0ac22029b47ca9a265a15))
* sales trpc ([#7288](https://github.com/erxes/erxes/issues/7288)) ([e74a93f](https://github.com/erxes/erxes/commit/e74a93f1a594b6da34acd9a2fc3f46715ee67986))
* sales-api deals order not override ([634430e](https://github.com/erxes/erxes/commit/634430e57189c281b8fd0e9c7c2c38102da53815))
* set ticketConfigId nullable, enhancement: schedule day options are richer ([2332ac7](https://github.com/erxes/erxes/commit/2332ac734c9786128fa62348d8e718fc8e54500e))
* show deals total numbers ([#6813](https://github.com/erxes/erxes/issues/6813)) ([96cdcff](https://github.com/erxes/erxes/commit/96cdcff8d81c8b57e8d624decdbb44fc77a6c6b8))
* simplify client portal user type determination in comment mutations ([017276d](https://github.com/erxes/erxes/commit/017276d992a9a05bf920bb6e6418848d0c625ad1))
* skip permission for widget form mutations ([878ab85](https://github.com/erxes/erxes/commit/878ab85a2cc861fc1da0344eb87845bb8a3db2f8))
* sonar resolved on backend/utils ([#7143](https://github.com/erxes/erxes/issues/7143)) ([14509a2](https://github.com/erxes/erxes/commit/14509a261928e76625e5023f545b0de289de01d4))
* sonar resolved on erxes-messenger ([#7265](https://github.com/erxes/erxes/issues/7265)) ([f41c79e](https://github.com/erxes/erxes/commit/f41c79e3bc3af9edb5096750ba816c29e5643653))
* sonar resolved on frontend/conversation/components ([#7247](https://github.com/erxes/erxes/issues/7247)) ([e4ce2c2](https://github.com/erxes/erxes/commit/e4ce2c2409964f03329a29f0dab455b524148dc7))
* sonar resolved on frontend/integration/components ([#7252](https://github.com/erxes/erxes/issues/7252)) ([c31386f](https://github.com/erxes/erxes/commit/c31386f878ddbb0b2319d4b92e7a5ef8b3d79f01))
* sonar resolved on frontend/structure/components ([#7246](https://github.com/erxes/erxes/issues/7246)) ([6085ab9](https://github.com/erxes/erxes/commit/6085ab952b52f2d7c3fd6dbde7afa9bbdde4dc47))
* sonar resolved on knowledgebase ([#7142](https://github.com/erxes/erxes/issues/7142)) ([5c91814](https://github.com/erxes/erxes/commit/5c91814a5065835e7c1f23cf96ee6dbc4ec1c030))
* sync-erkhet settings menu ([a511c60](https://github.com/erxes/erxes/commit/a511c6045ecad01f06d29d99afc1d67194e28cc8))
* test user ([#7044](https://github.com/erxes/erxes/issues/7044)) ([ac7c92a](https://github.com/erxes/erxes/commit/ac7c92aea85c7b5c528feb4e6104a540cc9742eb))
* ticket pipeline add bottom padding to scroll container to ensure 'Show Less' button is visible" ([66177fe](https://github.com/erxes/erxes/commit/66177feff7cbb6a4be13ce28099efbe7a7c60b33))
* **ticket:** pipeline permissions  ([46c1239](https://github.com/erxes/erxes/commit/46c12393ad2265edce12211828e383c963301d7a))
* trpc on payment ([#6759](https://github.com/erxes/erxes/issues/6759)) ([3f3ff3b](https://github.com/erxes/erxes/commit/3f3ff3b4b9e439eceac902562c49318598a62c8c))
* unknown payment bug ([#7125](https://github.com/erxes/erxes/issues/7125)) ([4a59cdd](https://github.com/erxes/erxes/commit/4a59cdda352ad2c07a98464a337c9b50867c761c))
* update checklist and widget card on sales ([60056e5](https://github.com/erxes/erxes/commit/60056e5f28d80e238659fb754fc61fcc5af42cd8))
* update customer, company select on deals ([26b1e8a](https://github.com/erxes/erxes/commit/26b1e8a731093e9e0612202b447a9822ebfe2b33))
* update forms owner permission check and remove debug log ([95f2345](https://github.com/erxes/erxes/commit/95f234517fef3d8528e9da6839f996ac6465e5c6))
* update notification filters and links for improved functionality ([69c73c6](https://github.com/erxes/erxes/commit/69c73c6c50df9fe6abac4908b9039d158921e10c))
* update on deals card ([#6859](https://github.com/erxes/erxes/issues/6859)) ([079beab](https://github.com/erxes/erxes/commit/079beabe9caccc1a1610e26483679c93b1f0ca88))
* update payment, productData, detail on sales ([64dde42](https://github.com/erxes/erxes/commit/64dde4213777365a9e8bb1856fef54232f97b719))
* update product actions on sales ([c00be57](https://github.com/erxes/erxes/commit/c00be57dc3f25d245bac6cba4cb78873aa4c97fb))
* update sales overview ([2342111](https://github.com/erxes/erxes/commit/23421118a0546a9db92c1cd51399cc693378fe4c))
* use single quotes for consistency in roles.ts ([#7006](https://github.com/erxes/erxes/issues/7006)) ([28211d0](https://github.com/erxes/erxes/commit/28211d0e2a1e145cbb721e83648824db704b403e))
* webbuilder backend all logic without filter by clientPortal for lists and arrays  ([#7104](https://github.com/erxes/erxes/issues/7104)) ([b40ff60](https://github.com/erxes/erxes/commit/b40ff605efb355248a82a4a9c692c3f95ed235fb))
* workspace general settings bug ([#6883](https://github.com/erxes/erxes/issues/6883)) ([3612088](https://github.com/erxes/erxes/commit/3612088b72ece2b59ba98f844290a1815c8e6c5d))


### Features

* Accounting ac report ([#6742](https://github.com/erxes/erxes/issues/6742)) ([4d3f6d5](https://github.com/erxes/erxes/commit/4d3f6d59af124b5406ec8074aeadf310efab349a))
* accounting census and show liveRemainder ([#7279](https://github.com/erxes/erxes/issues/7279)) ([d3c8986](https://github.com/erxes/erxes/commit/d3c8986a5f329a79bcaa5b6fc6ff430baae416d5))
* add  export, import on Products ([#6904](https://github.com/erxes/erxes/issues/6904)) ([837de95](https://github.com/erxes/erxes/commit/837de955dca4d48a90dd7e8e0d3c42e41ddd8542))
* Add 20 most popular fonts to FontFamilyButton ([#6860](https://github.com/erxes/erxes/issues/6860)) ([bcd891d](https://github.com/erxes/erxes/commit/bcd891d8de9fe4d8168cf3bd316f95ddb3769fe7))
* add a new client portal post list query that supports offset-based pagination ([#6956](https://github.com/erxes/erxes/issues/6956)) ([7a6c14e](https://github.com/erxes/erxes/commit/7a6c14e7b77882a76ef996c50b09a7cade435342))
* add activity logs to sales_api ([#6762](https://github.com/erxes/erxes/issues/6762)) ([a19220c](https://github.com/erxes/erxes/commit/a19220cf195724082570b79859865c51844b5453))
* add auth token logic ([7bb73bb](https://github.com/erxes/erxes/commit/7bb73bbdc82d3eb355c46526d4836fa12b6cf580))
* add back button to report filter  ([148c375](https://github.com/erxes/erxes/commit/148c3752ed409a96f771edd2a92b09124da97cc7))
* add client portal ticket management functionality ([#6928](https://github.com/erxes/erxes/issues/6928)) ([8b4e0c9](https://github.com/erxes/erxes/commit/8b4e0c9cf66321789b547baf3ea756f4cac78574))
* add client protal ticket detail query ([1a4f297](https://github.com/erxes/erxes/commit/1a4f2972b2b82e43d84b9ab3b46649f53b54e6e0))
* add copy-ID actions to tag and category tables and surface an external Web Builder link in the content navigation. ([77b024d](https://github.com/erxes/erxes/commit/77b024dc24fd1726211fbbe3539fe627466c8f1a))
* add cpGetDeploymentEvents query  ([c5c0531](https://github.com/erxes/erxes/commit/c5c0531def7b5dd965b12bd850048e6abba73b5b))
* add cpInvoicesCheck  ([11ffffb](https://github.com/erxes/erxes/commit/11ffffbbf20f4f297e1796f3154464b958901229))
* add cpTags query for client portal ([5116675](https://github.com/erxes/erxes/commit/5116675dc8d4d64107d8678a84ca8fe054d3fa73))
* add datefilter to cmsPostList query ([#6976](https://github.com/erxes/erxes/issues/6976)) ([93fff9a](https://github.com/erxes/erxes/commit/93fff9aacb053c3a50d0d4dd4fe39a417cfb7aa8))
* add decline triage feature and add status to triage([#6868](https://github.com/erxes/erxes/issues/6868)) ([c0e7079](https://github.com/erxes/erxes/commit/c0e707935b7b47d78a1f00ffbc81cdbdd83063f0))
* add env hide modules ([6326729](https://github.com/erxes/erxes/commit/63267291d76ec6787a4ee58a0f0f587189490d29))
* add explicit `_id` existence checks for customer and user objects in various integration modules. ([637341e](https://github.com/erxes/erxes/commit/637341e46d906869ca1c8a1269f3ad54d23405d7))
* add form widget implementation with multi-step form support and routing restructuring ([#6963](https://github.com/erxes/erxes/issues/6963)) ([82e2fbb](https://github.com/erxes/erxes/commit/82e2fbb0ad794a082643439685a9042d7842c236))
* add import export teammember, download template file for custom… ([#6921](https://github.com/erxes/erxes/issues/6921)) ([9088d0b](https://github.com/erxes/erxes/commit/9088d0b5bba2c9a89425fcd228db4b961c5caa5e))
* add inbox insight  ([40cf350](https://github.com/erxes/erxes/commit/40cf3500ea9bda3d2bb87ca56f4734b3e6f0b490))
* add loading state for plugin configuration and update NotFoundPage to display loading screen ([b3c87d9](https://github.com/erxes/erxes/commit/b3c87d96069a7a8856cd5e704cc0625836ec1abf))
* add LogsIndexPage and integrate logs routing in SettingsRoutes ([b1e243c](https://github.com/erxes/erxes/commit/b1e243c9d0f295afdaa8304416fbd5cb697550f4))
* add members in project ([6d3c94f](https://github.com/erxes/erxes/commit/6d3c94fcf9d2c7a9acacae5b57cf6002e33f6c97))
* add multiple category selection and improve service charge handling  ([da11d42](https://github.com/erxes/erxes/commit/da11d42cf433702fb57844782e405b71b156034c))
* add notification sound for frontline widgets  ([f6cb251](https://github.com/erxes/erxes/commit/f6cb251a3ec58bb2cbca6277c8969328e3e438a2))
* add pipeline-aware product filtering on the backend and enable opening PMS/TMS ([#7106](https://github.com/erxes/erxes/issues/7106)) ([62f8184](https://github.com/erxes/erxes/commit/62f81847606052685079d13abffcd7d057a51511))
* add posCovers query and align schema with sales_api ([#7170](https://github.com/erxes/erxes/issues/7170)) ([8e81ba4](https://github.com/erxes/erxes/commit/8e81ba43b7e6e0e35ea958a5c087c0a9489898c6))
* add ProductsTotalCount component and improve block editor content sync (among other changes) ([#6959](https://github.com/erxes/erxes/issues/6959)) ([cf79fe8](https://github.com/erxes/erxes/commit/cf79fe861b7a83a0b4f21b2feb5612d1d75ecbe5))
* add propertiesData to CP user registration ([6b02a75](https://github.com/erxes/erxes/commit/6b02a75356d90b9c27e505feaa06be57ae6d534c))
* add REACT_APP_HIDE_CORE_MODULES env ([97691ba](https://github.com/erxes/erxes/commit/97691ba8775ae5d8b2e4077e938f64a9cccf9993))
* add redis logic on app token ([84c2e87](https://github.com/erxes/erxes/commit/84c2e870f9d7ec5e699911311a74a6efd96d6343))
* add release it and revert gateway dockerfile ([f1fbae3](https://github.com/erxes/erxes/commit/f1fbae353ca745d34db4a6057905e445b2e2c59b))
* add stageId on ticket collection ([#7250](https://github.com/erxes/erxes/issues/7250)) ([9c939c0](https://github.com/erxes/erxes/commit/9c939c0ba62696fba58c126bbf83cfa5ac34ffbb))
* add status field to page ([#7034](https://github.com/erxes/erxes/issues/7034)) ([182c447](https://github.com/erxes/erxes/commit/182c4479d64381256cb388ee3bc91e67777562f6))
* add template in operation ([a3604fd](https://github.com/erxes/erxes/commit/a3604fd87ff878554eb314829eeca8446d5a1e40))
* add tooltip for marking notifications as read in NotificationItem ([f896848](https://github.com/erxes/erxes/commit/f896848de9738c05d48177bd9c2fa30990090f16))
* add tourism tms development  ([6f95ccc](https://github.com/erxes/erxes/commit/6f95ccce0cc8f35b3b0349a93f437ae7769f3cb0))
* **client-portal:** add edit & delete actions to client portal list ([#6886](https://github.com/erxes/erxes/issues/6886)) ([6919c07](https://github.com/erxes/erxes/commit/6919c074fc4ebabc4b4d073a05a113fde9a05653))
* clientportal ui,notification ([#6906](https://github.com/erxes/erxes/issues/6906)) ([89544e5](https://github.com/erxes/erxes/commit/89544e5db9fdd04deaecbec75e2210372ee868bd))
* cms translation ([#7173](https://github.com/erxes/erxes/issues/7173)) ([0688879](https://github.com/erxes/erxes/commit/0688879025bc137c84810301264749764b41fb9d))
* content cms enhacement ([#7056](https://github.com/erxes/erxes/issues/7056)) ([162809e](https://github.com/erxes/erxes/commit/162809e86af15eae2abeff75f2c625595250b499))
* core contacts impovements ([560e6e6](https://github.com/erxes/erxes/commit/560e6e630cd281c7a8c5d0a11903db6ee154c947))
* core settings enhancements ([42c709f](https://github.com/erxes/erxes/commit/42c709f8b8aa10213d26eb1d0794c32ae992a6be))
* core stabilization ([#6941](https://github.com/erxes/erxes/issues/6941)) ([b29f1e1](https://github.com/erxes/erxes/commit/b29f1e1e035395425a141d4ab475dded4de75b5a))
* **core-api:** add chunked file upload support for large files ([1387406](https://github.com/erxes/erxes/commit/13874062013edd3237f43efdee9d2b7f7a9bb5fb))
* ecommerce module ([#7091](https://github.com/erxes/erxes/issues/7091)) ([1a3eca2](https://github.com/erxes/erxes/commit/1a3eca27db70dff38a7bb2647bfc18fac83877ca))
* enable self-editing for team member profiles and refactor permission checks ([d74b17e](https://github.com/erxes/erxes/commit/d74b17e1fab823ae5c81c4a6906f9a1fc3045a98))
* enhance client portal and document management features ([#6943](https://github.com/erxes/erxes/issues/6943)) ([ec360e5](https://github.com/erxes/erxes/commit/ec360e59c5964d57aee55e153d1103c2d4e07702))
* enhance client portal ticket user handling ([c885696](https://github.com/erxes/erxes/commit/c885696d86153c9b4787f035fe5aad6ee3493301))
* enhance email broadcast functionality ([#6857](https://github.com/erxes/erxes/issues/6857)) ([8567dae](https://github.com/erxes/erxes/commit/8567daee6300de700bf6b511e1e1fd9731a3e4c5))
* enhance RenderPluginsComponentWrapper and update UIConfig with new widget flags ([#6912](https://github.com/erxes/erxes/issues/6912)) ([2d3f00f](https://github.com/erxes/erxes/commit/2d3f00f2e61a47a3634afc16cca377b93e454f37))
* enhance tag filtering and validation ([e6ef669](https://github.com/erxes/erxes/commit/e6ef669bc366ec21859f9b49aa11e9ed4d4d33fa))
* enhance tag query and filtering for client portal ([#6927](https://github.com/erxes/erxes/issues/6927)) ([657a2f7](https://github.com/erxes/erxes/commit/657a2f722265386d68949ee6582daee92169b006))
* Enhance ticket management by adding propertiesData support, including validation and schema updates across backend and frontend. ([#7062](https://github.com/erxes/erxes/issues/7062)) ([b493512](https://github.com/erxes/erxes/commit/b493512c880478404c6c35a18f3ba6fd6d8738e9))
* enhance user notification settings ([#7038](https://github.com/erxes/erxes/issues/7038)) ([daf32ff](https://github.com/erxes/erxes/commit/daf32ffa11fdcbfc2f67eda556b5671efec21c9e))
* enhanced menu and page schemas to support language selection and translation management ([#7149](https://github.com/erxes/erxes/issues/7149)) ([f0c453e](https://github.com/erxes/erxes/commit/f0c453effed32e7e6e7cb28ae770cbd2f3d1afba))
* Enhances CMS with skip-based pagination, improved sorting, UI updates, and language support, while consolidating constants and types ([#6954](https://github.com/erxes/erxes/issues/6954)) ([f61090b](https://github.com/erxes/erxes/commit/f61090b14d8b4406b85f07479bf5f94a5a4b1d53))
* exchange Rates to mongolian ([#6918](https://github.com/erxes/erxes/issues/6918)) ([6aa3f91](https://github.com/erxes/erxes/commit/6aa3f914de81ca77e251568c0ee265ba1be4eeb1))
* fix customfieldDatas  ([4c3cbf9](https://github.com/erxes/erxes/commit/4c3cbf958ec7291e359a0d2ae4e0be1f72894662))
* frontline add brand to integrations and refactor ticket permission UI ([cbf8486](https://github.com/erxes/erxes/commit/cbf8486c11e99c13fe98f2028d2ef1d633073758))
* frontline imap ([#6887](https://github.com/erxes/erxes/issues/6887)) ([09580fb](https://github.com/erxes/erxes/commit/09580fb448211d87fb26a7136a426a81b8da831f))
* frontline inbox assign and report call filter  ([7ff023c](https://github.com/erxes/erxes/commit/7ff023c6fe6b41a9d9c0b15e3bcd1526f8e1d80f))
* frontline knowledgebase api ([0ce2ae7](https://github.com/erxes/erxes/commit/0ce2ae7cd786dbb479d3739bb0c424a890166e5e))
* frontline remove channel members many  ([#7119](https://github.com/erxes/erxes/issues/7119)) ([f5ee34e](https://github.com/erxes/erxes/commit/f5ee34ebbedad98494b655260e92d51a6c3ff7ad))
* frontline ticket attachment ([0e559fc](https://github.com/erxes/erxes/commit/0e559fcb9188716e9557f4d9fcf4cf31ce41cbcf))
* frontline-ticket add logic to show only tickets assigned to the user ([1915944](https://github.com/erxes/erxes/commit/1915944570181091acd3552061a1385377981c69))
* **frontline:** add mobile notification feature  ([4d872ba](https://github.com/erxes/erxes/commit/4d872ba7f353cd83d780bd1dc97367bcf0b92bd4))
* **frontline:** implement ticket pipeline delete action in UI ([00d2ac7](https://github.com/erxes/erxes/commit/00d2ac73fd039a502fa59a7c5e624aa6e3b20e16))
* implement bulk form deletion functionality ([#6939](https://github.com/erxes/erxes/issues/6939)) ([2e7642a](https://github.com/erxes/erxes/commit/2e7642a8b1ee34d14e2276a76f7c2310e4db3cb3))
* implement permission-based access control system ([67e0e92](https://github.com/erxes/erxes/commit/67e0e921673778e05ab44fd938b2e63324107c0c))
* implement properties module migration and UI improvements ([#6870](https://github.com/erxes/erxes/issues/6870)) ([380b0ae](https://github.com/erxes/erxes/commit/380b0ae53ce59cf0324b1c939b36bce189340fc6))
* implement template module & structure ([#7070](https://github.com/erxes/erxes/issues/7070)) ([ba4fe22](https://github.com/erxes/erxes/commit/ba4fe22f7d07faee7c41d903d4edf66ebd5fe5c6))
* implement user-scoped permissions for team member updates ([ac9897f](https://github.com/erxes/erxes/commit/ac9897f93a6f8d87676e733337e3e9c470957875))
* implements the sales pos order feature, adding comprehensive order management functionality ([#7201](https://github.com/erxes/erxes/issues/7201)) ([6b998e2](https://github.com/erxes/erxes/commit/6b998e2ac173808b4edeaf31dbb9004fdf500326))
* improve the CMS post creation experience by restructuring the content editor and post type handling ([#6840](https://github.com/erxes/erxes/issues/6840)) ([92299c2](https://github.com/erxes/erxes/commit/92299c2638ae767dd36e466c0ef86726dc62a9f0))
* insurance plugin ([#6973](https://github.com/erxes/erxes/issues/6973)) ([f56d752](https://github.com/erxes/erxes/commit/f56d7520ef5794b8deb4707284b329cda2bcbd2d))
* **insurance:** improve contract and customer filtering with enhanced queries ([#7067](https://github.com/erxes/erxes/issues/7067)) ([9171a0d](https://github.com/erxes/erxes/commit/9171a0d4e5778df0c01b7b4a9cb32fa6850f9cfb))
* **insurance:** introduce insurance plugin ([#6869](https://github.com/erxes/erxes/issues/6869)) ([4e7673e](https://github.com/erxes/erxes/commit/4e7673ef78e46074aec43c116f5c467da849d115))
* integrate FieldsInDetail component into CompanyDetail and CustomerDetail with improved layout ([d694fd0](https://github.com/erxes/erxes/commit/d694fd0e4e1c43adb60584e22f442c347b0447a8))
* integrate graphql resolvers and schemas for loyalty features ([#6792](https://github.com/erxes/erxes/issues/6792)) ([04621a2](https://github.com/erxes/erxes/commit/04621a247eed552b8078de018e52a03c1dc752c8))
* Introduce a new unified tagging system across tasks and settings, integrating inline tag assignment, tag type management, and updated backend tag type metadata. ([f4d0e2d](https://github.com/erxes/erxes/commit/f4d0e2db26770b9291a333ec1608e2873229a8d8))
* Introduce a ticket properties tab in the frontline ticket detail view to display and edit custom fields ([#6980](https://github.com/erxes/erxes/issues/6980)) ([2cf73b6](https://github.com/erxes/erxes/commit/2cf73b678c28a6e3c1a478edbadcc50669e25201))
* invCost report and some refactors ([#6764](https://github.com/erxes/erxes/issues/6764)) ([7036fe7](https://github.com/erxes/erxes/commit/7036fe71b524b3aab153c184a9dabc2d5a04b0c1))
* Loyalty pluging convert ([#6879](https://github.com/erxes/erxes/issues/6879)) ([2be0b03](https://github.com/erxes/erxes/commit/2be0b037e1e89154dbad0added6dadf422b849a5))
* migrate loyalty & pricing trpc consumers ([#7144](https://github.com/erxes/erxes/issues/7144)) ([c34adcf](https://github.com/erxes/erxes/commit/c34adcfb3c52f14d6946cc9bd5b3d3b9fb5bef12))
* **mongolian_api:** add productPlaces module and ebarimt improve  ([#6739](https://github.com/erxes/erxes/issues/6739)) ([6ce0489](https://github.com/erxes/erxes/commit/6ce04897233c1d21184784fed5c5a3a22008209c))
* new flag for website reservation locking and extend day model with titles. ([#7086](https://github.com/erxes/erxes/issues/7086)) ([a231365](https://github.com/erxes/erxes/commit/a231365afabf76e71fef1c0b5dcd847359b11861))
* notification sound in inbox ([#7208](https://github.com/erxes/erxes/issues/7208)) ([4ff3b7e](https://github.com/erxes/erxes/commit/4ff3b7e6554dc3be81bf6e1b8fe8c036d3837606))
* permissions core check ([20f77d4](https://github.com/erxes/erxes/commit/20f77d4c57ae0ddead366ed9a4f581d019d88d8d))
* permissions view  ([237fef2](https://github.com/erxes/erxes/commit/237fef2c55a2edbb014c07ce04f14197f64a4bec))
* **pos:** add service charge field to payment configuration ([deae4d7](https://github.com/erxes/erxes/commit/deae4d7d7c058b4c0a402c312eb6b1ea0032fce1))
* posts media videoUrl field  ([23ec840](https://github.com/erxes/erxes/commit/23ec840a9a410c59b6176feba41d35600dda6c04))
* **pos:** update pos delete and settings page ([#6845](https://github.com/erxes/erxes/issues/6845)) ([57d6563](https://github.com/erxes/erxes/commit/57d65636e24fb7afc8a901546384d422c584130d))
* product uoms ([#6818](https://github.com/erxes/erxes/issues/6818)) ([e2488fb](https://github.com/erxes/erxes/commit/e2488fbec7f98edbdd19d0a79f8c169d787492c9))
* products add settings configuration  ([c98d2c5](https://github.com/erxes/erxes/commit/c98d2c59bb098b4ec22c475b90a821538279bcb1))
* products remainder and discount schema and census ([#7055](https://github.com/erxes/erxes/issues/7055)) ([09c747a](https://github.com/erxes/erxes/commit/09c747a63939ac0530a68d6ae4771a4cecf38ea6))
* **properties:** add client portal queries with offset pagination ([#7047](https://github.com/erxes/erxes/issues/7047)) ([eaa4e48](https://github.com/erxes/erxes/commit/eaa4e486788d7522cdbde7952c601311422f581d))
* refine CMS content management UX and translation handling across posts, custom fields, and listing pages ([b13372d](https://github.com/erxes/erxes/commit/b13372de8e0e3ccb2fb94e21ee66b775b45a668d))
* remainder with products ([#7088](https://github.com/erxes/erxes/issues/7088)) ([2579e01](https://github.com/erxes/erxes/commit/2579e013ac202431edfcd1b681438c12e7a9b81d))
* remove ticket required ([6ede5e6](https://github.com/erxes/erxes/commit/6ede5e66fb1ab93dfa7e439365602b8bbf177381))
* sales deal sync to accounting transaction ([#6901](https://github.com/erxes/erxes/issues/6901)) ([3c8fc06](https://github.com/erxes/erxes/commit/3c8fc06efe276c0cf272e9b35946e3c362f26172))
* ticket add status filter to ticket list  ([d9c528e](https://github.com/erxes/erxes/commit/d9c528e218d216d3a99618465d4913bc513fa2d6))
* **ticket:** add frontline permissions ([91dd0ed](https://github.com/erxes/erxes/commit/91dd0ed8e7d645d0c3ff943aa945db839179273d))
* **tour:** add flexible date scheduling  ([f8a6335](https://github.com/erxes/erxes/commit/f8a633532771b023f17d61eb99f36c05de76aa9d))
* ui for broadcast module & replace message queue to worker ([#6805](https://github.com/erxes/erxes/issues/6805)) ([35e22b0](https://github.com/erxes/erxes/commit/35e22b0eb4159165cfa351b5833a6bd83d095ce1))
* Unify and simplify authentication and onboarding UI flows while improving focus handling and removing SaaS-specific branches. ([#6953](https://github.com/erxes/erxes/issues/6953)) ([29081bf](https://github.com/erxes/erxes/commit/29081bff1b1402b403b785f8009d69dbbb5f15c6))
* webbuilder version 3 ([5189d79](https://github.com/erxes/erxes/commit/5189d79ec70deee50056390111e3e72e2c1ac9a2))


### Performance Improvements

* improve automations ui ([42c2ce3](https://github.com/erxes/erxes/commit/42c2ce3de0549b61280f024b5c0f8b0b6cc617b1))
* improve ci ([4af0ebc](https://github.com/erxes/erxes/commit/4af0ebcf9150dcb63391e3861d5f4ffee85e5f03))
* improve ci and dockerfiles ([0fe58a6](https://github.com/erxes/erxes/commit/0fe58a634a8f5ad575e2c6d5ea90cb6d1e486c53))
* improve dockerfiles ([a60f251](https://github.com/erxes/erxes/commit/a60f251a15f6281365a4dee64a51e2b30cfa7853))
* improvement products  ([f1d9153](https://github.com/erxes/erxes/commit/f1d91531ebd7cd0c802db0486b5360b80bc36748))
* pos order ui ([952de31](https://github.com/erxes/erxes/commit/952de317346d7727bad6a621ecff4a5807ce46e2))


### Reverts

* client portal authentication changes ([05d19cb](https://github.com/erxes/erxes/commit/05d19cb80735a0fc73dcddc0da38954a3c443064))
* disable early return in client portal token middleware ([da7db14](https://github.com/erxes/erxes/commit/da7db1476063ff4ac6f9b41f32b6b6a7b9366cf7))
* gateway docker ([706b122](https://github.com/erxes/erxes/commit/706b122e8ba796260fa30efcdb6e1e32b6762816))
