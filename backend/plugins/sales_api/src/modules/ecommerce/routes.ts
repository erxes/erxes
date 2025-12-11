import { getSubdomain, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels, generateModels } from '~/connectionResolvers';
import { IProductReviewDocument } from '~/modules/ecommerce/@types/productReview';
import { IWishlistDocument } from './@types/wishlist';
import { ILastViewedItemDocument } from './@types/lastViewedItem';
import { IAddressDocument } from './@types/address';
import { 
  fetchProducts, 
  fetchCustomers, 
  getProductCategories 
} from './utils';

// Define interfaces inline since there's no separate interfaces.ts file
interface IProduct {
  _id: string;
  name: string;
  code?: string;
  categoryId?: string;
  description?: string;
  unitPrice?: number;
  [key: string]: any;
}

interface ICustomer {
  _id: string;
  firstName?: string;
  lastName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  [key: string]: any;
}

interface IProductCategory {
  _id: string;
  name: string;
  code?: string;
  parentId?: string;
  [key: string]: any;
}

// Define operation result types
type OperationResultSuccess = {
  type: string;
  success: true;
  data: IWishlistDocument | IProductReviewDocument | ILastViewedItemDocument | IAddressDocument;
};

type OperationResultError = {
  type: string;
  success: false;
  error: string;
};

type OperationResult = OperationResultSuccess | OperationResultError;

// Helper function to fetch product details with extended information
export const getProductDetails = async (
  subdomain: string,
  productIds: string[],
  includeCategories = true,
): Promise<{ products: IProduct[]; categories: IProductCategory[] }> => {
  if (!productIds.length) {
    return { products: [], categories: [] };
  }

  const products = await fetchProducts(subdomain, productIds);

  let categories: IProductCategory[] = [];
  if (includeCategories && products.length) {
    const categoryIds = products
      .map(p => p.categoryId)
      .filter((value): value is string => Boolean(value))
      .filter((value, index, self) => self.indexOf(value) === index);

    if (categoryIds.length) {
      categories = await getProductCategories(subdomain, categoryIds);
    }
  }

  return { products, categories };
};

// Helper function to fetch customer details
export const getCustomerDetails = async (
  subdomain: string,
  customerIds: string[],
): Promise<ICustomer[]> => {
  if (!customerIds.length) {
    return [];
  }

  return await fetchCustomers(subdomain, customerIds);
};

// Get customer summary data (reviews, wishlist, last viewed items)
export const getCustomerSummary = async (
  subdomain: string,
  models: IModels,
  customerId: string,
) => {
  const data: any = {};

  // Get product reviews by customer
  const productReviews = await models.ProductReview.find({ customerId }).lean();
  data.productReviews = productReviews;

  // Calculate review statistics
  if (productReviews.length) {
    data.reviewStats = {
      totalReviews: productReviews.length,
      averageRating: 
        productReviews.reduce((sum, cur) => sum + (cur.review || 0), 0) / 
        productReviews.length,
      ratingDistribution: {
        1: productReviews.filter(r => r.review === 1).length,
        2: productReviews.filter(r => r.review === 2).length,
        3: productReviews.filter(r => r.review === 3).length,
        4: productReviews.filter(r => r.review === 4).length,
        5: productReviews.filter(r => r.review === 5).length,
      },
    };
  }

  // Get wishlist items
  const wishlistItems = await models.Wishlist.find({ customerId }).lean();
  data.wishlistItems = wishlistItems;

  // Get last viewed items
  const lastViewedItems = await models.LastViewedItem.find({ customerId })
    .sort({ modifiedAt: -1 })
    .limit(20)
    .lean();
  data.lastViewedItems = lastViewedItems;

  // Get addresses
  const addresses = await models.Address.find({ customerId }).lean();
  data.addresses = addresses;

  // Extract product IDs for fetching details
  const allProductIds = [
    ...productReviews.map(r => r.productId),
    ...wishlistItems.map(w => w.productId),
    ...lastViewedItems.map(l => l.productId),
  ].filter((value, index, self) => self.indexOf(value) === index);

  // Fetch product details
  if (allProductIds.length) {
    const { products } = await getProductDetails(subdomain, allProductIds, false);
    data.products = products;
  }

  return data;
};

