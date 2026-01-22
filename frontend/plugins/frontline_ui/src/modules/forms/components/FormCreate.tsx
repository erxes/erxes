import { useAtomValue, useSetAtom } from 'jotai';
import { FormSetupSteps } from './FormSetupSteps';
import {
  resetFormSetupAtom,
  settedFormDetailAtom,
} from '../states/formSetupStates';
import { useEffect } from 'react';

export const FormCreate = () => {
  const settedFormDetail = useAtomValue(settedFormDetailAtom);
  const resetFormSetup = useSetAtom(resetFormSetupAtom);
  useEffect(() => {
    if (settedFormDetail) {
      resetFormSetup();
    }
  }, [settedFormDetail, resetFormSetup]);

  return <FormSetupSteps />;
};
