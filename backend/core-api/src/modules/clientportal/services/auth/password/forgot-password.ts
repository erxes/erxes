import { IClientPortalDocument } from '@/clientportal/types/clientPortal';
import { ICPUserDocument } from '@/clientportal/types/cpUser';
import * as crypto from 'crypto';
import { IModels } from '~/connectionResolvers';
import { setActionCode } from '../../helpers/actionCodeHelper';
import { sendAndStoreOTP } from '../../helpers/otpSenderHelper';
import { notificationService } from '@/clientportal/services/notification';
import { detectIdentifierType } from '../../helpers/validators';

const RESET_TOKEN_EXPIRY_HOURS = 1;

async function setPasswordResetCode(
  userId: string,
  code: string,
  expires: Date,
  models: IModels,
): Promise<void> {
  await setActionCode(
    userId,
    { code, expires, type: 'PASSWORD_RESET' },
    models,
  );
}

async function sendPasswordResetLink(
  subdomain: string,
  user: ICPUserDocument,
  resetToken: string,
  clientPortal: IClientPortalDocument,
  resetPasswordConfig: any,
  models: IModels,
): Promise<void> {
  if (!user.email) {
    return;
  }

  const resetUrl = `${
    clientPortal.url || ''
  }/reset-password?token=${resetToken}`;
  const emailSubject = resetPasswordConfig?.emailSubject || 'Password Reset';
  const emailContent = resetPasswordConfig?.emailContent || '';

  await notificationService.sendEmail(
    subdomain,
    {
      toEmails: [user.email],
      title: emailSubject,
      customHtml: emailContent,
      customHtmlData: { resetUrl, token: resetToken },
      userId: user._id,
    },
    models,
  );
}

export async function forgotPassword(
  identifier: string,
  clientPortal: IClientPortalDocument,
  models: IModels,
  subdomain: string,
): Promise<void> {
  const identifierType = detectIdentifierType(identifier);
  const user = await models.CPUser.findByIdentifier(
    identifier,
    identifierType,
    clientPortal._id,
  );

  if (!user) {
    return;
  }

  const resetPasswordConfig =
    clientPortal.securityAuthConfig?.resetPasswordConfig;
  const mode = resetPasswordConfig?.mode || 'link';

  if (mode === 'code') {
    const emailSubject = resetPasswordConfig?.emailSubject || 'Password Reset';
    const messageTemplate = resetPasswordConfig?.emailContent || '';

    await sendAndStoreOTP({
      user,
      identifierType,
      actionCodeType: 'PASSWORD_RESET',
      context: 'passwordReset',
      clientPortal,
      subdomain,
      models,
      emailSubject,
      messageTemplate,
    });
  } else {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + RESET_TOKEN_EXPIRY_HOURS);

    await setPasswordResetCode(user._id, resetToken, resetExpires, models);
    await sendPasswordResetLink(
      subdomain,
      user,
      resetToken,
      clientPortal,
      resetPasswordConfig,
      models,
    );
  }
}
