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

