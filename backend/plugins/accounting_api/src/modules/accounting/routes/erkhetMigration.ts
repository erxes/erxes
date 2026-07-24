import { Request, Response } from 'express';
import { getSubdomain, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels, generateModels } from '~/connectionResolvers';
import { ITransaction, ITrDetail } from '../@types/transaction';

const ERKHET_CONTENT_TYPE = 'erkhet:ptr';

type ErkhetTransactionBatch = {
  externalPtrId: string;
  trDocs: ITransaction[];
};

type ErkhetTransactionsRequest = {
  userId?: string;
  dryRun?: boolean;
  skipAccountPermission?: boolean;
  batches?: ErkhetTransactionBatch[];
};

type TCodeMap = Record<string, string>;

type TReferenceMaps = {
  accountsByCode: TCodeMap;
  branchesByCode: TCodeMap;
  departmentsByCode: TCodeMap;
  customersByCode: TCodeMap;
  productsByCode: TCodeMap;
  fixedAssetsByCode: TCodeMap;
  fxaInstanceIdsByCode: Record<string, string[]>;
  fxaInstanceIdsByAssetAndCode: Record<string, Record<string, string[]>>;
  fxaInstanceIdsById: TCodeMap;
};

type TFxaInstanceMigrationInput = {
  _id?: string;
  tempId?: string;
  transactionDetailId?: string;
  fixedAssetId?: string;
  code?: string;
  sequence?: number;
  branchId?: string;
  departmentId?: string;
  responsibleUserId?: string;
  locationId?: string;
  originalCost?: number;
  depreciationStartDate?: Date;
  openingAccumulatedDepreciation?: number;
};

type TErkhetContact = {
  type?: string;
  code?: string;
  name?: string;
  phone?: string;
  email?: string;
};

type TContactResolution = {
  type?: string;
  _id?: string;
};

type TMigrationSuccessRow = {
  externalPtrId: string;
  action: string;
  parentId?: string;
  ptrId?: string;
  count: number;
};

