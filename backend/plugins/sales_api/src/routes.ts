import { Router } from 'express';
import { posInit, posSyncConfig, unfetchOrderInfo } from './modules/pos/routes';
import {
  ecommerceInit,
  ecommerceProductSummary,
  ecommerceLastViewed,
  ecommerceWishlist,
  ecommerceAddresses,
  ecommerceProductReviews,
  ecommerceBulkOperations,
} from './modules/ecommerce/routes';

export const router: Router = Router();
router.get(`/pos-init`, posInit)
// router.use(`/file-export`, exportFileRunner)
router.post(`/api/unfetch-order-info`, unfetchOrderInfo)
router.post(`/pos-sync-config`, posSyncConfig)

//ecommerce routes
router.get(`/ecommerce-init`, ecommerceInit);
router.get(`/ecommerce-product-summary`, ecommerceProductSummary);
router.get(`/ecommerce-last-viewed`, ecommerceLastViewed);
router.get(`/ecommerce-wishlist`, ecommerceWishlist);
router.get(`/ecommerce-addresses`, ecommerceAddresses);
router.get(`/ecommerce-product-reviews`, ecommerceProductReviews);
router.post(`/ecommerce-bulk-operations`, ecommerceBulkOperations);