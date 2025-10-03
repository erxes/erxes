import { ChangePasswordForm } from '@/settings/security/components/ChangePasswordForm';
import { ChangePasswordHeader } from '@/settings/security/components/ChangePasswordHeader';
import React from 'react';

export default function ChangePassword() {
  return (
    <>
      <ChangePasswordHeader />
      <ChangePasswordForm />
    </>
  );
}
