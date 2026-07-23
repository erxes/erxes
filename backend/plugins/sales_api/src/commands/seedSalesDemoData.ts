import * as dotenv from 'dotenv';
import { existsSync } from 'fs';
import { Db, Document, MongoClient } from 'mongodb';
import { resolve } from 'path';

const envPaths = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '../../../.env'),
  resolve(__dirname, '../../../../../.env'),
];

for (const envPath of [...new Set(envPaths)]) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

const SEED_CODE = 'sales-demo-data-v2';
const MONGO_URL = process.env.MONGO_URL;
const DATABASE_NAME = process.env.SALES_DEMO_DB_NAME || process.env.DB_NAME;

if (!MONGO_URL) {
  throw new Error('Environment variable MONGO_URL is required.');
}

if (
  process.env.NODE_ENV === 'production' &&
  process.env.SALES_DEMO_ALLOW_PRODUCTION !== 'true'
) {
  throw new Error(
    'Refusing to seed sales demo data in production. Set SALES_DEMO_ALLOW_PRODUCTION=true to override.',
  );
}

type SeedDocument = Document & {
  _id: string;
};

type ProductCategoryDocument = SeedDocument & {
  name: string;
  code: string;
  order: string;
  status: 'active';
  createdAt: Date;
  updatedAt: Date;
};

type ProductDocument = SeedDocument & {
  name: string;
  shortName: string;
  code: string;
  categoryId: string;
  type: 'product' | 'service' | 'subscription';
  status: 'active';
  description: string;
  unitPrice: number;
  currency: 'USD';
  uom: 'unit';
  createdAt: Date;
  updatedAt: Date;
};

type CustomerDocument = SeedDocument & {
  state: 'customer';
  status: 'Active';
  firstName: string;
  lastName: string;
  primaryEmail: string;
  emails: string[];
  primaryPhone: string;
  phones: string[];
  position: string;
  description: string;
  searchText: string;
  ownerId?: string;
  createdAt: Date;
  updatedAt: Date;
};

type CompanyDocument = SeedDocument & {
  primaryName: string;
  names: string[];
  status: 'Active';
  industry: string[];
  website: string;
  primaryEmail: string;
  emails: string[];
  primaryPhone: string;
  phones: string[];
  employees: number;
  description: string;
  searchText: string;
  ownerId?: string;
  createdAt: Date;
  updatedAt: Date;
};

type BoardDocument = SeedDocument & {
  name: string;
  order: number;
  type: 'deal';
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
};

type PipelineDocument = SeedDocument & {
  name: string;
  boardId: string;
  status: 'active' | 'archived';
  visibility: 'public';
  order: number;
  type: 'deal';
  userId?: string;
  bgColor: string;
  createdAt: Date;
  updatedAt: Date;
};

type StageDocument = SeedDocument & {
  name: string;
  probability: string;
  pipelineId: string;
  status: 'active';
  visibility: 'public';
  order: number;
  type: 'deal';
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
};

type LabelDocument = SeedDocument & {
  name: string;
  colorCode: string;
  pipelineId: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
};

type DealProductData = SeedDocument & {
  productId: string;
  name: string;
  uom: 'unit';
  currency: 'USD';
  quantity: number;
  unitPrice: number;
  globalUnitPrice: number;
  unitPricePercent: number;
  discountPercent: number;
  discount: number;
  amount: number;
  tickUsed: boolean;
};

type DealDocument = SeedDocument & {
  name: string;
  order: number;
  description: string;
  stageId: string;
  initialStageId: string;
  stageChangedDate: Date;
  startDate: Date;
  closeDate: Date;
  labelIds: string[];
  priority: 'Critical' | 'High' | 'Normal' | 'Low';
  status: 'active' | 'archived';
  searchText: string;
  assignedUserIds: string[];
  watchedUserIds: string[];
  userId?: string;
  brokerType: 'customer' | 'company';
  brokerId: string;
  productsData: DealProductData[];
  totalAmount: number;
  unUsedTotalAmount: number;
  bothTotalAmount: number;
  extraData: { seedCode: string };
  createdAt: Date;
  updatedAt: Date;
};

