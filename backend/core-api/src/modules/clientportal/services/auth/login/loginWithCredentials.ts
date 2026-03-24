import { IModels } from '~/connectionResolvers';
import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import { buildUserQuery } from '@/clientportal/services/helpers/queryBuilders';
import { updateLastLogin } from '@/clientportal/services/helpers/userUtils';
import { AuthenticationError } from '@/clientportal/services/errorHandler';
import { isTestAccountMatch } from '@/clientportal/services/helpers/testUserHelper';

function validateUserVerificationStatus(user: ICPUserDocument): void {
  if (!user.isVerified) {
    throw new AuthenticationError('User is not verified');
  }
}

export async function loginWithCredentials(
  email: string,
  phone: string,
  password: string,
  clientPortal: IClientPortalDocument,
  models: IModels,
): Promise<ICPUserDocument> {
  const query = buildUserQuery(undefined, email, phone, clientPortal._id);
  const user = await models.CPUser.findOne(query);

  if (!user || !user.password) {
    throw new AuthenticationError('Invalid login');
  }

  validateUserVerificationStatus(user);

  let isValid = false;

  if (
    clientPortal.testUser?.password &&
    isTestAccountMatch(clientPortal, user) &&
    password === clientPortal.testUser.password
  ) {
    isValid = true;
  } else {
    isValid = await models.CPUser.comparePassword(password, user.password);
  }

  if (!isValid) {
    throw new AuthenticationError('Invalid login');
  }

  await updateLastLogin(user._id, models);

  return user;
}
