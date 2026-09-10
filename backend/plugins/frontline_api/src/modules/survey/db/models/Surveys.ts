import { nanoid } from 'nanoid';
import { Model } from 'mongoose';
import {
  ISurveyDocument,
  ISurveyOption,
  ISurveyStep,
} from '@/survey/@types/survey';
import { SURVEY_STATUSES, surveySchema } from '@/survey/db/definitions/surveys';
import { IModels } from '~/connectionResolvers';

export const MAX_SURVEY_OPTIONS = 10;
export const MAX_SURVEY_STEPS = 10;
export const MAX_QUESTION_LENGTH = 300;
export const MAX_OPTION_LENGTH = 100;
export const MAX_STEP_NAME_LENGTH = 100;

export interface ISurveyOptionInput {
  _id?: string;
  text: string;
  order?: number;
  ticketCreationEnabled?: boolean;
  ticketCreationThreshold?: number;
  ticketPipelineId?: string;
  ticketStatusId?: string;
}

export interface ISurveyStepInput {
  _id?: string;
  name?: string;
  description?: string;
  order?: number;
  question: string;
  options: ISurveyOptionInput[];
  allowMultiselect?: boolean;
}

export interface ISurveyInput {
  title: string;
  question?: string;
  channelId?: string;
  brandId?: string;
  options?: ISurveyOptionInput[];
  steps?: ISurveyStepInput[];
  allowMultiselect?: boolean;
  durationHours?: number;
  status?: string;
}

export interface ISurveyModel extends Model<ISurveyDocument> {
  getSurvey(_id: string): Promise<ISurveyDocument>;
  generateCode(): Promise<string>;
  createSurvey(
    doc: ISurveyInput,
    createdUserId: string,
  ): Promise<ISurveyDocument>;
  updateSurvey(_id: string, doc: ISurveyInput): Promise<ISurveyDocument>;
  removeSurveys(_ids: string[]): Promise<string[]>;
  changeStatus(_ids: string[], status: string): Promise<boolean>;
  increaseSentCount(_id: string): Promise<void>;
}

const normalizeOptionTicketConfig = (option: ISurveyOptionInput) => {
  if (!option.ticketCreationEnabled) {
    return { ticketCreationEnabled: false };
  }

  const threshold = option.ticketCreationThreshold;

  if (!threshold || threshold < 1 || !Number.isInteger(threshold)) {
    throw new Error(
      'A ticket threshold must be a whole number of at least 1 vote',
    );
  }

  if (!option.ticketPipelineId || !option.ticketStatusId) {
    throw new Error(
      'Choose the pipeline and status a triggered ticket lands in',
    );
  }

  return {
    ticketCreationEnabled: true,
    ticketCreationThreshold: threshold,
    ticketPipelineId: option.ticketPipelineId,
    ticketStatusId: option.ticketStatusId,
  };
};

export const normalizeSurveyOptions = (
  options: ISurveyOptionInput[] = [],
): ISurveyOption[] => {
  const normalized = options
    .map((option) => ({
      _id: option._id || nanoid(),
      text: (option.text || '').trim().slice(0, MAX_OPTION_LENGTH),
      order: option.order,
      ...normalizeOptionTicketConfig(option),
    }))
    .filter((option) => option.text.length > 0)
    .slice(0, MAX_SURVEY_OPTIONS)
    .map((option, index) => ({ ...option, order: index }));

  if (normalized.length < 2) {
    throw new Error('A survey needs at least 2 options');
  }

  const seen = new Set<string>();

  for (const option of normalized) {
    if (seen.has(option.text.toLowerCase())) {
      throw new Error('Survey options must be unique');
    }
    seen.add(option.text.toLowerCase());
  }

  return normalized;
};

const normalizeStepOptions = (
  options: ISurveyOptionInput[] = [],
  label = '',
): ISurveyOption[] => {
  try {
    return normalizeSurveyOptions(options);
  } catch (error) {
    throw new Error(`${(error as Error).message}${label}`);
  }
};

export const normalizeSurveySteps = (
  steps: ISurveyStepInput[] = [],
): ISurveyStep[] => {
  if (!steps.length) {
    throw new Error('A survey needs at least 1 step');
  }

  const takenOptionIds = new Set<string>();

  const kept = steps.slice(0, MAX_SURVEY_STEPS);
  const label = (index: number) =>
    kept.length > 1 ? ` on step ${index + 1}` : '';

  const normalized = kept.map((step, index) => {
    const question = (step.question || '').trim().slice(0, MAX_QUESTION_LENGTH);

    if (!question) {
      throw new Error(`Survey question is required${label(index)}`);
    }

    const options = normalizeStepOptions(step.options, label(index)).map(
      (option) => {
        const _id = takenOptionIds.has(option._id) ? nanoid() : option._id;
        takenOptionIds.add(_id);

        return { ...option, _id };
      },
    );

    return {
      _id: step._id || nanoid(),
      name:
        (step.name || '').trim().slice(0, MAX_STEP_NAME_LENGTH) ||
        `Step ${index + 1}`,
      description: (step.description || '').trim(),
      order: index,
      question,
      options,
      allowMultiselect: Boolean(step.allowMultiselect),
    };
  });

  const takenStepIds = new Set<string>();

  return normalized.map((step) => {
    const _id = takenStepIds.has(step._id) ? nanoid() : step._id;
    takenStepIds.add(_id);

    return { ...step, _id };
  });
};

