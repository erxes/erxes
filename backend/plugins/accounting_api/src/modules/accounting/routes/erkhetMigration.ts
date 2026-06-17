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

    for (const detail of doc.details || []) {
      if (detail.accountId) {
        accountCodes.push(detail.accountId);
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
  };
};

const indexByCode = (items: any[] = []) =>
  items.reduce((byCode, item) => {
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

  return {
    accountsByCode: indexByCode(accounts),
    branchesByCode: indexByCode(branches),
    departmentsByCode: indexByCode(departments),
    customersByCode: indexByCode(customers),
    productsByCode: indexByCode(products),
  };
};

const buildContactQuery = (contact: any, type: string) => {
  const $or: any[] = [];

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

  return type === 'company' ? { $or } : { $or };
};

const findOrCreateContact = async ({
  subdomain,
  userId,
  contact,
}: {
  subdomain: string;
  userId: string;
  contact: any;
}) => {
  if (!contact?.code && !contact?.phone && !contact?.email && !contact?.name) {
    return {};
  }

  const type = contact.type === 'company' ? 'company' : 'customer';
  const module = type === 'company' ? 'companies' : 'customers';
  const findAction =
    type === 'company' ? 'findActiveCompanies' : 'findActiveCustomers';
  const createAction = type === 'company' ? 'createCompany' : 'createCustomer';
  const query = buildContactQuery(contact, type);

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

const resolveDetail = (detail: ITrDetail, maps: any) => {
  const accountCode = detail.accountId;
  const branchCode = detail.branchId;
  const productCode = detail.productId;
  const departmentCode = detail.departmentId;

  if (accountCode && !maps.accountsByCode[accountCode]) {
    throw new Error(`Account not found: ${accountCode}`);
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
    },
  };
};

const normalizeBatchDocs = async (
  subdomain: string,
  models: IModels,
  batch: ErkhetTransactionBatch,
  userId: string,
) => {
  const maps = await fetchReferenceMaps(subdomain, models, batch.trDocs);
  const contactByCode: Record<string, any> = {};

  for (const doc of batch.trDocs) {
    const contact = doc.extraData?.erkhetCustomer;
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
      contentType: doc.contentType || ERKHET_CONTENT_TYPE,
      contentId: doc.contentId || batch.externalPtrId,
      extraData: {
        ...(doc.extraData || {}),
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
    const successRows: any[] = [];
    const errorRows: any[] = [];

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
          error: e.message || 'Failed to import Erkhet transaction',
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
      .status(e.statusCode || 500)
      .json({ error: e.message || 'Failed to import Erkhet transactions' });
  }
};
