import { fixNum, sendTRPCMessage } from 'erxes-api-shared/utils';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import {
  JOURNALS,
  TR_SIDES,
  TR_STATUSES,
} from '~/modules/accounting/@types/constants';
import { ITransaction } from '~/modules/accounting/@types/transaction';
import { activeCost } from '~/modules/accounting/utils/inventories';
import { getDealAccountingDate } from './dealDate';

type TLocationSide = 'source' | 'destination';

type TLocationValue = string | { _id?: string } | null | undefined;

type TDealProductData = {
  productId?: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  tickUsed?: boolean;
  currency?: string;
  branchId?: string;
  departmentId?: string;
  branch?: TLocationValue;
  department?: TLocationValue;
};

type TDealMovementConfig = {
  dateRule: 'alwaysNow' | 'syncedDateOrNow';
  responseFieldId?: string;
  sourceAccountId: string;
  destinationAccountId: string;
  defaultSourceBranchId?: string;
  defaultSourceDepartmentId?: string;
  defaultDestinationBranchId?: string;
  defaultDestinationDepartmentId?: string;
  dealLocationSide: TLocationSide;
  trStatus?: string;
};

type TDealForMovement = {
  _id: string;
  number?: string;
  name?: string;
  createdAt?: string | Date;
  stageChangedDate?: string | Date;
  closeDate?: string | Date;
  productsData?: TDealProductData[];
  branchId?: string;
  departmentId?: string;
  branch?: TLocationValue;
  department?: TLocationValue;
  branchIds?: string[];
  departmentIds?: string[];
  assignedUserIds?: string[];
};

type TMovementProductRow = {
  productData: TDealProductData;
  count: number;
  source: {
    branchId?: string;
    departmentId?: string;
  };
  destination: {
    branchId?: string;
    departmentId?: string;
  };
};

const getLocationId = (value: TLocationValue) => {
  if (!value) {
    return;
  }

  return typeof value === 'string' ? value : value._id;
};

const getLocationCostKey = ({
  branchId,
  departmentId,
}: {
  branchId?: string;
  departmentId?: string;
}) => JSON.stringify([branchId || '', departmentId || '']);

const getDealBranchId = (deal: TDealForMovement) =>
  deal.branchId || getLocationId(deal.branch) || deal.branchIds?.[0];

const getDealDepartmentId = (deal: TDealForMovement) =>
  deal.departmentId ||
  getLocationId(deal.department) ||
  deal.departmentIds?.[0];

const getProductLocation = ({
  config,
  deal,
  productData,
}: {
  config: TDealMovementConfig;
  deal: TDealForMovement;
  productData: TDealProductData;
}) => {
  const dealBranchId =
    productData.branchId ||
    getLocationId(productData.branch) ||
    getDealBranchId(deal);
  const dealDepartmentId =
    productData.departmentId ||
    getLocationId(productData.department) ||
    getDealDepartmentId(deal);

  const source = {
    branchId: config.defaultSourceBranchId,
    departmentId: config.defaultSourceDepartmentId,
  };
  const destination = {
    branchId: config.defaultDestinationBranchId,
    departmentId: config.defaultDestinationDepartmentId,
  };

  if (config.dealLocationSide === 'destination') {
    destination.branchId = dealBranchId || destination.branchId;
    destination.departmentId = dealDepartmentId || destination.departmentId;
  } else {
    source.branchId = dealBranchId || source.branchId;
    source.departmentId = dealDepartmentId || source.departmentId;
  }

  return { source, destination };
};

