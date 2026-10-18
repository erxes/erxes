import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  ITechCard,
  ITechCardDocument,
  ITechCardItem,
  ITechCardCost,
} from '../../@types/techCards';
import { techCardSchema } from '../definitions/techCards';

const normalizeItems = (
  items: ITechCardItem[] = [],
  requireCostRatio = false,
) =>
  items
    .filter((item) => item.productId)
    .map((item) => ({
      productId: item.productId,
      uom: item.uom || '',
      quantity: Number(item.quantity || 0),
      costRatio:
        item.costRatio === undefined || item.costRatio === null
          ? undefined
          : Number(item.costRatio),
    }))
    .filter((item) => item.quantity > 0)
    .map((item) => ({
      ...item,
      costRatio: requireCostRatio ? item.costRatio ?? 0 : item.costRatio,
    }));

const validateTechCard = (params: ITechCard) => {
  const durationType =
    !params.durationType || params.durationType === 'минут'
      ? 'minut'
      : params.durationType;
  if (!['real', 'minut', 'hour', 'day'].includes(durationType)) {
    throw new Error('Duration type must be real, minut, hour, or day');
  }
  if (
    durationType !== 'real' &&
    (params.duration === undefined ||
      params.duration === null ||
      !Number.isFinite(params.duration) ||
      params.duration < 0)
  ) {
    throw new Error(
      'A non-negative duration is required for minut, hour, or day',
    );
  }
  const inputs = normalizeItems(params.inputs);
  const outputs = normalizeItems(params.outputs, true);

  if (!params.name?.trim()) {
    throw new Error('Tech card name is required');
  }

  if (!inputs.length) {
    throw new Error('Tech card input items are required');
  }

  if (!outputs.length) {
    throw new Error('Tech card output items are required');
  }

  if (
    outputs.some(
      (item) => !Number.isFinite(item.costRatio) || (item.costRatio ?? 0) < 0,
    )
  ) {
    throw new Error(
      'Output cost allocation ratios must be finite non-negative numbers',
    );
  }

  const totalOutputCostRatio = outputs.reduce(
    (sum, item) => sum + (item.costRatio ?? 0),
    0,
  );

  if (!Number.isFinite(totalOutputCostRatio) || totalOutputCostRatio <= 0) {
    throw new Error(
      'Output cost allocation ratios must have a positive finite total',
    );
  }

  return {
    inputs,
    outputs,
    durationType,
    duration: durationType === 'real' ? undefined : params.duration,
  };
};

export interface ITechCardModel extends Model<ITechCardDocument> {
  getTechCard(_id: string): Promise<ITechCardDocument>;
  createTechCard(params: ITechCard, userId: string): Promise<ITechCardDocument>;
  updateTechCard(
    params: ITechCard & { _id: string },
    userId: string,
  ): Promise<ITechCardDocument>;
  removeTechCard(_id: string): Promise<{ deletedCount?: number }>;
}

export const loadTechCardClass = (models: IModels) => {
  const validateEstimatedCosts = async (params: ITechCard) => {
    const costs: {
      laborCosts: ITechCardCost[];
      overheadCosts: ITechCardCost[];
    } = {
      laborCosts: [],
      overheadCosts: [],
    };
    const accountIds = new Set<string>();
    for (const group of ['laborCosts', 'overheadCosts'] as const) {
      for (const [index, row] of (params[group] ?? []).entries()) {
        const label = `${group} row ${index + 1}`;
        if (!row.name?.trim()) throw new Error(`${label} name is required`);
        if (!Number.isFinite(row.amount) || row.amount < 0) {
          throw new Error(`${label} must be a finite non-negative amount`);
        }
        const accountId = row.accountId?.trim();
        if (!accountId) throw new Error(`${label} posting account is required`);
        costs[group].push({
          name: row.name.trim(),
          amount: row.amount,
          accountId,
        });
        accountIds.add(accountId);
      }
    }
    await Promise.all(
      Array.from(accountIds, (_id) =>
        models.Accounts.getAccount({ _id, status: 'active' }),
      ),
    );
    return costs;
  };

  class TechCard {
    public static async getTechCard(_id: string) {
      const techCard = await models.TechCards.findOne({ _id }).lean();

      if (!techCard) {
        throw new Error('Tech card not found');
      }

      return techCard;
    }

    public static async createTechCard(params: ITechCard, userId: string) {
      const { inputs, outputs, duration, durationType } =
        validateTechCard(params);
      const estimatedCosts = await validateEstimatedCosts(params);

      return await models.TechCards.create({
        code: params.code,
        name: params.name,
        description: params.description,
        duration,
        durationType,
        ...estimatedCosts,
        inputs,
        outputs,
        status: params.status || 'active',
        createdAt: new Date(),
        createdBy: userId,
        modifiedAt: new Date(),
        modifiedBy: userId,
      });
    }

    public static async updateTechCard(
      params: ITechCard & { _id: string },
      userId: string,
    ) {
      const { _id } = params;
      const existing = await models.TechCards.getTechCard(_id);
      const { inputs, outputs, duration, durationType } =
        validateTechCard(params);
      const estimatedCosts = await validateEstimatedCosts({
        ...existing,
        ...params,
      });

      await models.TechCards.updateOne(
        { _id },
        {
          $set: {
            code: params.code,
            name: params.name,
            description: params.description,
            ...(durationType === 'real' ? {} : { duration }),
            durationType,
            ...estimatedCosts,
            inputs,
            outputs,
            status: params.status || 'active',
            modifiedAt: new Date(),
            modifiedBy: userId,
          },
          ...(durationType === 'real' ? { $unset: { duration: 1 } } : {}),
        },
      );

      return await models.TechCards.getTechCard(_id);
    }

    public static async removeTechCard(_id: string) {
      await models.TechCards.getTechCard(_id);
      return await models.TechCards.deleteOne({ _id });
    }
  }

  techCardSchema.loadClass(TechCard);

  return techCardSchema;
};
