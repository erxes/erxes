import { IEmailFieldProps } from 'erxes-ui/modules/inputs';
import { Badge } from 'erxes-ui/components';
import { IconCircleDashed, IconCircleDashedCheck } from '@tabler/icons-react';
import { formatEmails } from '../utils/formatEmails';
import { ValidationStatus } from 'erxes-ui/types';

export const EmailDisplay = ({
  primaryEmail,
  emails,
  emailValidationStatus,
  onEmailClick,
}: IEmailFieldProps & {
  onEmailClick?: (email: string) => void;
}) => {
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
            <span key={email.email} className="inline-flex">
              {onEmailClick && email.status === ValidationStatus.Valid ? (
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/10 hover:text-primary"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEmailClick(email.email || '');
                  }}
                  onDoubleClick={(event) => event.stopPropagation()}
                >
                  {email.isPrimary &&
                    (email.status === ValidationStatus.Valid ? (
                      <IconCircleDashedCheck className="text-success size-4" />
                    ) : (
                      <IconCircleDashed className="text-muted-foreground size-4" />
                    ))}
                  {email.email}
                </Badge>
              ) : (
                <Badge variant="secondary">
                  {email.isPrimary &&
                    (email.status === ValidationStatus.Valid ? (
                      <IconCircleDashedCheck className="text-success size-4" />
                    ) : (
                      <IconCircleDashed className="text-muted-foreground size-4" />
                    ))}
                  {email.email}
                </Badge>
              )}
            </span>
          ),
      )}
    </div>
  );
};
