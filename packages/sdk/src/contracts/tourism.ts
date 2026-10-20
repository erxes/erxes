import * as z from 'zod';
import { defineContract } from './define';

const PageInfo = z.object({
  hasNextPage: z.boolean().nullable(),
  hasPreviousPage: z.boolean().nullable(),
  startCursor: z.string().nullable(),
  endCursor: z.string().nullable(),
});

const page = <T extends z.ZodType>(item: T) =>
  z.object({
    list: z.array(item).nullable(),
    totalCount: z.number().nullable(),
    pageInfo: PageInfo.nullable(),
  });

const Tour = z.object({
  _id: z.string(),
  branchId: z.string().nullable(),
  language: z.string().nullable(),
  name: z.string().nullable(),
  refNumber: z.string().nullable(),
  content: z.string().nullable(),
  duration: z.number().nullable(),
  itineraryId: z.string().nullable(),
  dateType: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  availableFrom: z.string().nullable(),
  availableTo: z.string().nullable(),
  groupSize: z.number().nullable(),
  status: z.string().nullable(),
  date_status: z.string().nullable(),
  cost: z.number().nullable(),
  startingPrice: z.number().nullable(),
  categoryIds: z.array(z.string()).nullable(),
  images: z.array(z.string()).nullable(),
  viewCount: z.number().nullable(),
  createdAt: z.string().nullable(),
  modifiedAt: z.string().nullable(),
});

const Itinerary = z.object({
  _id: z.string(),
  branchId: z.string().nullable(),
  language: z.string().nullable(),
  name: z.string().nullable(),
  content: z.string().nullable(),
  duration: z.number().nullable(),
  totalCost: z.number().nullable(),
  images: z.array(z.string()).nullable(),
  status: z.string().nullable(),
  color: z.string().nullable(),
  foodCost: z.number().nullable(),
  gasCost: z.number().nullable(),
  driverCost: z.number().nullable(),
  guideCost: z.number().nullable(),
  guideCostExtra: z.number().nullable(),
  createdAt: z.string().nullable(),
  modifiedAt: z.string().nullable(),
});

const Element = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  quick: z.boolean().nullable(),
  orderCheck: z.boolean().nullable(),
  visibleName: z.boolean().nullable(),
  icon: z.string().nullable(),
  content: z.string().nullable(),
  note: z.string().nullable(),
  startTime: z.string().nullable(),
  duration: z.number().nullable(),
  cost: z.number().nullable(),
  images: z.array(z.string()).nullable(),
  categories: z.array(z.string()).nullable(),
  itineraryId: z.string().nullable(),
  branchId: z.string().nullable(),
  language: z.string().nullable(),
  createdAt: z.string().nullable(),
  modifiedAt: z.string().nullable(),
});

const ElementCategory = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  parentId: z.string().nullable(),
});

const BmsOrder = z.object({
  _id: z.string(),
  branchId: z.string().nullable(),
  customerId: z.string().nullable(),
  tourId: z.string().nullable(),
  amount: z.number().nullable(),
  status: z.string().nullable(),
  note: z.string().nullable(),
  internalNote: z.string().nullable(),
  numberOfPeople: z.number().nullable(),
  type: z.string().nullable(),
  additionalCustomers: z.array(z.string()).nullable(),
  isChild: z.boolean().nullable(),
  parent: z.string().nullable(),
  createdAt: z.string().nullable(),
});

const BmsBranch = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  language: z.string().nullable(),
  languages: z.array(z.string()).nullable(),
  prepaid: z.boolean().nullable(),
  prepaidPercent: z.number().nullable(),
  generalManagerIds: z.array(z.string()).nullable(),
  managerIds: z.array(z.string()).nullable(),
  createdAt: z.string().nullable(),
});

