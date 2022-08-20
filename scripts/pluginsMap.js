
    module.exports = {"cars":{"ui":{"name":"cars","exposes":{"./routes":"./src/routes.tsx","./customerSidebar":"./src/sidebars/CustomerSidebar.tsx","./companySidebar":"./src/sidebars/CompanySidebar.tsx","./dealSidebar":"./src/sidebars/DealSidebar.tsx"},"routes":{"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-cars-ui/remoteEntry.js","scope":"cars","module":"./routes"},"menus":[{"text":"Plugin Car","url":"/cars","location":"mainNavigation","icon":"icon-car","permission":"showCars"}],"customerRightSidebarSection":[{"text":"customerSection","component":"./customerSidebar","scope":"cars"}],"companyRightSidebarSection":[{"text":"companySection","component":"./companySidebar","scope":"cars"}],"dealRightSidebarSection":[{"text":"dealSection","component":"./dealSidebar","scope":"cars"}],"url":"https://plugin-uis.s3.us-west-2.amazonaws.com/js/plugins/plugin-cars-ui/remoteEntry.js"},"api":{"permissions":{"cars":{"name":"cars","description":"Cars","actions":[{"name":"all","description":"All","use":["showCars","manageCars"]},{"name":"showCars","description":"Show cars"},{"name":"manageCars","description":"Manage cars"}]}},"essyncer":[{"name":"cars","schema":"{}","script":""}]}}}
  