type ChecklistDocument = SeedDocument & {
  contentType: 'deal';
  contentTypeId: string;
  title: string;
  order: number;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
};

type ChecklistItemDocument = SeedDocument & {
  checklistId: string;
  content: string;
  isChecked: boolean;
  order: number;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
};

type ConformityDocument = SeedDocument & {
  mainType: 'sales:deal';
  mainTypeId: string;
  relType: 'core:customer' | 'core:company';
  relTypeId: string;
};

type PosDocument = SeedDocument & {
  name: string;
  description: string;
  userId?: string;
  createdAt: Date;
  token: string;
  isOnline: boolean;
  onServer: boolean;
  paymentTypes: Array<{ type: string; name: string }>;
  allowTypes: string[];
  isCheckRemainder: boolean;
  checkExcludeCategoryIds: string[];
  saveRemainder: boolean;
  banFractions: boolean;
  status: 'active';
};

type ProductGroupDocument = SeedDocument & {
  name: string;
  description: string;
  posId: string;
  categoryIds: string[];
  excludedCategoryIds: string[];
  excludedProductIds: string[];
};

type PosSlotDocument = SeedDocument & {
  name: string;
  code: string;
  posId: string;
  option: { capacity: number; zone: string };
};

type CoverDocument = SeedDocument & {
  posToken: string;
  status: 'new' | 'closed';
  beginDate: Date;
  endDate?: Date;
  description: string;
  userId?: string;
  details: Array<{
    _id: string;
    paidType: string;
    paidSummary: Array<{
      _id: string;
      kind: string;
      kindOfVal: number;
      value: number;
      amount: number;
    }>;
  }>;
  createdAt: Date;
  createdBy?: string;
  modifiedAt: Date;
  modifiedBy?: string;
  note: string;
};

type PosOrderItem = SeedDocument & {
  createdAt: Date;
  productId: string;
  count: number;
  unitPrice: number;
  discountAmount: number;
  discountPercent: number;
  orderId: string;
  isPackage: boolean;
  isTake: boolean;
  isInner: boolean;
  description: string;
};

type PosOrderDocument = SeedDocument & {
  createdAt: Date;
  status:
    | 'new'
    | 'doing'
    | 'reDoing'
    | 'done'
    | 'complete'
    | 'pending'
    | 'return';
  paidDate?: Date;
  dueDate?: Date;
  number: string;
  customerId: string;
  customerType: 'customer';
  brokerId: string;
  brokerType: 'customer';
  cashAmount: number;
  mobileAmount: number;
  mobileAmounts: Array<{ _id: string; amount: number }>;
  paidAmounts: Array<{
    _id: string;
    type: 'cash' | 'card' | 'mobile';
    amount: number;
    info: { reference: string };
  }>;
  totalAmount: number;
  finalAmount: number;
  shouldPrintEbarimt: boolean;
  printedEbarimt: boolean;
  type: 'eat' | 'take' | 'delivery';
  userId?: string;
  items: PosOrderItem[];
  posToken: string;
  posId: string;
  syncedErkhet: boolean;
  deliveryInfo?: { address: string; phone: string };
  description: string;
  isPre: boolean;
  origin: 'pos' | 'kiosk' | 'online';
  convertDealId?: string;
  returnInfo?: {
    cashAmount: number;
    paidAmounts: Array<{ _id: string; type: string; amount: number }>;
    returnAt: Date;
    returnBy?: string;
    description: string;
  };
  subscriptionInfo?: { subscriptionId: string; status: 'active' | 'closed' };
  closeDate?: Date;
  extraInfo: { seedCode: string; slotCode: string };
};

type UserDocument = SeedDocument;

type SeedResult = {
  collectionName: string;
  documents: number;
  inserted: number;
  updated: number;
};

const client = new MongoClient(MONGO_URL);

const addDays = (date: Date, days: number) => {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
};

const atDay = (date: Date, days: number, hour: number) => {
  const value = addDays(date, days);
  value.setHours(hour, 0, 0, 0);
  return value;
};

const select = <T>(items: T[], index: number): T => {
  return items[index % items.length];
};

