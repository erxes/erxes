import { SettingsHeader } from 'ui-modules';
import { Button } from 'erxes-ui';
import { IconForms } from '@tabler/icons-react';
import { FormEdit } from '@/forms/components/FormEdit';

export const FormDetailPage = () => {
  return (
    <>
      <SettingsHeader>
        <Button variant="ghost" className="font-semibold">
          <IconForms />
          Forms
        </Button>
      </SettingsHeader>
      <FormEdit />
    </>
  );
};
