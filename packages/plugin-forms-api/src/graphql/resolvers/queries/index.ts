import {
  fieldQueries as fields,
  fieldsGroupQueries as fieldsgroups
} from './fields';
import forms from './forms';

export default {
  ...fields,
  ...forms,
  ...fieldsgroups,
};
