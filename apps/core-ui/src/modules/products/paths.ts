/** Products: the organisation's catalog, shared by every plugin. */
export const PRODUCTS_PATH = '/products';

/** Products › Settings: categories and product properties. */
export const PRODUCT_SETTINGS_PATH = `${PRODUCTS_PATH}/settings`;

export const PRODUCT_SETTINGS = {
  categories: `${PRODUCT_SETTINGS_PATH}/categories`,
  properties: `${PRODUCT_SETTINGS_PATH}/properties`,
} as const;

/** Opens a product's sheet over the list. */
export const productHref = (id: string) => `${PRODUCTS_PATH}?product=${encodeURIComponent(id)}`;
