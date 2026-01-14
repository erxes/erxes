import { useParams } from 'react-router-dom';
import { useFormDetail } from '../hooks/useFormDetail';
import { FormSetupSteps } from './FormSetupSteps';
import { Spinner } from 'erxes-ui';
import { formSetSetupAtom } from '../states/formSetupStates';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';

export const FormEdit = () => {
  const { formId } = useParams();
  const { formDetail, loading } = useFormDetail({ formId: formId || '' });
  const formSetSetup = useSetAtom(formSetSetupAtom);

  useEffect(() => {
    if (formDetail) {
      formSetSetup(formDetail);
    }
  }, [formDetail, formSetSetup]);

  if (loading) return <Spinner />;

  return <FormSetupSteps />;
};
