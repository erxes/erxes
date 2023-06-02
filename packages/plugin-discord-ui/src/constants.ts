export const INTEGRATIONS = [
  {
    name: 'Discord Channel',
    description: 'Connect to Discord channel right from your Team Inbox',
    inMessenger: false,
    isAvailable: true,
    kind: 'discord-channel',
    logo: '/images/integrations/discord.png',
    createModal: 'discord-channel',
    createUrl: '/settings/integrations/createDiscord',
    category:
      'All integrations, For support teams, Marketing automation, Social media'
  }
];

export const KINDS = {
  CHANNEL: 'discord-channel'
};