// Get product summary data (reviews, wishlist count, etc.)
export const getProductSummary = async (
  subdomain: string,
  models: IModels,
  productId: string,
) => {
  const data: any = { productId };

  // Get product reviews
  const productReviews = await models.ProductReview.find({ productId: { $eq: productId } }).lean();
  data.productReviews = productReviews;

  // Calculate review statistics
  if (productReviews.length) {
    data.reviewStats = {
      totalReviews: productReviews.length,
      averageRating: 
        productReviews.reduce((sum, cur) => sum + (cur.review || 0), 0) / 
        productReviews.length,
      ratingDistribution: {
        1: productReviews.filter(r => r.review === 1).length,
        2: productReviews.filter(r => r.review === 2).length,
        3: productReviews.filter(r => r.review === 3).length,
        4: productReviews.filter(r => r.review === 4).length,
        5: productReviews.filter(r => r.review === 5).length,
      },
    };
  } else {
    data.reviewStats = {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  // Get wishlist count for this product
  const wishlistCount = await models.Wishlist.countDocuments({ productId: { $eq: productId } });
  data.wishlistCount = wishlistCount;

  // Get last viewed count for this product
  const lastViewedCount = await models.LastViewedItem.countDocuments({ productId: { $eq: productId } });
  data.lastViewedCount = lastViewedCount;

  // Get customer IDs for reviewers and fetch their details
  const reviewerIds = productReviews.map(r => r.customerId).filter(Boolean);
  if (reviewerIds.length) {
    const reviewers = await getCustomerDetails(subdomain, reviewerIds);
    data.reviewers = reviewers;
  }

  return data;
};

// Initialize ecommerce data for a customer
export const ecommerceInit = async (req: any, res: any) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    
    const { customerId } = req.query;
    
    if (!customerId) {
      return res.status(400).send({ error: 'Customer ID is required' });
    }

    const data = await getCustomerSummary(subdomain, models, customerId);
    
    return res.send({
      status: 'success',
      data,
    });
  } catch (error: any) {
    return res.status(500).send({ 
      status: 'error', 
      errorMessage: error.message 
    });
  }
};

// Get product summary endpoint
export const ecommerceProductSummary = async (req: any, res: any) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    
    const { productId } = req.query;
    
    if (!productId) {
      return res.status(400).send({ error: 'Product ID is required' });
    }

    const data = await getProductSummary(subdomain, models, productId);
    
    return res.send({
      status: 'success',
      data,
    });
  } catch (error: any) {
    return res.status(500).send({ 
      status: 'error', 
      errorMessage: error.message 
    });
  }
};

// Get customer's last viewed items with product details
export const ecommerceLastViewed = async (req: any, res: any) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    
    const { customerId, limit = 10 } = req.query;
    
    if (!customerId) {
      return res.status(400).send({ error: 'Customer ID is required' });
    }

    const lastViewedItems = await models.LastViewedItem.find({ customerId })
      .sort({ modifiedAt: -1 })
      .limit(parseInt(limit as string))
      .lean();

    const productIds = lastViewedItems.map(item => item.productId);
    
    let products: IProduct[] = [];
    if (productIds.length) {
      const { products: productDetails } = await getProductDetails(
        subdomain, 
        productIds, 
        true
      );
      products = productDetails;
    }

    const itemsWithProducts = lastViewedItems.map(item => ({
      ...item,
      product: products.find(p => p._id === item.productId) || null,
    }));

    return res.send({
      status: 'success',
      data: itemsWithProducts,
    });
  } catch (error: any) {
    return res.status(500).send({ 
      status: 'error', 
      errorMessage: error.message 
    });
  }
};

// Get customer's wishlist with product details
export const ecommerceWishlist = async (req: any, res: any) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    
    const { customerId } = req.query;
    
    if (!customerId) {
      return res.status(400).send({ error: 'Customer ID is required' });
    }

    const wishlistItems = await models.Wishlist.find({ customerId }).lean();
    
    const productIds = wishlistItems.map(item => item.productId);
    
    let products: IProduct[] = [];
    if (productIds.length) {
      const { products: productDetails } = await getProductDetails(
        subdomain, 
        productIds, 
        true
      );
      products = productDetails;
    }

    const itemsWithProducts = wishlistItems.map(item => ({
      ...item,
      product: products.find(p => p._id === item.productId) || null,
    }));

    return res.send({
      status: 'success',
      data: itemsWithProducts,
    });
  } catch (error: any) {
    return res.status(500).send({ 
      status: 'error', 
      errorMessage: error.message 
    });
  }
};

