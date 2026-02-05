import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import { IModels } from '~/connectionResolvers';
import { AuthenticationError } from '@/clientportal/services/errorHandler';
import { detectIdentifierType, validatePassword } from '../../helpers/validators';
import { validateActionCode } from '../../helpers/actionCodeHelper';

function validateResetToken(
  user: ICPUserDocument | null,
  code?: string | number,
): void {
  if (!user || !user.actionCode) {
    throw new AuthenticationError('Invalid or expired reset token');
  }
  const codeToValidate = code !== undefined ? code : user.actionCode.code;
  validateActionCode(user, codeToValidate, 'PASSWORD_RESET');
}

async function updateUserPassword(
  userId: string,
  hashedPassword: string,
  models: IModels,
): Promise<void> {
  await models.CPUser.updateOne(
    { _id: userId },
    {
      $set: { password: hashedPassword },
      $unset: { actionCode: '' },
    },
  );
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
  models: IModels,
): Promise<ICPUserDocument> {
  const user = await models.CPUser.findOne({ 'actionCode.code': token });
  validateResetToken(user, token);
  validatePassword(newPassword);

  const hashedPassword = await models.CPUser.generatePassword(newPassword);
  await updateUserPassword(user!._id, hashedPassword, models);
  return user!;
}

export async function resetPasswordWithCode(
  identifier: string,
  code: string,
  newPassword: string,
  clientPortalId: string,
  models: IModels,
): Promise<ICPUserDocument> {
  const identifierType = detectIdentifierType(identifier);
  const user = await models.CPUser.findByIdentifier(
    identifier,
    identifierType,
    clientPortalId,
  );

  if (!user || !user.actionCode) {
    throw new AuthenticationError('Invalid or expired reset token');
  }

  validateResetToken(user, code);
  validatePassword(newPassword);

  const hashedPassword = await models.CPUser.generatePassword(newPassword);
  await updateUserPassword(user._id, hashedPassword, models);

  return user;
}
