import { Router } from 'express';
import { getPosToken, posInit, posSyncConfig } from './modules/pos/routes';
import { PAPA_CALLBACK_PATH } from './modules/pos/papa/constants';
import { papaCallback } from './modules/pos/papa/callback';
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
router.get(`/pos-init`, posInit);
router.post(`/pos-sync-config`, posSyncConfig);
router.get(`/get-pos-token`, getPosToken);
router.get(`${PAPA_CALLBACK_PATH}/:secret`, papaCallback);

//ecommerce routes
router.get(`/ecommerce-init`, ecommerceInit);
router.get(`/ecommerce-product-summary`, ecommerceProductSummary);
router.get(`/ecommerce-last-viewed`, ecommerceLastViewed);
router.get(`/ecommerce-wishlist`, ecommerceWishlist);
router.get(`/ecommerce-addresses`, ecommerceAddresses);
router.get(`/ecommerce-product-reviews`, ecommerceProductReviews);
router.post(`/ecommerce-bulk-operations`, ecommerceBulkOperations);
