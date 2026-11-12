import { getFxaDeferredTaxTransactions } from './fxaDeferredTax';
import { getFxaSourceTaxDetail } from './fxaTaxValues';
import { getFxaRevaluationTransactions } from './fxaRevaluationTransactions';
import { FIXED_ASSET_DEPRECIATION_METHODS } from '@/fixedAssets/@types/constants';
import { IModels } from '~/connectionResolvers';
import {
  ACCOUNT_JOURNALS,
  JOURNALS,
  TR_INVENTORY_STATUS_TYPES,
  TR_FOLLOW_TYPES,
  TR_SIDES,
} from '../@types/constants';
import {
  ITransaction,
  ITransactionDocument,
  ITrDetail,
} from '../@types/transaction';
import { assertCorrectionDateOpen, readFxaCapitalRules } from './fxaRules';
import {
  fxaCapitalDate,
  getFxaCapitalValuation,
  TFxaCapitalValuation,
} from './fxaCapitalValuation';
import { assertCanWriteTransactionAccounts } from './trPermissions';
import { createOrUpdateTr } from './utils';
import { allocateFxaRevaluation } from './fxaRevaluationState';

const MONEY_EPSILON = 0.005;
const FOLLOW_TYPES = [
  TR_FOLLOW_TYPES.FXA_DEP_IN,
  TR_FOLLOW_TYPES.FXA_DEP_OUT,
  TR_FOLLOW_TYPES.FXA_DEFERRED_TAX,
  TR_FOLLOW_TYPES.FXA_REVALUATION_RESULT,
];

const roundMoney = (amount: number): number =>
  Math.round((amount + Number.EPSILON) * 10000) / 10000;

