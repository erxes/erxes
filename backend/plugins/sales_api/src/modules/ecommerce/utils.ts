import { sendTRPCMessage } from 'erxes-api-shared/utils';

/**
 * Fetch products from core service
 */
export const fetchProducts = async (
  subdomain: string,
  productIds: string[],
  options: {
    limit?: number;
    fields?: string[];
    query?: any;
  } = {}
): Promise<any[]> => {
  const { limit = productIds.length, fields, query = {} } = options;

  if (!productIds.length) {
    return [];
  }

  return sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'products',
    action: 'find',
    input: {
      query: {
        ...query,
        _id: { $in: productIds },
        status: { $ne: 'deleted' },
      },
      limit,
      fields,
    },
    defaultValue: [],
  });
};

/**
 * Fetch customers from core service
 */
export const fetchCustomers = async (
  subdomain: string,
  customerIds: string[],
  options: {
    limit?: number;
    fields?: string[];
    query?: any;
  } = {}
): Promise<any[]> => {
  const { limit = customerIds.length, fields, query = {} } = options;

  if (!customerIds.length) {
    return [];
  }

  return sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'customers',
    action: 'find',
    input: {
      query: {
        ...query,
        _id: { $in: customerIds },
      },
      limit,
      fields,
    },
    defaultValue: [],
  });
};

/**
 * Get product categories
 */
export const getProductCategories = async (
  subdomain: string,
  categoryIds: string[],
  options: {
    limit?: number;
    fields?: string[];
    query?: any;
  } = {}
): Promise<any[]> => {
  const { limit = categoryIds.length, fields, query = {} } = options;

  if (!categoryIds.length) {
    return [];
  }

  return sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'productCategories',
    action: 'find',
    input: {
      query: {
        ...query,
        _id: { $in: categoryIds },
      },
      limit,
      fields,
    },
    defaultValue: [],
  });
};

/**
 * Get child categories recursively
 */
export const getChildCategories = async (
  subdomain: string,
  categoryIds: string[]
): Promise<string[]> => {
  if (!categoryIds.length) {
    return [];
  }

  const allCategories = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'productCategories',
    action: 'find',
    input: {
      query: {},
      sort: { order: 1 },
    },
    defaultValue: [],
  });

  const getChildren = (parentId: string): string[] => {
    const children = allCategories
      .filter(cat => cat.parentId === parentId)
      .map(cat => cat._id);

    let allChildren = [...children];
    children.forEach(childId => {
      allChildren = [...allChildren, ...getChildren(childId)];
    });

    return allChildren;
  };

  let allChildIds: string[] = [...categoryIds];
  categoryIds.forEach(categoryId => {
    allChildIds = [...allChildIds, ...getChildren(categoryId)];
  });

  return [...new Set(allChildIds)];
};

/**
 * Fetch products by category
 */
export const fetchProductsByCategory = async (
  subdomain: string,
  categoryIds: string[],
  options: {
    limit?: number;
    skip?: number;
    fields?: string[];
    query?: any;
  } = {}
): Promise<any[]> => {
  const { limit = 100, skip = 0, fields, query = {} } = options;

  if (!categoryIds.length) {
    return [];
  }

  return sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'products',
    action: 'find',
    input: {
      query: {
        ...query,
        categoryId: { $in: categoryIds },
        status: { $ne: 'deleted' },
      },
      limit,
      skip,
      fields,
    },
    defaultValue: [],
  });
};

/**
 * Calculate product review statistics
 */
export const calculateReviewStats = (reviews: any[]) => {
  if (!reviews.length) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const totalReviews = reviews.length;
  const averageRating = 
    reviews.reduce((sum, cur) => sum + (cur.review || 0), 0) / totalReviews;

  const ratingDistribution = {
    1: reviews.filter(r => r.review === 1).length,
    2: reviews.filter(r => r.review === 2).length,
    3: reviews.filter(r => r.review === 3).length,
    4: reviews.filter(r => r.review === 4).length,
    5: reviews.filter(r => r.review === 5).length,
  };

  return { totalReviews, averageRating, ratingDistribution };
};

/**
 * Enrich ecommerce items with product details
 */
