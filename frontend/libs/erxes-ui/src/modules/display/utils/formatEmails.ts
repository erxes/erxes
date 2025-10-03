import { IEmailField, TEmails } from 'erxes-ui/modules/inputs';
import { ValidationStatus } from 'erxes-ui/types';

export function formatEmails(
  primaryEmail: string,
  emails: string[],
  emailValidationStatus: ValidationStatus,
): TEmails {
  const formattedEmails: IEmailField[] = [
    ...(primaryEmail
      ? [
          {
            email: primaryEmail,
            status: emailValidationStatus,
            isPrimary: true,
          },
        ]
      : []),
    ...(emails || []).map((email) => ({
      email,
      status: emailValidationStatus,
    })),
  ];

  return formattedEmails.filter(
    (email, index, self) =>
      index === self.findIndex((t) => t.email === email.email),
  );
}
