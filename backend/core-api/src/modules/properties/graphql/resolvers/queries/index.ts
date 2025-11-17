import { fieldQueries } from './field';
import { groupQueries } from './group';

export const propertiesQueries = {
  ...fieldQueries,
  ...groupQueries,
};
