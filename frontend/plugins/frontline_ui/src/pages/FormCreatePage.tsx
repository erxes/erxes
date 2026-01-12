import { FormCreate } from '@/forms/components/FormCreate';
import { IconForms } from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';
import { SettingsHeader } from 'ui-modules';

export const FormCreatePage = () => {
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
      <FormCreate />
    </>
  );
};
