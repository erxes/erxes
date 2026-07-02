import { AfterProcessConfigs, IAfterProcessRule } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { afterMutationHandlers as dealAfterEbarimt } from '~/modules/ebarimt/afterMutations';
import {
  afterMutationHandlers as dealAfterErkhet,
  hasErkhetStageConfig,
} from '~/modules/erkhet/afterMutations';
import { syncPosOrderToErkhet } from '~/modules/erkhet/afterMutPosOrder';
import { afterMutationHandlers as productPlacesAfterMutation } from '~/modules/productPlaces/afterMutations';
import { afterMutationHandlers as msdynamicAfterMutation } from '~/modules/msdynamic/afterMutation';

// Existing mutation name lists
const ebarimtMutationNames = ['dealsChange', 'dealsEdit', 'dealsAdd'];
const erkhetMutationNames = ['dealsChange', 'dealsEdit', 'dealsAdd'];
const productPlacesMutationNames = ['dealsChange', 'dealsEdit'];

// MSDynamic mutation names – using a Set for O(1) lookups
const msdynamicMutationNames = new Set([
  'dealsAdd',      // sales:deal create
  'dealsEdit',     // sales:deal update
  'dealsChange',   // sales:deal update (stage change)
  'customersAdd',  // core:customer create
  'companiesAdd',  // core:company create
  // 'posOrdersSync', // uncomment if you have a mutation that syncs pos orders
]);

const allRules: IAfterProcessRule[] = [
  {
    type: 'afterMutation',
    mutationNames: [
      ...new Set([
        ...ebarimtMutationNames,
        ...erkhetMutationNames,
        ...productPlacesMutationNames,
        ...Array.from(msdynamicMutationNames), // spread Set as array
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

    // ---- Ebarimt ----
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

    // ---- Erkhet ----
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
              : { _id: itemId, stageId: sourceStageId },
            updatedDocument: result,
            user: { _id: userId },
          });
        }
      } catch (error) {
        console.error('Erkhet afterMutation failed:', error);
      }
    }

    // ---- Product Places ----
    if (productPlacesMutationNames.includes(mutationName)) {
      try {
        await productPlacesAfterMutation(ctx.subdomain, {
          type: 'sales:deal',
          action: 'update',
          updatedDocument: result,
          object: { stageId: sourceStageId },
          user: userId,
        });
      } catch (error) {
        console.error('Product places afterMutation failed:', error);
      }
    }

    // ---- MSDynamic ----
    if (msdynamicMutationNames.has(mutationName)) {
      try {
        let type = '';
        let action = '';

        if (mutationName.startsWith('deals')) {
          type = 'sales:deal';
          action = mutationName === 'dealsAdd' ? 'create' : 'update';
        } else if (mutationName.startsWith('customers')) {
          type = 'core:customer';
          action = mutationName.endsWith('Add') ? 'create' : 'update';
        } else if (mutationName.startsWith('companies')) {
          type = 'core:company';
          action = mutationName.endsWith('Add') ? 'create' : 'update';
        } else if (mutationName.startsWith('posOrders')) {
          type = 'pos:order';
          action = 'synced';
        }

        if (type && action) {
          // For updates, pass the old object with sourceStageId
          let objectParam = result; // default for create
          if (
            action === 'update' &&
            (mutationName === 'dealsEdit' || mutationName === 'dealsChange')
          ) {
            objectParam = { _id: itemId, stageId: sourceStageId };
          }

          await msdynamicAfterMutation(ctx.subdomain, {
            type,
            action,
            user: { _id: userId },
            object: objectParam,
            updatedDocument: result,
          });
        }
      } catch (error) {
        console.error('MSDynamic afterMutation failed:', error);
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
