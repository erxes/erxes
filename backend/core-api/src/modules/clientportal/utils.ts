import { ICPUserDocument } from '@/clientportal/types/cpUser';

export function normalizeEmail(email: string): string {
  return (email || '').toLowerCase().trim();
}

export function validatePhoneFormat(phone: string): boolean {
  if (!phone) {
    return false;
  }
  return phone.length >= 8;
}

export const handleCPUserDeviceToken = async (
  cpUser: ICPUserDocument,
  deviceToken: string,
) => {
  if (deviceToken && cpUser) {
    const deviceTokens: string[] = (cpUser as any).deviceTokens || [];

    if (!deviceTokens.includes(deviceToken)) {
      deviceTokens.push(deviceToken);

      await cpUser.updateOne({ $set: { deviceTokens } });
    }
  }
};
