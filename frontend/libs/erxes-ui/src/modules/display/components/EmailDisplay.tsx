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
  onEmailDoubleClick,
  onEmailKeyActivate,
}: IEmailFieldProps & {
  onEmailClick?: (email: string) => void;
  onEmailDoubleClick?: (email: string) => void;
  onEmailKeyActivate?: (email: string) => void;
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
              {onEmailClick ? (
                <Badge
                  role="button"
                  tabIndex={0}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/10 hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEmailClick(email.email || '');
                  }}
                  onDoubleClick={(event) => {
                    event.stopPropagation();
                    onEmailDoubleClick?.(email.email || '');
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      event.stopPropagation();
                      (onEmailKeyActivate || onEmailClick)(email.email || '');
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
