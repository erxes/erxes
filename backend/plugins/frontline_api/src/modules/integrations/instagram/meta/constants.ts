export const instagramConstants = {
  actions: [
    {
      moduleName: 'instagram',
      collectionName: 'messages',
      method: 'create',
      icon: 'IconBrandMessenger',
      label: 'Send Instagram Message',
      description: 'Send Instagram Message',
      isAvailableOptionalConnect: true,
    },
    {
      moduleName: 'instagram',
      collectionName: 'comments',
      method: 'create',
      icon: 'IconBrandFacebook',
      label: 'Send Instagram Comment',
      description: 'Send Instagram Comments',
    },
  ],
  triggers: [
    {
      moduleName: 'instagram',
      collectionName: 'messages',
      icon: 'IconBrandMessenger',
      label: 'Instagram Message',
      description:
        'Start with a blank workflow that enrolls and is triggered off instagram messages',
      isCustom: true,
    },
    {
      moduleName: 'instagram',
      collectionName: 'comments',
      icon: 'IconBrandInstagram',
      label: 'Instagram Comments',
      description:
        'Start with a blank workflow that enrolls and is triggered off instagram comments',
      isCustom: true,
    },
    {
      moduleName: 'instagram',
      collectionName: 'ads',
      icon: 'IconSpeakerphone',
      label: 'Instagram Ads Message',
      description:
        'Start with a blank workflow that enrolls and is triggered off clicked send message on instagram ads',
      isCustom: true,
    },
  ],
  bots: [
    {
      moduleName: 'instagram',
      name: 'instagram-messenger-bots',
      label: 'Instagram Messenger',
      description: 'Generate Instagram Messenger Bots',
      logo: 'ig.svg',
      totalCountQueryName: 'instagramMessengerBotsTotalCount',
    },
  ],
};
