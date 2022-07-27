cube(`Customers`, {
  sql: `SELECT * FROM erxes.customers WHERE state='visitor'`,

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  joins: {},

  measures: {
    count: {
      type: `count`,
      drillMembers: [
        birthdate,
        emailvalidationstatus,
        firstname,
        integrationid,
        lastname,
        locationCity,
        locationCountry,
        locationCountrycode,
        locationHostname,
        messengerdataCustomdataOrganizationcreatedat,
        messengerdataCustomdataOrganizationexpirydate,
        messengerdataCustomdataOrganizationname,
        messengerdataCustomdataUsername,
        middlename,
        ownerid,
        phonevalidationstatus,
        trackeddatabackupOrganizationcreatedat,
        trackeddatabackupOrganizationexpirydate,
        trackeddatabackupOrganizationname,
        trackeddatabackupUsername,
        visitorid,
        createdat
      ]
    },

    messengerdataSessioncount: {
      sql: `${CUBE}.\`messengerData.sessionCount\``,
      type: `sum`,
      title: `Messengerdata.sessioncount`
    },

    sessioncount: {
      sql: `${CUBE}.\`sessionCount\``,
      type: `sum`
    }
  },

  dimensions: {
    avatar: {
      sql: `avatar`,
      type: `string`
    },

    birthdate: {
      sql: `${CUBE}.\`birthDate\``,
      type: `string`
    },

    code: {
      sql: `code`,
      type: `string`
    },

    department: {
      sql: `department`,
      type: `string`
    },

    description: {
      sql: `description`,
      type: `string`
    },

    donotdisturb: {
      sql: `${CUBE}.\`doNotDisturb\``,
      type: `string`
    },

    emailvalidationstatus: {
      sql: `${CUBE}.\`emailValidationStatus\``,
      type: `string`
    },

    firstname: {
      sql: `${CUBE}.\`firstName\``,
      type: `string`
    },

    hasauthority: {
      sql: `${CUBE}.\`hasAuthority\``,
      type: `string`
    },

    integrationid: {
      sql: `${CUBE}.\`integrationId\``,
      type: `string`
    },

    issubscribed: {
      sql: `${CUBE}.\`isSubscribed\``,
      type: `string`
    },

    lastname: {
      sql: `${CUBE}.\`lastName\``,
      type: `string`
    },

    leadstatus: {
      sql: `${CUBE}.\`leadStatus\``,
      type: `string`
    },

    lifecyclestate: {
      sql: `${CUBE}.\`lifecycleState\``,
      type: `string`
    },

    linksDiscord: {
      sql: `${CUBE}.\`links.discord\``,
      type: `string`,
      title: `Links.discord`
    },

    linksFacebook: {
      sql: `${CUBE}.\`links.facebook\``,
      type: `string`,
      title: `Links.facebook`
    },

    linksGithub: {
      sql: `${CUBE}.\`links.github\``,
      type: `string`,
      title: `Links.github`
    },

    linksGithub0: {
      sql: `${CUBE}.\`links.gitHub_0\``,
      type: `string`,
      title: `Links.github 0`
    },

    linksInstagram: {
      sql: `${CUBE}.\`links.instagram\``,
      type: `string`,
      title: `Links.instagram`
    },

    linksLinkedin: {
      sql: `${CUBE}.\`links.linkedIn\``,
      type: `string`,
      title: `Links.linkedin`
    },

    linksTwitter: {
      sql: `${CUBE}.\`links.twitter\``,
      type: `string`,
      title: `Links.twitter`
    },

    linksWebsite: {
      sql: `${CUBE}.\`links.website\``,
      type: `string`,
      title: `Links.website`
    },

    linksYoutube: {
      sql: `${CUBE}.\`links.youtube\``,
      type: `string`,
      title: `Links.youtube`
    },

    locationCity: {
      sql: `${CUBE}.\`location.city\``,
      type: `string`,
      title: `Location.city`
    },

    locationCountry: {
      sql: `${CUBE}.\`location.country\``,
      type: `string`,
      title: `Location.country`
    },

    locationCountrycode: {
      sql: `${CUBE}.\`location.countryCode\``,
      type: `string`,
      title: `Location.countrycode`
    },

    locationHostname: {
      sql: `${CUBE}.\`location.hostname\``,
      type: `string`,
      title: `Location.hostname`
    },

    locationLanguage: {
      sql: `${CUBE}.\`location.language\``,
      type: `string`,
      title: `Location.language`
    },

    locationRegion: {
      sql: `${CUBE}.\`location.region\``,
      type: `string`,
      title: `Location.region`
    },

    locationRemoteaddress: {
      sql: `${CUBE}.\`location.remoteAddress\``,
      type: `string`,
      title: `Location.remoteaddress`
    },

    locationUseragent: {
      sql: `${CUBE}.\`location.userAgent\``,
      type: `string`,
      title: `Location.useragent`
    },

    messengerdataCustomdataHasseenonboard: {
      sql: `${CUBE}.\`messengerData.customData.hasSeenOnBoard\``,
      type: `string`,
      title: `Messengerdata.customdata.hasseenonboard`
    },

    messengerdataCustomdataOrganizationcreatedat: {
      sql: `${CUBE}.\`messengerData.customData.organizationCreatedAt\``,
      type: `string`,
      title: `Messengerdata.customdata.organizationcreatedat`
    },

    messengerdataCustomdataOrganizationexpirydate: {
      sql: `${CUBE}.\`messengerData.customData.organizationExpiryDate\``,
      type: `string`,
      title: `Messengerdata.customdata.organizationexpirydate`
    },

    messengerdataCustomdataOrganizationname: {
      sql: `${CUBE}.\`messengerData.customData.organizationName\``,
      type: `string`,
      title: `Messengerdata.customdata.organizationname`
    },

    messengerdataCustomdataOrganizationplan: {
      sql: `${CUBE}.\`messengerData.customData.organizationPlan\``,
      type: `string`,
      title: `Messengerdata.customdata.organizationplan`
    },

    messengerdataCustomdataOrganizationsubdomain: {
      sql: `${CUBE}.\`messengerData.customData.organizationSubDomain\``,
      type: `string`,
      title: `Messengerdata.customdata.organizationsubdomain`
    },

    messengerdataCustomdataUsername: {
      sql: `${CUBE}.\`messengerData.customData.username\``,
      type: `string`,
      title: `Messengerdata.customdata.username`
    },

    middlename: {
      sql: `${CUBE}.\`middleName\``,
      type: `string`
    },

    ownerid: {
      sql: `${CUBE}.\`ownerId\``,
      type: `string`
    },

    phonevalidationstatus: {
      sql: `${CUBE}.\`phoneValidationStatus\``,
      type: `string`
    },

    position: {
      sql: `position`,
      type: `string`
    },

    primaryemail: {
      sql: `${CUBE}.\`primaryEmail\``,
      type: `string`
    },

    primaryphone: {
      sql: `${CUBE}.\`primaryPhone\``,
      type: `string`
    },

    searchtext: {
      sql: `${CUBE}.\`searchText\``,
      type: `string`
    },

    state: {
      sql: `state`,
      type: `string`
    },

    status: {
      sql: `status`,
      type: `string`
    },

    trackeddatabackup: {
      sql: `${CUBE}.\`trackedDataBackup\``,
      type: `string`
    },

    trackeddatabackupOrganizationcreatedat: {
      sql: `${CUBE}.\`trackedDataBackup.organizationCreatedAt\``,
      type: `string`,
      title: `Trackeddatabackup.organizationcreatedat`
    },

    trackeddatabackupOrganizationexpirydate: {
      sql: `${CUBE}.\`trackedDataBackup.organizationExpiryDate\``,
      type: `string`,
      title: `Trackeddatabackup.organizationexpirydate`
    },

    trackeddatabackupOrganizationname: {
      sql: `${CUBE}.\`trackedDataBackup.organizationName\``,
      type: `string`,
      title: `Trackeddatabackup.organizationname`
    },

    trackeddatabackupOrganizationplan: {
      sql: `${CUBE}.\`trackedDataBackup.organizationPlan\``,
      type: `string`,
      title: `Trackeddatabackup.organizationplan`
    },

    trackeddatabackupOrganizationsubdomain: {
      sql: `${CUBE}.\`trackedDataBackup.organizationSubDomain\``,
      type: `string`,
      title: `Trackeddatabackup.organizationsubdomain`
    },

    trackeddatabackupUsername: {
      sql: `${CUBE}.\`trackedDataBackup.username\``,
      type: `string`,
      title: `Trackeddatabackup.username`
    },

    visitorcontactinfoEmail: {
      sql: `${CUBE}.\`visitorContactInfo.email\``,
      type: `string`,
      title: `Visitorcontactinfo.email`
    },

    visitorcontactinfoPhone: {
      sql: `${CUBE}.\`visitorContactInfo.phone\``,
      type: `string`,
      title: `Visitorcontactinfo.phone`
    },

    visitorid: {
      sql: `${CUBE}.\`visitorId\``,
      type: `string`
    },

    createdat: {
      sql: `${CUBE}.\`createdAt\``,
      type: `time`
    },

    lastseenat: {
      sql: `${CUBE}.\`lastSeenAt\``,
      type: `time`
    },

    messengerdataLastseenat: {
      sql: `${CUBE}.\`messengerData.lastSeenAt\``,
      type: `time`,
      title: `Messengerdata.lastseenat`
    },

    modifiedat: {
      sql: `${CUBE}.\`modifiedAt\``,
      type: `time`
    }
  }

  // dataSource: `default`
});