type TMigrationErrorRow = {
  externalPtrId?: string;
  error: string;
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const getMigrationToken = (req: Request) =>
  req.headers['x-erkhet-migration-token'] || req.headers['x-migration-token'];

const assertMigrationToken = (req: Request) => {
  const expectedToken = process.env.ERKHET_MIGRATION_TOKEN;

  if (!expectedToken) {
    throw new Error('Erkhet migration endpoint is disabled');
  }

  if (getMigrationToken(req) !== expectedToken) {
    const error = new Error('Unauthorized');
    (error as Error & { statusCode?: number }).statusCode = 401;
    throw error;
  }
};

const validateBatch = (batch: ErkhetTransactionBatch) => {
  if (!batch?.externalPtrId) {
    throw new Error('externalPtrId is required');
  }

  if (!Array.isArray(batch.trDocs) || !batch.trDocs.length) {
    throw new Error('trDocs is required');
  }

  for (const doc of batch.trDocs) {
    if (!doc.date) {
      throw new Error('Transaction date is required');
    }

    if (!doc.journal) {
      throw new Error('Transaction journal is required');
    }

    if (!Array.isArray(doc.details) || !doc.details.length) {
      throw new Error('Transaction details are required');
    }
  }
};

const uniq = (values: string[]) => [...new Set(values.filter(Boolean))];

const getCodeMap = (docs: ITransaction[]) => {
  const accountCodes: string[] = [];
  const branchCodes: string[] = [];
  const departmentCodes: string[] = [];
  const customerCodes: string[] = [];
  const productCodes: string[] = [];
  const fixedAssetCodes: string[] = [];
  const fixedAssetIds: string[] = [];
  const fxaInstanceRefs: string[] = [];

  for (const doc of docs) {
    if (doc.branchId) {
      branchCodes.push(doc.branchId);
    }
    if (doc.departmentId) {
      departmentCodes.push(doc.departmentId);
    }
    if (doc.customerId) {
      customerCodes.push(doc.customerId);
    }

    const moveInBranchId = doc.followInfos?.moveInBranchId;
    const moveInDepartmentId = doc.followInfos?.moveInDepartmentId;
    const accumulatedDepreciationAccountId =
      doc.followInfos?.accumulatedDepreciationAccountId;
    const lossAccountId = doc.followInfos?.lossAccountId;

    if (moveInBranchId) {
      branchCodes.push(moveInBranchId);
    }
    if (moveInDepartmentId) {
      departmentCodes.push(moveInDepartmentId);
    }
    if (accumulatedDepreciationAccountId) {
      accountCodes.push(accumulatedDepreciationAccountId);
    }
    if (lossAccountId) {
      accountCodes.push(lossAccountId);
    }

    const fxaInstances =
      (doc.extraData?.fxaInstances as TFxaInstanceMigrationInput[]) || [];
    for (const instance of fxaInstances) {
      if (instance.fixedAssetId) {
        fixedAssetCodes.push(instance.fixedAssetId);
      }
      if (instance.branchId) {
        branchCodes.push(instance.branchId);
      }
      if (instance.departmentId) {
        departmentCodes.push(instance.departmentId);
      }
    }

    for (const instanceRef of doc.extraData?.fxaInstanceIds || []) {
      fxaInstanceRefs.push(instanceRef);
    }

    for (const detail of doc.details || []) {
      if (detail.accountId) {
        accountCodes.push(detail.accountId);
      }
      if (detail.fixedAssetId) {
        fixedAssetCodes.push(detail.fixedAssetId);
        fixedAssetIds.push(detail.fixedAssetId);
      }
      if (detail.branchId) {
        branchCodes.push(detail.branchId);
      }
      if (detail.departmentId) {
        departmentCodes.push(detail.departmentId);
      }
      if (detail.productId) {
        productCodes.push(detail.productId);
      }
    }
  }

  return {
    accountCodes: uniq(accountCodes),
    branchCodes: uniq(branchCodes),
    departmentCodes: uniq(departmentCodes),
    customerCodes: uniq(customerCodes),
    productCodes: uniq(productCodes),
    fixedAssetCodes: uniq(fixedAssetCodes),
    fixedAssetIds: uniq(fixedAssetIds),
    fxaInstanceRefs: uniq(fxaInstanceRefs),
  };
};

const indexByCode = <T extends { _id: string; code?: string }>(
  items: T[] = [],
) =>
  items.reduce<TCodeMap>((byCode, item) => {
    if (item?.code) {
      byCode[item.code] = item._id;
    }
    return byCode;
  }, {});

const fetchReferenceMaps = async (
  subdomain: string,
  models: IModels,
  docs: ITransaction[],
) => {
  const {
    accountCodes,
    branchCodes,
    departmentCodes,
    customerCodes,
    productCodes,
    fixedAssetCodes,
    fixedAssetIds,
    fxaInstanceRefs,
  } = getCodeMap(docs);

  const accounts = accountCodes.length
    ? await models.Accounts.find(
        { code: { $in: accountCodes } },
        { _id: 1, code: 1 },
      ).lean()
    : [];

  const departments = departmentCodes.length
    ? await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'departments',
        action: 'find',
        defaultValue: [],
        input: {
          query: { code: { $in: departmentCodes } },
          fields: { _id: 1, code: 1 },
        },
      })
    : [];

  const branches = branchCodes.length
    ? await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'branches',
        action: 'find',
        defaultValue: [],
        input: {
          query: { code: { $in: branchCodes } },
          fields: { _id: 1, code: 1 },
        },
      })
    : [];

  const customers = customerCodes.length
    ? await sendTRPCMessage({
        subdomain,
        method: 'query',
        pluginName: 'core',
        module: 'customers',
        action: 'findActiveCustomers',
        input: {
          query: { code: { $in: customerCodes } },
          fields: { _id: 1, code: 1 },
        },
        defaultValue: [],
      })
    : [];

  const products = productCodes.length
    ? await sendTRPCMessage({
        subdomain,
        method: 'query',
        pluginName: 'core',
        module: 'products',
        action: 'find',
        input: {
          query: { code: { $in: productCodes } },
          fields: { _id: 1, code: 1 },
        },
        defaultValue: [],
      })
    : [];

  const fixedAssets = fixedAssetCodes.length
    ? await models.FixedAssets.find(
        { code: { $in: fixedAssetCodes } },
        { _id: 1, code: 1 },
      ).lean()
    : [];
  const fixedAssetsByCode = indexByCode(fixedAssets);
  const fxaInstanceFixedAssetIds = [
    ...fixedAssetIds,
    ...fixedAssetCodes
      .map((code) => fixedAssetsByCode[code])
      .filter((fixedAssetId): fixedAssetId is string => !!fixedAssetId),
  ];

  const fxaInstances = fxaInstanceRefs.length
    ? await models.FxaInstances.find(
        {
          $and: [
            {
              $or: [
                { _id: { $in: fxaInstanceRefs } },
                { code: { $in: fxaInstanceRefs } },
              ],
            },
            fxaInstanceFixedAssetIds.length
              ? { fixedAssetId: { $in: uniq(fxaInstanceFixedAssetIds) } }
              : {},
          ],
        },
        { _id: 1, code: 1, fixedAssetId: 1 },
      )
        .sort({ acquisitionDate: 1, createdAt: 1, _id: 1 })
        .lean()
    : [];

  const fxaInstanceIdsByCode = fxaInstances.reduce<Record<string, string[]>>(
    (byCode, instance) => {
      if (!instance.code) {
        return byCode;
      }

      byCode[instance.code] = [...(byCode[instance.code] || []), instance._id];
      return byCode;
    },
    {},
  );
  const fxaInstanceIdsByAssetAndCode = fxaInstances.reduce<
    Record<string, Record<string, string[]>>
  >((byAssetAndCode, instance) => {
    if (!instance.fixedAssetId || !instance.code) {
      return byAssetAndCode;
    }

    byAssetAndCode[instance.fixedAssetId] = byAssetAndCode[
      instance.fixedAssetId
    ] || {};
    byAssetAndCode[instance.fixedAssetId][instance.code] = [
      ...(byAssetAndCode[instance.fixedAssetId][instance.code] || []),
      instance._id,
    ];

    return byAssetAndCode;
  }, {});

  const fxaInstanceIdsById = fxaInstances.reduce<TCodeMap>((byId, instance) => {
    byId[instance._id] = instance._id;
    return byId;
  }, {});

  return {
    accountsByCode: indexByCode(accounts),
    branchesByCode: indexByCode(branches),
    departmentsByCode: indexByCode(departments),
    customersByCode: indexByCode(customers),
    productsByCode: indexByCode(products),
    fixedAssetsByCode,
    fxaInstanceIdsByCode,
    fxaInstanceIdsByAssetAndCode,
    fxaInstanceIdsById,
  };
};

