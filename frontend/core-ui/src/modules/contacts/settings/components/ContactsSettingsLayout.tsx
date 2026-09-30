import { PageContainer } from 'erxes-ui';
import { SettingsHeader } from 'ui-modules';
import { ContactsBreadcrumb } from './ContactsBreadcrumb';

export const ContactsSettingsLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <PageContainer>
      <SettingsHeader breadcrumbs={<ContactsBreadcrumb />}></SettingsHeader>
      <div className="flex flex-auto overflow-hidden">{children}</div>
    </PageContainer>
  );
};
