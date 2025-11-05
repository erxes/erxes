import { Route, Routes } from 'react-router-dom';
import { ContactsSettingsLayout } from './ContactsSettingsLayout';
import { ContactsSettingsPage } from '~/pages/settings/modules/ContactsSettingsPage';

export const ContactsSettingsRoutes = () => {
  return (
    <ContactsSettingsLayout>
      <Routes>
        <Route path="/" element={<ContactsSettingsPage />} />
      </Routes>
    </ContactsSettingsLayout>
  );
};
