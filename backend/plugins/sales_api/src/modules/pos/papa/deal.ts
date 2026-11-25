import { IModels } from '~/connectionResolvers';
import { changeDeal } from '~/modules/sales/graphql/resolvers/mutations/utils';
import { createDeliveryDeal } from '../utils';
import { PAPA_DEAL_CREATE_LOCK_MS } from './constants';
import { papaDealStep, shouldMoveDeal } from './mapping';
import { IPosPapaConfig } from './types';

const errorText = (error: unknown) =>
  (error instanceof Error ? error.message : String(error)).slice(0, 500);

/**
 * Claims the deal create for one order, so a callback and a manual refresh
 * arriving together cannot make two deals. A claim older than the lock is
 * taken as a crashed create.
 */
const claimDealCreate = async (models: IModels, orderId: string) => {
  const now = new Date();
  const claimed = await models.PosOrders.updateOne(
    {
      _id: orderId,
      'papaDeal.dealId': { $in: [null, ''] },
      $or: [
        { 'papaDeal.creatingAt': { $in: [null] } },
        {
          'papaDeal.creatingAt': {
            $lt: new Date(now.getTime() - PAPA_DEAL_CREATE_LOCK_MS),
          },
        },
      ],
    },
    { $set: { 'papaDeal.creatingAt': now } },
  );

  return claimed.modifiedCount > 0;
};

/** The order's delivery deal, created in the first stage when it has none. */
const ensureDeliveryDeal = async ({
  subdomain,
  models,
  orderId,
  stageId,
}: {
  subdomain: string;
  models: IModels;
  orderId: string;
  stageId: string;
}) => {
  const order = await models.PosOrders.getOrder(orderId);
  const known = order.papaDeal?.dealId || order.deliveryInfo?.dealId;

  if (known) {
    return known;
  }

  if (!(await claimDealCreate(models, orderId))) {
    return undefined;
  }

  try {
    const pos = await models.Pos.findOne({ token: order.posToken }).lean();
    const deliveryConfig = pos?.deliveryConfig || {};
    const dealId = await createDeliveryDeal({
      subdomain,
      models,
      doneOrder: order,
      pos: {
        ...pos,
        deliveryConfig: {
          ...deliveryConfig,
          stageId: deliveryConfig.stageId || stageId,
        },
      },
    });

    await models.PosOrders.updateOne(
      { _id: orderId },
      {
        $set: { 'papaDeal.dealId': dealId },
        $unset: { 'papaDeal.creatingAt': 1 },
      },
    );

    return dealId;
  } catch (error) {
    await models.PosOrders.updateOne(
      { _id: orderId },
      { $unset: { 'papaDeal.creatingAt': 1 } },
    );
    throw error;
  }
};

/**
 * Moves the order's delivery deal to the stage set for its Papa status.
 * Never throws: a deal problem is stored on `papaDeal.error` and the
 * delivery itself carries on.
 */
export const syncPapaDeal = async ({
  subdomain,
  models,
  orderId,
}: {
  subdomain: string;
  models: IModels;
  orderId: string;
}) => {
  try {
    const order = await models.PosOrders.getOrder(orderId);
    const delivery = order.papaDelivery;
    const step = papaDealStep(delivery?.status);
    const papaOrderId = delivery?.papaOrderId;

    if (
      !step ||
      !papaOrderId ||
      !shouldMoveDeal(order.papaDeal, step, papaOrderId)
    ) {
      return;
    }

    const pos = await models.Pos.findOne({ token: order.posToken }).lean();
    const papa: IPosPapaConfig | undefined = pos?.deliveryConfig?.papa;
    const stageId = papa?.stageIds?.[step];

    if (!stageId) {
      return;
    }

    // A stage left over from an earlier delivery pipeline would move the
    // deal out of the pipeline the delivery deals live in.
    const stage = await models.Stages.findOne({ _id: stageId }).lean();
    const pipelineId = pos?.deliveryConfig?.pipelineId;

    if (!stage || (pipelineId && stage.pipelineId !== pipelineId)) {
      throw new Error(
        `The Papa "${step}" stage is not in the delivery pipeline; choose it again`,
      );
    }

    const dealId = await ensureDeliveryDeal({
      subdomain,
      models,
      orderId,
      stageId,
    });

    if (!dealId) {
      return;
    }

    await changeDeal(subdomain, models, delivery.sentBy || order.userId || '', {
      itemId: dealId,
      destinationStageId: stageId,
    });

    const now = new Date();

    await models.PosOrders.updateOne(
      { _id: orderId },
      {
        $set: {
          'papaDeal.dealId': dealId,
          'papaDeal.step': step,
          'papaDeal.papaOrderId': papaOrderId,
          'papaDeal.updatedAt': now,
        },
        $unset: { 'papaDeal.error': 1 },
      },
    );
  } catch (error) {
    await models.PosOrders.updateOne(
      { _id: orderId },
      {
        $set: {
          'papaDeal.error': errorText(error),
          'papaDeal.updatedAt': new Date(),
        },
      },
    ).catch(() => undefined);
  }
};
