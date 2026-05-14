import { templateHandler as productTemplateHandler } from '@/products/meta/template';

export const templates = {
  plugin: 'core',
  
  modules: {
    product: productTemplateHandler,
  },
};
