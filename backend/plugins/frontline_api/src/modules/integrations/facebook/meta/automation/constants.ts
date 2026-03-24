export const facebookConstants = {
  actions: [
    {
      moduleName: 'facebook',
      collectionName: 'messages',
      method: 'create',
      icon: 'IconBrandMessenger',
      label: 'Send Facebook Message',
      description: 'Send Facebook Message',
      isAvailableOptionalConnect: true,
    },
    {
      moduleName: 'facebook',
      collectionName: 'comments',
      method: 'create',
      icon: 'IconBrandFacebook',
      label: 'Send Facebook Comment',
      description: 'Send Facebook Comments',
    },
  ],
  triggers: [
    {
      moduleName: 'facebook',
      collectionName: 'messages',
      icon: 'IconBrandMessenger',
      label: 'Facebook Message',
      description:
        'Start with a blank workflow that enrolls and is triggered off facebook messages',
      isCustom: true,
    },
    {
      moduleName: 'facebook',
      collectionName: 'comments',
      icon: 'IconBrandFacebook',
      label: 'Facebook Comments',
      description:
        'Start with a blank workflow that enrolls and is triggered off facebook comments',
      isCustom: true,
    },
    {
      moduleName: 'facebook',
      collectionName: 'ads',
      icon: 'IconSpeakerphone',
      label: 'Facebook Ads Message',
      description:
        'Start with a blank workflow that enrolls and is triggered off clicked send message on facebook ads',
      isCustom: true,
    },
  ],
  bots: [
    {
      moduleName: 'facebook',
      name: 'facebook-messenger-bots',
      label: 'Facebook Messenger',
      description: 'Generate Facebook Messenger Bots',
      logo: 'fb-messenger.webp',
      totalCountQueryName: 'facebookMessengerBotsTotalCount',
    },
  ],
};
