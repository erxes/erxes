const reportTemplates = [
  {
    serviceType: "contacts",
    title: "Contact chart",
    serviceName: "core",
    serviceLabel: "Contacts",
    description: "Contact charts",
    charts: [
      "TotalContactCount",
      "TotalContactCountByYear",
      "TotalContactByState",
      "TotalContactBySource",

      "TotalCustomerCount",
      "TotalCustomerByYear",
      "TotalCustomerBySource",
      "TotalCustomerByTag",
      "TotalCustomerByPropertiesField",
      // 'TotalCustomerByPropertiesName',

      "TotalLeadCount",
      "TotalLeadByYear",
      "TotalLeadBySource",
      "TotalLeadByTag",
      "TotalLeadsByPropertiesField",
      // 'TotalLeadsByPropertiesName',

      "TotalCompanyCount",
      "TotalCompanyByYear",
      "TotalCompanyCountByTag",
      "TotalCompanyCountByPropertiesField",
      // 'TotalCompanyCountByPropertiesName',

      "TotalClientPortalUsersCount",
      "TotalClientPortalUsersByYear",
      "TotalVendorPortalUsersCount",
      "TotalVendorPortalUsersByYear"
    ],
    img: "https://sciter.com/wp-content/uploads/2022/08/chart-js.png"
  },
  {
    serviceType: "forms",
    title: "Form chart",
    serviceName: "core",
    serviceLabel: "Forms",
    description: "Form charts",
    charts: [
      "TotalFormCount",
      "TotalSubmissionCount"
    ],
    img: "https://sciter.com/wp-content/uploads/2022/08/chart-js.png"
  }
];

export default reportTemplates;
