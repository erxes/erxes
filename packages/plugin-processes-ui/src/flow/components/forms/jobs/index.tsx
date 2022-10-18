import { __ } from '@erxes/ui/src/utils/core';
import JobForm from '../../../containers/forms/jobs/subForms/JobForm';
import EndPointForm from '../../../containers/forms/jobs/subForms/EndPointForm';
import ProductForm from '../../../containers/forms/jobs/subForms/ProductForm';

export const ActionForms = {
  default: ProductForm,
  job: JobForm,
  endPoint: EndPointForm
};
