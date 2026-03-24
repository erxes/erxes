import { IModels } from '~/connectionResolvers';
import { ITransaction } from '../@types/transaction';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const commonRemove = async (
  subdomain: string,
  models: IModels,
  tr: ITransaction,
) => {
  const handler = getJournalHandler(tr.journal);
  if (!handler) throw new Error(`Unsupported journal: ${tr.journal}`);

  await handler(models, subdomain, tr);
};

function getJournalHandler(journal: string) {
  const handlers: Record<
    string,
    (models: IModels, subdomain: string, doc: ITransaction) => Promise<void>
  > = {
    main: handleNone,
    cash: handleNone,
    bank: handleNone,
    receivable: handleNone,
    payable: handleNone,
    invIncome: handleInvIncome,
    invOut: handleInvOut,
    invMove: handleInvMove,
    invSale: handleInvSale,
  };

  return handlers[journal];
}

async function handleNone(
  models: IModels,
  _subdomain: string,
  doc: ITransaction,
) {
  return;
}

async function handleInvIncome(
  _models: IModels,
  subdomain: string,
  tr: ITransaction,
) {
  sendTRPCMessage({
    subdomain,
    method: 'mutation',
    pluginName: 'core',
    module: 'products',
    action: 'increaseInventories',
    input: {
      branchId: tr?.branchId,
      departmentId: tr?.departmentId,
      productsInfo: tr?.details?.map((det) => ({
        productId: det.productId,
        diffCount: -1 * (det.count ?? 0),
      })),
    },
  });
}

async function handleInvOut(
  models: IModels,
  _subdomain: string,
  doc: ITransaction,
) {
  return;
}

async function handleInvMove(
  models: IModels,
  _subdomain: string,
  doc: ITransaction,
) {
  return;
}

async function handleInvSale(
  models: IModels,
  _subdomain: string,
  doc: ITransaction,
) {
  return;
}