const buildContactQuery = (contact: TErkhetContact) => {
  const $or: Record<string, unknown>[] = [];

  if (contact?.code) {
    $or.push({ code: contact.code });
  }
  if (contact?.phone) {
    $or.push(
      { primaryPhone: contact.phone },
      { phones: { $in: [contact.phone] } },
    );
  }
  if (contact?.email) {
    $or.push(
      { primaryEmail: contact.email },
      { emails: { $in: [contact.email] } },
    );
  }

  if (!$or.length) {
    return {};
  }

  return { $or };
};

const findOrCreateContact = async ({
  subdomain,
  userId,
  contact,
}: {
  subdomain: string;
  userId: string;
  contact: TErkhetContact;
}) => {
  if (!contact?.code && !contact?.phone && !contact?.email && !contact?.name) {
    return {};
  }

  const type = contact.type === 'company' ? 'company' : 'customer';
  const module = type === 'company' ? 'companies' : 'customers';
  const findAction =
    type === 'company' ? 'findActiveCompanies' : 'findActiveCustomers';
  const createAction = type === 'company' ? 'createCompany' : 'createCustomer';
  const query = buildContactQuery(contact);

  const found = Object.keys(query).length
    ? await sendTRPCMessage({
        subdomain,
        method: 'query',
        pluginName: 'core',
        module,
        action: findAction,
        input: {
          query,
          fields: { _id: 1, code: 1, primaryPhone: 1, primaryEmail: 1 },
          limit: 1,
        },
        defaultValue: [],
      })
    : [];

  if (found?.[0]?._id) {
    return { type, _id: found[0]._id };
  }

  const doc =
    type === 'company'
      ? {
          code: contact.code,
          primaryName: contact.name || contact.code || contact.phone,
          primaryPhone: contact.phone,
          primaryEmail: contact.email,
          phones: contact.phone ? [contact.phone] : [],
          emails: contact.email ? [contact.email] : [],
          scopeBrandIds: [],
        }
      : {
          code: contact.code,
          firstName: contact.name || contact.code || contact.phone,
          primaryPhone: contact.phone,
          primaryEmail: contact.email,
          phones: contact.phone ? [contact.phone] : [],
          emails: contact.email ? [contact.email] : [],
        };

  const created = await sendTRPCMessage({
    subdomain,
    method: 'mutation',
    pluginName: 'core',
    module,
    action: createAction,
    input: { doc },
    context: { userId },
    defaultValue: {},
  });

  return { type, _id: created?._id };
};