const upsertDocuments = async (
  db: Db,
  collectionName: string,
  documents: SeedDocument[],
): Promise<SeedResult> => {
  if (!documents.length) {
    return {
      collectionName,
      documents: 0,
      inserted: 0,
      updated: 0,
    };
  }

  const result = await db.collection<SeedDocument>(collectionName).bulkWrite(
    documents.map((document) => ({
      updateOne: {
        filter: { _id: document._id },
        update: { $set: document },
        upsert: true,
      },
    })),
    { ordered: false },
  );

  return {
    collectionName,
    documents: documents.length,
    inserted: result.upsertedCount,
    updated: result.modifiedCount,
  };
};

const logResult = ({
  collectionName,
  documents,
  inserted,
  updated,
}: SeedResult) => {
  process.stdout.write(
    `${collectionName}: ${documents} demo documents (${inserted} inserted, ${updated} updated)\n`,
  );
};

const productCategories: Array<{ name: string; code: string }> = [
  { name: 'Professional Services', code: 'DEMO-SERVICES' },
  { name: 'Subscription Plans', code: 'DEMO-SUBSCRIPTIONS' },
  { name: 'POS Merchandise', code: 'DEMO-MERCHANDISE' },
  { name: 'Training & Support', code: 'DEMO-TRAINING' },
];

const firstNames = [
  'Avery',
  'Jordan',
  'Taylor',
  'Morgan',
  'Riley',
  'Casey',
  'Parker',
  'Quinn',
  'Hayden',
  'Emerson',
  'Cameron',
  'Rowan',
];

const lastNames = [
  'Adams',
  'Bennett',
  'Chen',
  'Diaz',
  'Ellis',
  'Foster',
  'Garcia',
  'Hayes',
  'Ibrahim',
  'Johnson',
];

const companyPrefixes = [
  'Northwind',
  'Summit',
  'Brightline',
  'Cedar',
  'Vertex',
  'Harbor',
  'Atlas',
  'Evergreen',
  'Bluebird',
  'Cobalt',
];

const companySuffixes = [
  'Analytics',
  'Foods',
  'Logistics',
  'Health',
  'Works',
  'Systems',
  'Retail',
  'Studios',
  'Labs',
  'Partners',
];

const productNames = [
  'Implementation Sprint',
  'Sales Workspace License',
  'Operations Dashboard',
  'Customer Success Bundle',
  'Point of Sale Terminal',
  'Support Retainer',
  'Training Workshop',
  'Data Migration Package',
  'Analytics Add-on',
  'Team Expansion License',
  'Priority Support',
  'Integration Connector',
];

const boardDefinitions = [
  { name: 'New Business', color: '#2563EB' },
  { name: 'Customer Growth', color: '#16A34A' },
  { name: 'Partner Channel', color: '#EA580C' },
];

const pipelineDefinitions = [
  { name: 'Enterprise Accounts', color: '#DBEAFE' },
  { name: 'Mid-Market Accounts', color: '#E0F2FE' },
  { name: 'Renewals', color: '#DCFCE7' },
  { name: 'Upsell Opportunities', color: '#ECFCCB' },
  { name: 'Reseller Partners', color: '#FFEDD5' },
  { name: 'Referral Partners', color: '#FDE68A' },
];

const stageDefinitions = [
  { name: 'Prospecting', probability: '10%' },
  { name: 'Qualified', probability: '30%' },
  { name: 'Discovery', probability: '50%' },
  { name: 'Proposal Sent', probability: '60%' },
  { name: 'Negotiation', probability: '80%' },
  { name: 'Won', probability: 'Won' },
  { name: 'Lost', probability: 'Lost' },
];

const labelDefinitions = [
  { name: 'Enterprise', colorCode: '#2563EB' },
  { name: 'Expansion', colorCode: '#16A34A' },
  { name: 'At Risk', colorCode: '#DC2626' },
  { name: 'High Value', colorCode: '#9333EA' },
  { name: 'Partner Led', colorCode: '#EA580C' },
  { name: 'Needs Review', colorCode: '#0891B2' },
];

