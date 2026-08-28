import { Request, Response } from 'express';
import { getSubdomain, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels, generateModels } from '~/connectionResolvers';
import {
  FXA_OWNER_RECORD_ACTIONS,
  FXA_OWNER_RECORD_STATUSES,
} from '@/fixedAssets/@types/constants';
import { JOURNALS } from '../@types/constants';
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
  fixedAssetCategoriesByCode: TCodeMap;
  fixedAssetsByCode: TCodeMap;
  usersByRef: TCodeMap;
};

type TFxaOwnerRecordMigrationInput = {
  _id?: string;
  fxaOwnerRecordId?: string;
  tempId?: string;
  transactionDetailId?: string;
  fixedAssetId?: string;
  code?: string;
  sequence?: number;
  count?: number;
  ownerId?: string;
  sourceOwnerId?: string;
  responsibleUserId?: string;
  sourceResponsibleUserId?: string;
};

type TMigrationUser = {
  _id: string;
  email?: string;
  username?: string;
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

const normalizeSourceCode = (value?: string) =>
  typeof value === 'string' ? value.trim() : value || '';

const uniq = (values: string[]) => [
  ...new Set(values.map((value) => normalizeSourceCode(value)).filter(Boolean)),
];

const getCodeMap = (docs: ITransaction[]) => {
  const accountCodes: string[] = [];
  const branchCodes: string[] = [];
  const departmentCodes: string[] = [];
  const customerCodes: string[] = [];
  const productCodes: string[] = [];
  const fixedAssetCategoryCodes: string[] = [];
  const fixedAssetCodes: string[] = [];
  const userRefs: string[] = [];

  // Payload дотор ирсэн бүх source code-г эхэлж цуглуулна. Дараагийн шатанд
  // эдгээрийг нэг дор query хийж erxes _id болгон resolve хийх нь N+1 query-гээс хамгаална.
  for (const doc of docs) {
    if (doc.branchId) {
      branchCodes.push(normalizeSourceCode(doc.branchId));
    }
    if (doc.departmentId) {
      departmentCodes.push(normalizeSourceCode(doc.departmentId));
    }
    if (doc.customerId) {
      customerCodes.push(normalizeSourceCode(doc.customerId));
    }

    const moveInBranchId = doc.followInfos?.moveInBranchId;
    const moveInDepartmentId = doc.followInfos?.moveInDepartmentId;
    const accumulatedDepreciationAccountId =
      doc.followInfos?.accumulatedDepreciationAccountId;
    const fixedAssetAccountId = doc.followInfos?.fixedAssetAccountId;
    const lossAccountId = doc.followInfos?.lossAccountId;

    if (moveInBranchId) {
      branchCodes.push(normalizeSourceCode(moveInBranchId));
    }
    if (moveInDepartmentId) {
      departmentCodes.push(normalizeSourceCode(moveInDepartmentId));
    }
    if (accumulatedDepreciationAccountId) {
      accountCodes.push(normalizeSourceCode(accumulatedDepreciationAccountId));
    }
    if (fixedAssetAccountId) {
      accountCodes.push(normalizeSourceCode(fixedAssetAccountId));
    }
    if (lossAccountId) {
      accountCodes.push(normalizeSourceCode(lossAccountId));
    }

    const fxaOwnerRecords =
      (doc.extraData?.fxaOwnerRecords as TFxaOwnerRecordMigrationInput[]) || [];
    for (const ownerRecord of fxaOwnerRecords) {
      if (ownerRecord.fixedAssetId) {
        fixedAssetCodes.push(normalizeSourceCode(ownerRecord.fixedAssetId));
      }
      if (ownerRecord.ownerId) {
        userRefs.push(normalizeSourceCode(ownerRecord.ownerId));
      }
      if (ownerRecord.sourceOwnerId) {
        userRefs.push(normalizeSourceCode(ownerRecord.sourceOwnerId));
      }
      if (ownerRecord.responsibleUserId) {
        userRefs.push(normalizeSourceCode(ownerRecord.responsibleUserId));
      }
      if (ownerRecord.sourceResponsibleUserId) {
        userRefs.push(normalizeSourceCode(ownerRecord.sourceResponsibleUserId));
      }
    }

    for (const detail of doc.details || []) {
      if (detail.accountId) {
        accountCodes.push(normalizeSourceCode(detail.accountId));
      }
      if (detail.fixedAssetId) {
        fixedAssetCodes.push(normalizeSourceCode(detail.fixedAssetId));
      }
      if (detail.fixedAssetCategoryId) {
        fixedAssetCategoryCodes.push(
          normalizeSourceCode(detail.fixedAssetCategoryId),
        );
      }
      if (detail.branchId) {
        branchCodes.push(normalizeSourceCode(detail.branchId));
      }
      if (detail.departmentId) {
        departmentCodes.push(normalizeSourceCode(detail.departmentId));
      }
      if (detail.productId) {
        productCodes.push(normalizeSourceCode(detail.productId));
      }
    }
  }

  return {
    accountCodes: uniq(accountCodes),
    branchCodes: uniq(branchCodes),
    departmentCodes: uniq(departmentCodes),
    customerCodes: uniq(customerCodes),
    productCodes: uniq(productCodes),
    fixedAssetCategoryCodes: uniq(fixedAssetCategoryCodes),
    fixedAssetCodes: uniq(fixedAssetCodes),
    userRefs: uniq(userRefs),
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

const OMIT_DETAIL_FOLLOW_INFO_KEYS = [
  'erkhetProduct',
  'inventoryCode',
  'invLocationCode',
  'fxaLocationCode',
];

// Хуучин migration payload-оос ирсэн audit-only key-үүдийг хадгалахгүй.
// Erxes тал resolve хийсний дараа хэрэгтэй source code-уудыг өөрөө followInfos-д нэмнэ.
const cleanDetailFollowInfos = (
  followInfos: ITrDetail['followInfos'] = {},
) =>
  Object.fromEntries(
    Object.entries(followInfos).filter(
      ([key, value]) =>
        value !== undefined && !OMIT_DETAIL_FOLLOW_INFO_KEYS.includes(key),
    ),
  );

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
    fixedAssetCategoryCodes,
    fixedAssetCodes,
    userRefs,
  } = getCodeMap(docs);

  // Transaction route лавлах үүсгэхгүй. Reference migration өмнө нь
  // bootstrap хийсэн байх ёстой бөгөөд энд зөвхөн code -> _id lookup хийнэ.
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
  const productsByCode = indexByCode(products);

  const fixedAssetCategories = fixedAssetCategoryCodes.length
    ? await models.FixedAssetCategories.find(
        { code: { $in: fixedAssetCategoryCodes } },
        { _id: 1, code: 1 },
      ).lean()
    : [];

  const fixedAssets = fixedAssetCodes.length
    ? await models.FixedAssets.find(
        { code: { $in: fixedAssetCodes } },
        { _id: 1, code: 1 },
      ).lean()
    : [];
  const fixedAssetsByCode = indexByCode(fixedAssets);

  const users: TMigrationUser[] = userRefs.length
    ? ((await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'users',
        action: 'find',
        defaultValue: [],
        input: {
          query: {
            $or: [
              { _id: { $in: userRefs } },
              { email: { $in: userRefs } },
              { username: { $in: userRefs } },
            ],
          },
          fields: { _id: 1, email: 1, username: 1 },
        },
      })) as TMigrationUser[])
    : [];
  const usersByRef = users.reduce<TCodeMap>((byRef, user) => {
    byRef[user._id] = user._id;
    if (user.email) {
      byRef[user.email] = user._id;
    }
    if (user.username) {
      byRef[user.username] = user._id;
    }
    return byRef;
  }, {});

  return {
    accountsByCode: indexByCode(accounts),
    branchesByCode: indexByCode(branches),
    departmentsByCode: indexByCode(departments),
    customersByCode: indexByCode(customers),
    productsByCode,
    fixedAssetCategoriesByCode: indexByCode(fixedAssetCategories),
    fixedAssetsByCode,
    usersByRef,
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

  // Erkhet-д бүх харилцагч нэг model-д байсан. Erxes дээр company/customer
  // тусдаа тул source category mapping-ээр ирсэн type-г баримталж олж эсвэл үүсгэнэ.
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
  const accountCode = normalizeSourceCode(detail.accountId);
  const branchCode = normalizeSourceCode(detail.branchId);
  const productCode = normalizeSourceCode(detail.productId);
  const departmentCode = normalizeSourceCode(detail.departmentId);
  const fixedAssetCode = normalizeSourceCode(detail.fixedAssetId);
  const fixedAssetCategoryCode = normalizeSourceCode(
    detail.fixedAssetCategoryId,
  );

  // Detail дээр байгаа account/product/fixedAsset/category/branch/department нь
  // бүгд source code. Хадгалахаас өмнө erxes _id-р солихгүй бол journal logic ажиллахгүй.
  if (accountCode && !maps.accountsByCode[accountCode]) {
    throw new Error(`Account not found: ${accountCode}`);
  }
  if (fixedAssetCode && !maps.fixedAssetsByCode[fixedAssetCode]) {
    throw new Error(`Fixed asset not found: ${fixedAssetCode}`);
  }
  if (
    fixedAssetCategoryCode &&
    !maps.fixedAssetCategoriesByCode[fixedAssetCategoryCode]
  ) {
    throw new Error(`Fixed asset category not found: ${fixedAssetCategoryCode}`);
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
    fixedAssetCategoryId: fixedAssetCategoryCode
      ? maps.fixedAssetCategoriesByCode[fixedAssetCategoryCode] ||
        detail.fixedAssetCategoryId
      : detail.fixedAssetCategoryId,
    fixedAssetCode: normalizeSourceCode(detail.fixedAssetCode),
    fixedAssetName: normalizeSourceCode(detail.fixedAssetName),
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
      ...cleanDetailFollowInfos(detail.followInfos),
      accountCode,
      branchCode,
      productCode,
      departmentCode,
      fixedAssetCode,
      fixedAssetCategoryCode,
    },
  };
};

