import { IconCircleDashed, IconCircleDashedCheck } from '@tabler/icons-react';
import { Badge, Button } from 'erxes-ui/components';
import type { EmailDisplayProps } from 'erxes-ui/modules/display/types/emailDisplay';
import { formatEmails } from 'erxes-ui/modules/display/utils/formatEmails';
import { ValidationStatus } from 'erxes-ui/types';

export const EmailDisplay = ({
  primaryEmail,
  emails,
  emailValidationStatus,
  onEmailClick,
  onEmailDoubleClick,
  onEmailKeyActivate,
}: EmailDisplayProps) => {
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
                // Rendered inside table/detail triggers, which are buttons
                // themselves, so the chip is a span acting as a button.
                <Button
                  asChild
                  size="sm"
                  variant="secondary"
                  className="h-6 w-fit rounded-sm border gap-1 cursor-pointer hover:bg-primary/10 hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      onEmailClick(email.email || '');
                    }}
                    onDoubleClick={(event) => {
                      event.stopPropagation();
                      onEmailDoubleClick?.(email.email || '');
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter' && event.key !== ' ') {
                        return;
                      }

                      event.preventDefault();
                      event.stopPropagation();
                      (onEmailKeyActivate || onEmailClick)(email.email || '');
                    }}
                  >
                    {email.isPrimary &&
                      (email.status === ValidationStatus.Valid ? (
                        <IconCircleDashedCheck className="text-success size-4" />
                      ) : (
                        <IconCircleDashed className="text-muted-foreground size-4" />
                      ))}
                    {email.email}
                  </span>
                </Button>
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