export const enrichWithProductDetails = async (
  subdomain: string,
  items: any[],
  productIdField: string = 'productId'
): Promise<any[]> => {
  if (!items.length) {
    return items;
  }

  const productIds = items
    .map(item => item[productIdField])
    .filter(Boolean)
    .filter((value, index, self) => self.indexOf(value) === index);

  if (!productIds.length) {
    return items;
  }

  const products = await fetchProducts(subdomain, productIds);
  const productsMap = products.reduce((map, product) => {
    map[product._id] = product;
    return map;
  }, {});

  return items.map(item => ({
    ...item,
    product: productsMap[item[productIdField]] || null,
  }));
};

/**
 * Enrich ecommerce items with customer details
 */
export const enrichWithCustomerDetails = async (
  subdomain: string,
  items: any[],
  customerIdField: string = 'customerId'
): Promise<any[]> => {
  if (!items.length) {
    return items;
  }

  const customerIds = items
    .map(item => item[customerIdField])
    .filter(Boolean)
    .filter((value, index, self) => self.indexOf(value) === index);

  if (!customerIds.length) {
    return items;
  }

  const customers = await fetchCustomers(subdomain, customerIds);
  const customersMap = customers.reduce((map, customer) => {
    map[customer._id] = customer;
    return map;
  }, {});

  return items.map(item => ({
    ...item,
    customer: customersMap[item[customerIdField]] || null,
  }));
};

/**
 * Get configuration from core service
 */
export const getConfig = async (
  subdomain: string,
  code: string,
  defaultValue: any
): Promise<any> => {
  return sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'configs',
    action: 'findOne',
    input: {
      query: { code },
    },
    defaultValue,
  });
};

/**
 * Format address for display
 */
export const formatAddress = (address: any): string => {
  if (!address) return '';

  const parts = [
    address.address1,
    address.address2,
    address.street,
    address.district,
    address.city,
  ].filter(Boolean);

  return parts.join(', ');
};

/**
 * Get distance between two coordinates (in kilometers)
 */
export const calculateDistance = (
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const R = 6371; // Earth's radius in km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);
  
  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);

  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

/**
 * Paginate results with cursor-based pagination
 */
export const cursorPaginate = async (
  model: any,
  filter: any,
  options: {
    limit?: number;
    sort?: any;
    fields?: string[];
  } = {}
): Promise<{
  list: any[];
  totalCount: number;
  hasNext: boolean;
  nextCursor?: string;
}> => {
  const { limit = 20, sort = { _id: -1 }, fields } = options;

  const query = model.find(filter);

  if (fields) {
    query.select(fields);
  }

  const results = await query
    .sort(sort)
    .limit(limit + 1) // Get one extra to check if there's more
    .lean();

  const hasNext = results.length > limit;
  const list = hasNext ? results.slice(0, -1) : results;
  const nextCursor = hasNext ? results[results.length - 2]._id : undefined;

  const totalCount = await model.countDocuments(filter);

  return {
    list,
    totalCount,
    hasNext,
    nextCursor,
  };
};

/**
 * Validate and sanitize ecommerce data
 */
export const sanitizeEcommerceData = (data: any, type: string): any => {
  const sanitized = { ...data };

  // Common sanitization for all ecommerce types
  if (sanitized._id) {
    delete sanitized._id;
  }
  if (sanitized.createdAt) {
    delete sanitized.createdAt;
  }
  if (sanitized.modifiedAt) {
    delete sanitized.modifiedAt;
  }

  // Type-specific sanitization
  switch (type) {
    case 'productReview':
      sanitized.review = Math.min(Math.max(sanitized.review || 0, 0), 5);
      break;
    
    case 'address':
      if (sanitized.coordinate) {
        sanitized.coordinate.lat = parseFloat(sanitized.coordinate.lat) || 0;
        sanitized.coordinate.lng = parseFloat(sanitized.coordinate.lng) || 0;
      }
      break;
  }

  return sanitized;
};

export default {
  fetchProducts,
  fetchCustomers,
  getProductCategories,
  getChildCategories,
  fetchProductsByCategory,
  calculateReviewStats,
  enrichWithProductDetails,
  enrichWithCustomerDetails,
  getConfig,
  formatAddress,
  calculateDistance,
  cursorPaginate,
  sanitizeEcommerceData,
};