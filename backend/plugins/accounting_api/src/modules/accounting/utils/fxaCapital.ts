import { IModels } from '~/connectionResolvers';
import {
  ACCOUNT_JOURNALS,
  JOURNALS,
  TR_INVENTORY_STATUS_TYPES,
  TR_SIDES,
} from '../@types/constants';
import {
  ITransaction,
  ITransactionDocument,
  ITrDetail,
} from '../@types/transaction';
import { assertCorrectionDateOpen, readFxaCapitalRules } from './fxaJustify';
import {
  fxaCapitalDate,
  getFxaCapitalValuation,
  TFxaCapitalValuation,
} from './fxaCapitalValuation';
import { assertCanWriteTransactionAccounts } from './trPermissions';
import { createOrUpdateTr } from './utils';

const MONEY_EPSILON = 0.005;
const FOLLOW_TYPES = [
  'fxaCapitalDepIn',
  'fxaCapitalDepOut',
  'fxaCapitalBalanceDt',
  'fxaCapitalBalanceCt',
];

const getCapitalAccountId = (doc: ITransaction): string => {
  const info: unknown = doc.followInfos;
  if (
    !info ||
    typeof info !== 'object' ||
    !('capitalAccountId' in info) ||
    typeof info.capitalAccountId !== 'string' ||
    !info.capitalAccountId
  ) {
    throw new Error(
      'Select the capitalization/revaluation counterpart account.',
    );
  }
  return info.capitalAccountId;
};

const roundMoney = (amount: number): number =>
  Math.round((amount + Number.EPSILON) * 10000) / 10000;

export const buildFxaCapitalDocuments = (
  doc: ITransaction,
  valuation: TFxaCapitalValuation,
): { main: ITransaction; follows: ITransaction[] } => {
  const input = doc.details[0];
  const info = input.followInfos || {};
  const rules = readFxaCapitalRules(info);
  if (
    !rules.originalCost ||
    !rules.annualDepreciationRate ||
    !['improvement', 'revaluation'].includes(String(info.capitalizationType))
  ) {
    throw new Error(
      'Enter capitalization type, new unit cost and useful life.',
    );
  }
  const targetDepreciation = info.preDeprecation ?? valuation.preDeprecation;
  const salvageValue = rules.salvageValue ?? valuation.salvageValue;
  if (
    !Number.isFinite(targetDepreciation) ||
    targetDepreciation < 0 ||
    targetDepreciation + salvageValue > rules.originalCost + MONEY_EPSILON
  ) {
    throw new Error(
      'Accumulated depreciation and residual value cannot exceed the new unit cost.',
    );
  }
  const targetCost = rules.originalCost;
  const costDelta = targetCost - valuation.originalCost;
  const depreciationDelta = targetDepreciation - valuation.preDeprecation;
  const offsetAccountId = getCapitalAccountId(doc);
  const side = costDelta < 0 ? TR_SIDES.CREDIT : TR_SIDES.DEBIT;
  const date = fxaCapitalDate(doc.date);
  const usedDetailIds = new Set<string>();
  const locationDetails = valuation.locations.map(
    (location, index): ITrDetail => {
      const previous = doc.details.find(
        (detail) =>
          (detail.branchId || '') === location.branchId &&
          (detail.departmentId || '') === location.departmentId,
      );
      const candidateId =
        previous?._id || (index === 0 ? input._id : undefined);
      const detailId =
        candidateId && !usedDetailIds.has(candidateId)
          ? candidateId
          : undefined;
      if (detailId) usedDetailIds.add(detailId);
      return {
        _id: detailId,
        fixedAssetId: valuation.fixedAssetId,
        accountId: valuation.accountId,
        branchId: location.branchId,
        departmentId: location.departmentId,
        count: 0,
        unitPrice: 0,
        amount: roundMoney(Math.abs(costDelta) * location.count),
        followInfos: {
          ...rules,
          depreciationMethod:
            rules.depreciationMethod || valuation.depreciationMethod,
          salvageValue,
          depreciationStartDate: date,
          depreciationBase: Math.max(
            targetCost - targetDepreciation - salvageValue,
            0,
          ),
          preDeprecation: targetDepreciation,
          capitalizationType: info.capitalizationType,
          previousDepreciationRules: {
            originalCost: valuation.originalCost,
            preDeprecation: valuation.preDeprecation,
            annualDepreciationRate: valuation.annualDepreciationRate,
            depreciationMethod: valuation.depreciationMethod,
            salvageValue: valuation.salvageValue,
          },
        },
      };
    },
  );
  const main: ITransaction = { ...doc, date, side, details: locationDetails };
  const follows: ITransaction[] = [];
  const appendFollow = (
    journal: string,
    originType: string,
    followSide: string,
    accountId: string,
    delta: number,
  ) => {
    const details = valuation.locations
      .map(
        (location): ITrDetail => ({
          fixedAssetId: valuation.fixedAssetId,
          accountId,
          branchId: location.branchId,
          departmentId: location.departmentId,
          count: 0,
          amount: roundMoney(Math.abs(delta) * location.count),
        }),
      )
      .filter((detail) => detail.amount > MONEY_EPSILON);
    if (details.length)
      follows.push({
        date,
        journal,
        originType,
        originId: doc._id,
        ptrId: doc.ptrId,
        parentId: doc.parentId,
        number: doc.number,
        status: doc.status,
        description: doc.description,
        customerType: doc.customerType,
        customerId: doc.customerId,
        side: followSide,
        details,
      });
  };
  appendFollow(
    depreciationDelta < 0 ? JOURNALS.FXA_DEP_OUT : JOURNALS.FXA_DEP_IN,
    depreciationDelta < 0 ? 'fxaCapitalDepOut' : 'fxaCapitalDepIn',
    depreciationDelta < 0 ? TR_SIDES.DEBIT : TR_SIDES.CREDIT,
    valuation.depreciationAccountId,
    depreciationDelta,
  );
  const netDelta = costDelta - depreciationDelta;
  appendFollow(
    JOURNALS.FXA_CAPITAL_BALANCE,
    netDelta < 0 ? 'fxaCapitalBalanceDt' : 'fxaCapitalBalanceCt',
    netDelta < 0 ? TR_SIDES.DEBIT : TR_SIDES.CREDIT,
    offsetAccountId,
    netDelta,
  );
  return { main, follows };
};

