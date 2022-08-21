cube(`Integrations`, {
  sql: `SELECT * FROM erxes.integrations`,

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  joins: {},

  measures: {
    count: {
      type: `count`,
      drillMembers: [
        bookingdataImageName,
        bookingdataName,
        bookingdataProductcategoryid,
        bookingdataStyleWidgetcolor,
        brandid,
        createduserid,
        formid,
        leaddataAdminemailtitle,
        leaddataCalloutTitle,
        leaddataThanktitle,
        leaddataUseremailtitle,
        messengerdataMessagesArGreetingsTitle,
        messengerdataMessagesBgGreetingsTitle,
        messengerdataMessagesBgGreetingsTitle0,
        messengerdataMessagesBnGreetingsTitle,
        messengerdataMessagesCsGreetingsTitle,
        messengerdataMessagesDeGreetingsTitle,
        messengerdataMessagesEnGreetingsTitle,
        messengerdataMessagesEnRsGreetingsTitle,
        messengerdataMessagesEsGreetingsTitle,
        messengerdataMessagesFaIrGreetingsTitle,
        messengerdataMessagesFrGreetingsTitle,
        messengerdataMessagesHiGreetingsTitle,
        messengerdataMessagesIdIdAway,
        messengerdataMessagesIdIdGreetingsMessage,
        messengerdataMessagesIdIdGreetingsTitle,
        messengerdataMessagesIdIdThank,
        messengerdataMessagesIdIdWelcome,
        messengerdataMessagesItGreetingsTitle,
        messengerdataMessagesJaGreetingsTitle,
        messengerdataMessagesJvGreetingsTitle,
        messengerdataMessagesKkGreetingsTitle,
        messengerdataMessagesKoGreetingsTitle,
        messengerdataMessagesMnGreetingsTitle,
        messengerdataMessagesMrGreetingsTitle,
        messengerdataMessagesNlGreetingsTitle,
        messengerdataMessagesPaGreetingsTitle,
        messengerdataMessagesPlPlGreetingsTitle,
        messengerdataMessagesPtBrGreetingsTitle,
        messengerdataMessagesPtBrGreetingsTitle,
        messengerdataMessagesRoGreetingsTitle,
        messengerdataMessagesRuGreetingsTitle,
        messengerdataMessagesSqGreetingsTitle,
        messengerdataMessagesTaGreetingsTitle,
        messengerdataMessagesTeGreetingsTitle,
        messengerdataMessagesTrTrGreetingsTitle,
        messengerdataMessagesUkUaGreetingsTitle,
        messengerdataMessagesUrPkGreetingsTitle,
        messengerdataMessagesViGreetingsTitle,
        messengerdataMessagesYiGreetingsTitle,
        messengerdataMessagesZhCnGreetingsTitle,
        messengerdataMessagesZhCnGreetingsTitle,
        name
      ]
    },

    bookingdataViewcount: {
      sql: `${CUBE}.\`bookingData.viewCount\``,
      type: `sum`,
      title: `Bookingdata.viewcount`
    },

    leaddataViewcount: {
      sql: `${CUBE}.\`leadData.viewCount\``,
      type: `sum`,
      title: `Leaddata.viewcount`
    }
  },

  dimensions: {
    _id: {
      sql: `_id`,
      type: `number`,
      primaryKey: true
    },

    bookingdataBookingformtext: {
      sql: `${CUBE}.\`bookingData.bookingFormText\``,
      type: `string`,
      title: `Bookingdata.bookingformtext`
    },

    bookingdataDescription: {
      sql: `${CUBE}.\`bookingData.description\``,
      type: `string`,
      title: `Bookingdata.description`
    },

    bookingdataImageName: {
      sql: `${CUBE}.\`bookingData.image.name\``,
      type: `string`,
      title: `Bookingdata.image.name`
    },

    bookingdataImageType: {
      sql: `${CUBE}.\`bookingData.image.type\``,
      type: `string`,
      title: `Bookingdata.image.type`
    },

    bookingdataImageUrl: {
      sql: `${CUBE}.\`bookingData.image.url\``,
      type: `string`,
      title: `Bookingdata.image.url`
    },

    bookingdataName: {
      sql: `${CUBE}.\`bookingData.name\``,
      type: `string`,
      title: `Bookingdata.name`
    },

    bookingdataNavigationtext: {
      sql: `${CUBE}.\`bookingData.navigationText\``,
      type: `string`,
      title: `Bookingdata.navigationtext`
    },

    bookingdataProductcategoryid: {
      sql: `${CUBE}.\`bookingData.productCategoryId\``,
      type: `string`,
      title: `Bookingdata.productcategoryid`
    },

    bookingdataStyleBasefont: {
      sql: `${CUBE}.\`bookingData.style.baseFont\``,
      type: `string`,
      title: `Bookingdata.style.basefont`
    },

    bookingdataStyleItemshape: {
      sql: `${CUBE}.\`bookingData.style.itemShape\``,
      type: `string`,
      title: `Bookingdata.style.itemshape`
    },

    bookingdataStyleLine: {
      sql: `${CUBE}.\`bookingData.style.line\``,
      type: `string`,
      title: `Bookingdata.style.line`
    },

    bookingdataStyleProductavailable: {
      sql: `${CUBE}.\`bookingData.style.productAvailable\``,
      type: `string`,
      title: `Bookingdata.style.productavailable`
    },

    bookingdataStyleTextavailable: {
      sql: `${CUBE}.\`bookingData.style.textAvailable\``,
      type: `string`,
      title: `Bookingdata.style.textavailable`
    },

    bookingdataStyleWidgetcolor: {
      sql: `${CUBE}.\`bookingData.style.widgetColor\``,
      type: `string`,
      title: `Bookingdata.style.widgetcolor`
    },

    brandid: {
      sql: `${CUBE}.\`brandId\``,
      type: `string`
    },

    createduserid: {
      sql: `${CUBE}.\`createdUserId\``,
      type: `string`
    },

    formid: {
      sql: `${CUBE}.\`formId\``,
      type: `string`
    },

    kind: {
      sql: `kind`,
      type: `string`
    },

    languagecode: {
      sql: `${CUBE}.\`languageCode\``,
      type: `string`
    },

    leaddataAdminemailcontent: {
      sql: `${CUBE}.\`leadData.adminEmailContent\``,
      type: `string`,
      title: `Leaddata.adminemailcontent`
    },

    leaddataAdminemailtitle: {
      sql: `${CUBE}.\`leadData.adminEmailTitle\``,
      type: `string`,
      title: `Leaddata.adminemailtitle`
    },

    leaddataCalloutBody: {
      sql: `${CUBE}.\`leadData.callout.body\``,
      type: `string`,
      title: `Leaddata.callout.body`
    },

    leaddataCalloutButtontext: {
      sql: `${CUBE}.\`leadData.callout.buttonText\``,
      type: `string`,
      title: `Leaddata.callout.buttontext`
    },

    leaddataCalloutFeaturedimage: {
      sql: `${CUBE}.\`leadData.callout.featuredImage\``,
      type: `string`,
      title: `Leaddata.callout.featuredimage`
    },

    leaddataCalloutTitle: {
      sql: `${CUBE}.\`leadData.callout.title\``,
      type: `string`,
      title: `Leaddata.callout.title`
    },

    leaddataCss: {
      sql: `${CUBE}.\`leadData.css\``,
      type: `string`,
      title: `Leaddata.css`
    },

    leaddataFromemail: {
      sql: `${CUBE}.\`leadData.fromEmail\``,
      type: `string`,
      title: `Leaddata.fromemail`
    },

    leaddataLoadtype: {
      sql: `${CUBE}.\`leadData.loadType\``,
      type: `string`,
      title: `Leaddata.loadtype`
    },

    leaddataRedirecturl: {
      sql: `${CUBE}.\`leadData.redirectUrl\``,
      type: `string`,
      title: `Leaddata.redirecturl`
    },

    leaddataSuccessaction: {
      sql: `${CUBE}.\`leadData.successAction\``,
      type: `string`,
      title: `Leaddata.successaction`
    },

    leaddataSuccessimage: {
      sql: `${CUBE}.\`leadData.successImage\``,
      type: `string`,
      title: `Leaddata.successimage`
    },

    leaddataSuccessimagesize: {
      sql: `${CUBE}.\`leadData.successImageSize\``,
      type: `string`,
      title: `Leaddata.successimagesize`
    },

    leaddataThankcontent: {
      sql: `${CUBE}.\`leadData.thankContent\``,
      type: `string`,
      title: `Leaddata.thankcontent`
    },

    leaddataThanktitle: {
      sql: `${CUBE}.\`leadData.thankTitle\``,
      type: `string`,
      title: `Leaddata.thanktitle`
    },

    leaddataThemecolor: {
      sql: `${CUBE}.\`leadData.themeColor\``,
      type: `string`,
      title: `Leaddata.themecolor`
    },

    leaddataUseremailcontent: {
      sql: `${CUBE}.\`leadData.userEmailContent\``,
      type: `string`,
      title: `Leaddata.useremailcontent`
    },

    leaddataUseremailtitle: {
      sql: `${CUBE}.\`leadData.userEmailTitle\``,
      type: `string`,
      title: `Leaddata.useremailtitle`
    },

    messengerdataAvailabilitymethod: {
      sql: `${CUBE}.\`messengerData.availabilityMethod\``,
      type: `string`,
      title: `Messengerdata.availabilitymethod`
    },

    messengerdataBotendpointurl: {
      sql: `${CUBE}.\`messengerData.botEndpointUrl\``,
      type: `string`,
      title: `Messengerdata.botendpointurl`
    },

    messengerdataLinksFacebook: {
      sql: `${CUBE}.\`messengerData.links.facebook\``,
      type: `string`,
      title: `Messengerdata.links.facebook`
    },

    messengerdataLinksTwitter: {
      sql: `${CUBE}.\`messengerData.links.twitter\``,
      type: `string`,
      title: `Messengerdata.links.twitter`
    },

    messengerdataLinksYoutube: {
      sql: `${CUBE}.\`messengerData.links.youtube\``,
      type: `string`,
      title: `Messengerdata.links.youtube`
    },

    messengerdataMessagesArAway: {
      sql: `${CUBE}.\`messengerData.messages.ar.away\``,
      type: `string`,
      title: `Messengerdata.messages.ar.away`
    },

    messengerdataMessagesArGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.ar.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.ar.greetings.message`
    },

    messengerdataMessagesArGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.ar.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.ar.greetings.title`
    },

    messengerdataMessagesArThank: {
      sql: `${CUBE}.\`messengerData.messages.ar.thank\``,
      type: `string`,
      title: `Messengerdata.messages.ar.thank`
    },

    messengerdataMessagesArWelcome: {
      sql: `${CUBE}.\`messengerData.messages.ar.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.ar.welcome`
    },

    messengerdataMessagesBgAway: {
      sql: `${CUBE}.\`messengerData.messages.bg.away\``,
      type: `string`,
      title: `Messengerdata.messages.bg.away`
    },

    messengerdataMessagesBgAway0: {
      sql: `${CUBE}.\`messengerData.messages.Bg.away_0\``,
      type: `string`,
      title: `Messengerdata.messages.bg.away 0`
    },

    messengerdataMessagesBgGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.bg.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.bg.greetings.message`
    },

    messengerdataMessagesBgGreetingsMessage0: {
      sql: `${CUBE}.\`messengerData.messages.Bg.greetings.message_0\``,
      type: `string`,
      title: `Messengerdata.messages.bg.greetings.message 0`
    },

    messengerdataMessagesBgGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.bg.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.bg.greetings.title`
    },

    messengerdataMessagesBgGreetingsTitle0: {
      sql: `${CUBE}.\`messengerData.messages.Bg.greetings.title_0\``,
      type: `string`,
      title: `Messengerdata.messages.bg.greetings.title 0`
    },

    messengerdataMessagesBgThank: {
      sql: `${CUBE}.\`messengerData.messages.bg.thank\``,
      type: `string`,
      title: `Messengerdata.messages.bg.thank`
    },

    messengerdataMessagesBgThank0: {
      sql: `${CUBE}.\`messengerData.messages.Bg.thank_0\``,
      type: `string`,
      title: `Messengerdata.messages.bg.thank 0`
    },

    messengerdataMessagesBgWelcome: {
      sql: `${CUBE}.\`messengerData.messages.bg.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.bg.welcome`
    },

    messengerdataMessagesBgWelcome0: {
      sql: `${CUBE}.\`messengerData.messages.Bg.welcome_0\``,
      type: `string`,
      title: `Messengerdata.messages.bg.welcome 0`
    },

    messengerdataMessagesBnAway: {
      sql: `${CUBE}.\`messengerData.messages.bn.away\``,
      type: `string`,
      title: `Messengerdata.messages.bn.away`
    },

    messengerdataMessagesBnGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.bn.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.bn.greetings.message`
    },

    messengerdataMessagesBnGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.bn.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.bn.greetings.title`
    },

    messengerdataMessagesBnThank: {
      sql: `${CUBE}.\`messengerData.messages.bn.thank\``,
      type: `string`,
      title: `Messengerdata.messages.bn.thank`
    },

    messengerdataMessagesBnWelcome: {
      sql: `${CUBE}.\`messengerData.messages.bn.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.bn.welcome`
    },

    messengerdataMessagesCsAway: {
      sql: `${CUBE}.\`messengerData.messages.cs.away\``,
      type: `string`,
      title: `Messengerdata.messages.cs.away`
    },

    messengerdataMessagesCsGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.cs.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.cs.greetings.message`
    },

    messengerdataMessagesCsGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.cs.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.cs.greetings.title`
    },

    messengerdataMessagesCsThank: {
      sql: `${CUBE}.\`messengerData.messages.cs.thank\``,
      type: `string`,
      title: `Messengerdata.messages.cs.thank`
    },

    messengerdataMessagesCsWelcome: {
      sql: `${CUBE}.\`messengerData.messages.cs.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.cs.welcome`
    },

    messengerdataMessagesDeAway: {
      sql: `${CUBE}.\`messengerData.messages.de.away\``,
      type: `string`,
      title: `Messengerdata.messages.de.away`
    },

    messengerdataMessagesDeGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.de.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.de.greetings.message`
    },

    messengerdataMessagesDeGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.de.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.de.greetings.title`
    },

    messengerdataMessagesDeThank: {
      sql: `${CUBE}.\`messengerData.messages.de.thank\``,
      type: `string`,
      title: `Messengerdata.messages.de.thank`
    },

    messengerdataMessagesDeWelcome: {
      sql: `${CUBE}.\`messengerData.messages.de.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.de.welcome`
    },

    messengerdataMessagesEnAway: {
      sql: `${CUBE}.\`messengerData.messages.en.away\``,
      type: `string`,
      title: `Messengerdata.messages.en.away`
    },

    messengerdataMessagesEnGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.en.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.en.greetings.message`
    },

    messengerdataMessagesEnGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.en.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.en.greetings.title`
    },

    messengerdataMessagesEnThank: {
      sql: `${CUBE}.\`messengerData.messages.en.thank\``,
      type: `string`,
      title: `Messengerdata.messages.en.thank`
    },

    messengerdataMessagesEnWelcome: {
      sql: `${CUBE}.\`messengerData.messages.en.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.en.welcome`
    },

    messengerdataMessagesEnRsAway: {
      sql: `${CUBE}.\`messengerData.messages.en_RS.away\``,
      type: `string`,
      title: `Messengerdata.messages.en Rs.away`
    },

    messengerdataMessagesEnRsGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.en_RS.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.en Rs.greetings.message`
    },

    messengerdataMessagesEnRsGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.en_RS.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.en Rs.greetings.title`
    },

    messengerdataMessagesEnRsThank: {
      sql: `${CUBE}.\`messengerData.messages.en_RS.thank\``,
      type: `string`,
      title: `Messengerdata.messages.en Rs.thank`
    },

    messengerdataMessagesEnRsWelcome: {
      sql: `${CUBE}.\`messengerData.messages.en_RS.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.en Rs.welcome`
    },

    messengerdataMessagesEsAway: {
      sql: `${CUBE}.\`messengerData.messages.es.away\``,
      type: `string`,
      title: `Messengerdata.messages.es.away`
    },

    messengerdataMessagesEsGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.es.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.es.greetings.message`
    },

    messengerdataMessagesEsGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.es.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.es.greetings.title`
    },

    messengerdataMessagesEsThank: {
      sql: `${CUBE}.\`messengerData.messages.es.thank\``,
      type: `string`,
      title: `Messengerdata.messages.es.thank`
    },

    messengerdataMessagesEsWelcome: {
      sql: `${CUBE}.\`messengerData.messages.es.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.es.welcome`
    },

    messengerdataMessagesFaIrAway: {
      sql: `${CUBE}.\`messengerData.messages.fa_IR.away\``,
      type: `string`,
      title: `Messengerdata.messages.fa Ir.away`
    },

    messengerdataMessagesFaIrGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.fa_IR.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.fa Ir.greetings.message`
    },

    messengerdataMessagesFaIrGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.fa_IR.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.fa Ir.greetings.title`
    },

    messengerdataMessagesFaIrThank: {
      sql: `${CUBE}.\`messengerData.messages.fa_IR.thank\``,
      type: `string`,
      title: `Messengerdata.messages.fa Ir.thank`
    },

    messengerdataMessagesFaIrWelcome: {
      sql: `${CUBE}.\`messengerData.messages.fa_IR.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.fa Ir.welcome`
    },

    messengerdataMessagesFrAway: {
      sql: `${CUBE}.\`messengerData.messages.fr.away\``,
      type: `string`,
      title: `Messengerdata.messages.fr.away`
    },

    messengerdataMessagesFrGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.fr.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.fr.greetings.message`
    },

    messengerdataMessagesFrGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.fr.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.fr.greetings.title`
    },

    messengerdataMessagesFrThank: {
      sql: `${CUBE}.\`messengerData.messages.fr.thank\``,
      type: `string`,
      title: `Messengerdata.messages.fr.thank`
    },

    messengerdataMessagesFrWelcome: {
      sql: `${CUBE}.\`messengerData.messages.fr.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.fr.welcome`
    },

    messengerdataMessagesHiAway: {
      sql: `${CUBE}.\`messengerData.messages.hi.away\``,
      type: `string`,
      title: `Messengerdata.messages.hi.away`
    },

    messengerdataMessagesHiGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.hi.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.hi.greetings.message`
    },

    messengerdataMessagesHiGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.hi.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.hi.greetings.title`
    },

    messengerdataMessagesHiThank: {
      sql: `${CUBE}.\`messengerData.messages.hi.thank\``,
      type: `string`,
      title: `Messengerdata.messages.hi.thank`
    },

    messengerdataMessagesHiWelcome: {
      sql: `${CUBE}.\`messengerData.messages.hi.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.hi.welcome`
    },

    messengerdataMessagesIdIdAway: {
      sql: `${CUBE}.\`messengerData.messages.id_ID.away\``,
      type: `string`,
      title: `Messengerdata.messages.id Id.away`
    },

    messengerdataMessagesIdIdGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.id_ID.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.id Id.greetings.message`
    },

    messengerdataMessagesIdIdGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.id_ID.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.id Id.greetings.title`
    },

    messengerdataMessagesIdIdThank: {
      sql: `${CUBE}.\`messengerData.messages.id_ID.thank\``,
      type: `string`,
      title: `Messengerdata.messages.id Id.thank`
    },

    messengerdataMessagesIdIdWelcome: {
      sql: `${CUBE}.\`messengerData.messages.id_ID.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.id Id.welcome`
    },

    messengerdataMessagesItAway: {
      sql: `${CUBE}.\`messengerData.messages.it.away\``,
      type: `string`,
      title: `Messengerdata.messages.it.away`
    },

    messengerdataMessagesItGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.it.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.it.greetings.message`
    },

    messengerdataMessagesItGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.it.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.it.greetings.title`
    },

    messengerdataMessagesItThank: {
      sql: `${CUBE}.\`messengerData.messages.it.thank\``,
      type: `string`,
      title: `Messengerdata.messages.it.thank`
    },

    messengerdataMessagesItWelcome: {
      sql: `${CUBE}.\`messengerData.messages.it.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.it.welcome`
    },

    messengerdataMessagesJaAway: {
      sql: `${CUBE}.\`messengerData.messages.ja.away\``,
      type: `string`,
      title: `Messengerdata.messages.ja.away`
    },

    messengerdataMessagesJaGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.ja.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.ja.greetings.message`
    },

    messengerdataMessagesJaGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.ja.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.ja.greetings.title`
    },

    messengerdataMessagesJaThank: {
      sql: `${CUBE}.\`messengerData.messages.ja.thank\``,
      type: `string`,
      title: `Messengerdata.messages.ja.thank`
    },

    messengerdataMessagesJaWelcome: {
      sql: `${CUBE}.\`messengerData.messages.ja.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.ja.welcome`
    },

    messengerdataMessagesJvAway: {
      sql: `${CUBE}.\`messengerData.messages.jv.away\``,
      type: `string`,
      title: `Messengerdata.messages.jv.away`
    },

    messengerdataMessagesJvGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.jv.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.jv.greetings.message`
    },

    messengerdataMessagesJvGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.jv.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.jv.greetings.title`
    },

    messengerdataMessagesJvThank: {
      sql: `${CUBE}.\`messengerData.messages.jv.thank\``,
      type: `string`,
      title: `Messengerdata.messages.jv.thank`
    },

    messengerdataMessagesJvWelcome: {
      sql: `${CUBE}.\`messengerData.messages.jv.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.jv.welcome`
    },

    messengerdataMessagesKkAway: {
      sql: `${CUBE}.\`messengerData.messages.kk.away\``,
      type: `string`,
      title: `Messengerdata.messages.kk.away`
    },

    messengerdataMessagesKkGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.kk.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.kk.greetings.message`
    },

    messengerdataMessagesKkGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.kk.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.kk.greetings.title`
    },

    messengerdataMessagesKkThank: {
      sql: `${CUBE}.\`messengerData.messages.kk.thank\``,
      type: `string`,
      title: `Messengerdata.messages.kk.thank`
    },

    messengerdataMessagesKkWelcome: {
      sql: `${CUBE}.\`messengerData.messages.kk.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.kk.welcome`
    },

    messengerdataMessagesKoAway: {
      sql: `${CUBE}.\`messengerData.messages.ko.away\``,
      type: `string`,
      title: `Messengerdata.messages.ko.away`
    },

    messengerdataMessagesKoGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.ko.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.ko.greetings.message`
    },

    messengerdataMessagesKoGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.ko.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.ko.greetings.title`
    },

    messengerdataMessagesKoThank: {
      sql: `${CUBE}.\`messengerData.messages.ko.thank\``,
      type: `string`,
      title: `Messengerdata.messages.ko.thank`
    },

    messengerdataMessagesKoWelcome: {
      sql: `${CUBE}.\`messengerData.messages.ko.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.ko.welcome`
    },

    messengerdataMessagesMnAway: {
      sql: `${CUBE}.\`messengerData.messages.mn.away\``,
      type: `string`,
      title: `Messengerdata.messages.mn.away`
    },

    messengerdataMessagesMnGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.mn.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.mn.greetings.message`
    },

    messengerdataMessagesMnGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.mn.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.mn.greetings.title`
    },

    messengerdataMessagesMnThank: {
      sql: `${CUBE}.\`messengerData.messages.mn.thank\``,
      type: `string`,
      title: `Messengerdata.messages.mn.thank`
    },

    messengerdataMessagesMnWelcome: {
      sql: `${CUBE}.\`messengerData.messages.mn.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.mn.welcome`
    },

    messengerdataMessagesMrAway: {
      sql: `${CUBE}.\`messengerData.messages.mr.away\``,
      type: `string`,
      title: `Messengerdata.messages.mr.away`
    },

    messengerdataMessagesMrGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.mr.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.mr.greetings.message`
    },

    messengerdataMessagesMrGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.mr.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.mr.greetings.title`
    },

    messengerdataMessagesMrThank: {
      sql: `${CUBE}.\`messengerData.messages.mr.thank\``,
      type: `string`,
      title: `Messengerdata.messages.mr.thank`
    },

    messengerdataMessagesMrWelcome: {
      sql: `${CUBE}.\`messengerData.messages.mr.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.mr.welcome`
    },

    messengerdataMessagesNlAway: {
      sql: `${CUBE}.\`messengerData.messages.nl.away\``,
      type: `string`,
      title: `Messengerdata.messages.nl.away`
    },

    messengerdataMessagesNlGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.nl.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.nl.greetings.message`
    },

    messengerdataMessagesNlGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.nl.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.nl.greetings.title`
    },

    messengerdataMessagesNlThank: {
      sql: `${CUBE}.\`messengerData.messages.nl.thank\``,
      type: `string`,
      title: `Messengerdata.messages.nl.thank`
    },

    messengerdataMessagesNlWelcome: {
      sql: `${CUBE}.\`messengerData.messages.nl.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.nl.welcome`
    },

    messengerdataMessagesPaAway: {
      sql: `${CUBE}.\`messengerData.messages.pa.away\``,
      type: `string`,
      title: `Messengerdata.messages.pa.away`
    },

    messengerdataMessagesPaGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.pa.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.pa.greetings.message`
    },

    messengerdataMessagesPaGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.pa.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.pa.greetings.title`
    },

    messengerdataMessagesPaThank: {
      sql: `${CUBE}.\`messengerData.messages.pa.thank\``,
      type: `string`,
      title: `Messengerdata.messages.pa.thank`
    },

    messengerdataMessagesPaWelcome: {
      sql: `${CUBE}.\`messengerData.messages.pa.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.pa.welcome`
    },

    messengerdataMessagesPlPlAway: {
      sql: `${CUBE}.\`messengerData.messages.pl_PL.away\``,
      type: `string`,
      title: `Messengerdata.messages.pl Pl.away`
    },

    messengerdataMessagesPlPlGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.pl_PL.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.pl Pl.greetings.message`
    },

    messengerdataMessagesPlPlGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.pl_PL.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.pl Pl.greetings.title`
    },

    messengerdataMessagesPlPlThank: {
      sql: `${CUBE}.\`messengerData.messages.pl_PL.thank\``,
      type: `string`,
      title: `Messengerdata.messages.pl Pl.thank`
    },

    messengerdataMessagesPlPlWelcome: {
      sql: `${CUBE}.\`messengerData.messages.pl_PL.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.pl Pl.welcome`
    },

    messengerdataMessagesPtBrAway: {
      sql: `${CUBE}.\`messengerData.messages.pt_BR.away\``,
      type: `string`,
      title: `Messengerdata.messages.pt Br.away`
    },

    messengerdataMessagesPtBrGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.pt_BR.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.pt Br.greetings.message`
    },

    messengerdataMessagesPtBrGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.pt_BR.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.pt Br.greetings.title`
    },

    messengerdataMessagesPtBrThank: {
      sql: `${CUBE}.\`messengerData.messages.pt_BR.thank\``,
      type: `string`,
      title: `Messengerdata.messages.pt Br.thank`
    },

    messengerdataMessagesPtBrWelcome: {
      sql: `${CUBE}.\`messengerData.messages.pt_BR.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.pt Br.welcome`
    },

    messengerdataMessagesRoAway: {
      sql: `${CUBE}.\`messengerData.messages.ro.away\``,
      type: `string`,
      title: `Messengerdata.messages.ro.away`
    },

    messengerdataMessagesRoGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.ro.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.ro.greetings.message`
    },

    messengerdataMessagesRoGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.ro.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.ro.greetings.title`
    },

    messengerdataMessagesRoThank: {
      sql: `${CUBE}.\`messengerData.messages.ro.thank\``,
      type: `string`,
      title: `Messengerdata.messages.ro.thank`
    },

    messengerdataMessagesRoWelcome: {
      sql: `${CUBE}.\`messengerData.messages.ro.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.ro.welcome`
    },

    messengerdataMessagesRuAway: {
      sql: `${CUBE}.\`messengerData.messages.ru.away\``,
      type: `string`,
      title: `Messengerdata.messages.ru.away`
    },

    messengerdataMessagesRuGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.ru.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.ru.greetings.message`
    },

    messengerdataMessagesRuGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.ru.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.ru.greetings.title`
    },

    messengerdataMessagesRuThank: {
      sql: `${CUBE}.\`messengerData.messages.ru.thank\``,
      type: `string`,
      title: `Messengerdata.messages.ru.thank`
    },

    messengerdataMessagesRuWelcome: {
      sql: `${CUBE}.\`messengerData.messages.ru.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.ru.welcome`
    },

    messengerdataMessagesSqAway: {
      sql: `${CUBE}.\`messengerData.messages.sq.away\``,
      type: `string`,
      title: `Messengerdata.messages.sq.away`
    },

    messengerdataMessagesSqGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.sq.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.sq.greetings.message`
    },

    messengerdataMessagesSqGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.sq.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.sq.greetings.title`
    },

    messengerdataMessagesSqThank: {
      sql: `${CUBE}.\`messengerData.messages.sq.thank\``,
      type: `string`,
      title: `Messengerdata.messages.sq.thank`
    },

    messengerdataMessagesSqWelcome: {
      sql: `${CUBE}.\`messengerData.messages.sq.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.sq.welcome`
    },

    messengerdataMessagesTaAway: {
      sql: `${CUBE}.\`messengerData.messages.ta.away\``,
      type: `string`,
      title: `Messengerdata.messages.ta.away`
    },

    messengerdataMessagesTaGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.ta.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.ta.greetings.message`
    },

    messengerdataMessagesTaGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.ta.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.ta.greetings.title`
    },

    messengerdataMessagesTaThank: {
      sql: `${CUBE}.\`messengerData.messages.ta.thank\``,
      type: `string`,
      title: `Messengerdata.messages.ta.thank`
    },

    messengerdataMessagesTaWelcome: {
      sql: `${CUBE}.\`messengerData.messages.ta.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.ta.welcome`
    },

    messengerdataMessagesTeAway: {
      sql: `${CUBE}.\`messengerData.messages.te.away\``,
      type: `string`,
      title: `Messengerdata.messages.te.away`
    },

    messengerdataMessagesTeGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.te.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.te.greetings.message`
    },

    messengerdataMessagesTeGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.te.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.te.greetings.title`
    },

    messengerdataMessagesTeThank: {
      sql: `${CUBE}.\`messengerData.messages.te.thank\``,
      type: `string`,
      title: `Messengerdata.messages.te.thank`
    },

    messengerdataMessagesTeWelcome: {
      sql: `${CUBE}.\`messengerData.messages.te.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.te.welcome`
    },

    messengerdataMessagesTrTrAway: {
      sql: `${CUBE}.\`messengerData.messages.tr_TR.away\``,
      type: `string`,
      title: `Messengerdata.messages.tr Tr.away`
    },

    messengerdataMessagesTrTrGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.tr_TR.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.tr Tr.greetings.message`
    },

    messengerdataMessagesTrTrGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.tr_TR.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.tr Tr.greetings.title`
    },

    messengerdataMessagesTrTrThank: {
      sql: `${CUBE}.\`messengerData.messages.tr_TR.thank\``,
      type: `string`,
      title: `Messengerdata.messages.tr Tr.thank`
    },

    messengerdataMessagesTrTrWelcome: {
      sql: `${CUBE}.\`messengerData.messages.tr_TR.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.tr Tr.welcome`
    },

    messengerdataMessagesUkUaAway: {
      sql: `${CUBE}.\`messengerData.messages.uk_UA.away\``,
      type: `string`,
      title: `Messengerdata.messages.uk Ua.away`
    },

    messengerdataMessagesUkUaGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.uk_UA.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.uk Ua.greetings.message`
    },

    messengerdataMessagesUkUaGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.uk_UA.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.uk Ua.greetings.title`
    },

    messengerdataMessagesUkUaThank: {
      sql: `${CUBE}.\`messengerData.messages.uk_UA.thank\``,
      type: `string`,
      title: `Messengerdata.messages.uk Ua.thank`
    },

    messengerdataMessagesUkUaWelcome: {
      sql: `${CUBE}.\`messengerData.messages.uk_UA.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.uk Ua.welcome`
    },

    messengerdataMessagesUrPkAway: {
      sql: `${CUBE}.\`messengerData.messages.ur_PK.away\``,
      type: `string`,
      title: `Messengerdata.messages.ur Pk.away`
    },

    messengerdataMessagesUrPkGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.ur_PK.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.ur Pk.greetings.message`
    },

    messengerdataMessagesUrPkGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.ur_PK.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.ur Pk.greetings.title`
    },

    messengerdataMessagesUrPkThank: {
      sql: `${CUBE}.\`messengerData.messages.ur_PK.thank\``,
      type: `string`,
      title: `Messengerdata.messages.ur Pk.thank`
    },

    messengerdataMessagesUrPkWelcome: {
      sql: `${CUBE}.\`messengerData.messages.ur_PK.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.ur Pk.welcome`
    },

    messengerdataMessagesViAway: {
      sql: `${CUBE}.\`messengerData.messages.vi.away\``,
      type: `string`,
      title: `Messengerdata.messages.vi.away`
    },

    messengerdataMessagesViGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.vi.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.vi.greetings.message`
    },

    messengerdataMessagesViGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.vi.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.vi.greetings.title`
    },

    messengerdataMessagesViThank: {
      sql: `${CUBE}.\`messengerData.messages.vi.thank\``,
      type: `string`,
      title: `Messengerdata.messages.vi.thank`
    },

    messengerdataMessagesViWelcome: {
      sql: `${CUBE}.\`messengerData.messages.vi.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.vi.welcome`
    },

    messengerdataMessagesYiAway: {
      sql: `${CUBE}.\`messengerData.messages.yi.away\``,
      type: `string`,
      title: `Messengerdata.messages.yi.away`
    },

    messengerdataMessagesYiGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.yi.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.yi.greetings.message`
    },

    messengerdataMessagesYiGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.yi.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.yi.greetings.title`
    },

    messengerdataMessagesYiThank: {
      sql: `${CUBE}.\`messengerData.messages.yi.thank\``,
      type: `string`,
      title: `Messengerdata.messages.yi.thank`
    },

    messengerdataMessagesYiWelcome: {
      sql: `${CUBE}.\`messengerData.messages.yi.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.yi.welcome`
    },

    messengerdataMessagesZhCnAway: {
      sql: `${CUBE}.\`messengerData.messages.zh_CN.away\``,
      type: `string`,
      title: `Messengerdata.messages.zh Cn.away`
    },

    messengerdataMessagesZhCnGreetingsMessage: {
      sql: `${CUBE}.\`messengerData.messages.zh_CN.greetings.message\``,
      type: `string`,
      title: `Messengerdata.messages.zh Cn.greetings.message`
    },

    messengerdataMessagesZhCnGreetingsTitle: {
      sql: `${CUBE}.\`messengerData.messages.zh_CN.greetings.title\``,
      type: `string`,
      title: `Messengerdata.messages.zh Cn.greetings.title`
    },

    messengerdataMessagesZhCnThank: {
      sql: `${CUBE}.\`messengerData.messages.zh_CN.thank\``,
      type: `string`,
      title: `Messengerdata.messages.zh Cn.thank`
    },

    messengerdataMessagesZhCnWelcome: {
      sql: `${CUBE}.\`messengerData.messages.zh_CN.welcome\``,
      type: `string`,
      title: `Messengerdata.messages.zh Cn.welcome`
    },

    messengerdataResponserate: {
      sql: `${CUBE}.\`messengerData.responseRate\``,
      type: `string`,
      title: `Messengerdata.responserate`
    },

    messengerdataTimezone: {
      sql: `${CUBE}.\`messengerData.timezone\``,
      type: `string`,
      title: `Messengerdata.timezone`
    },

    name: {
      sql: `name`,
      type: `string`
    },

    uioptionsColor: {
      sql: `${CUBE}.\`uiOptions.color\``,
      type: `string`,
      title: `Uioptions.color`
    },

    uioptionsLogo: {
      sql: `${CUBE}.\`uiOptions.logo\``,
      type: `string`,
      title: `Uioptions.logo`
    },

    uioptionsTextcolor: {
      sql: `${CUBE}.\`uiOptions.textColor\``,
      type: `string`,
      title: `Uioptions.textcolor`
    },

    uioptionsWallpaper: {
      sql: `${CUBE}.\`uiOptions.wallpaper\``,
      type: `string`,
      title: `Uioptions.wallpaper`
    },

    visibility: {
      sql: `visibility`,
      type: `string`
    },

    webhookdataOrigin: {
      sql: `${CUBE}.\`webhookData.origin\``,
      type: `string`,
      title: `Webhookdata.origin`
    },

    webhookdataScript: {
      sql: `${CUBE}.\`webhookData.script\``,
      type: `string`,
      title: `Webhookdata.script`
    },

    webhookdataToken: {
      sql: `${CUBE}.\`webhookData.token\``,
      type: `string`,
      title: `Webhookdata.token`
    }
  },

  dataSource: `default`
});
