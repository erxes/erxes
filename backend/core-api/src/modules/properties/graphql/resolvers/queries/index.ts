import { fieldQueries } from './field';
import { groupQueries } from './group';
import { propertyQueries } from './property';
import { systemFieldQueries } from './systemField';

export const propertiesQueries = {
  ...fieldQueries,
  ...groupQueries,
  ...propertyQueries,
  ...systemFieldQueries,
};
