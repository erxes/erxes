import { IModels } from '~/connectionResolvers';
import {
  ACCOUNT_CATEGORY_STATUSES,
  JOURNALS,
} from '~/modules/accounting/@types/constants';
import { ITransaction } from '~/modules/accounting/@types/transaction';
import { nanoid } from 'nanoid';
import { fixNum, sendTRPCMessage } from 'erxes-api-shared/utils';

export async function prepareAccountDoc(
  models: IModels,
  row: any,
) {
  const doc: any = { ...row };

  doc.createdAt = new Date();
  doc.updatedAt = new Date();

  if (!doc.code) {
    throw new Error('code is required');
  }

  if (row.parentId) {
    const parentCategory = await models.AccountCategories.findOne({
      $or: [
        { _id: row.parentId }, { code: row.parentId }]
    }).lean();
    if (!parentCategory) {
      throw new Error(`Parent category (by _id or code) not found for line with code "${row.code}"`)
    }

    doc.parentId = parentCategory._id;
    doc.order = `${parentCategory.order}${row.code}/`
  } else {
    doc.order = `${row.code}/`
  }

  const normalize = (val: any) => String(val).toLowerCase();

  // STATUS
  doc.status = ['deleted', 0, '0'].includes(normalize(row.status))
    ? ACCOUNT_CATEGORY_STATUSES.ARCHIVED
    : ACCOUNT_CATEGORY_STATUSES.ACTIVE;

  return doc;
}

const savePtr = async (models: IModels, trDocs: ITransaction[], userId: string, ptrInfo) => {
  const { hasOld, parentId } = ptrInfo;
  if (hasOld) {
    const transactions = await models.Transactions.updatePTransaction(
      parentId,
      trDocs,
      userId,
    );
    return transactions?.[0]?.parentId || parentId;
  }

  const transactions = await models.Transactions.createPTransaction(trDocs, userId);
  return transactions?.[0]?.parentId || parentId;
};

const getPtrInfo = async (models, row) => {
  const date = new Date(row.date);
  const { number } = row;
  const oldTr = await models.Transactions.findOne({
    date,
    number,
    originId: { $exists: false },
  });
  if (oldTr) {
    return {
      hasOld: true,
      parentId: oldTr.parentId,
      ptrId: oldTr.ptrId,
      date,
      number,
    };
  }
  return {
    hasOld: false,
    parentId: nanoid(),
    ptrId: nanoid(),
    date,
    number,
  };
};

const getBooleanVal = (value) => {
  if ([1, '1', true, 'true', 'TRUE', 'True'].includes(value)) {
    return true;
  }
  return false;
}

const getFollowInfos = async (models: IModels, row: any, relatedData) => {
  const { accounts, branches, departments } = relatedData;
  if (JOURNALS.ALL_WITH_CURRENCIES.includes(row.journal)) {
    if (row.follow1) {
      return { currencyDiffAccountId: accounts?.find(acc => acc.code === row.follow1)?._id }
    }
  }
  if (JOURNALS.INV_MOVE === row.journal) {
    return {
      moveInAccountId: accounts?.find(acc => acc.code === row.follow1)?._id,
      moveInBranchId: branches?.find(branch => branch.code === row.follow2)?._id,
      moveInDepartmentId: departments?.find(department => department.code === row.follow3)?._id,
    }
  }
  if (JOURNALS.INV_SALE === row.journal) {
    return {
      saleOutAccountId: accounts?.find(acc => acc.code === row.follow1)?._id,
      saleCostAccountId: accounts?.find(acc => acc.code === row.follow2)?._id,
    }
  }
  if (JOURNALS.INV_SALE_RETURN === row.journal) {
    let saleTransactionId = '';
    if (row.follow1) {
      saleTransactionId = (
        await models.Transactions.findOne({
          number: row.follow1,
          journal: JOURNALS.INV_SALE,
        }).lean()
      )?._id ?? '';
    }
    return {
      saleTransactionId,
      saleOutAccountId: accounts?.find(acc => acc.code === row.follow2)?._id,
      saleCostAccountId: accounts?.find(acc => acc.code === row.follow3)?._id,
    }
  }
  return;
}

