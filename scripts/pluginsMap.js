
    module.exports = {"ads":{},"cars":{"ui":{"name":"cars","exposes":{"./routes":"./src/routes.tsx","./customerSidebar":"./src/sidebars/CustomerSidebar.tsx","./companySidebar":"./src/sidebars/CompanySidebar.tsx","./dealSidebar":"./src/sidebars/DealSidebar.tsx"},"routes":{"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-cars-ui/remoteEntry.js","scope":"cars","module":"./routes"},"menus":[{"text":"Plugin Car","url":"/cars","location":"mainNavigation","icon":"icon-car","permission":"showCars"}],"customerRightSidebarSection":[{"text":"customerSection","component":"./customerSidebar","scope":"cars"}],"companyRightSidebarSection":[{"text":"companySection","component":"./companySidebar","scope":"cars"}],"dealRightSidebarSection":[{"text":"dealSection","component":"./dealSidebar","scope":"cars"}],"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-cars-ui/remoteEntry.js"},"api":{"permissions":{"cars":{"name":"cars","description":"Cars","actions":[{"name":"all","description":"All","use":["showCars","manageCars"]},{"name":"showCars","description":"Show cars"},{"name":"manageCars","description":"Manage cars"}]}},"essyncer":[{"name":"cars","schema":"{}","script":""}]}},"loan":{"ui":{"name":"loan","exposes":{"./routes":"./src/routes.tsx"},"routes":{"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-loan-ui/remoteEntry.js","scope":"loan","module":"./routes"},"menus":[{"text":"Contracts","url":"/contract-list","icon":"icon-medal","location":"mainNavigation","permission":"showContracts"},{"text":"Contract types","image":"/images/icons/erxes-01.svg","to":"/settings/contract-types/","action":"loanConfig","scope":"loan","location":"settings","permissions":["manageContracts"]},{"text":"Insurance types","image":"/images/icons/erxes-13.svg","to":"/insurance-types/","action":"loanConfig","scope":"loan","location":"settings","permissions":["manageContracts"]},{"text":"Loan config","image":"/images/icons/erxes-16.svg","to":"/settings/holiday-settings/","action":"loanConfig","scope":"loan","location":"settings","permissions":["manageContracts"]}],"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-loan-ui/remoteEntry.js"}},"neighbor":{"ui":{"name":"neighbor","exposes":{"./routes":"./src/routes.tsx","./productCategoryCreateAction":"./src/containers/NeighborForm.tsx"},"routes":{"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-neighbor-ui/remoteEntry.js","scope":"neighbor","module":"./routes"},"menus":[{"text":"Neighbor","to":"/erxes-plugin-neighbor?type=kindergarden","image":"/images/icons/erxes-05.svg","location":"settings","scope":"neighbor","action":"","permissions":[]}],"productCategoryActions":[{"text":"productCategoryCreateAction","component":"./productCategoryCreateAction","scope":"neighbor"}],"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-neighbor-ui/remoteEntry.js"}},"rentpay":{"ui":{"name":"rentpay","scope":"rentpay","url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-rentpay-ui/remoteEntry.js","exposes":{"./routes":"./src/routes.tsx","./buyerSection":"./src/BuyerSection.tsx","./waiterSection":"./src/WaiterSection.tsx"},"routes":{"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-rentpay-ui/remoteEntry.js","scope":"rentpay","module":"./routes"},"dealRightSidebarSection":[{"text":"buyerSection","component":"./buyerSection","scope":"rentpay"},{"text":"waiterSection","component":"./waiterSection","scope":"rentpay"}],"menus":[]}},"tumentech":{"ui":{"name":"tumentech","scope":"tumentech","url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-tumentech-ui/remoteEntry.js","exposes":{"./routes":"./src/routes.tsx","./participantsSection":"./src/Participants.tsx","./locationSection":"./src/Location.tsx","./carSection":"./src/components/common/CarSection.tsx"},"routes":{"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-tumentech-ui/remoteEntry.js","scope":"tumentech","module":"./routes"},"menus":[{"text":"Tumentech","url":"/erxes-plugin-tumentech/car/list","icon":"icon-car","location":"mainNavigation","permission":"showCars"}],"customerRightSidebarSection":[{"text":"customerSection","component":"./carSection","scope":"tumentech"}],"companyRightSidebarSection":[{"text":"companySection","component":"./carSection","scope":"tumentech"}],"dealRightSidebarSection":[{"text":"locationSection","component":"./locationSection","scope":"tumentech"},{"text":"carSection","component":"./carSection","scope":"tumentech"},{"text":"participantsSection","component":"./participantsSection","scope":"tumentech"}]},"api":{"essyncer":[{"name":"cars","schema":"{}","script":""}]}}}
  