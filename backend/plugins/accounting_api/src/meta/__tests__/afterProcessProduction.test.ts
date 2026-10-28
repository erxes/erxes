import { IModels, generateModels } from '~/connectionResolvers';
import { afterProcess } from '../afterProcess';
import { dealToTrs } from '../afterProcessHandlers/dealToTrs';
import { orderToTrs } from '../afterProcessHandlers/orderToTrs';
import { dealToMovementTrs } from '../afterProcessHandlers/dealToMovementTrs';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

jest.mock('erxes-api-shared/utils', () => ({
  sendTRPCMessage: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('~/connectionResolvers', () => ({ generateModels: jest.fn() }));
jest.mock('../afterProcessHandlers/dealToTrs', () => ({
  dealToTrs: jest.fn(),
}));
jest.mock('../afterProcessHandlers/orderToTrs', () => ({
  orderToTrs: jest.fn(),
}));
jest.mock('../afterProcessHandlers/dealToReturnTrs', () => ({
  dealToReturnTrs: jest.fn(),
}));
jest.mock('../afterProcessHandlers/orderToReturnTrs', () => ({
  orderToReturnTrs: jest.fn(),
}));
jest.mock('../afterProcessHandlers/dealToMovementTrs', () => ({
  dealToMovementTrs: jest.fn(),
}));
jest.mock('../afterProcessHandlers/coreMerge', () => ({
  mergeMutationNames: [],
  handleCoreMergeMutation: jest.fn(),
}));

describe.each(['deal', 'order', 'movement'] as const)(
  'after-process %s sync',
  (source) => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.mocked(generateModels).mockResolvedValue({
        Configs: {
          getConfigValue: jest.fn().mockImplementation(async (code: string) => {
            if (
              code === (source === 'movement' ? 'syncDealMovement' : 'syncDeal')
            )
              return { stageId: 'stage', responseFieldId: 'response' };
            if (code === 'syncOrder') return { posId: 'pos' };
            return undefined;
          }),
        },
      } as unknown as IModels);
    });

    it.each(['created', 'updated'] as const)(
      'enables automatic real-job production for a %s event',
      async (event) => {
        const data = {
          collectionName: source === 'order' ? 'orders' : 'deals',
          docId: source,
          userId: 'user',
          processId: 'process',
          contentType:
            source === 'order' ? 'sales:pos.orders' : 'sales:sales.deals',
          currentDocument: {
            _id: source,
            stageId: 'stage',
            posId: 'pos',
            status: 'complete',
          },
        };
        if (event === 'created')
          afterProcess.afterDocumentCreated?.(
            { subdomain: 'tenant' },
            { data },
          );
        else
          afterProcess.afterDocumentUpdated?.(
            { subdomain: 'tenant' },
            {
              data: {
                ...data,
                updateDescription: {
                  added: {},
                  updated: { stageId: { prev: 'previous', current: 'stage' } },
                  removed: [],
                },
              },
            },
          );
        await new Promise<void>((resolve) => setImmediate(resolve));
        const handler =
          source === 'movement'
            ? dealToMovementTrs
            : source === 'deal'
            ? dealToTrs
            : orderToTrs;
        expect(handler).toHaveBeenCalledWith(
          expect.objectContaining({
            ...(source === 'movement' ? {} : { allowRealJobProduction: true }),
            subdomain: 'tenant',
          }),
        );
      },
    );

    it.each(['created', 'updated'] as const)(
      'persists handler errors without success for a %s event',
      async (event) => {
        const message = 'Accounting sync validation failed';
        const handler =
          source === 'movement'
            ? dealToMovementTrs
            : source === 'deal'
            ? dealToTrs
            : orderToTrs;
        jest.mocked(handler).mockRejectedValueOnce(new Error(message));
        const data = {
          collectionName: source === 'order' ? 'orders' : 'deals',
          docId: source,
          userId: 'user',
          processId: 'process',
          contentType:
            source === 'order' ? 'sales:pos.orders' : 'sales:sales.deals',
          currentDocument: {
            _id: source,
            stageId: 'stage',
            posId: 'pos',
            status: 'complete',
          },
        };
        if (event === 'created')
          afterProcess.afterDocumentCreated?.(
            { subdomain: 'tenant' },
            { data },
          );
        else
          afterProcess.afterDocumentUpdated?.(
            { subdomain: 'tenant' },
            {
              data: {
                ...data,
                updateDescription: {
                  added: {},
                  updated: { stageId: { prev: 'previous', current: 'stage' } },
                  removed: [],
                },
              },
            },
          );
        await new Promise<void>((resolve) => setImmediate(resolve));
        expect(sendTRPCMessage).toHaveBeenCalledTimes(1);
        expect(sendTRPCMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            subdomain: 'tenant',
            action: 'updateOne',
            module: source === 'order' ? 'orders' : 'deal',
            input: {
              selector: { _id: source },
              modifier:
                source === 'order'
                  ? { accountingResponse: message }
                  : { $set: { 'propertiesData.response': message } },
            },
          }),
        );
      },
    );
  },
);
