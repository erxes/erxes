import { FormCreate } from '@/forms/components/FormCreate';
import { FormsBreadCrumb } from '@/forms/components/FormsBreadCrumb';
import { Button, Separator } from 'erxes-ui';
import { SettingsHeader } from 'ui-modules';

export const FormCreatePage = () => {
  return (
    <>
      <SettingsHeader>
        <FormsBreadCrumb />
        <Separator.Inline />
        <Button variant="ghost" className="font-semibold hover:bg-transparent">
          Create form
        </Button>
      </SettingsHeader>
      <FormCreate />
    </>
  );
};
