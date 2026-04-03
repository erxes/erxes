import { fieldQueries } from './field';
import { groupQueries } from './group';
import { propertyQueries } from './property';

export const propertiesQueries = {
  ...fieldQueries,
  ...groupQueries,
  ...propertyQueries,
};
