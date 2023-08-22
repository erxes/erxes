import { Telegraf } from 'telegraf';
import { receiveMessage } from './receiveMessage';
import { message } from 'telegraf/filters';
import { Chats } from './models';

export class TelegramBot {
  private _bot;
  private _info;
  error?: string;

  constructor(botToken: string) {
    try {
      this._bot = new Telegraf(botToken);
    } catch (e) {
      this.error = e.message;
    }
  }

  getMe = async () => {
    const me = await this._bot.telegram.getMe();
    this._info = me;
    return me;
  };

  run = async accountId => {
    if (!this._info) {
      await this.getMe();
    }
    this._bot.on(message('text'), receiveMessage(accountId));

    this._bot.on(['my_chat_member'], async ctx => {
      await this.updateChat(ctx, accountId);
    });

    this._bot.launch();
    console.log(`Bot "${this._info.username}" is running`);
    return;
  };

  updateChat = async (ctx, botAccountId) => {
    const update = ctx.update;
    const memberUpdate = update.my_chat_member;
    const { chat, new_chat_member } = memberUpdate;
    const { id: telegramId, title, type: chatType } = chat;

    switch (new_chat_member.status) {
      case 'kicked':
      case 'left':
        console.log(`Removing telegram chat: ${telegramId}`);
        const removingResult = await Chats.remove({
          botAccountId,
          telegramId
        });
        return;
      case 'member':
      case 'administrator':
        console.log(`Add/Updating telegram chat: ${telegramId}`);
        const addingChat = await Chats.createOrUpdate(
          { telegramId, botAccountId },
          {
            botAccountId,
            telegramId,
            title,
            chatType,
            memberType: new_chat_member.status
          }
        );
      default:
        return;
    }
  };
}
