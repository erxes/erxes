import { IEmailFieldProps } from 'erxes-ui/modules/inputs';
import { Badge } from 'erxes-ui/components';
import { IconCircleDashed, IconCircleDashedCheck } from '@tabler/icons-react';
import { formatEmails } from '../utils/formatEmails';
import { ValidationStatus } from 'erxes-ui/types';

export const EmailDisplay = ({
  primaryEmail,
  emails,
  emailValidationStatus,
}: IEmailFieldProps) => {
  const emailsWithProperties = formatEmails(
    primaryEmail,
    emails,
    emailValidationStatus,
  );

  return (
    <div className="flex gap-2">
      {emailsWithProperties.map(
        (email) =>
          email.email && (
            <Badge key={email.email} variant="secondary">
              {email.isPrimary &&
                (email.status === ValidationStatus.Valid ? (
                  <IconCircleDashedCheck className="text-success size-4" />
                ) : (
                  <IconCircleDashed className="text-muted-foreground size-4" />
                ))}
              {email.email}
            </Badge>
          ),
      )}
    </div>
  );
};
