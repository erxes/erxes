export const integrations = [
  {
    name: 'row-1',
    rows: [
      {
        name: 'Facebook',
        description: 'See and reply to Facebook messages in your Team Inbox',
        inMessenger: false,
        kind: 'facebook',
        logo: '/images/integrations/facebook.png'
      },
      {
        name: 'Twitter',
        description: 'See and reply to Twitter DMs in your Team Inbox',
        inMessenger: false,
        kind: 'twitter',
        logo: '/images/integrations/twitter.png'
      },
      {
        name: 'Messenger',
        description: 'See and reply to Messenger messages in your Team Inbox',
        inMessenger: false,
        kind: 'messenger',
        logo: '/images/integrations/messenger.png'
      }
    ]
  },

  {
    title: 'Coming soon',
    name: 'row-2',
    rows: [
      {
        name: 'Gmail',
        description: 'See and reply to Gmail in your Team Inbox',
        inMessenger: false,
        logo: '/images/integrations/gmail.png'
      },
      {
        name: 'Google calendar',
        description:
          'Let leads and customers book meetings during conversations',
        inMessenger: true,
        logo: '/images/integrations/google-calendar.png'
      },
      {
        name: 'Wechat',
        description: 'See and reply to Wechat messages in your Team Inbox',
        inMessenger: false,
        logo: '/images/integrations/wechat.png'
      }
    ]
  },

  {
    name: 'row-3',
    rows: [
      {
        name: 'Viber',
        description: 'See and reply to Viber messages in your Team Inbox',
        inMessenger: false,
        logo: '/images/integrations/viber.png'
      },
      {
        name: 'WhatsApp',
        description: 'See and reply to Whatsapp messages in your Team Inbox',
        inMessenger: false,
        logo: '/images/integrations/whatsapp.png'
      },
      {
        name: 'Line',
        description: 'See and reply to Line messages in your Team Inbox',
        inMessenger: false,
        logo: '/images/integrations/line.png'
      }
    ]
  }
];
