const chargeCurrentOrganization = `
  query chargeCurrentOrganization {
    chargeCurrentOrganization
  }
`;

const savedPlugins = `
  query savedPlugins($mainType: String) {
    savedPlugins(mainType: $mainType) {
      _id

      language
      createdAt
      modifiedAt
      createdBy
      modifiedBy

      avatar
      images
      video

      title
      creator {
        name
        address
        email
        phone
      }
      department

      description
      shortDescription
      screenShots
      features

      tango

      changeLog
      lastUpdatedInfo
      contributors
      support

      mainType
      selfHosted
      type
      limit
      count
      initialCount
      growthInitialCount
      resetMonthly
      unit
      comingSoon

      categories
      dependencies
      stripeProductId

      icon
    }
  }
`;

export default {
  chargeCurrentOrganization,
  savedPlugins,
};
