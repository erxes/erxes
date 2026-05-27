import { FormSubHeader } from '@/forms/components/form-page/FormSubHeader';
import { lazy } from 'react';

const FormPageList = lazy(() =>
  import('@/forms/components/form-page/FormPageList').then((module) => ({
    default: module.FormPageList,
  })),
);

export default function FormsIndexPage() {
  return (
    <>
      <FormSubHeader />
      <FormPageList />
    </>
  );
}
