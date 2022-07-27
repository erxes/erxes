cube(`Users`, {
  sql: `SELECT * FROM erxes.users WHERE role=""`,

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  joins: {},

  measures: {
    count: {
      type: `count`,
      drillMembers: [
        detailsFullname,
        detailsShortname,
        username,
        createdat,
        detailsBirthdate,
        detailsWorkstarteddate
      ]
    }
  },

  dimensions: {
    code: {
      sql: `code`,
      type: `string`
    },

    detailsAvatar: {
      sql: `${CUBE}.\`details.avatar\``,
      type: `string`,
      title: `Details.avatar`
    },

    detailsDescription: {
      sql: `${CUBE}.\`details.description\``,
      type: `string`,
      title: `Details.description`
    },

    detailsFullname: {
      sql: `${CUBE}.\`details.fullName\``,
      type: `string`,
      title: `Details.fullname`
    },

    detailsLocation: {
      sql: `${CUBE}.\`details.location\``,
      type: `string`,
      title: `Details.location`
    },

    detailsOperatorphone: {
      sql: `${CUBE}.\`details.operatorPhone\``,
      type: `string`,
      title: `Details.operatorphone`
    },

    detailsPosition: {
      sql: `${CUBE}.\`details.position\``,
      type: `string`,
      title: `Details.position`
    },

    detailsShortname: {
      sql: `${CUBE}.\`details.shortName\``,
      type: `string`,
      title: `Details.shortname`
    },

    donotdisturb: {
      sql: `${CUBE}.\`doNotDisturb\``,
      type: `string`
    },

    email: {
      sql: `email`,
      type: `string`
    },

    issubscribed: {
      sql: `${CUBE}.\`isSubscribed\``,
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

    password: {
      sql: `password`,
      type: `string`
    },

    registrationtoken: {
      sql: `${CUBE}.\`registrationToken\``,
      type: `string`
    },

    resetpasswordtoken: {
      sql: `${CUBE}.\`resetPasswordToken\``,
      type: `string`
    },

    role: {
      sql: `role`,
      type: `string`
    },

    username: {
      sql: `username`,
      type: `string`
    },

    createdat: {
      sql: `${CUBE}.\`createdAt\``,
      type: `time`
    },

    detailsBirthdate: {
      sql: `${CUBE}.\`details.birthDate\``,
      type: `time`,
      title: `Details.birthdate`
    },

    detailsWorkstarteddate: {
      sql: `${CUBE}.\`details.workStartedDate\``,
      type: `time`,
      title: `Details.workstarteddate`
    },

    registrationtokenexpires: {
      sql: `${CUBE}.\`registrationTokenExpires\``,
      type: `time`
    },

    resetpasswordexpires: {
      sql: `${CUBE}.\`resetPasswordExpires\``,
      type: `time`
    }
  },

  dataSource: `default`
});
