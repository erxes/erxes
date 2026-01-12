import { IconForms } from '@tabler/icons-react';
import { Button, Preview, Resizable, Separator } from 'erxes-ui';
import { SettingsHeader } from 'ui-modules';
import { FrontlinePaths } from '@/types/FrontlinePaths';
import { formSetupStepAtom } from '@/forms/states/formSetupStates';
import { useAtomValue } from 'jotai';
import { FormGeneral } from '@/forms/components/FormGeneral';
import { FormContent } from '@/forms/components/FormContent';
import { FormMutateLayoutPreviousStepButton } from '@/forms/components/FormMutateLayout';
import { FormConfirmation } from '@/forms/components/FormConfirmation';

export const FormCreatePage = () => {
  const step = useAtomValue(formSetupStepAtom);

  return (
    <>
      <SettingsHeader>
        <Button variant="ghost" className="font-semibold">
          <IconForms />
          Forms
        </Button>
        <Separator.Inline />
        <Button variant="ghost" className="font-semibold">
          Create form
        </Button>
      </SettingsHeader>
      <Resizable.PanelGroup direction="horizontal" className="flex-auto">
        <Resizable.Panel defaultSize={50}>
          {step === 1 && <FormGeneral />}
          {step === 2 && <FormContent />}
          {step === 3 && <FormConfirmation />}
          {step === 3 && <FormMutateLayoutPreviousStepButton />}
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
            <Preview.View
              iframeSrc={
                '/settings/frontline/forms' +
                FrontlinePaths.FormPreview +
                '?inPreview=true'
              }
            />
          </Preview>
        </Resizable.Panel>
      </Resizable.PanelGroup>
    </>
  );
};