const buildFxaCapitalAssetDocuments = (
  doc: ITransaction,
  valuation: TFxaCapitalValuation,
): { main: ITransaction; follows: ITransaction[] } => {
  const input = doc.details[0];
  const info = input.followInfos || {};
  const revaluation = doc.journal === JOURNALS.FXA_REVALUATION;
  const rules = readFxaCapitalRules(info);
  if (revaluation) {
    for (const field of [
      'depreciationMethod',
      'annualDepreciationRate',
      'salvageValue',
      'taxDepreciationMethod',
      'taxAnnualDepreciationRate',
      'taxSalvageValue',
      'incomeTaxRate',
    ] as const) {
      if (
        doc.details.some(
          (detail) =>
            detail.followInfos?.[field] !== undefined &&
            detail.followInfos[field] !== valuation[field],
        )
      )
        throw new Error(
          'Change depreciation rules and income tax rate through capitalization/correction.',
        );
      Object.assign(rules, { [field]: valuation[field] });
    }
    if (
      doc.details.some(
        (detail) =>
          detail.followInfos?.depreciationStartDate &&
          new Date(detail.followInfos.depreciationStartDate).getTime() !==
            new Date(valuation.depreciationStartDate).getTime(),
      )
    )
      throw new Error(
        'Change depreciation start date through capitalization/correction.',
      );
    rules.depreciationStartDate = valuation.depreciationStartDate;
  }
  if (rules.originalCost === undefined || !rules.annualDepreciationRate) {
    throw new Error('Enter new unit cost and remaining useful life.');
  }
  const enteredDepreciation = doc.details.filter(
    (detail) => detail.followInfos?.preDeprecation !== undefined,
  );
  const totalDepreciation = enteredDepreciation.length
    ? enteredDepreciation.reduce(
        (sum, detail) => sum + (detail.followInfos?.preDeprecation ?? 0),
        0,
      )
    : valuation.preDeprecation;
  if (
    enteredDepreciation.some(
      (detail) =>
        !Number.isFinite(detail.followInfos?.preDeprecation) ||
        (detail.followInfos?.preDeprecation ?? 0) < 0,
    )
  )
    throw new Error(
      'Total accumulated depreciation must be a nonnegative finite amount.',
    );
  const targetDepreciation = totalDepreciation / valuation.count;
  let allocatedDepreciation = 0;
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
  const taxEnabled = valuation.hasTaxDepreciation;
  const enteredTax = doc.details.filter(
    (detail) => detail.followInfos?.taxPreDeprecation !== undefined,
  );
  const revaluationTaxDepreciation =
    valuation.taxPreDeprecation + totalDepreciation - valuation.preDeprecation;
  const totalTaxDepreciation = revaluation
    ? revaluationTaxDepreciation
    : taxEnabled
    ? enteredTax.length
      ? enteredTax.reduce(
          (sum, detail) => sum + (detail.followInfos?.taxPreDeprecation ?? 0),
          0,
        )
      : valuation.taxPreDeprecation
    : totalDepreciation;
  if (
    revaluation &&
    enteredTax.length &&
    Math.abs(
      enteredTax.reduce(
        (sum, detail) => sum + (detail.followInfos?.taxPreDeprecation ?? 0),
        0,
      ) - revaluationTaxDepreciation,
    ) > 0.0001
  )
    throw new Error(
      'Revaluation must preserve the book/tax accumulated depreciation difference. Use capitalization/correction.',
    );
  const incomeTaxRate = rules.incomeTaxRate ?? valuation.incomeTaxRate;
  if (taxEnabled) {
    const taxMethod =
      rules.taxDepreciationMethod ?? valuation.taxDepreciationMethod;
    const taxRate =
      rules.taxAnnualDepreciationRate ?? valuation.taxAnnualDepreciationRate;
    if (
      !Number.isFinite(taxRate) ||
      taxRate <= 0 ||
      taxRate > 100 ||
      !FIXED_ASSET_DEPRECIATION_METHODS.ALL.includes(taxMethod) ||
      taxMethod === FIXED_ASSET_DEPRECIATION_METHODS.MANUAL
    )
      throw new Error('Valid automatic tax depreciation rules are required.');
    const taxResidual = rules.taxSalvageValue ?? valuation.taxSalvageValue;
    if (
      enteredTax.some(
        (detail) =>
          !Number.isFinite(detail.followInfos?.taxPreDeprecation) ||
          (detail.followInfos?.taxPreDeprecation ?? 0) < 0,
      ) ||
      !Number.isFinite(totalTaxDepreciation) ||
      totalTaxDepreciation < 0 ||
      totalTaxDepreciation / valuation.count + taxResidual >
        rules.originalCost + MONEY_EPSILON
    ) {
      throw new Error(
        'Tax accumulated depreciation and residual value cannot exceed the shared asset cost.',
      );
    }
    if (
      incomeTaxRate === undefined ||
      !Number.isFinite(incomeTaxRate) ||
      incomeTaxRate < 0 ||
      incomeTaxRate > 100
    ) {
      throw new Error('Enter an income tax rate for the fixed asset change.');
    }
  }
  let allocatedTaxDepreciation = 0;
  const targetCost = rules.originalCost;
  const costDelta = targetCost - valuation.originalCost;
  const depreciationDelta =
    targetDepreciation - valuation.preDeprecation / valuation.count;
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
      const locationDepreciation = roundMoney(
        index === valuation.locations.length - 1
          ? totalDepreciation - allocatedDepreciation
          : targetDepreciation * location.count,
      );
      allocatedDepreciation += locationDepreciation;
      const locationTaxDepreciation = roundMoney(
        index === valuation.locations.length - 1
          ? totalTaxDepreciation - allocatedTaxDepreciation
          : (totalTaxDepreciation * location.count) / valuation.count,
      );
      allocatedTaxDepreciation += locationTaxDepreciation;
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
          depreciationStartDate: rules.depreciationStartDate || date,
          depreciationBase: Math.max(
            targetCost - targetDepreciation - salvageValue,
            0,
          ),
          preDeprecation: locationDepreciation,
          taxPreDeprecation: locationTaxDepreciation,
          incomeTaxRate,
          ...(revaluation
            ? {
                ...allocateFxaRevaluation(
                  (costDelta - depreciationDelta) * location.count,
                  ((valuation.revaluationLoss || 0) * location.count) /
                    valuation.count,
                  ((valuation.revaluationReserve || 0) * location.count) /
                    valuation.count,
                ),
              }
            : {}),
        },
      };
    },
  );
  const main: ITransaction = {
    ...doc,
    date,
    side,
    followInfos: undefined,
    details: locationDetails,
  };
  const decreasesDepreciation = depreciationDelta < 0;
  const details = valuation.locations
    .map(
      (location): ITrDetail => ({
        fixedAssetId: valuation.fixedAssetId,
        accountId: valuation.depreciationAccountId,
        branchId: location.branchId,
        departmentId: location.departmentId,
        count: 0,
        amount: roundMoney(Math.abs(depreciationDelta) * location.count),
      }),
    )
    .filter((detail) => detail.amount > MONEY_EPSILON);
  const follows: ITransaction[] = details.length
    ? [
        {
          date,
          journal: decreasesDepreciation
            ? JOURNALS.FXA_DEP_OUT
            : JOURNALS.FXA_DEP_IN,
          originType: decreasesDepreciation
            ? TR_FOLLOW_TYPES.FXA_DEP_OUT
            : TR_FOLLOW_TYPES.FXA_DEP_IN,
          originId: doc._id,
          ptrId: doc.ptrId,
          parentId: doc.parentId,
          number: doc.number,
          status: doc.status,
          description: doc.description,
          customerType: doc.customerType,
          customerId: doc.customerId,
          side: decreasesDepreciation ? TR_SIDES.DEBIT : TR_SIDES.CREDIT,
          details,
        },
      ]
    : [];
  return { main, follows };
};

