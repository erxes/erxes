import {
  fieldMutations as fields,
  fieldsGroupsMutations as fieldsgroups
} from './fields';
import forms from './forms';

export default {
  ...fields,
  ...forms,
  ...fieldsgroups,
};
