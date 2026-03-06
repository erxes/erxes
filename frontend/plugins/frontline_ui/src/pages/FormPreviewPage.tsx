import { FormPreview } from '@/forms/components/FormPreview';
import { useFormDetail } from '@/forms/hooks/useFormDetail';
import {
  formSetSetupAtom,
  formSetupGeneralAtom,
} from '@/forms/states/formSetupStates';
import { hexToOklch, useQueryState } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useLayoutEffect } from 'react';

export const FormPreviewPage = () => {
  const formGeneral = useAtomValue(formSetupGeneralAtom);
  const setSetup = useSetAtom(formSetSetupAtom);

  const [formId] = useQueryState<string>('formId');

  const { formDetail } = useFormDetail({ formId: formId || '' });

  useEffect(() => {
    if (formId && formDetail) {
      setSetup(formDetail);
    }
  }, [formDetail, formId]);

  useLayoutEffect(() => {
    const primaryColor =
      formDetail?.leadData?.primaryColor ?? formGeneral?.primaryColor;

    if (primaryColor && hexToOklch(primaryColor)) {
      document.documentElement.style.setProperty(
        '--primary',
        hexToOklch(primaryColor) || '',
      );
    }
  }, [formDetail, formGeneral]);

  return <FormPreview />;
};
