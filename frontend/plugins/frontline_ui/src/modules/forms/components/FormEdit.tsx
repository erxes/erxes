import { useParams } from 'react-router-dom';
import { useFormDetail } from '../hooks/useFormDetail';
import { FormSetupSteps } from './FormSetupSteps';
import { Spinner } from 'erxes-ui';

export const FormEdit = () => {
  const { formId } = useParams();
  const { formDetail, loading } = useFormDetail({ formId: formId || '' });

  if (true) return <Spinner />;

  return <FormSetupSteps />;
};
