import { FormPreview } from '@/forms/components/FormPreview';
import { LEAD_DATA_SCHEMA } from '@/forms/constants/formSchema';
import { useFormDetail } from '@/forms/hooks/useFormDetail';
import {
  formSetSetupAtom,
  formSetupGeneralAtom,
} from '@/forms/states/formSetupStates';
import { hexToOklch, useQueryState } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useLayoutEffect } from 'react';
import { FormDraftScope } from '@/forms/components/FormDraftScope';
import { useFormDraftPreviewSubscriber } from '@/forms/hooks/useFormDraftPreview';

export const FormPreviewPage = () => {
  const [draftId] = useQueryState<string>('draft');
  const [formId] = useQueryState<string>('formId');
  return (
    <FormDraftScope scope={`preview:${draftId || formId || 'empty'}`}>
      <FormPreviewContent draftId={draftId} />
    </FormDraftScope>
  );
};

const FormPreviewContent = ({ draftId }: { draftId: string | null }) => {
  useFormDraftPreviewSubscriber(draftId);
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
      LEAD_DATA_SCHEMA.parse(formDetail?.leadData).primaryColor ??
      formGeneral?.primaryColor;

    if (primaryColor && hexToOklch(primaryColor)) {
      document.documentElement.style.setProperty(
        '--primary',
        hexToOklch(primaryColor) || '',
      );
    }
  }, [formDetail, formGeneral]);

  return <FormPreview />;
};
