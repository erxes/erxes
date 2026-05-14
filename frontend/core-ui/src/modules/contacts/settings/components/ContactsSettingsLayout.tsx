import { PageContainer } from 'erxes-ui';
import { SettingsHeader } from 'ui-modules';
import { ContactsBreadcrumb } from './ContactsBreadcrumb';
import { ContactsSidebar } from './ContactsSettingsSidebar';

export const ContactsSettingsLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <PageContainer>
      <SettingsHeader breadcrumbs={<ContactsBreadcrumb />}></SettingsHeader>
      <div className="flex flex-auto overflow-hidden">
        <ContactsSidebar />
        {children}
      </div>
    </PageContainer>
  );
};
