# [0.13.0](https://github.com/erxes/erxes/compare/0.12.1...0.13.0) (2020-03-17)


### Bug Fixes

* **deal/task/ticket/growthHack:** not copying labels ([7f99cf9](https://github.com/erxes/erxes/commit/7f99cf948df86a38b0754aba456a8b5c9e5b1e4d)), closes [#1598](https://github.com/erxes/erxes/issues/1598)
* **docker:** fix dockerfile permission error ([68ef0b3](https://github.com/erxes/erxes/commit/68ef0b387e61b174f5e408c4d16ce7fdb2b53e52))
* **drone:** workaround for wrong version information showing on version.json ([ea0aa9f](https://github.com/erxes/erxes/commit/ea0aa9f3ca3794c4081b56916b8a1c9ba0d71679))
* **form:** checkbox error ([4b64aa5](https://github.com/erxes/erxes/commit/4b64aa573fdb2464fd309582b09631ec4720610f)), closes [#157](https://github.com/erxes/erxes/issues/157)
* **form:** multiple submit bug ([e04e206](https://github.com/erxes/erxes/commit/e04e2063a45abfcfa12206f6d5816c4b15aa30fd)), closes [#160](https://github.com/erxes/erxes/issues/160)
* little fix in nylas doc ([e9dd5bd](https://github.com/erxes/erxes/commit/e9dd5bd46a2c6aa82bec8c438bf5d64c76945d89))
* **typo:** url to push-notifications in overview ([#1719](https://github.com/erxes/erxes/issues/1719)) ([48f4a45](https://github.com/erxes/erxes/commit/48f4a451c6871749928827b3eb2c26a52a31fb40))
* **upload:** forbidden error ([2c84ad5](https://github.com/erxes/erxes/commit/2c84ad5d889a47f2a8e801069791a6f260e9dec4)), closes [#156](https://github.com/erxes/erxes/issues/156)
* merge with master and fix conflict ([01eb251](https://github.com/erxes/erxes/commit/01eb25150e0aa5330922e1b0d051a8d3f6a14fba))
* reset submit state after fail mutation ([aa62e8a](https://github.com/erxes/erxes/commit/aa62e8a69e4511560146861a409a9804731a5f73))
* send missing argument in onSubmitResolve ([0bc5201](https://github.com/erxes/erxes/commit/0bc52017e6e4e7b1a60ec49f87624005e78648ab))
* **widget:** fix popup can not cancelling  (close [#1672](https://github.com/erxes/erxes/issues/1672)) ([b9fefdf](https://github.com/erxes/erxes/commit/b9fefdf41e2a47bcba0bf160a9d0f10756a433e3))


### Features

* **customers:** added birthdate & gender ([f5af3e7](https://github.com/erxes/erxes/commit/f5af3e7011c31a1ee614e1c41a83d8562973fdd5)), closes [#1641](https://github.com/erxes/erxes/issues/1641)
* **deal/task/ticket:** add load more on archived list ([75a0d50](https://github.com/erxes/erxes/commit/75a0d50c286562fda824ef90f2ac31afd3e30061)), closes [#1739](https://github.com/erxes/erxes/issues/1739)
* **deal/task/ticket:** assignee, checklist activity log ([b7fad20](https://github.com/erxes/erxes/commit/b7fad2020baf8767c93efb349dbcbd16eff8e8be)), closes [#1594](https://github.com/erxes/erxes/issues/1594)
* **env:** store env variables to database ([a4fa05f](https://github.com/erxes/erxes/commit/a4fa05f96f247b42d1ea37e25693b52d6ab56c52)), closes [#1700](https://github.com/erxes/erxes/issues/1700)
* **form:** ability call submit action from parent website ([dbb252c](https://github.com/erxes/erxes/commit/dbb252cf65f75eb8c0a20f2b45a1f023ee51efbe)), closes [#158](https://github.com/erxes/erxes/issues/158)
* **form:** ability to change css from parent ([d833901](https://github.com/erxes/erxes/commit/d8339011af1b039c5d2bab531b680f6f224e4313)), closes [#159](https://github.com/erxes/erxes/issues/159)
* **growthhack:** change UI of growthhack page entirely (close [#1634](https://github.com/erxes/erxes/issues/1634)) ([78ca651](https://github.com/erxes/erxes/commit/78ca651c3f2eb4b721b9c059e4fe35f4e4e27215))
* **heroku:** added heroku deployment ([b313681](https://github.com/erxes/erxes/commit/b313681bfdf07660875d3fe432a39afbc682ecb1)), closes [#848](https://github.com/erxes/erxes/issues/848)
* **installation:** quick install on debian 10 ([5568719](https://github.com/erxes/erxes/commit/55687192fbbccf7409a47637f0ad0f19d886879d)), closes [#1649](https://github.com/erxes/erxes/issues/1649)
* **knowledgebase:** ability run without iframe ([1652c28](https://github.com/erxes/erxes/commit/1652c280ba6e1f6729c1d14526c34590d0de6bfc)), closes [#126](https://github.com/erxes/erxes/issues/126)
* **knowledgebase:** add article reactions ([27d3f21](https://github.com/erxes/erxes/commit/27d3f21315728517add2f51362a6207528856d04)), closes [#128](https://github.com/erxes/erxes/issues/128)
* **language:** add italian language ([0b1a38e](https://github.com/erxes/erxes/commit/0b1a38e63dc1d11b580964ddd289aa45c4eb7cfb))
* **messenger:** ability to hide launcher from admin ([3d72041](https://github.com/erxes/erxes/commit/3d7204149b0393e72e05546ff8d6baf7f6104e4d)), closes [#123](https://github.com/erxes/erxes/issues/123)
* nylas-gmail doc ([78aa297](https://github.com/erxes/erxes/commit/78aa29784d1cb825e5e9c88ebeafe5dd8ffd6983))
* **messenger:** added showErxesMessenger trigger ([80469cc](https://github.com/erxes/erxes/commit/80469cc80f5ab1ca0840e516979d44751bbe60de)), closes [#148](https://github.com/erxes/erxes/issues/148)
* **segments:** reimplemented using elk ([016aa66](https://github.com/erxes/erxes/commit/016aa667e1f9f476130838e3e61d63ac9f72fd59)), closes [#1686](https://github.com/erxes/erxes/issues/1686)
* **settings:** add engage environment variables ([5f3a595](https://github.com/erxes/erxes/commit/5f3a5956f1a908601632339c25af8d689c53d7ee)), closes [#1724](https://github.com/erxes/erxes/issues/1724)
* **settings:** improve UI of channel, brands page (close [#1597](https://github.com/erxes/erxes/issues/1597)) ([0a76eb7](https://github.com/erxes/erxes/commit/0a76eb7e5f000032b3980bdfd17a3b8f5edc8698))
* **translation:** add indonesia lang ([2a893c8](https://github.com/erxes/erxes/commit/2a893c868383942655a52a46690270d6a11a3d9b))
* **videoCall:** add video call ([3397802](https://github.com/erxes/erxes/commit/3397802ea46e7ccfb6625e9ad5ac1f2c10bcfc84))


### Performance Improvements

* **board:** change UI of board pipeline, campaign & projects (close [#1612](https://github.com/erxes/erxes/issues/1612)) ([316fad8](https://github.com/erxes/erxes/commit/316fad80a2fff4e2ca3b6ff118df5f473d518f85))
* **common:** choosing the same file doesn't trigger onChange  (close [#1571](https://github.com/erxes/erxes/issues/1571)) ([9848226](https://github.com/erxes/erxes/commit/9848226131ba61c716f66cc106e186cb389f443a))
* **common:** show confirmation when clear team members (close [#1677](https://github.com/erxes/erxes/issues/1677)) ([c5d0fe7](https://github.com/erxes/erxes/commit/c5d0fe7083e5fdb3fef335e5f8e48ecd47bb466d))
* **contacts:** fix page menu or breadcrumb not positioned properly when import contacts (close [#1741](https://github.com/erxes/erxes/issues/1741)) ([93a34e8](https://github.com/erxes/erxes/commit/93a34e8ea4b16aa0ceb7f8f4d5adeff2ac914e5a))
* **contacts:** show gender, birthday in customerDetails (close [#1670](https://github.com/erxes/erxes/issues/1670)) ([61c6532](https://github.com/erxes/erxes/commit/61c6532d2875a7b7074b687a3f7550bfd21705a3))
* **customer:** add new customer and not email visitorContactInfo to open email input field (close [#1573](https://github.com/erxes/erxes/issues/1573)) ([ed89d77](https://github.com/erxes/erxes/commit/ed89d778f9fd5d375d2cd8225f86cf35649d3e14))
* **customer:** change user indicator (close [#1689](https://github.com/erxes/erxes/issues/1689)) ([9c10b86](https://github.com/erxes/erxes/commit/9c10b86c154e4c8f5a06c52ac63c070b30dd575e))
* **customer:** export pop-ups data for customer list when filtering by pop ups ([a62308b](https://github.com/erxes/erxes/commit/a62308b27d104ecc6638b507a2276faecad79fc0)), closes [#1674](https://github.com/erxes/erxes/issues/1674)
* **deal:** improve UI of deal products (close [#1629](https://github.com/erxes/erxes/issues/1629)) ([8da4cb3](https://github.com/erxes/erxes/commit/8da4cb32199eb8a9ef48b96fa763706f277830e8))
* **editor:** show default avatar when user has an invalid avatar (close [#1619](https://github.com/erxes/erxes/issues/1619)) ([a6f2963](https://github.com/erxes/erxes/commit/a6f2963286b944e0b7e6d19d7a6d53c5d27fd848))
* **inbox:** add inbox assign loader (close [#1754](https://github.com/erxes/erxes/issues/1754)) ([1e4c4b8](https://github.com/erxes/erxes/commit/1e4c4b829972a7469c1b605e223569562d97f3c2))
* **integration:** improve integration view in App store ([2f7a16e](https://github.com/erxes/erxes/commit/2f7a16e780baf3af8e0664e43795d4b363517bb7)), closes [#1583](https://github.com/erxes/erxes/issues/1583)
* **knowledgebase:** change UI of knowledge base (close [#1611](https://github.com/erxes/erxes/issues/1611)) ([43497e3](https://github.com/erxes/erxes/commit/43497e3ff62bafd7c7559dacba0f5b6fb0b4c8b7))
* **logs:** enhancement logs ([af6b1fe](https://github.com/erxes/erxes/commit/af6b1fe709025c9c92042b412f7d3fed685c147e)), closes [#1576](https://github.com/erxes/erxes/issues/1576)
* **notification:** add recent, unread tab on notification popup (close [#1560](https://github.com/erxes/erxes/issues/1560)) ([7895e09](https://github.com/erxes/erxes/commit/7895e09e8f4b20f1940c20168af23d4826b5d5c0))
* **onboard:** add video to onboarding robot (close [#1693](https://github.com/erxes/erxes/issues/1693)) ([e9d7dce](https://github.com/erxes/erxes/commit/e9d7dceba5c071141ec11d4d1bc902d9069d2e3e))
* **onboard:** fix onboard youtube url ([26e1a9b](https://github.com/erxes/erxes/commit/26e1a9b47389c7761711d1b1860cf3b83a27cf62))
* **permission:** improve ui of permission, logs page ([c22239a](https://github.com/erxes/erxes/commit/c22239a8d0bc16b4dde0ab817310f7ce0ed58c70))
* **product:** change UI of product and services (close [#1613](https://github.com/erxes/erxes/issues/1613)) ([929c56d](https://github.com/erxes/erxes/commit/929c56d15d5c2e0080649cb838497f2b6b778b11))
* **product:** first registered values of UOM and the currency selected automatically in the deal (close [#1627](https://github.com/erxes/erxes/issues/1627)) ([645e5c5](https://github.com/erxes/erxes/commit/645e5c5d31e8cefd778cebbdf396f0809f31c1dc))
* **product:** fix currency and uom dropdown (close [#1703](https://github.com/erxes/erxes/issues/1703)) ([dbc5c66](https://github.com/erxes/erxes/commit/dbc5c661614497b080c6b8e6d4cad9cc8499b6f7))
* **product:** fix style of manage product service (close [#1680](https://github.com/erxes/erxes/issues/1680)) ([b1b7027](https://github.com/erxes/erxes/commit/b1b7027efcb58dccb80c485bb88b10174781bae1))
* **product:** make it easy to navigate from the Deal edit window to the product service selection window (close [#1675](https://github.com/erxes/erxes/issues/1675)) ([79cbbbe](https://github.com/erxes/erxes/commit/79cbbbef28cf4016c740bd51db6e324d0588844f))
* **properties:** improve ui of properties page ([b27f9e3](https://github.com/erxes/erxes/commit/b27f9e3e527fe3e6c9bcf5edf64b4b6f36572084))
* **settings:** change google button (close [#1694](https://github.com/erxes/erxes/issues/1694)) ([9b428da](https://github.com/erxes/erxes/commit/9b428da31420a427991717b63de86860150cd554))
* **settings:** display no channel, brand even though there are few (close [#1621](https://github.com/erxes/erxes/issues/1621)) ([99a4cd8](https://github.com/erxes/erxes/commit/99a4cd875a90cca8649221a03c54f8efe411d140))
* **settings:** fix integration search in app store (close [#1673](https://github.com/erxes/erxes/issues/1673)) ([9ea09ef](https://github.com/erxes/erxes/commit/9ea09efc896dc35215d9f53cfd56d618ce041d29))
* **tags:** improve ui of tags ([b70ab3f](https://github.com/erxes/erxes/commit/b70ab3f9627007debb00e2f21d3c5648843e686c))
* **teaminbox:** fix overlaping image in editor (close [#1667](https://github.com/erxes/erxes/issues/1667)) ([2e95430](https://github.com/erxes/erxes/commit/2e95430f45cbca6466b9db80122b471ee7f08235))
* **teaminbox:** fix response template not sent when press enter (close [#1642](https://github.com/erxes/erxes/issues/1642)) ([f2f18a4](https://github.com/erxes/erxes/commit/f2f18a410eea4df295ccb1e5a7e0ff2ee63a526e))
* **teaminbox:** overlapping big image in message item (close [#1668](https://github.com/erxes/erxes/issues/1668)) ([ee10d9e](https://github.com/erxes/erxes/commit/ee10d9ef7f7c3921454720f3a33426421bf7c43f))
* **translation:** loading all locales ([20bb930](https://github.com/erxes/erxes/commit/20bb930ef82e144cac8025b26d0c2848ee580656)), closes [#130](https://github.com/erxes/erxes/issues/130)


### BREAKING CHANGES

* **translation:** renamed some language codes (np -> hi, jp -> ja, kr -> ko, ptBr -> pt-br, vn -> vi, zh -> zh-cn)

## [0.12.1](https://github.com/erxes/erxes/compare/0.12.0...0.12.1) (2020-03-09)


### Bug Fixes

* **integrations:** invalid check in conversations gmail kind ([0e8cacd](https://github.com/erxes/erxes/commit/0e8cacd))

# [0.12.0](https://github.com/erxes/erxes/compare/0.11.2...0.12.0) (2020-01-08)


### Bug Fixes

* able to add cc bcc in reply ([#1528](https://github.com/erxes/erxes/issues/1528)) ([8af13a0](https://github.com/erxes/erxes/commit/8af13a0))


### Features

* **checklist:** add possibility to convert checklist item to card and remove close [#1562](https://github.com/erxes/erxes/issues/1562) ([fa7a9a0](https://github.com/erxes/erxes/commit/fa7a9a0))
* **email:** nylas forward feature ([#1526](https://github.com/erxes/erxes/issues/1526)) ([50dd13a](https://github.com/erxes/erxes/commit/50dd13a))
* **engage:** show active process logs ([9f6de8c](https://github.com/erxes/erxes/commit/9f6de8c)), closes [#1538](https://github.com/erxes/erxes/issues/1538)
* **engage:** verification management ([509c32d](https://github.com/erxes/erxes/commit/509c32d)), closes [#1539](https://github.com/erxes/erxes/issues/1539)
* **integration:** added web kinded messenger app ([a29ce77](https://github.com/erxes/erxes/commit/a29ce77)), closes [#1507](https://github.com/erxes/erxes/issues/1507)
* **permissions:** improved filter ([58ebf77](https://github.com/erxes/erxes/commit/58ebf77)), closes [#1512](https://github.com/erxes/erxes/issues/1512)


### Performance Improvements

* **checklist:** can not add checklist item sometimes close [#1566](https://github.com/erxes/erxes/issues/1566) ([db39ba4](https://github.com/erxes/erxes/commit/db39ba4))
* **engage:** show sent content close [#1523](https://github.com/erxes/erxes/issues/1523) ([f5d3c50](https://github.com/erxes/erxes/commit/f5d3c50))
* **growthHack:** show all campaign ([60cc9e8](https://github.com/erxes/erxes/commit/60cc9e8))
* **inbox:** improve attachment view in inbox (close [#1568](https://github.com/erxes/erxes/issues/1568)) ([c45de57](https://github.com/erxes/erxes/commit/c45de57))
* **upload:** warning when upload large file ([09bceda](https://github.com/erxes/erxes/commit/09bceda))
* **upload:** warning when upload large file ([d66222d](https://github.com/erxes/erxes/commit/d66222d))

## [0.11.2](https://github.com/erxes/erxes/compare/0.11.1...0.11.2) (2019-12-15)

## [0.11.1](https://github.com/erxes/erxes/compare/0.11.0...0.11.1) (2019-12-15)


### Bug Fixes

* **board:** improve checklist ([0571565](https://github.com/erxes/erxes/commit/0571565)), closes [#1489](https://github.com/erxes/erxes/issues/1489) [#1490](https://github.com/erxes/erxes/issues/1490) [#1491](https://github.com/erxes/erxes/issues/1491) [#1492](https://github.com/erxes/erxes/issues/1492)
* **customer:** add save and continue button close [#1451](https://github.com/erxes/erxes/issues/1451) ([5a3e949](https://github.com/erxes/erxes/commit/5a3e949))
* **customers:** use renderFullName in SelectCustomers ([67aa25d](https://github.com/erxes/erxes/commit/67aa25d)), closes [#1466](https://github.com/erxes/erxes/issues/1466)
* **date:** displaying numbers as date ([657eabb](https://github.com/erxes/erxes/commit/657eabb)), closes [#1460](https://github.com/erxes/erxes/issues/1460)
* **deal/ticket/task:** saving labels on click ([dc33631](https://github.com/erxes/erxes/commit/dc33631)), closes [#1462](https://github.com/erxes/erxes/issues/1462)
* **inbox:** overlapping text in sidebar ([ed5fddf](https://github.com/erxes/erxes/commit/ed5fddf))
* **inbox:** show email subject close [#1468](https://github.com/erxes/erxes/issues/1468) ([dac6466](https://github.com/erxes/erxes/commit/dac6466))
* **integration:** add ability to edit common fields ([fef660a](https://github.com/erxes/erxes/commit/fef660a)), closes [#1434](https://github.com/erxes/erxes/issues/1434)
* **labels:** saving labels even no labels changed ([fb1e221](https://github.com/erxes/erxes/commit/fb1e221)), closes [#1461](https://github.com/erxes/erxes/issues/1461)
* **select-with-search:** implemented logic to cancel prev queries ([dbda70c](https://github.com/erxes/erxes/commit/dbda70c)), closes [#1458](https://github.com/erxes/erxes/issues/1458)


### Features

* **common:** add help popover ([072c9a1](https://github.com/erxes/erxes/commit/072c9a1))
* **dea/task/ticket:** add ability to restrict users by assigned & created users ([17fe9f8](https://github.com/erxes/erxes/commit/17fe9f8)), closes [#1428](https://github.com/erxes/erxes/issues/1428)
* **users:** change password from admin ([da05b50](https://github.com/erxes/erxes/commit/da05b50)), closes [#1505](https://github.com/erxes/erxes/issues/1505)


### Performance Improvements

* **contacts:** save & new possibility on customer form. close [#1485](https://github.com/erxes/erxes/issues/1485), Not showing search result if not on the first page. close [#1486](https://github.com/erxes/erxes/issues/1486) ([1c1ca21](https://github.com/erxes/erxes/commit/1c1ca21))
* **contacts:** show action buttons in detail page ([44692de](https://github.com/erxes/erxes/commit/44692de)), closes [#1497](https://github.com/erxes/erxes/issues/1497)
* **integrations:** auto appear install code after saving messenger integration ([2fedfbc](https://github.com/erxes/erxes/commit/2fedfbc))
* **mail:** improve dropdown of from email ([12c0fa7](https://github.com/erxes/erxes/commit/12c0fa7))

# [0.11.0](https://github.com/erxes/erxes/compare/0.10.1...0.11.0) (2019-11-01)


### Bug Fixes

* **attachment:** fix attachment view ([#1265](https://github.com/erxes/erxes/issues/1265)) ([3c83b20](https://github.com/erxes/erxes/commit/3c83b20)), closes [#1257](https://github.com/erxes/erxes/issues/1257)
* **deal/ticket/task/growthHack:** fix copy bug with attachment ([1cce81b](https://github.com/erxes/erxes/commit/1cce81b)), closes [#1268](https://github.com/erxes/erxes/issues/1268)
* **inbox:** some teammembers are not showing in assign component ([3f894fb](https://github.com/erxes/erxes/commit/3f894fb)), closes [#1236](https://github.com/erxes/erxes/issues/1236)
* **insights:** conversation insight UI improvement ([6d72db1](https://github.com/erxes/erxes/commit/6d72db1)), closes [#1215](https://github.com/erxes/erxes/issues/1215)
* **notes:** add mutation loading in note ([a872401](https://github.com/erxes/erxes/commit/a872401)), closes [#1181](https://github.com/erxes/erxes/issues/1181)
* **notification:** icon not showing, broken date in list ([c0030e3](https://github.com/erxes/erxes/commit/c0030e3)), closes [#1255](https://github.com/erxes/erxes/issues/1255) [#1254](https://github.com/erxes/erxes/issues/1254)


### Features

* **conformity:** generalized deal, ticket, task, company, customer relations ([c5014a9](https://github.com/erxes/erxes/commit/c5014a9)), closes [#1200](https://github.com/erxes/erxes/issues/1200)
* **deal/task/ticket:** improve due date reminder ([e2f8561](https://github.com/erxes/erxes/commit/e2f8561)), closes [#1210](https://github.com/erxes/erxes/issues/1210)
* **growth-hack:** add feature growth hack ([c905f0e](https://github.com/erxes/erxes/commit/c905f0e)), closes [#1113](https://github.com/erxes/erxes/issues/1113) [#1113](https://github.com/erxes/erxes/issues/1113)
* **imap:** add imap feature by nylus ([cf89f7e](https://github.com/erxes/erxes/commit/cf89f7e)), closes [#1367](https://github.com/erxes/erxes/issues/1367)
* **integration:** add chatfuel ([910adbb](https://github.com/erxes/erxes/commit/910adbb)), closes [#1358](https://github.com/erxes/erxes/issues/1358)
* **integrations:** facebook post ([3e377e0](https://github.com/erxes/erxes/commit/3e377e0)), closes [#1108](https://github.com/erxes/erxes/issues/1108)
* **language:** add italian language ([2328f18](https://github.com/erxes/erxes/commit/2328f18))
* **notication:** improve the color of the updated cards of deal / task / ticket ([ec45d95](https://github.com/erxes/erxes/commit/ec45d95)), closes [#1230](https://github.com/erxes/erxes/issues/1230)
* **twitter-dm:** add twitter direct message feature ([9c3f01c](https://github.com/erxes/erxes/commit/9c3f01c)), closes [#1127](https://github.com/erxes/erxes/issues/1127)


### Performance Improvements

* **test:** tested some components ([6bc276b](https://github.com/erxes/erxes/commit/6bc276b)), closes [#1242](https://github.com/erxes/erxes/issues/1242)

## [0.10.1](https://github.com/erxes/erxes/compare/0.10.0...0.10.1) (2019-08-31)


### Bug Fixes

* **notification:** widget and notification popover being out of sync. ([#1223](https://github.com/erxes/erxes/issues/1223)) ([1fdcc25](https://github.com/erxes/erxes/commit/1fdcc25))


### Features

* **deal/task/ticket:** auto save ([51fe182](https://github.com/erxes/erxes/commit/51fe182)), closes [#637](https://github.com/erxes/erxes/issues/637)
* **deal/ticket/task:** added notification color on item  ([e7f9f7c](https://github.com/erxes/erxes/commit/e7f9f7c)), closes [#1232](https://github.com/erxes/erxes/issues/1232) [#1209](https://github.com/erxes/erxes/issues/1209)
* **notification:** add desktop notification ([8d4097f](https://github.com/erxes/erxes/commit/8d4097f)), closes [#1093](https://github.com/erxes/erxes/issues/1093)
* **translation:** add some translations ([b964af3](https://github.com/erxes/erxes/commit/b964af3)), closes [#1144](https://github.com/erxes/erxes/issues/1144)


### Performance Improvements

* **segment:** refactored edit form segment count ([afcde0b](https://github.com/erxes/erxes/commit/afcde0b)), closes [#1131](https://github.com/erxes/erxes/issues/1131)

# [0.10.0](https://github.com/erxes/erxes/compare/0.9.17...0.10.0) (2019-08-15)


### Bug Fixes

* **activity-log:** fix segment log message ([b9bb9bb](https://github.com/erxes/erxes/commit/b9bb9bb)), closes [#1172](https://github.com/erxes/erxes/issues/1172)
* **board:** fix board and stage scroll issue ([980e158](https://github.com/erxes/erxes/commit/980e158))
* **channels:** remove user query and add members to channels ([310e6e1](https://github.com/erxes/erxes/commit/310e6e1)), closes [#1183](https://github.com/erxes/erxes/issues/1183)
* **config:** move config to app store. close [#663](https://github.com/erxes/erxes/issues/663) ([d02a742](https://github.com/erxes/erxes/commit/d02a742))
* **deal/task/ticket:** new boards in the deal tab ([ff02695](https://github.com/erxes/erxes/commit/ff02695))
* **deal/task/ticket:** new boards in the deal tab ([eca30b8](https://github.com/erxes/erxes/commit/eca30b8)), closes [#1038](https://github.com/erxes/erxes/issues/1038)
* **editor:** fix footer buttons position ([2167f88](https://github.com/erxes/erxes/commit/2167f88)), closes [#1133](https://github.com/erxes/erxes/issues/1133)
* **engage:** Show alert when kind is auto ([08410e3](https://github.com/erxes/erxes/commit/08410e3)), closes [#1164](https://github.com/erxes/erxes/issues/1164)
* **engage:** show alert when some field is empty ([aaf0eb9](https://github.com/erxes/erxes/commit/aaf0eb9))
* **form:** fixed common form get value selector ([813acf6](https://github.com/erxes/erxes/commit/813acf6)), closes [#1178](https://github.com/erxes/erxes/issues/1178)
* **inbox:** inbox sidebar counts are not changing reactivily ([0ac81ce](https://github.com/erxes/erxes/commit/0ac81ce)), closes [#1128](https://github.com/erxes/erxes/issues/1128)
* **knowledgebase:** Add kb script description and additional tag ([#1150](https://github.com/erxes/erxes/issues/1150)) ([d326044](https://github.com/erxes/erxes/commit/d326044)), closes [#1143](https://github.com/erxes/erxes/issues/1143)
* **lead:** add description ([6ba5686](https://github.com/erxes/erxes/commit/6ba5686)), closes [#1147](https://github.com/erxes/erxes/issues/1147)
* **lead:** move save button to top ([a2ff78b](https://github.com/erxes/erxes/commit/a2ff78b))
* **lead/engage/messenger:** Fix some naming and Move step save button to top ([#1102](https://github.com/erxes/erxes/issues/1102)) ([72643fb](https://github.com/erxes/erxes/commit/72643fb))
* **logs:** show all teammembers and little refactor in logs ([5bd970a](https://github.com/erxes/erxes/commit/5bd970a)), closes [#1184](https://github.com/erxes/erxes/issues/1184)
* **messenger:** add description in messenger toggle ([7c80da3](https://github.com/erxes/erxes/commit/7c80da3)), closes [#1179](https://github.com/erxes/erxes/issues/1179)
* **notification:** show notification option enabled by default ([3d792e8](https://github.com/erxes/erxes/commit/3d792e8)), closes [#1125](https://github.com/erxes/erxes/issues/1125)
* **status:** erxes status will show correct information ([75d6352](https://github.com/erxes/erxes/commit/75d6352))
* **version:** status page will show correct branch ([3003935](https://github.com/erxes/erxes/commit/3003935))


### Features

* **contacts:** add messenger preview on quick message close [#1041](https://github.com/erxes/erxes/issues/1041) ([9589e44](https://github.com/erxes/erxes/commit/9589e44))
* **deal/task/ticket:** save itemId in querystring ([27a8b26](https://github.com/erxes/erxes/commit/27a8b26)), closes [#1103](https://github.com/erxes/erxes/issues/1103)
* **integration:** reimplement gmail ([090f434](https://github.com/erxes/erxes/commit/090f434)), closes [#1135](https://github.com/erxes/erxes/issues/1135)
* **knowledgebase:** add article reactions ([d283d72](https://github.com/erxes/erxes/commit/d283d72)), closes [#1036](https://github.com/erxes/erxes/issues/1036)
* **messenger:** Add ios, android, single app install description ([24636a2](https://github.com/erxes/erxes/commit/24636a2)), closes [#1132](https://github.com/erxes/erxes/issues/1132)
* **notification:** add realtime ([caf3a9c](https://github.com/erxes/erxes/commit/caf3a9c)), closes [#1121](https://github.com/erxes/erxes/issues/1121)
* **transalation:** add indonesian lang ([5afae50](https://github.com/erxes/erxes/commit/5afae50))


### Performance Improvements

* **common:** replace moment with dayjs ([2cc59e1](https://github.com/erxes/erxes/commit/2cc59e1)), closes [#449](https://github.com/erxes/erxes/issues/449) [#1039](https://github.com/erxes/erxes/issues/1039)
* **deal/ticket/task:** add attachment field ([6995687](https://github.com/erxes/erxes/commit/6995687)), closes [#1029](https://github.com/erxes/erxes/issues/1029)
* **inbox:** Add animated loader in inbox ([#1160](https://github.com/erxes/erxes/issues/1160)) ([aa67923](https://github.com/erxes/erxes/commit/aa67923)), closes [#1099](https://github.com/erxes/erxes/issues/1099)
* **rule:** add description on rule close [#1156](https://github.com/erxes/erxes/issues/1156) ([28519b0](https://github.com/erxes/erxes/commit/28519b0))


### BREAKING CHANGES

* **integration:** remove REACT_APP_INTEGRATIONS_API_URL env
* **common:** renamed some language codes (np -> hi, jp -> ja, kr -> ko, ptBr -> pt-br, vn -> vi, zh -> zh-cn)

## [0.9.17](https://github.com/erxes/erxes/compare/0.9.16...0.9.17) (2019-07-09)


### Bug Fixes

* **board:** fix drag and drop bug ([7d03d14](https://github.com/erxes/erxes/commit/7d03d14)), closes [#1023](https://github.com/erxes/erxes/issues/1023)
* **brands:** fix refetch integration lists in brands Close [#1016](https://github.com/erxes/erxes/issues/1016) ([#1017](https://github.com/erxes/erxes/issues/1017)) ([0ebb928](https://github.com/erxes/erxes/commit/0ebb928))


### Features

* **deal:** change deal, task, ticket background from settings ([70300c7](https://github.com/erxes/erxes/commit/70300c7))
* **deal/ticket/task:** Add watch option for deal, ticket, task and pipeline ([28bfb87](https://github.com/erxes/erxes/commit/28bfb87)), closes [#1013](https://github.com/erxes/erxes/issues/1013)
* **integration:** add show lancher option in messenger ([f5e00d4](https://github.com/erxes/erxes/commit/f5e00d4)), closes [#1015](https://github.com/erxes/erxes/issues/1015)
* **kb:** add background image ([aa2025a](https://github.com/erxes/erxes/commit/aa2025a)), closes [#1021](https://github.com/erxes/erxes/issues/1021)
* **ticket:** add priority indicator circle on list and priority select ([7a8e9ce](https://github.com/erxes/erxes/commit/7a8e9ce))


### Performance Improvements

* **deal:** remove some editor buttons ([cdc0ff8](https://github.com/erxes/erxes/commit/cdc0ff8))

## [0.9.16](https://github.com/erxes/erxes/compare/0.9.15...0.9.16) (2019-07-03)

