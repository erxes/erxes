import { FormPreview } from '@/forms/components/FormPreview';
import { formSetupGeneralAtom } from '@/forms/states/formSetupStates';
import { hexToOklch } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useLayoutEffect } from 'react';

export const FormPreviewPage = () => {
  const formGeneral = useAtomValue(formSetupGeneralAtom);

  useLayoutEffect(() => {
    if (formGeneral?.primaryColor && hexToOklch(formGeneral?.primaryColor)) {
      document.documentElement.style.setProperty(
        '--primary',
        hexToOklch(formGeneral?.primaryColor) || '',
      );
    }
  }, [formGeneral]);

  return <FormPreview />;
};