const getTrDoc = async (models: IModels, row: any, ptrInfo, relatedData) => {
  const {
    users,
    customers,
    companies
  } = relatedData;

  const journal = row.journal
  if (!JOURNALS.ALL_ORIGINS.includes(journal)) {
    throw new Error('Зөвшөөрөгдөөгүй журнал бөглөгдсөн байна')
  }
  const { ptrId, parentId, date, number } = ptrInfo;
  let customerId = '';
  if (row.customerInfo) {
    if (row.customerType === 'company') {
      customerId = companies
        .find(c => [c.primaryPhone, c.primaryEmail, c.code].includes(row.customerInfo))?._id ?? '';
    } else if (row.customerType === 'user') {
      customerId = users.find(u => u.email === row.customerInfo)?._id ?? '';
    } else {
      customerId = customers
        .find(c => [c.primaryPhone, c.primaryEmail, c.code].includes(row.customerInfo))?._id ?? '';
    }
  }

  return {
    ptrId,
    parentId,
    number,
    date,
    description: row.description,
    journal,
    side: row.side,
    followInfos: await getFollowInfos(models, row, relatedData),

    customerType: row.customerType,
    customerId,
    assignedUserIds: users
      .filter((user) =>
        String(row.assignedUserEmails || '')
          .split(',')
          .map((email) => email.trim())
          .filter(Boolean)
          .includes(user.email),
      )
      .map((user) => user._id),

    hasVat: getBooleanVal(row.hasVat),
    vatRowId: row.vatRowId,
    afterVat: getBooleanVal(row.afterVat),
    isHandleVat: getBooleanVal(row.isHandleVat),
    vatAmount: row.vatAmount ?? 0,

    hasCtax: getBooleanVal(row.hasCtax),
    ctaxRowId: row.ctaxRowId,
    isHandleCtax: getBooleanVal(row.isHandleCtax),
    ctaxAmount: row.ctaxAmount ?? 0,
    details: [],
  };
}

const getDetailDoc = async (row, currentTr, relatedData) => {
  const { accounts, branches, departments, users, products } = relatedData;
  return {
    _id: nanoid(),
    accountId: accounts?.find(acc => acc.code === row.accountCode)?._id,
    branchId: branches?.find(branch => branch.code === row.branchId)?._id,
    departmentId: departments?.find(department => department.code === row.departmentId)?._id,
    amount: fixNum(row.amount, 6),
    currencyAmount: fixNum(row.currencyAmount, 6),
    customRate: fixNum(row.customRate, 6),
    assignedUserId:
      (row.assignUserEmail &&
        users.find((user) => user.email === row.assignUserEmail)?._id) ||
      '',

    productId:
      (row.productCode &&
        products.find((prod) => prod.code === row.productCode)?._id) ||
      '',
    count: fixNum(row.count, 6),
    unitPrice: fixNum(row.unitPrice, 6),

    excludeVat: getBooleanVal(row.excludeVat),
    excludeCtax: getBooleanVal(row.excludeCtax),
  };
}

const extractFollowInfos = (row) => {
  if (JOURNALS.ALL_WITH_CURRENCIES.includes(row.journal)) {
    if (row.follow1) {
      return { accounts: [row.follow1] };
    }
  }
  if (JOURNALS.INV_MOVE === row.journal) {
    return {
      accounts: [row.follow1].filter(Boolean),
      branches: [row.follow2].filter(Boolean),
      departments: [row.follow3].filter(Boolean),
    };
  }
  if (JOURNALS.INV_SALE === row.journal) {
    return {
      accounts: [row.follow1, row.follow2].filter(Boolean),
    };
  }
  if (JOURNALS.INV_SALE_RETURN === row.journal) {
    return {
      transactions: [row.follow1].filter(Boolean),
      accounts: [row.follow2, row.follow3].filter(Boolean),
    };
  }
};

