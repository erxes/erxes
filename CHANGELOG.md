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

