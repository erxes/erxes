import { PageContainer } from 'erxes-ui';
import { FormPageHeader } from './FormPageHeader';
import { FormSubHeader } from './FormSubHeader';
import { Outlet } from 'react-router';

const FormView = () => {
  return (
    <PageContainer>
      <FormPageHeader />
      <Outlet />
    </PageContainer>
  );
};

export default FormView;
