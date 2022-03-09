import customScalars from '@erxes/api-utils/src/customScalars';

import { field as Field, fieldsGroup as FieldGroup } from './field'
import Form from './forms';
import { fieldQueries, fieldsGroupQueries } from './queries/fields';
import { fieldMutations, fieldsGroupsMutations } from './mutations/fields';
import formQueries from './queries/forms';
import formMutations from './mutations/forms';

const resolvers = (_serviceDiscovery) => ({
  ...customScalars,
  Field,
  FieldGroup,
  Form,
  Mutation: {
    ...fieldMutations,
    ...fieldsGroupsMutations,
    ...formMutations,
  },
  Query: {
    ...fieldQueries,
    ...fieldsGroupQueries,
    ...formQueries,
  }
});

export default resolvers;