const PricingOption = z
  .object({
    _id: z.string().optional(),
    title: z.string().min(1),
    minPersons: z.number().int().min(1),
    maxPersons: z.number().int().min(1).optional(),
    prices: z
      .array(
        z
          .object({
            type: z.enum(['adult', 'child', 'infant']),
            price: z.number().min(0.01),
          })
          .strict(),
      )
      .min(1),
    accommodationType: z.string().optional(),
    singleSupplement: z.number().min(0).optional(),
    note: z.string().optional(),
  })
  .strict();

const ids = z.array(z.string().min(1)).min(1);

const listFilters = {
  branchId: z.string().optional(),
  language: z.string().optional(),
  limit: z.number().int().min(1).max(50).optional(),
  cursor: z.string().optional(),
};

const listArgs = {
  branchId: 'String',
  language: 'String',
  limit: 'Int',
  cursor: 'String',
};

const tourFields = {
  branchId: z.string().optional(),
  language: z.string().optional(),
  name: z.string().optional(),
  content: z.string().optional(),
  itineraryId: z.string().optional(),
  dateType: z.enum(['fixed', 'flexible']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  availableFrom: z.string().optional(),
  availableTo: z.string().optional(),
  groupSize: z.number().int().optional(),
  duration: z.number().int().optional(),
  advancePercent: z.number().optional(),
  advanceCheck: z.boolean().optional(),
  status: z.string().optional(),
  cost: z.number().optional(),
  categoryIds: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
};

const tourArgs = {
  branchId: 'String',
  language: 'String',
  name: 'String',
  content: 'String',
  itineraryId: 'String',
  dateType: 'DATE_TYPE',
  startDate: 'Date',
  endDate: 'Date',
  availableFrom: 'Date',
  availableTo: 'Date',
  groupSize: 'Int',
  duration: 'Int',
  advancePercent: 'Float',
  advanceCheck: 'Boolean',
  status: 'String',
  cost: 'Float',
  categoryIds: '[String]',
  images: '[String]',
};

const itineraryFields = {
  branchId: z.string().optional(),
  language: z.string().optional(),
  name: z.string().optional(),
  content: z.string().optional(),
  duration: z.number().int().optional(),
  totalCost: z.number().optional(),
  images: z.array(z.string()).optional(),
  status: z.enum(['published', 'draft']).optional(),
  color: z.string().optional(),
  foodCost: z.number().optional(),
  gasCost: z.number().optional(),
  driverCost: z.number().optional(),
  guideCost: z.number().optional(),
  guideCostExtra: z.number().optional(),
};

const itineraryArgs = {
  branchId: 'String',
  language: 'String',
  name: 'String',
  content: 'String',
  duration: 'Int',
  totalCost: 'Float',
  images: '[String]',
  status: 'STATUS',
  color: 'String',
  foodCost: 'Float',
  gasCost: 'Float',
  driverCost: 'Float',
  guideCost: 'Float',
  guideCostExtra: 'Float',
};

const elementFields = {
  name: z.string().optional(),
  content: z.string().optional(),
  note: z.string().optional(),
  startTime: z.string().optional(),
  duration: z.number().int().optional(),
  cost: z.number().optional(),
  images: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  itineraryId: z.string().optional(),
  branchId: z.string().optional(),
  language: z.string().optional(),
  icon: z.string().optional(),
  visibleName: z.boolean().optional(),
  quick: z.boolean().optional(),
  orderCheck: z.boolean().optional(),
};

const elementArgs = {
  name: 'String',
  content: 'String',
  note: 'String',
  startTime: 'String',
  duration: 'Int',
  cost: 'Float',
  images: '[String]',
  categories: '[String]',
  itineraryId: 'String',
  branchId: 'String',
  language: 'String',
  icon: 'String',
  visibleName: 'Boolean',
  quick: 'Boolean',
  orderCheck: 'Boolean',
};

const orderFields = {
  branchId: z.string().optional(),
  customerId: z.string().optional(),
  tourId: z.string().optional(),
  amount: z.number().optional(),
  status: z.string().optional(),
  note: z.string().optional(),
  internalNote: z.string().optional(),
  numberOfPeople: z.number().int().optional(),
  type: z.string().optional(),
  additionalCustomers: z.array(z.string()).optional(),
  isChild: z.boolean().optional(),
  parent: z.string().optional(),
};

export const tourismContract = defineContract('tourism', 1, [
  {
    name: 'tours.list',
    description:
      'List tours, 20 per page by default and at most 50. Pass pageInfo.endCursor as cursor for the next page. Filter by branchId, language (overlays that translation), and tour status. Read-only.',
    kind: 'read',
    field: 'bmsTours',
    args: {
      ...listArgs,
      name: 'String',
      status: 'String',
      categoryIds: '[String]',
    },
    input: z
      .object({
        ...listFilters,
        name: z.string().optional(),
        status: z.string().optional(),
        categoryIds: z.array(z.string()).optional(),
      })
      .strict(),
    output: page(Tour).nullable(),
  },
  {
    name: 'tours.count',
    description:
      'Count tours, across all branches or within one branchId. Returns a number. Read-only.',
    kind: 'read',
    field: 'bmsToursTotalCount',
    args: { branchId: 'String' },
    input: z.object({ branchId: z.string().optional() }).strict(),
    output: z.number().nullable(),
  },
  {
    name: 'tours.get',
    description:
      'Read one tour by _id. Language overlays that translation when given. Returns null when no tour has that id. Read-only.',
    kind: 'read',
    field: 'bmsTourDetail',
    args: { _id: 'String!', language: 'String' },
    input: z
      .object({
        _id: z.string().min(1),
        language: z.string().optional(),
      })
      .strict(),
    output: Tour.nullable(),
  },
  {
    name: 'tours.create',
    description:
      'Create a tour. pricingOptions needs at least one option with an adult price. Dates are ISO strings. date_status is computed from the dates and the branch timezone, so it is not an input. Returns the created tour.',
    kind: 'write',
    field: 'bmsTourAdd',
    args: { ...tourArgs, pricingOptions: '[PricingOptionInput]' },
    input: z
      .object({
        ...tourFields,
        pricingOptions: z.array(PricingOption).min(1),
      })
      .strict(),
    output: Tour.nullable(),
  },
  {
    name: 'tours.edit',
    description:
      'Edit a tour by _id. Only the fields you pass change. Passing pricingOptions replaces the whole list. date_status is recomputed. Returns the saved tour.',
    kind: 'write',
    field: 'bmsTourEdit',
    args: {
      _id: 'String!',
      ...tourArgs,
      pricingOptions: '[PricingOptionInput]',
    },
    input: z
      .object({
        _id: z.string().min(1),
        ...tourFields,
        pricingOptions: z.array(PricingOption).min(1).optional(),
      })
      .strict(),
    output: Tour.nullable(),
  },
  {
    name: 'tours.remove',
    description:
      'Delete tours by id, along with their translations. Destructive: the tours are removed. Returns the database delete result.',
    kind: 'destructive',
    field: 'bmsTourRemove',
    args: { ids: '[String]' },
    input: z.object({ ids }).strict(),
    output: z.unknown().nullable(),
  },
  {
    name: 'itineraries.list',
    description:
      'List itineraries, 20 per page by default and at most 50. Pass pageInfo.endCursor as cursor for the next page. Filter by branchId, name (case-insensitive) and language. Read-only.',
    kind: 'read',
    field: 'bmsItineraries',
    args: { ...listArgs, name: 'String' },
    input: z
      .object({
        ...listFilters,
        name: z.string().optional(),
      })
      .strict(),
    output: page(Itinerary).nullable(),
  },
  {
    name: 'itineraries.get',
    description:
      'Read one itinerary by _id. Language overlays that translation when given. Returns null when no itinerary has that id. Read-only.',
    kind: 'read',
    field: 'bmsItineraryDetail',
    args: { _id: 'String!', language: 'String' },
    input: z
      .object({
        _id: z.string().min(1),
        language: z.string().optional(),
      })
      .strict(),
    output: Itinerary.nullable(),
  },
  {
    name: 'itineraries.create',
    description:
      'Create an itinerary with its cost fields and images. status is published or draft. Returns the created itinerary.',
    kind: 'write',
    field: 'bmsItineraryAdd',
    args: itineraryArgs,
    input: z.object(itineraryFields).strict(),
    output: Itinerary.nullable(),
  },
  {
    name: 'itineraries.edit',
    description:
      'Edit an itinerary by _id. Only the fields you pass change. Returns the saved itinerary.',
    kind: 'write',
    field: 'bmsItineraryEdit',
    args: { _id: 'String!', ...itineraryArgs },
    input: z
      .object({
        _id: z.string().min(1),
        ...itineraryFields,
      })
      .strict(),
    output: Itinerary.nullable(),
  },
  {
    name: 'itineraries.remove',
    description:
      'Delete itineraries by id, along with their translations. Destructive: the itineraries are removed. Returns the database delete result.',
    kind: 'destructive',
    field: 'bmsItineraryRemove',
    args: { ids: '[String]' },
    input: z.object({ ids }).strict(),
    output: z.unknown().nullable(),
  },
  {
    name: 'elements.list',
    description:
      'List elements (reusable schedule items such as meals or check-in), 20 per page by default and at most 50. Pass pageInfo.endCursor as cursor for the next page. name matches the element name or its location name. categories includes subcategories. Read-only.',
    kind: 'read',
    field: 'bmsElements',
    args: {
      ...listArgs,
      name: 'String',
      quick: 'Boolean',
      categories: '[String]',
    },
    input: z
      .object({
        ...listFilters,
        name: z.string().optional(),
        quick: z.boolean().optional(),
        categories: z.array(z.string()).optional(),
      })
      .strict(),
    output: page(Element).nullable(),
  },
  {
    name: 'elements.get',
    description:
      'Read one element by _id. Language overlays that translation when given. Returns null when no element has that id. Read-only.',
    kind: 'read',
    field: 'bmsElementDetail',
    args: { _id: 'String!', language: 'String' },
    input: z
      .object({
        _id: z.string().min(1),
        language: z.string().optional(),
      })
      .strict(),
    output: Element.nullable(),
  },
  {
    name: 'elements.create',
    description:
      'Create an element. quick sets the quick flag on the element. categories is a list of element category ids. Returns the created element.',
    kind: 'write',
    field: 'bmsElementAdd',
    args: elementArgs,
    input: z.object(elementFields).strict(),
    output: Element.nullable(),
  },
  {
    name: 'elements.edit',
    description:
      'Edit an element by _id. Only the fields you pass change. Returns the saved element.',
    kind: 'write',
    field: 'bmsElementEdit',
    args: { _id: 'String!', ...elementArgs },
    input: z
      .object({
        _id: z.string().min(1),
        ...elementFields,
      })
      .strict(),
    output: Element.nullable(),
  },
  {
    name: 'elements.remove',
    description:
      'Delete elements by id, along with their translations. Destructive: the elements are removed. Returns the database delete result.',
    kind: 'destructive',
    field: 'bmsElementRemove',
    args: { ids: '[String]' },
    input: z.object({ ids }).strict(),
    output: z.unknown().nullable(),
  },
  {
    name: 'elementCategories.list',
    description:
      'List element categories under parentId. Pass parentId null for top-level categories. Omit parentId to get every category. Read-only.',
    kind: 'read',
    field: 'bmsElementCategories',
    args: { parentId: 'String' },
    input: z.object({ parentId: z.string().nullish() }).strict(),
    output: z.array(ElementCategory).nullable(),
  },
  {
    name: 'elementCategories.create',
    description:
      'Create an element category. parentId must be an existing category id when given. Returns the created category.',
    kind: 'write',
    field: 'bmsElementCategoryAdd',
    args: { name: 'String', parentId: 'String' },
    input: z
      .object({
        name: z.string().optional(),
        parentId: z.string().optional(),
      })
      .strict(),
    output: ElementCategory.nullable(),
  },
  {
    name: 'elementCategories.edit',
    description:
      'Edit an element category by _id. Only the fields you pass change. Throws when the category does not exist. Returns the saved category.',
    kind: 'write',
    field: 'bmsElementCategoryEdit',
    args: { _id: 'String!', name: 'String', parentId: 'String' },
    input: z
      .object({
        _id: z.string().min(1),
        name: z.string().optional(),
        parentId: z.string().optional(),
      })
      .strict(),
    output: ElementCategory.nullable(),
  },
  {
    name: 'elementCategories.remove',
    description:
      'Delete one element category by _id. Destructive: the category is removed. Returns the database delete result.',
    kind: 'destructive',
    field: 'bmsElementCategoryRemove',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: z.unknown().nullable(),
  },
  {
    name: 'orders.list',
    description:
      'List orders, 20 per page by default and at most 50. Pass pageInfo.endCursor as cursor for the next page. Filter by tourId, customerId and branchId. Read-only.',
    kind: 'read',
    field: 'bmsOrders',
    args: {
      branchId: 'String',
      limit: 'Int',
      cursor: 'String',
      tourId: 'String',
      customerId: 'String',
    },
    input: z
      .object({
        branchId: z.string().optional(),
        limit: z.number().int().min(1).max(50).optional(),
        cursor: z.string().optional(),
        tourId: z.string().optional(),
        customerId: z.string().optional(),
      })
      .strict(),
    output: page(BmsOrder).nullable(),
  },
  {
    name: 'orders.get',
    description:
      'Read one order by _id. Returns null when no order has that id. Read-only.',
    kind: 'read',
    field: 'bmsOrderDetail',
    args: { _id: 'String!' },
    notFound: 'Order not found',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: BmsOrder.nullable(),
  },
  {
    name: 'orders.create',
    description:
      'Create an order for a tour and a customer. amount is the order total. status must be one of the payment status values the model accepts. Returns the created order.',
    kind: 'write',
    field: 'bmsOrderAdd',
    args: { order: 'BmsOrderInput' },
    input: z.object({ order: z.object(orderFields).strict() }).strict(),
    output: BmsOrder.nullable(),
  },
  {
    name: 'orders.edit',
    description:
      'Edit an order by _id. Only the fields you pass change. Returns the saved order.',
    kind: 'write',
    field: 'bmsOrderEdit',
    args: { _id: 'String!', order: 'BmsOrderInput' },
    input: z
      .object({
        _id: z.string().min(1),
        order: z.object(orderFields).strict(),
      })
      .strict(),
    output: BmsOrder.nullable(),
  },
  {
    name: 'orders.remove',
    description:
      'Delete orders by id. Destructive: the orders are removed. Returns the database delete result.',
    kind: 'destructive',
    field: 'bmsOrderRemove',
    args: { ids: '[String]' },
    input: z.object({ ids }).strict(),
    output: z.unknown().nullable(),
  },
  {
    name: 'branches.list',
    description:
      'List tourism branches, 20 per page by default and at most 50. Pass pageInfo.endCursor as cursor for the next page. Read-only.',
    kind: 'read',
    field: 'bmsBranchList',
    args: { limit: 'Int', cursor: 'String' },
    input: z
      .object({
        limit: z.number().int().min(1).max(50).optional(),
        cursor: z.string().optional(),
      })
      .strict(),
    output: page(BmsBranch).nullable(),
  },
  {
    name: 'branches.get',
    description:
      'Read one branch by _id or token. Throws "Bms Branch not found" when no branch matches. Read-only.',
    kind: 'read',
    field: 'bmsBranchDetail',
    args: { _id: 'String!' },
    notFound: 'Bms Branch not found',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: BmsBranch.nullable(),
  },
]);
