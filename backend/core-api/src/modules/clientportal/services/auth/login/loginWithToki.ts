import { getEnv } from 'erxes-api-shared/utils';

import { IModels } from '~/connectionResolvers';

import { AuthenticationError } from '@/clientportal/services/errorHandler';
import { updateLastLogin } from '@/clientportal/services/helpers/userUtils';
import { handleCPContacts } from '@/clientportal/services/user/contactService';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { ICPUserDocument } from '@/clientportal/types/cpUser';

async function fetchUserFromToki(
  token: string,
  clientPortal: IClientPortalDocument,
) {
  const tokiConfig = clientPortal.auth?.tokiConfig;

  if (!tokiConfig) {
    throw new Error('Toki configs are not set');
  }

  const testApiUrl = getEnv({ name: 'TOKI_TEST_API_URL' });
  const prodApiUrl = getEnv({ name: 'TOKI_PRODUCTION_API_URL' });

  const apiUrl = tokiConfig.production ? prodApiUrl : testApiUrl;

  const response = await fetch(
    `https://${apiUrl}/third-party-service/v1/shoppy/user`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'api-key': tokiConfig.apiKey,
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export async function loginWithToki(
  token: string,
  clientPortal: IClientPortalDocument,
  models: IModels,
): Promise<ICPUserDocument> {
  const response = await fetchUserFromToki(token, clientPortal);

  const { _id, phoneNo, profilePicURL, name } = response.data;

  const [firstName = '', ...rest] = (name || '').trim().split(' ');
  const lastName = rest.join(' ');

  let user: ICPUserDocument | null = await models.CPUser.findOne({
    clientPortalId: clientPortal._id,
    phone: phoneNo,
  });

  if (!user) {
    user = await handleCPContacts(models, clientPortal._id, {
      firstName,
      lastName,
      phone: phoneNo,
    });
  }

  if (!user) {
    throw new AuthenticationError('Cannot create user');
  }

  await models.CPUser.updateOne(
    { _id: user._id },
    {
      $set: {
        code: _id,
        avatar: profilePicURL
          ? `https://ms-public-toki.mn/profile/${profilePicURL}`
          : '',
        isVerified: true,
        isPhoneVerified: true,
      },
    },
  );

  await updateLastLogin(user._id, models);

  return (await models.CPUser.findById(user._id)) as ICPUserDocument;
}
