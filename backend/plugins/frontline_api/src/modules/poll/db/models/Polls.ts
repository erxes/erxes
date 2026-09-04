import { nanoid } from 'nanoid';
import { Model } from 'mongoose';
import { IPollDocument, IPollOption } from '@/poll/@types/poll';
import { POLL_STATUSES, pollSchema } from '@/poll/db/definitions/polls';
import { IModels } from '~/connectionResolvers';

export const MAX_POLL_OPTIONS = 10;
export const MAX_QUESTION_LENGTH = 300;
export const MAX_OPTION_LENGTH = 100;

export interface IPollOptionInput {
  _id?: string;
  text: string;
  order?: number;
}

export interface IPollInput {
  title: string;
  question: string;
  channelId?: string;
  options: IPollOptionInput[];
  allowMultiselect?: boolean;
  durationHours?: number;
  status?: string;
}

export interface IPollModel extends Model<IPollDocument> {
  getPoll(_id: string): Promise<IPollDocument>;
  generateCode(): Promise<string>;
  createPoll(doc: IPollInput, createdUserId: string): Promise<IPollDocument>;
  updatePoll(_id: string, doc: IPollInput): Promise<IPollDocument>;
  removePolls(_ids: string[]): Promise<string[]>;
  changeStatus(_ids: string[], status: string): Promise<boolean>;
  increaseSentCount(_id: string): Promise<void>;
}

export const normalizePollOptions = (
  options: IPollOptionInput[] = [],
): IPollOption[] => {
  const normalized = options
    .map((option) => ({
      _id: option._id || nanoid(),
      text: (option.text || '').trim().slice(0, MAX_OPTION_LENGTH),
      order: option.order,
    }))
    .filter((option) => option.text.length > 0)
    .slice(0, MAX_POLL_OPTIONS)
    .map((option, index) => ({ ...option, order: index }));

  if (normalized.length < 2) {
    throw new Error('A poll needs at least 2 options');
  }

  const seen = new Set<string>();

  for (const option of normalized) {
    if (seen.has(option.text.toLowerCase())) {
      throw new Error('Poll options must be unique');
    }
    seen.add(option.text.toLowerCase());
  }

  return normalized;
};

const validateDoc = (doc: IPollInput) => {
  const title = (doc.title || '').trim();
  const question = (doc.question || '').trim().slice(0, MAX_QUESTION_LENGTH);

  if (!title) {
    throw new Error('Poll title is required');
  }

  if (!question) {
    throw new Error('Poll question is required');
  }

  if (doc.durationHours !== undefined && doc.durationHours !== null) {
    if (doc.durationHours < 1 || doc.durationHours > 768) {
      throw new Error('Poll duration must be between 1 and 768 hours');
    }
  }

  return {
    title,
    question,
    channelId: doc.channelId || undefined,
    options: normalizePollOptions(doc.options),
    allowMultiselect: Boolean(doc.allowMultiselect),
    durationHours: doc.durationHours ?? undefined,
  };
};

export const loadPollClass = (models: IModels) => {
  class Poll {
    public static async getPoll(_id: string) {
      const poll = await models.Polls.findOne({ _id });

      if (!poll) {
        throw new Error('Poll not found');
      }

      return poll;
    }

    public static async generateCode() {
      let code = '';
      let exists = true;

      do {
        code = nanoid(6);
        exists = Boolean(await models.Polls.findOne({ code }));
      } while (exists);

      return code;
    }

    public static async createPoll(doc: IPollInput, createdUserId: string) {
      return models.Polls.create({
        ...validateDoc(doc),
        code: await models.Polls.generateCode(),
        status: doc.status || POLL_STATUSES.ACTIVE,
        sentCount: 0,
        createdUserId,
      });
    }

    public static async updatePoll(_id: string, doc: IPollInput) {
      await models.Polls.getPoll(_id);

      await models.Polls.updateOne(
        { _id },
        {
          $set: {
            ...validateDoc(doc),
            ...(doc.status ? { status: doc.status } : {}),
          },
        },
        { runValidators: true },
      );

      return models.Polls.getPoll(_id);
    }

    public static async removePolls(_ids: string[]) {
      await models.Polls.deleteMany({ _id: { $in: _ids } });
      await models.PollVotes.deleteMany({ pollId: { $in: _ids } });

      return _ids;
    }

    public static async changeStatus(_ids: string[], status: string) {
      if (!POLL_STATUSES.ALL.includes(status)) {
        throw new Error(`Unknown poll status: ${status}`);
      }

      await models.Polls.updateMany(
        { _id: { $in: _ids } },
        { $set: { status } },
      );

      return true;
    }

    public static async increaseSentCount(_id: string) {
      await models.Polls.updateOne({ _id }, { $inc: { sentCount: 1 } });
    }
  }

  pollSchema.loadClass(Poll);

  return pollSchema;
};
