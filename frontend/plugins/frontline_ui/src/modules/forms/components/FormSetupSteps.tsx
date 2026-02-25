import { Preview, Resizable, Separator } from 'erxes-ui';
import { FrontlinePaths } from '@/types/FrontlinePaths';
import { formSetupStepAtom } from '@/forms/states/formSetupStates';
import { useAtomValue } from 'jotai';
import { FormGeneral } from '@/forms/components/FormGeneral';
import { FormContent } from '@/forms/components/FormContent';
import { FormConfirmation } from '@/forms/components/FormConfirmation';

export const FormSetupSteps = () => {
  const step = useAtomValue(formSetupStepAtom);
  return (
    <Resizable.PanelGroup direction="horizontal" className="flex-auto">
      <Resizable.Panel defaultSize={50}>
        {step === 1 && <FormGeneral />}
        {step === 2 && <FormContent />}
        {step === 3 && <FormConfirmation />}
      </Resizable.Panel>
      <Resizable.Handle />
      <Resizable.Panel
        defaultSize={50}
        className="flex flex-col overflow-hidden"
      >
        <Preview>
          <div className="bg-background">
            <Preview.Toolbar
              path={
                '/settings/frontline/forms' +
                FrontlinePaths.FormPreview +
                '?inPreview=true'
              }
            />
          </div>
          <Separator />
          <Preview.View iframeSrc={'/frontline/forms/preview?inPreview=true'} />
        </Preview>
      </Resizable.Panel>
    </Resizable.PanelGroup>
  );
};
