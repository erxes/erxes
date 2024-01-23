
    module.exports = {"ads":{},"loan":{"ui":{"srcDir":"/Users/soyombobat-erdene/work/erxes-enterprises/packages/plugin-loan-ui/src","name":"loan","exposes":{"./routes":"./src/routes.tsx"},"routes":{"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-loan-ui/remoteEntry.js","scope":"loan","module":"./routes"},"menus":[{"text":"Contracts","url":"/contract-list","icon":"icon-medal","location":"mainNavigation","permission":"showContracts"},{"text":"Contract types","image":"/images/icons/erxes-01.svg","to":"/settings/contract-types/","action":"loanConfig","scope":"loan","location":"settings","permissions":["manageContracts"]},{"text":"Insurance types","image":"/images/icons/erxes-13.svg","to":"/insurance-types/","action":"loanConfig","scope":"loan","location":"settings","permissions":["manageContracts"]},{"text":"Loan config","image":"/images/icons/erxes-16.svg","to":"/settings/holiday-settings/","action":"loanConfig","scope":"loan","location":"settings","permissions":["manageContracts"]}],"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-loan-ui/remoteEntry.js"}},"neighbor":{"ui":{"srcDir":"/Users/soyombobat-erdene/work/erxes-enterprises/packages/plugin-neighbor-ui/src","name":"neighbor","exposes":{"./routes":"./src/routes.tsx","./productCategoryCreateAction":"./src/containers/NeighborForm.tsx"},"routes":{"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-neighbor-ui/remoteEntry.js","scope":"neighbor","module":"./routes"},"menus":[{"text":"Neighbor","to":"/erxes-plugin-neighbor?type=kindergarden","image":"/images/icons/erxes-05.svg","location":"settings","scope":"neighbor","action":"","permissions":[]}],"productCategoryActions":[{"text":"productCategoryCreateAction","component":"./productCategoryCreateAction","scope":"neighbor"}],"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-neighbor-ui/remoteEntry.js"}},"rentpay":{"ui":{"srcDir":"/Users/soyombobat-erdene/work/erxes-enterprises/packages/plugin-rentpay-ui/src","name":"rentpay","scope":"rentpay","url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-rentpay-ui/remoteEntry.js","exposes":{"./routes":"./src/routes.tsx","./buyerSection":"./src/BuyerSection.tsx","./waiterSection":"./src/WaiterSection.tsx"},"routes":{"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-rentpay-ui/remoteEntry.js","scope":"rentpay","module":"./routes"},"dealRightSidebarSection":[{"text":"buyerSection","component":"./buyerSection","scope":"rentpay"},{"text":"waiterSection","component":"./waiterSection","scope":"rentpay"}],"menus":[]}},"tumentech":{"ui":{"srcDir":"/Users/soyombobat-erdene/work/erxes-enterprises/packages/plugin-tumentech-ui/src","name":"tumentech","scope":"tumentech","url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-tumentech-ui/remoteEntry.js","exposes":{"./routes":"./src/routes.tsx","./participantsSection":"./src/Participants.tsx","./locationSection":"./src/DealRoute.tsx","./carSection":"./src/components/common/CarSection.tsx","./accountSection":"./src/CustomerAccount.tsx"},"routes":{"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-tumentech-ui/remoteEntry.js","scope":"tumentech","module":"./routes"},"menus":[{"text":"Tumentech","url":"/erxes-plugin-tumentech/car/list","icon":"icon-car","location":"mainNavigation","permission":"showCars"},{"text":"Topup account","url":"/erxes-plugin-tumentech/topup","icon":"icon-dollar-sign","location":"mainNavigation","permission":""}],"customerRightSidebarSection":[{"text":"customerAccountSection","component":"./carSection","scope":"tumentech"},{"text":"customerSection","component":"./accountSection","scope":"tumentech"}],"companyRightSidebarSection":[{"text":"companySection","component":"./carSection","scope":"tumentech"}],"dealRightSidebarSection":[{"text":"locationSection","component":"./locationSection","scope":"tumentech"},{"text":"carSection","component":"./carSection","scope":"tumentech"},{"text":"participantsSection","component":"./participantsSection","scope":"tumentech"}]},"api":{"permissions":{"cars":{"name":"cars","description":"Cars","actions":[{"name":"all","description":"All","use":["showCars","manageCars"]},{"name":"showCars","description":"Show cars"},{"name":"manageCars","description":"Manage cars"}]},"topups":{"name":"topups","description":"Topups","actions":[{"name":"all","description":"All","use":["showTopups","manageTopups"]},{"name":"showTopups","description":"Show topups"},{"name":"manageTopups","description":"Manage topups"}]}},"essyncer":[{"name":"cars","schema":"{}","script":""}]}},"priuscenter":{"ui":{"srcDir":"/Users/soyombobat-erdene/work/erxes-enterprises/packages/plugin-priuscenter-ui/src","name":"priuscenter","scope":"priuscenter","exposes":{"./routes":"./src/routes.tsx"},"routes":{"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-priuscenter-ui/remoteEntry.js","scope":"priuscenter","module":"./routes"},"menus":[{"text":"Ads","url":"/ads","icon":"icon-star","location":"mainNavigation"}],"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-priuscenter-ui/remoteEntry.js"},"api":{"permissions":{"priuscenter":{"name":"priuscenter","description":"Prius center","actions":[{"name":"priuscenterManageAds","description":"Manage Ads"}]}}}},"apex":{"ui":{"srcDir":"/Users/soyombobat-erdene/work/erxes-enterprises/packages/plugin-apex-ui/src","name":"apex","scope":"apex","exposes":{"./routes":"./src/routes.tsx","./clientPortalUserDetailAction":"./src/components/ClientPortalUserDetailAction.tsx"},"clientPortalUserDetailAction":"./clientPortalUserDetailAction","routes":{"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-apex-ui/remoteEntry.js","scope":"apex","module":"./routes"},"menus":[{"text":"Reports","to":"/settings/apexreports","image":"/images/icons/erxes-09.svg","location":"settings","scope":"apex","permissions":["manageApexReports"]},{"text":"Stories","to":"/settings/apexstories","image":"/images/icons/erxes-09.svg","location":"settings","scope":"apex","permissions":["manageApexReports"]}],"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-apex-ui/remoteEntry.js"},"api":{"permissions":{"apex":{"name":"apex","description":"apex","actions":[{"name":"manageApexReports","description":"manageApexReports","use":["manageApexReports"]},{"name":"manageApexReports","description":"Manage reports"}]}}}},"bichil":{"ui":{"srcDir":"/Users/soyombobat-erdene/work/erxes-enterprises/packages/plugin-bichil-ui/src","name":"bichil","scope":"bichil","exposes":{"./routes":"./src/routes.tsx","./bichilReportTable":"./src/containers/report/ReportList.tsx","./bichilTimeclockTable":"./src/containers/timeclock/TimeclockList.tsx","./bichilExportReportBtn":"./src/components/report/ExportBtn.tsx","./bichilTimeclockActionBar":"./src/components/timeclock/TimeclockActionBar.tsx","./gotoSalaries":"./src/components/salary/SalaryBtn.tsx"},"routes":{"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-bichil-ui/remoteEntry.js","scope":"bichil","module":"./routes"},"bichilReportTable":"./bichilReportTable","bichilTimeclockTable":"./bichilTimeclockTable","bichilExportReportBtn":"./bichilExportReportBtn","bichilTimeclockActionBar":"./bichilTimeclockActionBar","actionForms":"./gotoSalaries","menus":[{"text":"Bichil Globus","to":"/bichil/salary","image":"/images/icons/erxes-18.svg","location":"settings","scope":"bichil"}],"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-bichil-ui/remoteEntry.js"},"api":{"permissions":{"salaries":{"name":"bichilSalaries","description":"Bichil salaries","actions":[{"name":"bichilSalariesAll","description":"All","use":["addSalaries","showSalaries","removeSalaries"]},{"name":"addSalaries","description":"Add salaries"},{"name":"showSalaries","description":"Show salaries"},{"name":"removeSalaries","description":"Remove salaries"}]}}}},"mobinet":{"ui":{"srcDir":"/Users/soyombobat-erdene/work/erxes-enterprises/packages/plugin-mobinet-ui/src","name":"mobinet","scope":"mobinet","exposes":{"./routes":"./src/routes.tsx","./customerSidebar":"./src/modules/contracts/containers/CustomerSidebar.tsx","./cardDetailAction":"./src/modules/contracts/containers/CardDetailAction.tsx","./buildingsSection":"./src/common/routes/Buildings.tsx","./mobinetConfigs":"./src/modules/MobinetConfigs.tsx"},"extendSystemConfig":"./mobinetConfigs","routes":{"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-mobinet-ui/remoteEntry.js","scope":"mobinet","module":"./routes"},"menus":[{"text":"Mobinet","url":"/mobinet/building/list?viewType=list","icon":"icon-star","location":"mainNavigation"}],"ticketRightSidebarSection":[{"text":"buildingsSection","component":"./buildingsSection","scope":"mobinet"}],"cardDetailAction":"./cardDetailAction","customerRightSidebarSection":[{"text":"customerSection","component":"./customerSidebar","scope":"mobinet"}],"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-mobinet-ui/remoteEntry.js"}},"dac":{"ui":{"srcDir":"/Users/soyombobat-erdene/work/erxes-enterprises/packages/plugin-dac-ui/src","name":"dac","scope":"dac","exposes":{"./routes":"./src/routes.tsx","./extendSystemConfig":"./src/components/Config.tsx"},"routes":{"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-dac-ui/remoteEntry.js","scope":"dac","module":"./routes"},"extendSystemConfig":"./extendSystemConfig","menus":[{"text":"Doctor Auto Chain","to":"/dac","image":"/images/icons/erxes-18.svg","location":"settings","scope":"dac"}],"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-dac-ui/remoteEntry.js"},"api":{"permissions":{"dac":{"name":"dac","description":"Doctor auto suljee","actions":[{"name":"manageCupon","description":"Manage cupon"}]}}}},"rcfa":{"ui":{"srcDir":"/Users/soyombobat-erdene/work/erxes-enterprises/packages/plugin-rcfa-ui/src","name":"rcfa","scope":"rcfa","exposes":{"./routes":"./src/routes.tsx","./rcfaSection":"./src/rcfa/containers/Section.tsx","./selectResolver":"./src/common/SelectResolver.tsx"},"routes":{"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-rcfa-ui/remoteEntry.js","scope":"rcfa","module":"./routes"},"formsExtraFields":[{"scope":"rcfa","component":"./selectResolver","type":"rcfaResolver"}],"menus":[{"text":"RCFA","url":"/rcfa","icon":"icon-file-question-alt","location":"mainNavigation"}],"ticketRightSidebarSection":[{"text":"rcfaSection","component":"./rcfaSection","scope":"rcfa"}],"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-rcfa-ui/remoteEntry.js"}},"syncsaas":{"ui":{"srcDir":"/Users/soyombobat-erdene/work/erxes-enterprises/packages/plugin-syncsaas-ui/src","name":"syncsaas","scope":"syncsaas","exposes":{"./routes":"./src/routes.tsx"},"routes":{"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-syncsaas-ui/remoteEntry.js","scope":"syncsaas","module":"./routes"},"menus":[{"text":"Sync Saas","to":"/settings/sync-saas","image":"/images/icons/erxes-04.svg","location":"settings","scope":"syncsaas","action":"syncSaasConfig","permission":"syncSaasConfig"}],"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-syncsaas-ui/remoteEntry.js"}},"golomtces":{},"aputpm":{"ui":{"srcDir":"/Users/soyombobat-erdene/work/erxes-enterprises/packages/plugin-aputpm-ui/src","name":"aputpm","scope":"aputpm","exposes":{"./routes":"./src/routes.tsx","./selectKbCategory":"./src/common/SelectKBCategories.tsx"},"routes":{"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-aputpm-ui/remoteEntry.js","scope":"aputpm","module":"./routes"},"formsExtraFields":[{"scope":"aputpm","component":"./selectKbCategory","type":"kbCategory"}],"menus":[{"text":"APU TPM","to":"/settings/safety_tips","image":"/images/icons/erxes-09.svg","location":"settings","scope":"aputpm"}],"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-aputpm-ui/remoteEntry.js"}},"insurance":{"ui":{"srcDir":"/Users/soyombobat-erdene/work/erxes-enterprises/packages/plugin-insurance-ui/src","name":"insurance","scope":"insurance","exposes":{"./routes":"./src/routes.tsx","./cardDetailAction":"./src/modules/items/ContractButton.tsx"},"routes":{"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-insurance-ui/remoteEntry.js","scope":"insurance","module":"./routes"},"cardDetailAction":"./cardDetailAction","menus":[{"text":"Insurance","url":"/insurance/risks","icon":"icon-umbrella","location":"mainNavigation"}],"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-insurance-ui/remoteEntry.js"}},"bid":{"ui":{"srcDir":"/Users/soyombobat-erdene/work/erxes-enterprises/packages/plugin-bid-ui/src","name":"bid","scope":"bid","exposes":{"./routes":"./src/routes.tsx","./customerSidebar":"./src/CustomerSidebar.tsx","./extendSystemConfig":"./src/components/Configs.tsx"},"routes":{"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-bid-ui/remoteEntry.js","scope":"bid","module":"./routes"},"extendSystemConfig":"./extendSystemConfig","conversationDetailSidebar":"./customerSidebar","menus":[],"customerRightSidebarSection":[{"text":"customerSection","component":"./customerSidebar","scope":"bid"}],"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-bid-ui/remoteEntry.js"}}}
  