const priorityValues: Array<DealDocument['priority']> = [
  'Critical',
  'High',
  'Normal',
  'Low',
];

const orderStatuses: PosOrderDocument['status'][] = [
  'new',
  'doing',
  'reDoing',
  'done',
  'complete',
  'pending',
  'return',
];

const seedSalesDemoData = async () => {
  await client.connect();

  const databaseName = DATABASE_NAME || client.db().databaseName;
  const db = client.db(databaseName);
  const now = new Date();
  const existingUser = await db
    .collection<UserDocument>('users')
    .findOne({}, { projection: { _id: 1 } });
  const userId = existingUser?._id;

  const categories = productCategories.map<ProductCategoryDocument>(
    (category, index) => ({
      _id: `${SEED_CODE}:category:${index + 1}`,
      ...category,
      order: `${index + 1}`,
      status: 'active',
      createdAt: addDays(now, -180),
      updatedAt: now,
    }),
  );

  const products = Array.from({ length: 48 }, (_, index): ProductDocument => {
    const category = select(categories, index);
    const type =
      index % 7 === 0
        ? 'subscription'
        : index % 4 === 0
        ? 'service'
        : 'product';
    const unitPrice = 25 + ((index * 37) % 18) * 25;

    return {
      _id: `${SEED_CODE}:product:${index + 1}`,
      name: `${select(productNames, index)} ${
        Math.floor(index / productNames.length) + 1
      }`,
      shortName: select(productNames, index),
      code: `DEMO-${String(index + 1).padStart(3, '0')}`,
      categoryId: category._id,
      type,
      status: 'active',
      description: `Demo ${type} for sales and POS development.`,
      unitPrice,
      currency: 'USD',
      uom: 'unit',
      createdAt: addDays(now, -160 + index),
      updatedAt: now,
    };
  });

  const customers = Array.from(
    { length: 120 },
    (_, index): CustomerDocument => {
      const firstName = select(firstNames, index);
      const lastName = select(lastNames, Math.floor(index / firstNames.length));
      const fullName = `${firstName} ${lastName}`;
      const email = `demo.customer.${String(index + 1).padStart(
        3,
        '0',
      )}@example.test`;
      const phone = `+1555${String(1000000 + index).slice(-7)}`;

      return {
        _id: `${SEED_CODE}:customer:${index + 1}`,
        state: 'customer',
        status: 'Active',
        firstName,
        lastName,
        primaryEmail: email,
        emails: [email],
        primaryPhone: phone,
        phones: [phone],
        position:
          index % 3 === 0 ? 'Director' : index % 3 === 1 ? 'Manager' : 'Owner',
        description: `Demo contact ${fullName} for sales development.`,
        searchText: `${fullName} ${email} ${phone}`,
        ownerId: userId,
        createdAt: addDays(now, -150 + index),
        updatedAt: now,
      };
    },
  );

  const companies = Array.from({ length: 30 }, (_, index): CompanyDocument => {
    const primaryName = `${select(companyPrefixes, index)} ${select(
      companySuffixes,
      index * 3,
    )}`;
    const slug = primaryName.toLowerCase().replace(/\s+/g, '-');
    const email = `hello@${slug}.example.test`;
    const phone = `+1555${String(2000000 + index).slice(-7)}`;

    return {
      _id: `${SEED_CODE}:company:${index + 1}`,
      primaryName,
      names: [primaryName],
      status: 'Active',
      industry: [
        select(['Technology', 'Retail', 'Services', 'Logistics'], index),
      ],
      website: `https://${slug}.example.test`,
      primaryEmail: email,
      emails: [email],
      primaryPhone: phone,
      phones: [phone],
      employees: 25 + index * 17,
      description: `Demo company ${primaryName} for sales development.`,
      searchText: `${primaryName} ${email} ${phone}`,
      ownerId: userId,
      createdAt: addDays(now, -145 + index),
      updatedAt: now,
    };
  });

  const boards = boardDefinitions.map<BoardDocument>((board, index) => ({
    _id: `${SEED_CODE}:board:${index + 1}`,
    name: board.name,
    order: (index + 1) * 10,
    type: 'deal',
    userId,
    createdAt: addDays(now, -120 + index),
    updatedAt: now,
  }));

  const pipelines = pipelineDefinitions.map<PipelineDocument>(
    (pipeline, index) => ({
      _id: `${SEED_CODE}:pipeline:${index + 1}`,
      name: pipeline.name,
      boardId: select(boards, Math.floor(index / 2))._id,
      status: 'active',
      visibility: 'public',
      order: (index + 1) * 10,
      type: 'deal',
      userId,
      bgColor: pipeline.color,
      createdAt: addDays(now, -110 + index),
      updatedAt: now,
    }),
  );

  const stages = pipelines.flatMap((pipeline, pipelineIndex) =>
    stageDefinitions.map<StageDocument>((stage, stageIndex) => ({
      _id: `${SEED_CODE}:stage:${pipelineIndex + 1}:${stageIndex + 1}`,
      name: stage.name,
      probability: stage.probability,
      pipelineId: pipeline._id,
      status: 'active',
      visibility: 'public',
      order: (stageIndex + 1) * 10,
      type: 'deal',
      userId,
      createdAt: addDays(now, -100 + stageIndex),
      updatedAt: now,
    })),
  );

  const labels = pipelines.flatMap((pipeline, pipelineIndex) =>
    labelDefinitions.map<LabelDocument>((label, labelIndex) => ({
      _id: `${SEED_CODE}:label:${pipelineIndex + 1}:${labelIndex + 1}`,
      ...label,
      pipelineId: pipeline._id,
      userId,
      createdAt: addDays(now, -95 + labelIndex),
      updatedAt: now,
    })),
  );

  const deals = Array.from({ length: 336 }, (_, index): DealDocument => {
    const pipelineIndex = index % pipelines.length;
    const pipelineStages = stages.filter(
      (stage) => stage.pipelineId === pipelines[pipelineIndex]._id,
    );
    const stage = select(pipelineStages, Math.floor(index / pipelines.length));
    const pipelineLabels = labels.filter(
      (label) => label.pipelineId === pipelines[pipelineIndex]._id,
    );
    const customer = select(customers, index * 3);
    const company = select(companies, index * 5);
    const primaryProduct = select(products, index * 7);
    const secondaryProduct = select(products, index * 11 + 1);
    const productRows = [primaryProduct, secondaryProduct].map<DealProductData>(
      (product, productIndex) => {
        const quantity = 1 + ((index + productIndex) % 4);
        const discountPercent = (index + productIndex) % 5 === 0 ? 10 : 0;
        const undiscountedAmount = quantity * product.unitPrice;
        const discount = (undiscountedAmount * discountPercent) / 100;

        return {
          _id: `${SEED_CODE}:deal-product:${index + 1}:${productIndex + 1}`,
          productId: product._id,
          name: product.name,
          uom: 'unit',
          currency: 'USD',
          quantity,
          unitPrice: product.unitPrice,
          globalUnitPrice: product.unitPrice,
          unitPricePercent: 0,
          discountPercent,
          discount,
          amount: undiscountedAmount - discount,
          tickUsed: (index + productIndex) % 6 !== 0,
        };
      },
    );
    const totalAmount = productRows.reduce(
      (total, product) => total + product.amount,
      0,
    );
    const unusedTotalAmount = productRows
      .filter((product) => !product.tickUsed)
      .reduce((total, product) => total + product.amount, 0);
    const isCompanyDeal = index % 3 !== 0;
    const entityName = isCompanyDeal
      ? company.primaryName
      : `${customer.firstName} ${customer.lastName}`;
    const name = `${select(
      [
        'Expansion',
        'Renewal',
        'Implementation',
        'Discovery',
        'Rollout',
        'Upgrade',
      ],
      index,
    )} for ${entityName}`;
    const createdAt = atDay(now, -150 + (index % 145), 9 + (index % 8));

    return {
      _id: `${SEED_CODE}:deal:${index + 1}`,
      name,
      order: (index + 1) * 10,
      description: `Demo ${pipelines[
        pipelineIndex
      ].name.toLowerCase()} opportunity for ${entityName}.`,
      stageId: stage._id,
      initialStageId: select(pipelineStages, 0)._id,
      stageChangedDate: addDays(createdAt, index % 12),
      startDate: createdAt,
      closeDate: addDays(now, -45 + (index % 120)),
      labelIds: [
        select(pipelineLabels, index)._id,
        ...(index % 4 === 0 ? [select(pipelineLabels, index + 2)._id] : []),
      ],
      priority: select(priorityValues, index),
      status: index % 19 === 0 ? 'archived' : 'active',
      searchText: `${name} ${entityName} ${pipelines[pipelineIndex].name}`,
      assignedUserIds: userId ? [userId] : [],
      watchedUserIds: userId && index % 2 === 0 ? [userId] : [],
      userId,
      brokerType: isCompanyDeal ? 'company' : 'customer',
      brokerId: isCompanyDeal ? company._id : customer._id,
      productsData: productRows,
      totalAmount,
      unUsedTotalAmount: unusedTotalAmount,
      bothTotalAmount: totalAmount,
      extraData: { seedCode: SEED_CODE },
      createdAt,
      updatedAt: now,
    };
  });

  const conformities = deals.flatMap((deal, index) => {
    const customer = select(customers, index * 3);
    const company = select(companies, index * 5);
    const related: ConformityDocument[] = [
      {
        _id: `${SEED_CODE}:conformity:customer:${index + 1}`,
        mainType: 'sales:deal',
        mainTypeId: deal._id,
        relType: 'core:customer',
        relTypeId: customer._id,
      },
    ];

    if (index % 3 !== 0) {
      related.push({
        _id: `${SEED_CODE}:conformity:company:${index + 1}`,
        mainType: 'sales:deal',
        mainTypeId: deal._id,
        relType: 'core:company',
        relTypeId: company._id,
      });
    }

    return related;
  });

  const checklists = deals
    .filter((_, index) => index % 3 === 0)
    .map<ChecklistDocument>((deal, index) => ({
      _id: `${SEED_CODE}:checklist:${index + 1}`,
      contentType: 'deal',
      contentTypeId: deal._id,
      title: `Qualification checklist for ${deal.name}`,
      order: (index + 1) * 10,
      userId,
      createdAt: deal.createdAt,
      updatedAt: now,
    }));

  const checklistItems = checklists.flatMap((checklist, checklistIndex) =>
    [
      'Confirm need',
      'Validate budget',
      'Schedule follow-up',
      'Document outcome',
    ].map<ChecklistItemDocument>((content, itemIndex) => ({
      _id: `${SEED_CODE}:checklist-item:${checklistIndex + 1}:${itemIndex + 1}`,
      checklistId: checklist._id,
      content,
      isChecked: (checklistIndex + itemIndex) % 3 !== 0,
      order: (itemIndex + 1) * 10,
      userId,
      createdAt: checklist.createdAt,
      updatedAt: now,
    })),
  );

  const posLocations = [
    'Downtown Store',
    'Airport Kiosk',
    'Market Hall',
    'Event Counter',
  ].map<PosDocument>((name, index) => ({
    _id: `${SEED_CODE}:pos:${index + 1}`,
    name,
    description: `Demo POS location for ${name}.`,
    userId,
    createdAt: addDays(now, -90 + index),
    token: `${SEED_CODE}:pos-token:${index + 1}`,
    isOnline: true,
    onServer: true,
    paymentTypes: [
      { type: 'cash', name: 'Cash' },
      { type: 'card', name: 'Card' },
      { type: 'mobile', name: 'Mobile payment' },
    ],
    allowTypes: ['eat', 'take', 'delivery'],
    isCheckRemainder: false,
    checkExcludeCategoryIds: [],
    saveRemainder: false,
    banFractions: false,
    status: 'active',
  }));

  const productGroups = posLocations.flatMap((pos, posIndex) =>
    ['Services', 'Subscriptions', 'Merchandise'].map<ProductGroupDocument>(
      (name, groupIndex) => ({
        _id: `${SEED_CODE}:product-group:${posIndex + 1}:${groupIndex + 1}`,
        name,
        description: `${name} available at ${pos.name}.`,
        posId: pos._id,
        categoryIds: [select(categories, groupIndex + posIndex)._id],
        excludedCategoryIds: [],
        excludedProductIds: [],
      }),
    ),
  );

  const posSlots = posLocations.flatMap((pos, posIndex) =>
    ['A1', 'A2', 'B1', 'B2'].map<PosSlotDocument>((code, slotIndex) => ({
      _id: `${SEED_CODE}:pos-slot:${posIndex + 1}:${slotIndex + 1}`,
      name: `Table ${code}`,
      code,
      posId: pos._id,
      option: {
        capacity: 2 + ((posIndex + slotIndex) % 4),
        zone: slotIndex < 2 ? 'Main' : 'Patio',
      },
    })),
  );

  const covers = posLocations.flatMap((pos, posIndex) =>
    Array.from({ length: 10 }, (_, coverIndex): CoverDocument => {
      const beginDate = atDay(now, -60 + coverIndex * 4 + posIndex, 8);
      const isClosed = coverIndex % 3 !== 0;

      return {
        _id: `${SEED_CODE}:cover:${posIndex + 1}:${coverIndex + 1}`,
        posToken: pos.token,
        status: isClosed ? 'closed' : 'new',
        beginDate,
        ...(isClosed ? { endDate: addDays(beginDate, 1) } : {}),
        description: `Demo cash cover ${coverIndex + 1} for ${pos.name}.`,
        userId,
        details: [
          {
            _id: `${SEED_CODE}:cover-detail:${posIndex + 1}:${coverIndex + 1}`,
            paidType: 'cash',
            paidSummary: [
              {
                _id: `${SEED_CODE}:cover-summary:${posIndex + 1}:${
                  coverIndex + 1
                }`,
                kind: 'opening-balance',
                kindOfVal: 1,
                value: 200,
                amount: 200 + coverIndex * 20,
              },
            ],
          },
        ],
        createdAt: beginDate,
        createdBy: userId,
        modifiedAt: now,
        modifiedBy: userId,
        note: 'Demo cash cover.',
      };
    }),
  );

  const posOrders = Array.from(
    { length: 360 },
    (_, index): PosOrderDocument => {
      const pos = select(posLocations, index);
      const customer = select(customers, index * 5);
      const status = select(orderStatuses, index);
      const createdAt = atDay(now, -120 + (index % 118), 8 + (index % 10));
      const orderId = `${SEED_CODE}:pos-order:${index + 1}`;
      const items = Array.from(
        { length: 1 + (index % 3) },
        (_, itemIndex): PosOrderItem => {
          const product = select(products, index * 3 + itemIndex);
          const count = 1 + ((index + itemIndex) % 3);
          const discountPercent = (index + itemIndex) % 8 === 0 ? 15 : 0;

          return {
            _id: `${SEED_CODE}:pos-order-item:${index + 1}:${itemIndex + 1}`,
            createdAt,
            productId: product._id,
            count,
            unitPrice: product.unitPrice,
            discountAmount: (product.unitPrice * count * discountPercent) / 100,
            discountPercent,
            orderId,
            isPackage: false,
            isTake: index % 3 === 1,
            isInner: false,
            description: `Demo ${product.name} line item.`,
          };
        },
      );
      const totalAmount = items.reduce(
        (total, item) => total + item.unitPrice * item.count,
        0,
      );
      const finalAmount = items.reduce(
        (total, item) =>
          total + item.unitPrice * item.count - item.discountAmount,
        0,
      );
      const paymentType = select(['cash', 'card', 'mobile'] as const, index);
      const isPaid = ['done', 'complete', 'return'].includes(status);

      return {
        _id: orderId,
        createdAt,
        status,
        ...(isPaid ? { paidDate: addDays(createdAt, 1) } : {}),
        ...(status === 'pending' ? { dueDate: addDays(createdAt, 7) } : {}),
        number: `DEMO-${String(index + 1).padStart(5, '0')}`,
        customerId: customer._id,
        customerType: 'customer',
        brokerId: customer._id,
        brokerType: 'customer',
        cashAmount: paymentType === 'cash' ? finalAmount : 0,
        mobileAmount: paymentType === 'mobile' ? finalAmount : 0,
        mobileAmounts:
          paymentType === 'mobile'
            ? [{ _id: `${orderId}:mobile`, amount: finalAmount }]
            : [],
        paidAmounts: isPaid
          ? [
              {
                _id: `${orderId}:payment`,
                type: paymentType,
                amount: finalAmount,
                info: { reference: `DEMO-PAY-${index + 1}` },
              },
            ]
          : [],
        totalAmount,
        finalAmount,
        shouldPrintEbarimt: index % 2 === 0,
        printedEbarimt: isPaid && index % 4 === 0,
        type: select(['eat', 'take', 'delivery'] as const, index),
        userId,
        items,
        posToken: pos.token,
        posId: pos._id,
        syncedErkhet: isPaid && index % 5 === 0,
        ...(index % 3 === 2
          ? {
              deliveryInfo: {
                address: `${100 + (index % 50)} Demo Avenue`,
                phone: customer.primaryPhone,
              },
            }
          : {}),
        description: `Demo ${status} order for ${customer.firstName} ${customer.lastName}.`,
        isPre: index % 9 === 0,
        origin: select(['pos', 'kiosk', 'online'] as const, index),
        ...(index % 11 === 0
          ? { convertDealId: select(deals, index)._id }
          : {}),
        ...(status === 'return'
          ? {
              returnInfo: {
                cashAmount: paymentType === 'cash' ? finalAmount : 0,
                paidAmounts: [
                  {
                    _id: `${orderId}:return-payment`,
                    type: paymentType,
                    amount: finalAmount,
                  },
                ],
                returnAt: addDays(createdAt, 2),
                returnBy: userId,
                description: 'Demo returned order.',
              },
            }
          : {}),
        ...(index % 13 === 0
          ? {
              subscriptionInfo: {
                subscriptionId: `${SEED_CODE}:subscription:${index + 1}`,
                status: index % 26 === 0 ? 'closed' : 'active',
              },
              closeDate: addDays(createdAt, 30),
            }
          : {}),
        extraInfo: {
          seedCode: SEED_CODE,
          slotCode: select(
            posSlots.filter((slot) => slot.posId === pos._id),
            index,
          ).code,
        },
      };
    },
  );

  await db
    .collection<LabelDocument>('sales_pipeline_labels')
    .createIndex({ pipelineId: 1, name: 1, colorCode: 1 }, { unique: true });
  await db.collection<ConformityDocument>('conformities').createIndex({
    mainType: 1,
    mainTypeId: 1,
    relType: 1,
    relTypeId: 1,
  });

  process.stdout.write(
    `Seeding ${databaseName} with ${SEED_CODE} at ${now.toISOString()}\n`,
  );

  const results = await Promise.all([
    upsertDocuments(db, 'product_categories', categories),
    upsertDocuments(db, 'products', products),
    upsertDocuments(db, 'customers', customers),
    upsertDocuments(db, 'companies', companies),
    upsertDocuments(db, 'sales_boards', boards),
    upsertDocuments(db, 'sales_pipelines', pipelines),
    upsertDocuments(db, 'sales_stages', stages),
    upsertDocuments(db, 'sales_pipeline_labels', labels),
    upsertDocuments(db, 'deals', deals),
    upsertDocuments(db, 'conformities', conformities),
    upsertDocuments(db, 'sales_checklists', checklists),
    upsertDocuments(db, 'sales_checklist_items', checklistItems),
    upsertDocuments(db, 'pos', posLocations),
    upsertDocuments(db, 'product_groups', productGroups),
    upsertDocuments(db, 'pos_slots', posSlots),
    upsertDocuments(db, 'pos_covers', covers),
    upsertDocuments(db, 'pos_orders', posOrders),
  ]);

  results.forEach(logResult);
  process.stdout.write('Sales demo data seed completed.\n');
};

seedSalesDemoData()
  .catch((error: Error) => {
    process.stderr.write(`Sales demo data seed failed: ${error.message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.close();
  });
