import customScalars from "@erxes/api-utils/src/customScalars";

import { field as Field, fieldsGroup as FieldsGroup } from "./field";
import Submission from "./submission";
import Form from "./forms";
import { fieldQueries, fieldsGroupQueries } from "./queries/fields";
import { fieldMutations, fieldsGroupsMutations } from "./mutations/fields";
import formQueries from "./queries/forms";
import formMutations from "./mutations/forms";

const resolvers = _serviceDiscovery => ({
  ...customScalars,
  Field,
  FieldsGroup,
  Form,
  Submission,
  Mutation: {
    ...fieldMutations,
    ...fieldsGroupsMutations,
    ...formMutations
  },
  Query: {
    ...fieldQueries,
    ...fieldsGroupQueries,
    ...formQueries
  }
});

export default resolvers;
