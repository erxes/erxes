import { IEmailFieldProps } from 'erxes-ui/modules/inputs';
import { Badge, badgeVariants } from 'erxes-ui/components';
import { IconCircleDashed, IconCircleDashedCheck } from '@tabler/icons-react';
import { formatEmails } from '../utils/formatEmails';
import { ValidationStatus } from 'erxes-ui/types';

export const EmailDisplay = ({
  primaryEmail,
  emails,
  emailValidationStatus,
  onEmailDoubleClick,
}: IEmailFieldProps & {
  onEmailDoubleClick?: (email: string) => void;
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
              {onEmailDoubleClick ? (
                <button
                  type="button"
                  className={badgeVariants({
                    variant: 'secondary',
                    className:
                      email.status === ValidationStatus.Valid
                        ? 'cursor-pointer'
                        : 'cursor-default',
                  })}
                  onDoubleClick={(event) => {
                    if (email.status === ValidationStatus.Valid) {
                      event.stopPropagation();
                      onEmailDoubleClick(email.email || '');
                    }
                  }}
                >
                  {email.isPrimary &&
                    (email.status === ValidationStatus.Valid ? (
                      <IconCircleDashedCheck className="text-success size-4" />
                    ) : (
                      <IconCircleDashed className="text-muted-foreground size-4" />
                    ))}
                  {email.email}
                </button>
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