const resolveFxaOwnerRecords = (
  ownerRecords: TFxaOwnerRecordMigrationInput[],
  maps: TReferenceMaps,
) =>
  ownerRecords.map((ownerRecord) => {
    const fixedAssetCode = normalizeSourceCode(ownerRecord.fixedAssetId);
    const ownerRef = normalizeSourceCode(ownerRecord.ownerId);
    const sourceOwnerRef = normalizeSourceCode(ownerRecord.sourceOwnerId);
    const responsibleUserRef = normalizeSourceCode(
      ownerRecord.responsibleUserId,
    );
    const sourceResponsibleUserRef = normalizeSourceCode(
      ownerRecord.sourceResponsibleUserId,
    );

    // extraData.fxaOwnerRecords нь хөрөнгийн санхүүгийн хөдөлгөөн биш,
    // зөвхөн эд хариуцагч/serial allocation ownerRecord. Ирсэн code-уудыг энд _id болгоно.
    if (fixedAssetCode && !maps.fixedAssetsByCode[fixedAssetCode]) {
      throw new Error(`Fixed asset not found: ${fixedAssetCode}`);
    }
    if (ownerRef && !maps.usersByRef[ownerRef]) {
      throw new Error(`User not found: ${ownerRef}`);
    }
    if (sourceOwnerRef && !maps.usersByRef[sourceOwnerRef]) {
      throw new Error(`User not found: ${sourceOwnerRef}`);
    }
    if (responsibleUserRef && !maps.usersByRef[responsibleUserRef]) {
      throw new Error(`User not found: ${responsibleUserRef}`);
    }
    if (sourceResponsibleUserRef && !maps.usersByRef[sourceResponsibleUserRef]) {
      throw new Error(`User not found: ${sourceResponsibleUserRef}`);
    }

    return {
      _id: ownerRecord._id,
      fxaOwnerRecordId: ownerRecord.fxaOwnerRecordId,
      tempId: ownerRecord.tempId,
      transactionDetailId: ownerRecord.transactionDetailId,
      code: ownerRecord.code,
      sequence: ownerRecord.sequence,
      count: ownerRecord.count,
      fixedAssetId: fixedAssetCode
        ? maps.fixedAssetsByCode[fixedAssetCode]
        : ownerRecord.fixedAssetId,
      ownerId: ownerRef
        ? maps.usersByRef[ownerRef]
        : responsibleUserRef
          ? maps.usersByRef[responsibleUserRef]
          : ownerRecord.ownerId || ownerRecord.responsibleUserId,
      sourceOwnerId: sourceOwnerRef
        ? maps.usersByRef[sourceOwnerRef]
        : sourceResponsibleUserRef
          ? maps.usersByRef[sourceResponsibleUserRef]
          : ownerRecord.sourceOwnerId || ownerRecord.sourceResponsibleUserId,
      sourceResponsibleUserId: sourceResponsibleUserRef
        ? maps.usersByRef[sourceResponsibleUserRef]
        : undefined,
    };
  });

