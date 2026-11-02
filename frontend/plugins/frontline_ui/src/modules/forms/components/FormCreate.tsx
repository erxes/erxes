import { useAtomValue, useSetAtom } from 'jotai';
import { FormSetupSteps } from './FormSetupSteps';
import {
  resetFormSetupAtom,
  settedFormDetailAtom,
} from '../states/formSetupStates';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FormDraftScope } from './FormDraftScope';

export const FormCreate = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <FormDraftScope scope={`create:${id ?? 'global'}`}>
      <FormCreateContent />
    </FormDraftScope>
  );
};

const FormCreateContent = () => {
  const settedFormDetail = useAtomValue(settedFormDetailAtom);
  const resetFormSetup = useSetAtom(resetFormSetupAtom);
  useEffect(() => {
    if (settedFormDetail) {
      resetFormSetup();
    }
  }, [settedFormDetail, resetFormSetup]);

  return <FormSetupSteps />;
};