// Get customer's addresses
export const ecommerceAddresses = async (req: any, res: any) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    
    const { customerId } = req.query;
    
    if (!customerId) {
      return res.status(400).send({ error: 'Customer ID is required' });
    }

    const addresses = await models.Address.find({ customerId }).lean();

    return res.send({
      status: 'success',
      data: addresses,
    });
  } catch (error: any) {
    return res.status(500).send({ 
      status: 'error', 
      errorMessage: error.message 
    });
  }
};

// Get product reviews with customer details
export const ecommerceProductReviews = async (req: any, res: any) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    
    const { productId, limit = 20, skip = 0, sort = '-createdAt' } = req.query;
    
    if (!productId) {
      return res.status(400).send({ error: 'Product ID is required' });
    }

    const reviews = await models.ProductReview.find({ productId })
      .sort(sort as string)
      .skip(parseInt(skip as string))
      .limit(parseInt(limit as string))
      .lean();

    const customerIds = reviews.map(review => review.customerId).filter(Boolean);
    
    let customers: ICustomer[] = [];
    if (customerIds.length) {
      customers = await getCustomerDetails(subdomain, customerIds);
    }

    const reviewsWithCustomers = reviews.map(review => ({
      ...review,
      customer: customers.find(c => c._id === review.customerId) || null,
    }));

    // Calculate summary
    const totalReviews = await models.ProductReview.countDocuments({ productId });
    const averageRating = reviews.length
      ? reviews.reduce((sum, cur) => sum + (cur.review || 0), 0) / reviews.length
      : 0;

    return res.send({
      status: 'success',
      data: {
        reviews: reviewsWithCustomers,
        summary: {
          totalReviews,
          averageRating,
          currentPageReviews: reviews.length,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).send({ 
      status: 'error', 
      errorMessage: error.message 
    });
  }
};

// Bulk operations for ecommerce data (more appropriate than sync)
export const ecommerceBulkOperations = async (req: any, res: any) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    
    const { operations } = req.body;
    
    if (!operations || !Array.isArray(operations)) {
      return res.status(400).send({ error: 'Operations array is required' });
    }

    const results: OperationResult[] = [];
    
    for (const operation of operations) {
      const { type, data } = operation;
      
      switch (type) {
        case 'addToWishlist':
          const { productId, customerId } = data;
          const wishlistItem = await models.Wishlist.createWishlist({
            productId,
            customerId
          });
          results.push({ 
            type, 
            success: true, 
            data: wishlistItem as IWishlistDocument 
          });
          break;
          
        case 'addReview':
          const review = await models.ProductReview.createProductReview(data);
          results.push({ 
            type, 
            success: true, 
            data: review as IProductReviewDocument 
          });
          break;
          
        case 'addLastViewed':
          const lastViewed = await models.LastViewedItem.lastViewedItemAdd(data);
          results.push({ 
            type, 
            success: true, 
            data: lastViewed as ILastViewedItemDocument 
          });
          break;
          
        case 'addAddress':
          const address = await models.Address.createAddress(data);
          results.push({ 
            type, 
            success: true, 
            data: address as IAddressDocument 
          });
          break;
          
        default:
          results.push({ 
            type, 
            success: false, 
            error: 'Invalid operation type' 
          });
      }
    }

    return res.send({
      status: 'success',
      data: results,
    });
  } catch (error: any) {
    return res.status(500).send({ 
      status: 'error', 
      errorMessage: error.message 
    });
  }
};

// Export all route handlers
export const routes = {
  ecommerceInit,
  ecommerceProductSummary,
  ecommerceLastViewed,
  ecommerceWishlist,
  ecommerceAddresses,
  ecommerceProductReviews,
  ecommerceBulkOperations,
};

export default routes;