const prepareCapital = async (
  models: IModels,
  doc: ITransaction,
  oldTr?: ITransactionDocument,
) => {
  await assertCorrectionDateOpen(models, doc.date);
  if (oldTr) await assertCorrectionDateOpen(models, oldTr.date);
  const fixedAssetId = doc.details[0]?.fixedAssetId;
  if (
    !fixedAssetId ||
    doc.details.some((detail) => detail.fixedAssetId !== fixedAssetId)
  ) {
    throw new Error(
      'A capitalization journal must refer to one fixed asset. Add another journal for a different asset.',
    );
  }
  const valuation = await getFxaCapitalValuation(
    models,
    fixedAssetId,
    doc.date,
    oldTr?._id,
  );
  if (valuation.count <= 0)
    throw new Error('This asset has no remaining quantity to capitalize.');
  if (!valuation.ready)
    throw new Error(
      'Calculate and post depreciation through the day before capitalization first.',
    );
  const later = await models.Transactions.findOne({
    _id: { $ne: oldTr?._id || doc._id },
    journal: {
      $in: [
        JOURNALS.FXA_CAPITAL,
        JOURNALS.FXA_JUSTIFY,
        JOURNALS.FXA_OUT,
        JOURNALS.FXA_MOVE,
        JOURNALS.FXA_SALE,
      ],
    },
    status: { $in: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
    'details.fixedAssetId': fixedAssetId,
    date: {
      $gte: fxaCapitalDate(
        oldTr && oldTr.date < doc.date ? oldTr.date : doc.date,
      ),
    },
  }).lean();
  if (later)
    throw new Error(
      'Remove later asset changes before editing or inserting this capitalization.',
    );
  const documents = buildFxaCapitalDocuments(doc, valuation);
  const accountIds = [
    ...new Set([
      valuation.accountId,
      valuation.depreciationAccountId,
      getCapitalAccountId(doc),
    ]),
  ];
  const accounts = await models.Accounts.find({
    _id: { $in: accountIds },
    status: 'active',
    isTemp: { $ne: true },
  }).lean();
  if (accounts.length !== accountIds.length)
    throw new Error('Use active posting accounts for capitalization.');
  const assetAccount = accounts.find(
    (account) => account._id === valuation.accountId,
  );
  const depAccount = accounts.find(
    (account) => account._id === valuation.depreciationAccountId,
  );
  const offsetAccount = accounts.find(
    (account) => account._id === getCapitalAccountId(doc),
  );
  if (
    assetAccount?.journal !== ACCOUNT_JOURNALS.FIXED_ASSET ||
    depAccount?.journal !== ACCOUNT_JOURNALS.FXA_FOLLOW ||
    offsetAccount?.journal !== ACCOUNT_JOURNALS.MAIN
  ) {
    throw new Error(
      'Use fixed asset, accumulated depreciation and main counterpart journal accounts.',
    );
  }
  if (new Set(accounts.map((account) => account.currency || '')).size > 1) {
    throw new Error('Capitalization accounts must use the same currency.');
  }
  return documents;
};

export const validateFxaCapitalSave = async (
  _subdomain: string,
  models: IModels,
  userId: string,
  doc: ITransaction,
  oldTr?: ITransactionDocument,
): Promise<void> => {
  const documents = await prepareCapital(models, doc, oldTr);
  await assertCanWriteTransactionAccounts({
    models,
    userId,
    docs: [documents.main, ...documents.follows],
  });
};

export const validateFxaCapitalRemove = async (
  models: IModels,
  _subdomain: string,
  transaction: ITransactionDocument,
): Promise<void> => {
  await assertCorrectionDateOpen(models, transaction.date);
  const later = await models.Transactions.findOne({
    _id: { $ne: transaction._id },
    journal: {
      $in: [
        JOURNALS.FXA_CAPITAL,
        JOURNALS.FXA_JUSTIFY,
        JOURNALS.FXA_OUT,
        JOURNALS.FXA_MOVE,
        JOURNALS.FXA_SALE,
      ],
    },
    status: { $in: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
    'details.fixedAssetId': transaction.details[0]?.fixedAssetId,
    date: { $gte: fxaCapitalDate(transaction.date) },
  }).lean();
  if (later)
    throw new Error(
      'Remove later asset changes before deleting this capitalization.',
    );
};

export const saveFxaCapital = async (
  _subdomain: string,
  models: IModels,
  userId: string,
  doc: ITransaction,
  oldTr?: ITransactionDocument,
): Promise<{
  mainTr: ITransactionDocument;
  otherTrs: ITransactionDocument[];
}> => {
  const documents = await prepareCapital(models, doc, oldTr);
  const existing = oldTr
    ? await models.Transactions.find({
        originId: oldTr._id,
        originType: { $in: FOLLOW_TYPES },
      }).lean()
    : [];
  await assertCanWriteTransactionAccounts({
    models,
    userId,
    docs: [documents.main, ...documents.follows],
    oldTrs: existing,
  });
  const mainTr = await createOrUpdateTr(models, userId, documents.main, oldTr);
  const otherTrs: ITransactionDocument[] = [];
  for (const follow of documents.follows) {
    const previous = existing.find(
      (row) => row.originType === follow.originType,
    );
    const saved = await createOrUpdateTr(
      models,
      userId,
      {
        ...follow,
        originId: mainTr._id,
        parentId: mainTr.parentId,
        ptrId: mainTr.ptrId,
        details: follow.details.map((detail) => ({
          ...detail,
          _id: previous?.details.find(
            (old) =>
              (old.branchId || '') === (detail.branchId || '') &&
              (old.departmentId || '') === (detail.departmentId || ''),
          )?._id,
        })),
      },
      previous,
    );
    otherTrs.push(saved);
  }
  const keepIds = new Set(otherTrs.map((row) => row._id));
  const removeIds = existing
    .filter((row) => !keepIds.has(row._id))
    .map((row) => row._id);
  if (removeIds.length)
    await models.Transactions.deleteMany({ _id: { $in: removeIds } });
  return { mainTr, otherTrs };
};

export const removeFxaCapital = async (
  models: IModels,
  _subdomain: string,
  transaction: ITransactionDocument,
): Promise<void> => {
  await models.Transactions.deleteMany({
    originId: transaction._id,
    originType: { $in: FOLLOW_TYPES },
  });
};
