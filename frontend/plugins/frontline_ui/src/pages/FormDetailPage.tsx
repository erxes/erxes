import { SettingsHeader } from 'ui-modules';
import { FormEdit } from '@/forms/components/FormEdit';
import { FormsBreadCrumb } from '@/forms/components/FormsBreadCrumb';

export const FormDetailPage = () => {
  return (
    <>
      <SettingsHeader>
        <FormsBreadCrumb />
      </SettingsHeader>
      <FormEdit />
    </>
  );
};
