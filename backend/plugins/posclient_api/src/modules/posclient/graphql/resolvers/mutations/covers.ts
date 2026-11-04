import { deleteCoverWithLog } from '~/modules/posclient/utils/coverChangeLogs';
import { IContext } from '@/posclient/@types/types';
import { ICover } from '~/modules/posclient/@types/cover';
import { markResolvers, sendTRPCMessage } from 'erxes-api-shared/utils';
import { z } from 'zod';
import {
  coverDetailsUpdate,
  saveCoverTerminalResult,
} from '~/modules/posclient/utils/coverTerminalResults';

const terminalInput = z.object({
  _id: z.string().min(1),
  resultId: z.string().min(1).max(100),
  bank: z.enum(['golomtCard', 'khaanCard', 'TDBCard', 'capitron']),
  response: z
    .string()
    .min(1)
    .max(512 * 1024)
    .nullish(),
});

const checkCoverAccess = (
  cover: ICover,
  { posUser, config }: IContext,
  allowConfirming = false,
) => {
  if (!posUser) throw new Error('Must login');
  if (
    cover.posToken !== config.token ||
    (posUser._id !== cover.createdBy &&
      !(config.adminIds || []).includes(posUser._id))
  ) {
    throw new Error('Cannot manage this cover');
  }
  if (
    cover.status === 'confirm' ||
    (cover.status === 'confirming' && !allowConfirming)
  )
    throw new Error('Cannot update a confirmed cover');
};

const editableFilter = (_id: string, posToken: string) => ({
  _id,
  posToken,
  status: { $nin: ['confirm', 'confirming'] },
});

const getEditableCover = async (
  _id: string,
  context: IContext,
  allowConfirming = false,
) => {
  if (!context.posUser) throw new Error('Must login');
  const cover = await context.models.Covers.getCover(_id);
  checkCoverAccess(cover, context, allowConfirming);
  return cover;
};

export const coverMutations = {
  async coversAdd(
    _root: unknown,
    doc: ICover,
    { posUser, config, models }: IContext,
  ) {
    if (!posUser) throw new Error('Must login');
    return models.Covers.createCover({
      ...doc,
      status: doc.status === 'draft' ? 'draft' : 'new',
      posToken: config.token,
      createdAt: new Date(),
      createdBy: posUser._id,
    });
  },

  async coversEdit(
    _root: unknown,
    doc: ICover & { _id: string },
    context: IContext,
  ) {
    const { models, config, posUser } = context;
    const cover = await getEditableCover(doc._id, context);
    const fields = Object.fromEntries(
      Object.entries(doc)
        .filter(
          ([key, value]) =>
            ['beginDate', 'endDate', 'description', 'userId'].includes(key) &&
            value !== undefined,
        )
        .map(([key, value]) => [key, { $literal: value }]),
    );
    const updated = await models.Covers.findOneAndUpdate(
      editableFilter(doc._id, config.token),
      [
        {
          $set: {
            ...fields,
            ...(cover.status === 'draft' && doc.status === 'new'
              ? { status: 'new' }
              : {}),
            ...(doc.details !== undefined
              ? { details: coverDetailsUpdate(doc.details) }
              : {}),
            modifiedAt: new Date(),
            modifiedBy: { $literal: posUser?._id },
          },
        },
      ],
      { new: true },
    ).lean();
    if (!updated) throw new Error('Cover changed; reload before saving');
    return updated;
  },

  async posclientCoverTerminalResultSave(
    _root: unknown,
    args: z.infer<typeof terminalInput>,
    context: IContext,
  ) {
    const { _id, resultId, bank, response } = terminalInput.parse(args);
    const { models, posUser } = context;
    const cover = await getEditableCover(_id, context);
    return saveCoverTerminalResult(
      models,
      cover,
      { _id, resultId, bank, response },
      posUser?._id || '',
    );
  },

  async coversRemove(
    _root: unknown,
    { _id }: { _id: string },
    context: IContext,
  ) {
    const { models, posUser } = context;
    const cover = await getEditableCover(_id, context);
    return deleteCoverWithLog(models, cover, posUser?._id);
  },

  async coversConfirm(
    _root: unknown,
    { _id }: { _id: string },
    context: IContext,
  ) {
    const { models, config, posUser, subdomain } = context;
    const cover = await getEditableCover(_id, context, true);
    if (cover.status === 'draft')
      throw new Error('Calculate cover amounts before publishing');
    if (!cover.endDate)
      throw new Error('Select a cover end date before publishing');
    const locked = await models.Covers.findOneAndUpdate(
      {
        ...(cover.status === 'confirming'
          ? { _id, posToken: config.token, status: 'confirming' }
          : editableFilter(_id, config.token)),
        details: {
          $not: {
            $elemMatch: {
              terminalResults: { $elemMatch: { response: { $exists: false } } },
            },
          },
        },
      },
      { $set: { status: 'confirming' } },
      { new: true },
    ).lean();
    if (!locked)
      throw new Error('Save all pending terminal results before publishing');
    try {
      const response = await sendTRPCMessage({
        subdomain,
        method: 'mutation',
        pluginName: 'sales',
        module: 'pos',
        action: 'confirmCover',
        input: {
          posToken: config.token,
          cover: { ...locked, status: 'confirm' },
        },
        defaultValue: {},
        throwOnError: true,
      });
      if (response?._id !== _id)
        throw new Error('Cover was not published to Sales');
    } catch (error) {
      await models.Covers.updateOne(
        { _id, posToken: config.token, status: 'confirming' },
        { $set: { status: cover.status } },
      );
      throw error;
    }
    await models.Covers.updateOne(
      { _id, posToken: config.token, status: 'confirming' },
      {
        $set: {
          status: 'confirm',
          modifiedAt: new Date(),
          modifiedBy: posUser?._id,
        },
      },
    );
    return models.Covers.getCover(_id);
  },
};

markResolvers(coverMutations, { wrapperConfig: { skipPermission: true } });