const validateDoc = (doc: ISurveyInput) => {
  const title = (doc.title || '').trim();

  if (!title) {
    throw new Error('Survey title is required');
  }

  if (doc.durationHours !== undefined && doc.durationHours !== null) {
    if (doc.durationHours < 1 || doc.durationHours > 768) {
      throw new Error('Survey duration must be between 1 and 768 hours');
    }
  }

  const steps = normalizeSurveySteps(
    doc.steps?.length
      ? doc.steps
      : [
          {
            question: doc.question || '',
            options: doc.options || [],
            allowMultiselect: doc.allowMultiselect,
          },
        ],
  );

  const [firstStep] = steps;

  return {
    title,
    channelId: doc.channelId || undefined,
    brandId: doc.brandId || undefined,
    steps,
    question: firstStep.question,
    options: firstStep.options,
    allowMultiselect: firstStep.allowMultiselect,
    durationHours: doc.durationHours ?? undefined,
  };
};

const restoreOptionTicketState = (
  existing: ISurveyDocument,
  steps: ISurveyStep[],
): ISurveyStep[] => {
  const previous = new Map<string, ISurveyOption>();

  for (const step of existing.steps?.length
    ? existing.steps
    : [{ options: existing.options } as ISurveyStep]) {
    for (const option of step.options || []) {
      previous.set(option._id, option);
    }
  }

  return steps.map((step) => ({
    ...step,
    options: step.options.map((option) => {
      const before = previous.get(option._id);

      if (!before?.ticketCreated && !before?.ticketClaimedAt) {
        return option;
      }

      return {
        ...option,
        ticketCreated: before.ticketCreated,
        ticketId: before.ticketId,
        ticketClaimedAt: before.ticketClaimedAt,
      };
    }),
  }));
};

const assertBrandMessenger = async (
  models: IModels,
  channelId?: string,
  brandId?: string,
) => {
  if (!channelId || !brandId) {
    return;
  }

  const integration = await models.Integrations.findOne({
    channelId,
    brandId,
    kind: 'messenger',
    isActive: { $ne: false },
  }).lean();

  if (!integration) {
    throw new Error(
      'The selected brand has no active messenger integration in this channel',
    );
  }
};

export const loadSurveyClass = (models: IModels) => {
  class Survey {
    public static async getSurvey(_id: string) {
      const survey = await models.Surveys.findOne({ _id });

      if (!survey) {
        throw new Error('Survey not found');
      }

      return survey;
    }

    public static async generateCode() {
      let code = '';
      let exists = true;

      do {
        code = nanoid(6);
        exists = Boolean(await models.Surveys.findOne({ code }));
      } while (exists);

      return code;
    }

    public static async createSurvey(doc: ISurveyInput, createdUserId: string) {
      await assertBrandMessenger(models, doc.channelId, doc.brandId);

      return models.Surveys.create({
        ...validateDoc(doc),
        code: await models.Surveys.generateCode(),
        status: doc.status || SURVEY_STATUSES.ACTIVE,
        sentCount: 0,
        createdUserId,
      });
    }

    public static async updateSurvey(_id: string, doc: ISurveyInput) {
      const existing = await models.Surveys.getSurvey(_id);

      await assertBrandMessenger(models, doc.channelId, doc.brandId);

      const validated = validateDoc(doc);
      const steps = restoreOptionTicketState(existing, validated.steps);
      const [firstStep] = steps;

      await models.Surveys.updateOne(
        { _id },
        {
          $set: {
            ...validated,
            steps,
            options: firstStep.options,
            ...(doc.status ? { status: doc.status } : {}),
          },
        },
        { runValidators: true },
      );

      return models.Surveys.getSurvey(_id);
    }

    public static async removeSurveys(_ids: string[]) {
      await models.Surveys.deleteMany({ _id: { $in: _ids } });
      await models.SurveyVotes.deleteMany({ surveyId: { $in: _ids } });

      return _ids;
    }

    public static async changeStatus(_ids: string[], status: string) {
      if (!SURVEY_STATUSES.ALL.includes(status)) {
        throw new Error(`Unknown survey status: ${status}`);
      }

      await models.Surveys.updateMany(
        { _id: { $in: _ids } },
        { $set: { status } },
      );

      return true;
    }

    public static async increaseSentCount(_id: string) {
      await models.Surveys.updateOne({ _id }, { $inc: { sentCount: 1 } });
    }
  }

  surveySchema.loadClass(Survey);

  return surveySchema;
};
