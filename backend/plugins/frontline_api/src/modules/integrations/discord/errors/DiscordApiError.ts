export class DiscordApiError extends Error {
  status: number;
  discordCode?: number;

  constructor(status: number, message: string, discordCode?: number) {
    super(message);
    this.name = 'DiscordApiError';
    this.status = status;
    this.discordCode = discordCode;
  }
}
