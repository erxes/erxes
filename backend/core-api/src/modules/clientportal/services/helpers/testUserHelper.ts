import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { ICPUserDocument } from '@/clientportal/types/cpUser';

function normalizeEmail(email?: string | null): string | null {
  if (!email) {
    return null;
  }

  return email.trim().toLowerCase();
}

function normalizePhone(phone?: string | null): string | null {
  if (!phone) {
    return null;
  }

  const digitsOnly = phone.replace(/\D/g, '');

  return digitsOnly || null;
}

export function isTestAccountMatch(
  clientPortal: IClientPortalDocument,
  user: ICPUserDocument,
): boolean {
  const testUser = clientPortal.testUser;

  if (!testUser || !testUser.enableTestUser) {
    return false;
  }

  const testEmail = normalizeEmail(testUser.email);
  const testPhone = normalizePhone(testUser.phone);

  const userEmail = normalizeEmail((user as any).email);
  const userPhone = normalizePhone((user as any).phone);

  if (testEmail && userEmail && testEmail === userEmail) {
    return true;
  }

  if (testPhone && userPhone && testPhone === userPhone) {
    return true;
  }

  return false;
}

