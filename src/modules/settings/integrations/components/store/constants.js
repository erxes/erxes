export const integrations = [
  {
    name: 'row-1',
    rows: [
      {
        name: 'Facebook',
        description: 'See and reply to Facebook messages in your Team Inbox',
        inMessenger: false,
        kind: 'facebook',
        logo: '/images/integrations/facebook.png',
        createModal: 'facebook'
      },
      {
        name: 'Twitter',
        description: 'See and reply to Twitter DMs in your Team Inbox',
        inMessenger: false,
        kind: 'twitter',
        logo: '/images/integrations/twitter.png',
        createUrl: '/settings/integrations/twitter'
      },
      {
        name: 'Messenger',
        description: 'See and reply to Messenger messages in your Team Inbox',
        inMessenger: false,
        kind: 'messenger',
        logo: '/images/integrations/messenger.png',
        createUrl: '/settings/integrations/createMessenger'
      }
    ]
  },
  {
    title: 'Coming soon',
    name: 'row-2',
    rows: [
      {
        name: 'Google meet',
        description: 'Start a video call from your conversation',
        inMessenger: true,
        logo: '/images/integrations/google-meet.png'
      },
      {
        name: 'Knowledge Base',
        description: 'See knowledge base in your Widget',
        inMessenger: true,
        logo: '/images/integrations/knowledge-base.png'
      },
      {
        name: 'Google calendar',
        description:
          'Let leads and customers book meetings during conversations',
        inMessenger: true,
        logo: '/images/integrations/google-calendar.png'
      }
    ]
  },
  {
    name: 'row-3',
    rows: [
      {
        name: 'Gmail',
        description: 'See and reply to Gmail in your Team Inbox',
        inMessenger: false,
        logo: '/images/integrations/gmail.png'
      },
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
      }
    ]
  },
  {
    name: 'row-4',
    rows: [
      {
        name: 'Wechat',
        description: 'See and reply to Wechat messages in your Team Inbox',
        inMessenger: false,
        logo: '/images/integrations/wechat.png'
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
