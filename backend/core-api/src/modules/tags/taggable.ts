export type TaggableTarget = {
  moduleName: string;
  collectionName: string;
};

export const TAGGABLE_TARGETS: Record<string, TaggableTarget> = {
  customer: { moduleName: 'contacts', collectionName: 'customers' },
  company: { moduleName: 'contacts', collectionName: 'companies' },
  product: { moduleName: 'products', collectionName: 'products' },
  user: { moduleName: 'organization', collectionName: 'users' },
  form: { moduleName: 'forms', collectionName: 'forms' },
  automation: { moduleName: 'automations', collectionName: 'automations' },
};

export const taggableTarget = (type: string): TaggableTarget | undefined =>
  TAGGABLE_TARGETS[type.includes(':') ? type.split(':')[1] : type];
