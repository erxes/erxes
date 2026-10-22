import { IModels, generateModels } from '~/connectionResolvers';
import { afterProcess } from '../afterProcess';
import { dealToTrs } from '../afterProcessHandlers/dealToTrs';
import { orderToTrs } from '../afterProcessHandlers/orderToTrs';

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

describe.each(['deal', 'order'] as const)(
  'after-process %s production opt-in',
  (source) => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.mocked(generateModels).mockResolvedValue({
        Configs: {
          getConfigValue: jest.fn().mockImplementation(async (code: string) => {
            if (code === 'syncDeal') return { stageId: 'stage' };
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
          collectionName: source === 'deal' ? 'deals' : 'orders',
          docId: source,
          userId: 'user',
          processId: 'process',
          contentType:
            source === 'deal' ? 'sales:sales.deals' : 'sales:pos.orders',
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
        const handler = source === 'deal' ? dealToTrs : orderToTrs;
        expect(handler).toHaveBeenCalledWith(
          expect.objectContaining({
            allowRealJobProduction: true,
            subdomain: 'tenant',
          }),
        );
      },
    );
  },
);