const resolveDetail = (detail: ITrDetail, maps: TReferenceMaps) => {
  const accountCode = detail.accountId;
  const branchCode = detail.branchId;
  const productCode = detail.productId;
  const departmentCode = detail.departmentId;
  const fixedAssetCode = detail.fixedAssetId;

  if (accountCode && !maps.accountsByCode[accountCode]) {
    throw new Error(`Account not found: ${accountCode}`);
  }
  if (fixedAssetCode && !maps.fixedAssetsByCode[fixedAssetCode]) {
    throw new Error(`Fixed asset not found: ${fixedAssetCode}`);
  }
  if (productCode && !maps.productsByCode[productCode]) {
    throw new Error(`Product not found: ${productCode}`);
  }
  if (branchCode && !maps.branchesByCode[branchCode]) {
    throw new Error(`Branch not found: ${branchCode}`);
  }
  if (departmentCode && !maps.departmentsByCode[departmentCode]) {
    throw new Error(`Department not found: ${departmentCode}`);
  }

  return {
    ...detail,
    accountId: maps.accountsByCode[accountCode] || detail.accountId,
    fixedAssetId: fixedAssetCode
      ? maps.fixedAssetsByCode[fixedAssetCode] || detail.fixedAssetId
      : detail.fixedAssetId,
    branchId: branchCode
      ? maps.branchesByCode[branchCode] || detail.branchId
      : detail.branchId,
    productId: productCode
      ? maps.productsByCode[productCode] || detail.productId
      : detail.productId,
    departmentId: departmentCode
      ? maps.departmentsByCode[departmentCode] || detail.departmentId
      : detail.departmentId,
    followInfos: {
      ...(detail.followInfos || {}),
      accountCode,
      branchCode,
      productCode,
      departmentCode,
      fixedAssetCode,
    },
  };
};

const resolveFxaInstances = (
  instances: TFxaInstanceMigrationInput[],
  maps: TReferenceMaps,
) =>
  instances.map((instance) => {
    const fixedAssetCode = instance.fixedAssetId;
    const branchCode = instance.branchId;
    const departmentCode = instance.departmentId;

    if (fixedAssetCode && !maps.fixedAssetsByCode[fixedAssetCode]) {
      throw new Error(`Fixed asset not found: ${fixedAssetCode}`);
    }
    if (branchCode && !maps.branchesByCode[branchCode]) {
      throw new Error(`Branch not found: ${branchCode}`);
    }
    if (departmentCode && !maps.departmentsByCode[departmentCode]) {
      throw new Error(`Department not found: ${departmentCode}`);
    }

    return {
      ...instance,
      fixedAssetId: fixedAssetCode
        ? maps.fixedAssetsByCode[fixedAssetCode]
        : instance.fixedAssetId,
      branchId: branchCode ? maps.branchesByCode[branchCode] : instance.branchId,
      departmentId: departmentCode
        ? maps.departmentsByCode[departmentCode]
        : instance.departmentId,
      depreciationStartDate: instance.depreciationStartDate
        ? new Date(instance.depreciationStartDate)
        : instance.depreciationStartDate,
    };
  });

