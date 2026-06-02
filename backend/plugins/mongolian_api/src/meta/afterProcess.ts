import { AfterProcessConfigs, IAfterProcessRule } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { afterMutationHandlers as dealAfterEbarimt } from '~/modules/ebarimt/afterMutations';
import {
  afterMutationHandlers as dealAfterErkhet,
  hasErkhetStageConfig,
} from '~/modules/erkhet/afterMutations';
import { syncPosOrderToErkhet } from '~/modules/erkhet/afterMutPosOrder';
import { afterMutationHandlers as productPlacesAfterMutation } from '~/modules/productPlaces/afterMutations';

const ebarimtMutationNames = ['dealsChange', 'dealsEdit', 'dealsAdd'];
const erkhetMutationNames = ['dealsChange', 'dealsEdit', 'dealsAdd'];

// You can reuse same mutation names because productPlaces
const productPlacesMutationNames = ['dealsChange', 'dealsEdit'];

const allRules: IAfterProcessRule[] = [
  {
    type: 'afterMutation',
    mutationNames: [
      ...new Set([
        ...ebarimtMutationNames,
        ...erkhetMutationNames,
        ...productPlacesMutationNames,
      ]),
    ],
  },
  {
    type: 'updatedDocument',
    contentTypes: ['sales:pos.orders'],
    when: {
      fieldsUpdated: ['status', 'cashAmount', 'mobileAmount', 'paidAmounts'],
    },
  },
  {
    type: 'createdDocument',
    contentTypes: ['sales:pos.orders'],
    when: {
      fieldsWith: ['status'],
    },
  },
];

export const afterProcess: AfterProcessConfigs = {
  rules: allRules,

  afterMutation: async (ctx, input) => {
    const { mutationName, args, requestData, result, userId } =
      (input?.data as any) ?? {};

    if (!mutationName) return;

    const { itemId, destinationStageId, sourceStageId } = args || {};
    const models = await generateModels(ctx.subdomain);

    if (ebarimtMutationNames.includes(mutationName)) {
      const { stageId } = result || {};
      const sessionCode = Array.isArray(requestData?.sessioncode)
        ? requestData.sessioncode[0]
        : requestData?.sessioncode || '';

      if (
        destinationStageId &&
        destinationStageId !== sourceStageId &&
        destinationStageId === stageId &&
        itemId
      ) {
        try {
          await dealAfterEbarimt(models, ctx.subdomain, ctx.processId || '', {
            sourceStageId,
            destinationStageId,
            deal: result,
            sessionCode,
            userId,
          });
        } catch (error) {
          console.error('Ebarimt afterMutation failed:', error);
        }
      }
    }

    // SYNC ERKHET
    if (erkhetMutationNames.includes(mutationName)) {
      try {
        const currentStageId = result?.stageId || destinationStageId;
        const isCreate = mutationName === 'dealsAdd';
        const isStageChanged =
          destinationStageId &&
          destinationStageId !== sourceStageId &&
          destinationStageId === currentStageId &&
          itemId;

        if (
          (isCreate || isStageChanged) &&
          (await hasErkhetStageConfig(models, currentStageId))
        ) {
          await dealAfterErkhet(ctx.subdomain, {
            type: 'sales:deal',
            action: isCreate ? 'create' : 'update',
            object: isCreate
              ? result
              : {
                  _id: itemId,
                  stageId: sourceStageId,
                },
            updatedDocument: result,
            user: { _id: userId },
          });
        }
      } catch (error) {
        console.error('Erkhet afterMutation failed:', error);
      }
    }

    // PRODUCT PLACES
    if (productPlacesMutationNames.includes(mutationName)) {
      try {
        await productPlacesAfterMutation(ctx.subdomain, {
          type: 'sales:deal',
          action: 'update',
          updatedDocument: result,
          object: {
            stageId: sourceStageId,
          },
          user: userId,
        });
      } catch (error) {
        console.error('Product places afterMutation failed:', error);
      }
    }
  },

  afterDocumentUpdated: async (ctx, input) => {
    const { data } = input;
    const { subdomain } = ctx;
    const models = await generateModels(subdomain);
    const { contentType, currentDocument, userId } = data as any;

    if (contentType === 'sales:pos.orders' && currentDocument?._id) {
      await syncPosOrderToErkhet({
        subdomain,
        models,
        order: currentDocument,
        userId,
      });
    }
  },

  afterDocumentCreated: async (ctx, input) => {
    const { data } = input;
    const { subdomain } = ctx;
    const models = await generateModels(subdomain);
    const { contentType, currentDocument, userId } = data as any;

    if (contentType === 'sales:pos.orders' && currentDocument?._id) {
      await syncPosOrderToErkhet({
        subdomain,
        models,
        order: currentDocument,
        userId,
      });
    }
  },
};