export const buildFxaCapitalDocuments = (
  doc: ITransaction,
  valuationInput: TFxaCapitalValuation | TFxaCapitalValuation[],
): { main: ITransaction; follows: ITransaction[] } => {
  const valuations = Array.isArray(valuationInput)
    ? valuationInput
    : [valuationInput];
  if (!doc.details.length || doc.details.some((detail) => !detail.fixedAssetId))
    throw new Error('Select acquired fixed assets to capitalize.');
  const groups = new Map<string, ITrDetail[]>();
  for (const detail of doc.details) {
    const id = detail.fixedAssetId || '';
    const group = groups.get(id);
    if (group) group.push(detail);
    else groups.set(id, [detail]);
  }
  const results = [...groups].map(([fixedAssetId, details]) => {
    const valuation = valuations.find(
      (item) => item.fixedAssetId === fixedAssetId,
    );
    if (!valuation) throw new Error('Fixed asset valuation is missing.');
    return buildFxaCapitalAssetDocuments({ ...doc, details }, valuation);
  });
  const sides = new Set(
    results
      .filter((result) =>
        result.main.details.some((detail) => detail.amount > MONEY_EPSILON),
      )
      .map((result) => result.main.side),
  );
  if (sides.size > 1)
    throw new Error(
      'Separate cost increases and decreases into different capitalization journals.',
    );
  const follows = new Map<string, ITransaction>();
  for (const result of results)
    for (const follow of result.follows) {
      const previous = follows.get(follow.originType || '');
      if (previous) previous.details.push(...follow.details);
      else follows.set(follow.originType || '', follow);
    }
  return {
    main: {
      ...results[0].main,
      side: [...sides][0] || TR_SIDES.DEBIT,
      details: results.flatMap((result) => result.main.details),
    },
    follows: [...follows.values()],
  };
};