const resolveFxaInstanceIds = (
  refs: string[] = [],
  doc: ITransaction,
  maps: TReferenceMaps,
) => {
  const usedByCode: Record<string, number> = {};
  const fixedAssetIdsForRefs = (doc.details || []).flatMap((detail) => {
    const fixedAssetCode = detail.fixedAssetId;
    const fixedAssetId = fixedAssetCode
      ? maps.fixedAssetsByCode[fixedAssetCode] || fixedAssetCode
      : undefined;
    const count = Math.max(1, Math.trunc(detail.count || 1));

    return Array.from({ length: count }, () => fixedAssetId);
  });
  return refs.map((ref, index) => {
    if (maps.fxaInstanceIdsById[ref]) {
      return ref;
    }

    const fixedAssetId = fixedAssetIdsForRefs[index];
    const instances = fixedAssetId
      ? maps.fxaInstanceIdsByAssetAndCode[fixedAssetId]?.[ref] || []
      : maps.fxaInstanceIdsByCode[ref] || [];
    const usedIndex = usedByCode[ref] || 0;
    const instanceId = instances[usedIndex];

    if (!instanceId) {
      throw new Error(`Fixed asset instance not found: ${ref}`);
    }

    usedByCode[ref] = usedIndex + 1;
    return instanceId;
  });
};

const resolveTransactionFollowInfos = (
  doc: ITransaction,
  maps: TReferenceMaps,
) => {
  const moveInBranchCode = doc.followInfos?.moveInBranchId;
  const moveInDepartmentCode = doc.followInfos?.moveInDepartmentId;
  const accumulatedDepreciationAccountCode =
    doc.followInfos?.accumulatedDepreciationAccountId;
  const lossAccountCode = doc.followInfos?.lossAccountId;

  if (moveInBranchCode && !maps.branchesByCode[moveInBranchCode]) {
    throw new Error(`Branch not found: ${moveInBranchCode}`);
  }
  if (moveInDepartmentCode && !maps.departmentsByCode[moveInDepartmentCode]) {
    throw new Error(`Department not found: ${moveInDepartmentCode}`);
  }
  if (
    accumulatedDepreciationAccountCode &&
    !maps.accountsByCode[accumulatedDepreciationAccountCode]
  ) {
    throw new Error(
      `Account not found: ${accumulatedDepreciationAccountCode}`,
    );
  }
  if (lossAccountCode && !maps.accountsByCode[lossAccountCode]) {
    throw new Error(`Account not found: ${lossAccountCode}`);
  }

  return {
    ...(doc.followInfos || {}),
    moveInBranchId: moveInBranchCode
      ? maps.branchesByCode[moveInBranchCode]
      : doc.followInfos?.moveInBranchId,
    moveInDepartmentId: moveInDepartmentCode
      ? maps.departmentsByCode[moveInDepartmentCode]
      : doc.followInfos?.moveInDepartmentId,
    accumulatedDepreciationAccountId: accumulatedDepreciationAccountCode
      ? maps.accountsByCode[accumulatedDepreciationAccountCode]
      : doc.followInfos?.accumulatedDepreciationAccountId,
    lossAccountId: lossAccountCode
      ? maps.accountsByCode[lossAccountCode]
      : doc.followInfos?.lossAccountId,
    moveInBranchCode,
    moveInDepartmentCode,
    accumulatedDepreciationAccountCode,
    lossAccountCode,
  };
};