const isOwnerRecordMovementJournal = (journal?: string) =>
  [JOURNALS.FXA_OUT, JOURNALS.FXA_SALE, JOURNALS.FXA_MOVE].includes(
    journal || '',
  );

const getOwnerRecordInputKey = (input: TFxaOwnerRecordMigrationInput) =>
  input.fxaOwnerRecordId || input._id || '';

const getDetailId = (detail: ITrDetail) => detail._id?.toString() || '';

const resolveOwnerRecordSources = async (
  models: IModels,
  doc: ITransaction,
  ownerRecords: TFxaOwnerRecordMigrationInput[],
) => {
  if (!isOwnerRecordMovementJournal(doc.journal) || !ownerRecords.length) {
    return ownerRecords;
  }

  const detailById = new Map(
    (doc.details || []).map((detail) => [getDetailId(detail), detail]),
  );
  const usedCountByOwnerKey = new Map<string, number>();

  // Зарлага/хөдөлгөөн дээр Erkhet-д owner record id байхгүй байж болно. Тийм үед
  // fixedAsset + owner-аар хүлээж авсан/өгсөн мөрүүдийг нэгтгэж үлдэгдэл шалгана.
  return Promise.all(
    ownerRecords.map(async (input) => {
      if (getOwnerRecordInputKey(input) || !input.transactionDetailId) {
        return input;
      }

      const detail = detailById.get(input.transactionDetailId);
      const fixedAssetId = input.fixedAssetId || detail?.fixedAssetId;
      const preferredSourceOwnerId =
        input.sourceOwnerId || input.sourceResponsibleUserId;
      const count = Math.max(0, Math.trunc(input.count || detail?.count || 0));

      if (!detail || !fixedAssetId || count <= 0) {
        return input;
      }

      const selector: Record<string, unknown> = {
        fixedAssetId,
        status: FXA_OWNER_RECORD_STATUSES.ACTIVE,
      };
      if (preferredSourceOwnerId) {
        selector.ownerId = preferredSourceOwnerId;
      }

      const candidates = await models.FxaOwnerRecords.find(selector, {
        _id: 1,
        count: 1,
        action: 1,
        ownerId: 1,
      })
        .limit(200)
        .lean();
      const balanceByOwner = candidates.reduce<Record<string, number>>(
        (result, candidate) => {
          const candidateOwnerId = candidate.ownerId || '';
          const sign =
            candidate.action === FXA_OWNER_RECORD_ACTIONS.RECEIVED
              ? 1
              : candidate.action === FXA_OWNER_RECORD_ACTIONS.HANDED_OVER
                ? -1
                : 0;

          result[candidateOwnerId] =
            (result[candidateOwnerId] || 0) +
            sign * Math.max(0, Math.trunc(candidate.count || 0));

          return result;
        },
        {},
      );
      const selectedSourceOwnerId = Object.keys(balanceByOwner).find(
        (candidateOwnerId) => {
          const ownerKey = `${fixedAssetId}:${candidateOwnerId}`;
          const usedCount = usedCountByOwnerKey.get(ownerKey) || 0;

          return balanceByOwner[candidateOwnerId] - usedCount >= count;
        },
      );

      if (!selectedSourceOwnerId) {
        throw new Error(`Fixed asset owner record not found: ${fixedAssetId}`);
      }

      const ownerKey = `${fixedAssetId}:${selectedSourceOwnerId}`;
      const usedCount = usedCountByOwnerKey.get(ownerKey) || 0;

      usedCountByOwnerKey.set(ownerKey, usedCount + count);

      return {
        ...input,
        fixedAssetId,
        ownerId: input.ownerId || selectedSourceOwnerId,
        sourceOwnerId: selectedSourceOwnerId,
        count,
      };
    }),
  );
};

