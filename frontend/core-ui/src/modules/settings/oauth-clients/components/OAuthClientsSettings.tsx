import { EditOAuthClient } from './EditOAuthClient';
import { OAuthClientsHeader } from './OAuthClientsHeader';
import { OAuthClientsRecordTable } from './OAuthClientsRecordTable';

export const OAuthClientsSettings = () => {
  return (
    <>
      <OAuthClientsHeader />
      <OAuthClientsRecordTable />
      <EditOAuthClient />
    </>
  );
};
