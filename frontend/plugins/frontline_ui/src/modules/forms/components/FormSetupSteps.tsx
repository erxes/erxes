import { Preview, Resizable, Separator } from 'erxes-ui';
import { formSetupStepAtom } from '@/forms/states/formSetupStates';
import { useAtomValue } from 'jotai';
import { FormGeneral } from '@/forms/components/FormGeneral';
import { FormCallout } from '@/forms/components/FormCallout';
import { FormContent } from '@/forms/components/FormContent';
import { FormConfirmation } from '@/forms/components/FormConfirmation';
import { FORM_SETUP_STEPS } from '@/forms/constants/formStatesDefaultValues';
import { useState } from 'react';
import { nanoid } from 'nanoid';
import { useFormDraftPreviewPublisher } from '../hooks/useFormDraftPreview';

export const FormSetupSteps = () => {
  const step = useAtomValue(formSetupStepAtom);
  const [draftId] = useState(() => nanoid());
  useFormDraftPreviewPublisher(draftId);
  const previewUrl = `/frontline/forms/preview?inPreview=true&draft=${draftId}`;
  return (
    <Resizable.PanelGroup direction="horizontal" className="flex-auto">
      <Resizable.Panel defaultSize={50}>
        {step === FORM_SETUP_STEPS.GENERAL && <FormGeneral />}
        {step === FORM_SETUP_STEPS.CALLOUT && <FormCallout />}
        {step === FORM_SETUP_STEPS.CONTENT && <FormContent />}
        {step === FORM_SETUP_STEPS.CONFIRMATION && <FormConfirmation />}
      </Resizable.Panel>
      <Resizable.Handle />
      <Resizable.Panel
        defaultSize={50}
        className="flex flex-col overflow-hidden"
      >
        <Preview>
          <div className="bg-background">
            <Preview.Toolbar path={previewUrl} />
          </div>
          <Separator />
          <Preview.View iframeSrc={previewUrl} />
        </Preview>
      </Resizable.Panel>
    </Resizable.PanelGroup>
  );
};
