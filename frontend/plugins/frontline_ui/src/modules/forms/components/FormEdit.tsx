import { useParams } from 'react-router-dom';
import { useFormDetail } from '../hooks/useFormDetail';
import { FormSetupSteps } from './FormSetupSteps';
import { Spinner } from 'erxes-ui';
import { formSetSetupAtom } from '../states/formSetupStates';
import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';

export const FormEdit = () => {
  const { formId } = useParams();
  const [loadingSetup, setLoadingSetup] = useState(true);
  const { formDetail, loading } = useFormDetail({ formId: formId || '' });
  const formSetSetup = useSetAtom(formSetSetupAtom);

  useEffect(() => {
    if (formDetail) {
      formSetSetup(formDetail);
      setTimeout(() => {
        setLoadingSetup(false);
      }, 1000);
    }
  }, [formDetail, formSetSetup]);

  if (loading || loadingSetup) return <Spinner />;

  return <FormSetupSteps />;
};