const resolveTransactionFollowInfos = (
  doc: ITransaction,
  maps: TReferenceMaps,
) => {
  const moveInBranchCode = normalizeSourceCode(doc.followInfos?.moveInBranchId);
  const moveInDepartmentCode = normalizeSourceCode(
    doc.followInfos?.moveInDepartmentId,
  );
  const accumulatedDepreciationAccountCode =
    normalizeSourceCode(doc.followInfos?.accumulatedDepreciationAccountId);
  const fixedAssetAccountCode = normalizeSourceCode(
    doc.followInfos?.fixedAssetAccountId,
  );
  const lossAccountCode = normalizeSourceCode(doc.followInfos?.lossAccountId);

  // fxaOut/fxaMove-ийн дагалдах данс, шилжих салбар/хэлтэс нь transaction root
  // биш followInfos дотор ирдэг. Тэдгээрийг мөн _id-р сольж journal handler-т өгнө.
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
    throw new Error(`Account not found: ${accumulatedDepreciationAccountCode}`);
  }
  if (lossAccountCode && !maps.accountsByCode[lossAccountCode]) {
    throw new Error(`Account not found: ${lossAccountCode}`);
  }
  if (
    fixedAssetAccountCode &&
    !maps.accountsByCode[fixedAssetAccountCode]
  ) {
    throw new Error(`Account not found: ${fixedAssetAccountCode}`);
  }

  return {
    ...doc.followInfos,
    moveInBranchId: moveInBranchCode
      ? maps.branchesByCode[moveInBranchCode]
      : doc.followInfos?.moveInBranchId,
    moveInDepartmentId: moveInDepartmentCode
      ? maps.departmentsByCode[moveInDepartmentCode]
      : doc.followInfos?.moveInDepartmentId,
    accumulatedDepreciationAccountId: accumulatedDepreciationAccountCode
      ? maps.accountsByCode[accumulatedDepreciationAccountCode]
      : doc.followInfos?.accumulatedDepreciationAccountId,
    fixedAssetAccountId: fixedAssetAccountCode
      ? maps.accountsByCode[fixedAssetAccountCode]
      : doc.followInfos?.fixedAssetAccountId,
    lossAccountId: lossAccountCode
      ? maps.accountsByCode[lossAccountCode]
      : doc.followInfos?.lossAccountId,
    moveInBranchCode,
    moveInDepartmentCode,
    accumulatedDepreciationAccountCode,
    fixedAssetAccountCode,
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

  // Нэг batch дотор ижил customer олон transaction дээр давтагддаг тул
  // contact sync-г code-р cache хийж давхар create хийхээс сэргийлнэ.
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

  return Promise.all(batch.trDocs.map(async (doc) => {
    const customerCode = normalizeSourceCode(doc.customerId);
    const branchCode = normalizeSourceCode(doc.branchId);
    const departmentCode = normalizeSourceCode(doc.departmentId);

    const contact = customerCode ? contactByCode[customerCode] : undefined;
    const fxaOwnerRecords =
      (doc.extraData?.fxaOwnerRecords as TFxaOwnerRecordMigrationInput[]) || [];
    const extraData = { ...doc.extraData };

    if (customerCode && !contact?._id && !maps.customersByCode[customerCode]) {
      throw new Error(`Customer not found: ${customerCode}`);
    }
    if (branchCode && !maps.branchesByCode[branchCode]) {
      throw new Error(`Branch not found: ${branchCode}`);
    }
    if (departmentCode && !maps.departmentsByCode[departmentCode]) {
      throw new Error(`Department not found: ${departmentCode}`);
    }

    const resolvedDoc = {
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
        ...extraData,
        fxaOwnerRecords: resolveFxaOwnerRecords(fxaOwnerRecords, maps),
        migrationSource: 'erkhet',
        externalPtrId: batch.externalPtrId,
        customerCode,
        branchCode,
        departmentCode,
      },
    };

    resolvedDoc.extraData.fxaOwnerRecords = await resolveOwnerRecordSources(
      models,
      resolvedDoc,
      resolvedDoc.extraData.fxaOwnerRecords || [],
    );

    return resolvedDoc;
  }));
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
  const lookupContentType = trDocs[0]?.contentType || ERKHET_CONTENT_TYPE;
  const lookupContentId = trDocs[0]?.contentId || batch.externalPtrId;
  // Давтан ажиллуулахад ижил source баримт дахин үүсэхгүй байх гол түлхүүр.
  // sync_id/sync_type байвал deal/source content-оор, байхгүй бол externalPtrId-р update хийнэ.
  const oldTr = await models.Transactions.findOne({
    contentType: lookupContentType,
    contentId: lookupContentId,
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
