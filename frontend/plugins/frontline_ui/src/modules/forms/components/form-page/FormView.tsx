import { PageContainer } from "erxes-ui";
import { FormPageHeader } from "./FormPageHeader";
import { FormPageList } from "./FormPageList";
import { FormSubHeader } from "./FormSubHeader";

export const FormView = () => {
  return (
    <PageContainer>
      <FormPageHeader />
      <FormSubHeader />
      <FormPageList />
    </PageContainer>
  );
};