export const dealToMovementTrs = async ({
  subdomain,
  models,
  userId,
  deal,
  config,
  dateType,
}: {
  subdomain: string;
  models: IModels;
  userId?: string;
  deal: TDealForMovement;
  dateType?: string;
  config: TDealMovementConfig;
}) => {
  const actingUserId = userId || '';
  const activeProductsData = deal.productsData?.filter(
    (productData) =>
      productData.tickUsed &&
      productData.productId &&
      productData.quantity &&
      productData.quantity > 0,
  );

  if (!activeProductsData?.length) {
    return;
  }

  let mainId = nanoid();
  let ptrId = nanoid();
  let parentId = mainId;

  const [contentType, contentId] = ['sales:deal', deal._id];
  const number = deal.number;

  const oldTrs = await models.Transactions.find({
    contentType,
    contentId,
    journal: JOURNALS.INV_MOVE,
  }).lean();

  if (oldTrs?.length) {
    const oldMoveTr = oldTrs[0];
    mainId = oldMoveTr?._id || mainId;
    ptrId = oldMoveTr?.ptrId || ptrId;
    parentId = oldMoveTr?.parentId || parentId;
  }

  const firstLocation = getProductLocation({
    config,
    deal,
    productData: activeProductsData[0],
  });

  const date = getDealAccountingDate({
    deal,
    dateRule: config.dateRule,
    dateType,
    existingDate: oldTrs[0]?.date,
  });

  const movementRows = activeProductsData.map<TMovementProductRow>(
    (productData) => {
      const location = getProductLocation({ config, deal, productData });

      return {
        productData,
        count: productData.quantity || 0,
        source: location.source,
        destination: location.destination,
      };
    },
  );

  const costsByLocation = new Map<
    string,
    Record<string, { totalCost: number; unitCost: number; remainder: number }>
  >();
  const excludedTransactionIds = oldTrs
    .map((transaction) => transaction._id)
    .filter(Boolean);
  const rowsByLocation = new Map<string, TMovementProductRow[]>();

  for (const row of movementRows) {
    const key = getLocationCostKey(row.source);
    const rows = rowsByLocation.get(key) || [];

    rows.push(row);
    rowsByLocation.set(key, rows);
  }

  await Promise.all(
    [...rowsByLocation.entries()].map(async ([key, rows]) => {
      costsByLocation.set(
        key,
        await activeCost(
          models,
          config.sourceAccountId,
          rows[0].source.branchId,
          rows[0].source.departmentId,
          rows
            .map((row) => row.productData.productId)
            .filter((productId): productId is string => !!productId),
          excludedTransactionIds,
        ),
      );
    }),
  );

  const moveTrDoc: ITransaction = {
    _id: mainId,
    ptrId,
    parentId,
    number,
    date,
    description: deal.name,
    journal: JOURNALS.INV_MOVE,
    side: TR_SIDES.CREDIT,
    status: config.trStatus || TR_STATUSES.COMPLETE,
    followInfos: {
      moveInAccountId: config.destinationAccountId,
      moveInBranchId: firstLocation.destination.branchId,
      moveInDepartmentId: firstLocation.destination.departmentId,
    },
    branchId: firstLocation.source.branchId,
    departmentId: firstLocation.source.departmentId,
    assignedUserIds: deal.assignedUserIds,
    contentType,
    contentId,
    details: [],
  };

  const companyIds = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'relation',
    action: 'getRelationIds',
    input: {
      contentType,
      contentId,
      relatedContentType: 'core:company',
    },
    defaultValue: [],
  });

  if (companyIds?.length) {
    moveTrDoc.customerType = 'company';
    moveTrDoc.customerId = companyIds[0];
  } else {
    const customerIds = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'relation',
      action: 'getRelationIds',
      input: {
        contentType,
        contentId,
        relatedContentType: 'core:customer',
      },
      defaultValue: [],
    });

    moveTrDoc.customerType = 'customer';
    moveTrDoc.customerId = customerIds[0];
  }

  for (const row of movementRows) {
    const { productData, count, source, destination } = row;
    const cost = costsByLocation.get(getLocationCostKey(source))?.[
      productData.productId || ''
    ];
    const unitPrice = fixNum(cost?.unitCost ?? 0, 6);
    const amount = fixNum(count * unitPrice, 4);

    moveTrDoc.details.push({
      _id: nanoid(),
      accountId: config.sourceAccountId,
      amount,
      currency: productData.currency,
      productId: productData.productId,
      count,
      unitPrice,
      branchId: source.branchId,
      departmentId: source.departmentId,
      followInfos: {
        moveInBranchId: destination.branchId,
        moveInDepartmentId: destination.departmentId,
      },
    });
  }

  if (oldTrs.length) {
    await models.Transactions.updatePTransaction(
      parentId,
      [moveTrDoc],
      actingUserId,
      { skipAccountPermission: true },
    );
  } else {
    await models.Transactions.createPTransaction([moveTrDoc], actingUserId, {
      skipAccountPermission: true,
    });
  }
};
