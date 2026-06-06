import { lazy } from 'react';

const FormEdit = lazy(() =>
  import('@/forms/components/FormEdit').then((module) => ({
    default: module.FormEdit,
  })),
);

const FormDetailPage = () => {
  return <FormEdit />;
};

export default FormDetailPage;