const findLaterCapitalDependency = (
  models: IModels,
  transactionId: string | undefined,
  date: Date,
  fixedAssetIds: (string | undefined)[],
) =>
  models.Transactions.findOne({
    _id: { $ne: transactionId },
    journal: {
      $in: [
        JOURNALS.FXA_CAPITAL,
        JOURNALS.FXA_REVALUATION,
        JOURNALS.FXA_OUT,
        JOURNALS.FXA_MOVE,
        JOURNALS.FXA_SALE,
      ],
    },
    status: { $in: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
    'details.fixedAssetId': {
      $in: [...new Set(fixedAssetIds.filter(Boolean))],
    },
    date: { $gte: fxaCapitalDate(date) },
  }).lean();

const prepareCapital = async (
  models: IModels,
  doc: ITransaction,
  oldTr?: ITransactionDocument,
) => {
  await assertCorrectionDateOpen(models, doc.date);
  if (oldTr) await assertCorrectionDateOpen(models, oldTr.date);
  const fixedAssetIds = [
    ...new Set(doc.details.map((detail) => detail.fixedAssetId)),
  ];
  if (!fixedAssetIds.length || fixedAssetIds.some((id) => !id))
    throw new Error('Select acquired fixed assets to capitalize.');
  const valuations = await Promise.all(
    fixedAssetIds.map((fixedAssetId) =>
      getFxaCapitalValuation(models, fixedAssetId || '', doc.date, oldTr?._id),
    ),
  );
  if (valuations.some((valuation) => valuation.count <= 0))
    throw new Error('This asset has no remaining quantity to capitalize.');
  if (valuations.some((valuation) => !valuation.ready))
    throw new Error(
      'Calculate and post depreciation through the day before capitalization first.',
    );
  const affectedIds = [
    ...new Set([
      ...fixedAssetIds,
      ...(oldTr?.details || []).map((detail) => detail.fixedAssetId),
    ]),
  ].filter(Boolean);
  const later = await findLaterCapitalDependency(
    models,
    oldTr?._id || doc._id,
    oldTr && oldTr.date < doc.date ? oldTr.date : doc.date,
    affectedIds,
  );
  if (later)
    throw new Error(
      'Remove later asset changes before editing or inserting this capitalization.',
    );
  const documents = buildFxaCapitalDocuments(doc, valuations);
  const isRevaluation = doc.journal === JOURNALS.FXA_REVALUATION;
  if (isRevaluation)
    documents.follows.push(
      ...(await getFxaRevaluationTransactions(models, documents.main)),
    );
  const taxValuations = new Map(
    valuations
      .filter((row) => row.hasTaxDepreciation)
      .map((row) => [row.fixedAssetId, row]),
  );
  const taxDetails = documents.main.details.flatMap((detail) => {
    const valuation = taxValuations.get(detail.fixedAssetId || '');
    if (!valuation) return [];
    return [getFxaSourceTaxDetail(detail)];
  });
  if (!isRevaluation && taxDetails.length)
    documents.follows.push(
      ...(await getFxaDeferredTaxTransactions(
        models,
        { ...documents.main, _id: oldTr?._id || doc._id || '' },
        taxDetails,
        { sourceTransaction: true },
      )),
    );
  const accountIds = [
    ...new Set(
      valuations.flatMap((valuation) => [
        valuation.accountId,
        valuation.depreciationAccountId,
      ]),
    ),
  ];
  const accounts = await models.Accounts.find({
    _id: { $in: accountIds },
    status: 'active',
    isTemp: { $ne: true },
  }).lean();
  if (accounts.length !== accountIds.length)
    throw new Error('Use active posting accounts for capitalization.');
  for (const valuation of valuations) {
    const assetAccount = accounts.find(
      (account) => account._id === valuation.accountId,
    );
    const depAccount = accounts.find(
      (account) => account._id === valuation.depreciationAccountId,
    );
    if (
      assetAccount?.journal !== ACCOUNT_JOURNALS.FIXED_ASSET ||
      ![ACCOUNT_JOURNALS.FXA_FOLLOW, ACCOUNT_JOURNALS.FIXED_ASSET].includes(
        depAccount?.journal || '',
      )
    ) {
      throw new Error(
        'Use fixed asset and accumulated depreciation journal accounts.',
      );
    }
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
  const later = await findLaterCapitalDependency(
    models,
    transaction._id,
    transaction.date,
    transaction.details.map((detail) => detail.fixedAssetId),
  );
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
  // These writes share one workflow; keep their existing posting order.
  await documents.follows.reduce(async (previousSave, follow) => {
    await previousSave;
    const previous = existing.find(
      (row) => row.originType === follow.originType && row.side === follow.side,
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
              old.fixedAssetId === detail.fixedAssetId &&
              old.accountId === detail.accountId &&
              (old.branchId || '') === (detail.branchId || '') &&
              (old.departmentId || '') === (detail.departmentId || ''),
          )?._id,
        })),
      },
      previous,
    );
    otherTrs.push(saved);
  }, Promise.resolve());
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