const normalizeBatchDocs = async (
  subdomain: string,
  models: IModels,
  batch: ErkhetTransactionBatch,
  userId: string,
) => {
  const maps = await fetchReferenceMaps(subdomain, models, batch.trDocs);
  const contactByCode: Record<string, TContactResolution> = {};

  for (const doc of batch.trDocs) {
    const contact = doc.extraData?.erkhetCustomer as TErkhetContact | undefined;
    if (contact?.code && !contactByCode[contact.code]) {
      contactByCode[contact.code] = await findOrCreateContact({
        subdomain,
        userId,
        contact,
      });
    }
  }

  return batch.trDocs.map((doc) => {
    const customerCode = doc.customerId;
    const branchCode = doc.branchId;
    const departmentCode = doc.departmentId;

    const contact = customerCode ? contactByCode[customerCode] : undefined;
    const fxaInstances =
      (doc.extraData?.fxaInstances as TFxaInstanceMigrationInput[]) || [];
    const fxaInstanceIds = doc.extraData?.fxaInstanceIds || [];

    if (customerCode && !contact?._id && !maps.customersByCode[customerCode]) {
      throw new Error(`Customer not found: ${customerCode}`);
    }
    if (branchCode && !maps.branchesByCode[branchCode]) {
      throw new Error(`Branch not found: ${branchCode}`);
    }
    if (departmentCode && !maps.departmentsByCode[departmentCode]) {
      throw new Error(`Department not found: ${departmentCode}`);
    }

    return {
      ...doc,
      date: new Date(doc.date),
      customerType: contact?.type || doc.customerType,
      customerId:
        contact?._id ||
        (customerCode
          ? maps.customersByCode[customerCode] || doc.customerId
          : doc.customerId),
      branchId: branchCode
        ? maps.branchesByCode[branchCode] || doc.branchId
        : doc.branchId,
      departmentId: departmentCode
        ? maps.departmentsByCode[departmentCode] || doc.departmentId
        : doc.departmentId,
      details: (doc.details || []).map((detail) => resolveDetail(detail, maps)),
      followInfos: resolveTransactionFollowInfos(doc, maps),
      contentType: doc.contentType || ERKHET_CONTENT_TYPE,
      contentId: doc.contentId || batch.externalPtrId,
      extraData: {
        ...(doc.extraData || {}),
        fxaInstances: resolveFxaInstances(fxaInstances, maps),
        fxaInstanceIds: resolveFxaInstanceIds(fxaInstanceIds, doc, maps),
        migrationSource: 'erkhet',
        externalPtrId: batch.externalPtrId,
        customerCode,
        branchCode,
        departmentCode,
      },
    };
  });
};

const saveBatch = async ({
  models,
  batch,
  userId,
  skipAccountPermission,
  dryRun,
  subdomain,
}: {
  subdomain: string;
  models: IModels;
  batch: ErkhetTransactionBatch;
  userId: string;
  skipAccountPermission: boolean;
  dryRun: boolean;
}) => {
  validateBatch(batch);

  const trDocs = await normalizeBatchDocs(subdomain, models, batch, userId);
  const oldTr = await models.Transactions.findOne({
    contentType: ERKHET_CONTENT_TYPE,
    contentId: batch.externalPtrId,
    $or: [{ originId: { $exists: false } }, { originId: '' }],
  }).lean();

  if (dryRun) {
    return {
      action: oldTr ? 'update' : 'create',
      parentId: oldTr?.parentId,
      count: trDocs.length,
    };
  }

  const transactions = oldTr
    ? await models.Transactions.updatePTransaction(
        oldTr.parentId,
        trDocs,
        userId,
        { skipAccountPermission },
      )
    : await models.Transactions.createPTransaction(trDocs, userId, {
        skipAccountPermission,
      });

  return {
    action: oldTr ? 'updated' : 'created',
    parentId: transactions[0]?.parentId || oldTr?.parentId,
    ptrId: transactions[0]?.ptrId || oldTr?.ptrId,
    count: transactions.length,
  };
};

export const importErkhetTransactions = async (req: Request, res: Response) => {
  try {
    assertMigrationToken(req);

    const body = req.body as ErkhetTransactionsRequest;
    const userId = body.userId || String(req.headers.userid || '');

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!Array.isArray(body.batches) || !body.batches.length) {
      return res.status(400).json({ error: 'batches is required' });
    }

    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    const successRows: TMigrationSuccessRow[] = [];
    const errorRows: TMigrationErrorRow[] = [];

    for (const batch of body.batches) {
      try {
        const result = await saveBatch({
          models,
          batch,
          userId,
          skipAccountPermission: body.skipAccountPermission !== false,
          dryRun: Boolean(body.dryRun),
          subdomain,
        });

        successRows.push({
          externalPtrId: batch.externalPtrId,
          ...result,
        });
      } catch (e) {
        errorRows.push({
          externalPtrId: batch?.externalPtrId,
          error: getErrorMessage(e, 'Failed to import Erkhet transaction'),
        });
      }
    }

    return res.json({
      ok: !errorRows.length,
      dryRun: Boolean(body.dryRun),
      successCount: successRows.length,
      errorCount: errorRows.length,
      successRows,
      errorRows,
    });
  } catch (e) {
    return res
      .status(
        e instanceof Error && 'statusCode' in e
          ? Number(e.statusCode) || 500
          : 500,
      )
      .json({
        error: getErrorMessage(e, 'Failed to import Erkhet transactions'),
      });
  }
};
