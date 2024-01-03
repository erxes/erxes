import JobForm from '../../../containers/forms/jobs/subForms/JobForm';
import ProductForm from '../../../containers/forms/jobs/subForms/ProductForm';
import SubFlowForm from '../../../containers/forms/jobs/subForms/SubFlowForm';

export const ActionForms = {
  job: JobForm,
  end: JobForm,
  move: ProductForm,
  income: ProductForm,
  outlet: ProductForm,
  flow: SubFlowForm
};