const getRelatedDatas = async (subdomain: string, models: IModels, rows: any[]) => {
  const branchIds: string[] = [];
  const departmentIds: string[] = [];
  const userEmails: string[] = [];
  const customerInfos: string[] = [];
  const companyInfos: string[] = [];
  const accountCodes: string[] = [];
  const productCodes: string[] = [];

  for (const row of rows) {
    if (row.branchId && !branchIds.includes(row.branchId))
      branchIds.push(row.branchId);

    if (row.departmentId && !departmentIds.includes(row.departmentId))
      departmentIds.push(row.departmentId);

    if (row.assignedUserEmails) {
      row.assignedUserEmails.split(',').filter(email => email).forEach(email => {
        if (!userEmails.includes(email))
          userEmails.push(email);
      });
    }

    if (row.assignedUserEmail && !userEmails.includes(row.assignedUserEmail))
      userEmails.push(row.assignedUserEmail);

    if (row.customerInfo) {
      if (row.customerType === 'company') {
        if (!companyInfos.includes(row.customerInfo))
          companyInfos.push(row.customerInfo);
      } else if (row.customerType === 'user') {
        if (!userEmails.includes(row.customerInfo))
          userEmails.push(row.customerInfo);
      } else {
        if (!customerInfos.includes(row.customerInfo))
          customerInfos.push(row.customerInfo);
      }
    }

    if (row.accountCode && !accountCodes.includes(row.accountCode))
      accountCodes.push(row.accountCode);

    if (row.productCode && !productCodes.includes(row.productCode))
      productCodes.push(row.productCode);

    const extracted = extractFollowInfos(row);
    if (extracted?.accounts?.length) {
      extracted.accounts.forEach(acc => {
        if (!accountCodes.includes(acc))
          accountCodes.push(acc)
      });
    }
    if (extracted?.branches?.length) {
      extracted.branches.forEach(branch => {
        if (!branchIds.includes(branch))
          branchIds.push(branch);
      });
    }
    if (extracted?.departments?.length) {
      extracted.departments.forEach(department => {
        if (!departmentIds.includes(department))
          departmentIds.push(department);
      });
    }
  }

  const branches = branchIds.length
    ? await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'branches',
      action: 'find',
      defaultValue: [],
      input: {
        query: {
          $or: [{ _id: { $in: branchIds } }, { code: { $in: branchIds } }],
        },
        fields: { _id: 1, code: 1 },
      },
    })
    : [];

  const departments = departmentIds.length
    ? await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'departments',
      action: 'find',
      defaultValue: [],
      input: {
        query: {
          $or: [
            { _id: { $in: departmentIds } },
            { code: { $in: departmentIds } },
          ],
        },
        fields: { _id: 1, code: 1 },
      },
    })
    : [];

  const users = userEmails.length
    ? await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'users',
      action: 'find',
      defaultValue: [],
      input: {
        query: { email: { $in: userEmails } },
        fields: { _id: 1, email: 1 },
      },
    })
    : [];

  const customers = customerInfos.length
    ? await sendTRPCMessage({
      subdomain,
      method: 'query',
      pluginName: 'core',
      module: 'customers',
      action: 'findActiveCustomers',
      input: {
        query: {
          $or: [
            { primaryEmail: { $in: customerInfos } },
            { primaryPhone: { $in: customerInfos } },
            { code: { $in: customerInfos } },
          ]
        },
        fields: { _id: 1, primaryPhone: 1, primaryEmail: 1 },
      },
      defaultValue: [],
    }) : []

  const companies = companyInfos.length
    ? await sendTRPCMessage({
      subdomain,
      method: 'query',
      pluginName: 'core',
      module: 'companies',
      action: 'findActiveCompanies',
      input: {
        query: {
          $or: [
            { primaryEmail: { $in: companyInfos } },
            { primaryPhone: { $in: companyInfos } },
            { code: { $in: companyInfos } },
          ]
        },
        fields: { _id: 1, primaryPhone: 1, primaryEmail: 1 },
      },
      defaultValue: [],
    }) : []

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
    }) : []

  const accounts = accountCodes.length
    ? await models.Accounts.find({ code: { $in: accountCodes } }).lean()
    : [];

  return {
    branches,
    departments,
    users,
    customers,
    companies,
    accounts,
    products,
  };
};

export async function processTransactionRows(
  subdomain: string,
  models: IModels,
  rows: any[],
  userId: string,
): Promise<{ successRows: any[]; errorRows: any[] }> {
  const successRows: any[] = [];
  const errorRows: any[] = [];
  const currentSuccesRows: any[] = [];

  const relatedData = await getRelatedDatas(subdomain, models, rows);

  try {
    let currentPtrInfo: any;
    let currentTrDocs: any[] = [];
    let currentTr: ITransaction | null = null;
    let currentSuccessRows: any[] = [];

    const flushCurrentPtr = async () => {
      if (currentTr) {
        currentTrDocs.push(currentTr);
        currentTr = null;
      }

      if (!currentPtrInfo || !currentTrDocs.length) {
        currentTrDocs = [];
        currentSuccessRows = [];
        return;
      }

      const resultId = await savePtr(
        models,
        currentTrDocs,
        userId,
        currentPtrInfo,
      );

      currentSuccessRows.forEach((currentRow) => {
        successRows.push({ ...currentRow, _id: resultId });
      });

      currentTrDocs = [];
      currentSuccessRows = [];
    };

    for (const row of rows) {
      try {
        if (row.date) {
          await flushCurrentPtr();
          currentPtrInfo = await getPtrInfo(models, row);
          currentTrDocs = [];
        }

        if (row.journal) {
          if (!currentPtrInfo) {
            throw new Error('Transaction group date and number are required');
          }

          if (currentTr) {
            currentTrDocs.push(currentTr);
          }

          currentTr = await getTrDoc(models, row, currentPtrInfo, relatedData);
        }

        if (!currentPtrInfo || !currentTr) {
          continue;
        }

        const isSingleJournal = JOURNALS.SINGLES.includes(currentTr.journal);

        if (isSingleJournal && !row.journal) {
          continue;
        }

        if (currentTr)
          currentTr.details.push(await getDetailDoc(row, currentTr, relatedData));

        currentSuccessRows.push(row);
      } catch (e: any) {
        errorRows.push({
          ...row,
          error: e?.message || 'Failed to prepare row',
        });
      }
    }

    await flushCurrentPtr();

    return { successRows, errorRows };
  } catch (e: any) {
    return {
      successRows,
      errorRows: rows.map((r) => ({
        ...r,
        error: e?.message || 'Failed to process rows',
      })),
    };
  }
}
