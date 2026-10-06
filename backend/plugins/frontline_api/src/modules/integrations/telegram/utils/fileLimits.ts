export const MAX_TELEGRAM_DOWNLOAD_BYTES = 20 * 1024 * 1024;

export const TELEGRAM_FILE_TOO_LARGE_NOTICE =
  '[Attachment exceeds Telegram’s 20 MB download limit. Open Telegram to view it.]';

export class TelegramFileTooLargeError extends Error {
  constructor() {
    super('Telegram files must be 20 MB or smaller.');
    this.name = 'TelegramFileTooLargeError';
  }
}
