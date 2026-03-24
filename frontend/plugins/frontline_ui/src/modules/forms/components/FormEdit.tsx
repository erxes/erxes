import { useParams } from 'react-router-dom';
import { useFormDetail } from '../hooks/useFormDetail';
import { FormSetupSteps } from './FormSetupSteps';
import { Spinner } from 'erxes-ui';
import { formSetSetupAtom } from '../states/formSetupStates';
import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';

export const FormEdit = ({ setName }: { setName?: (name: string) => void }) => {
  const { formId } = useParams<{ formId: string }>();
  const [loadingSetup, setLoadingSetup] = useState(true);
  const { formDetail, loading } = useFormDetail({ formId: formId || '' });
  const formSetSetup = useSetAtom(formSetSetupAtom);

  useEffect(() => {
    if (formDetail) {
      formSetSetup(formDetail);
      setName?.(formDetail.name);
      setTimeout(() => {
        setLoadingSetup(false);
      }, 1000);
    }
  }, [formDetail, formSetSetup, setName]);

  if (loading || loadingSetup) return <Spinner />;

  return <FormSetupSteps />;
};
