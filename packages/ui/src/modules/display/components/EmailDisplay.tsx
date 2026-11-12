import { IconCircleDashed, IconCircleDashedCheck } from '@tabler/icons-react';
import { Badge } from 'erxes-ui/components/badge';
import { Button } from 'erxes-ui/components/button';
import type { EmailDisplayProps } from 'erxes-ui/modules/display/types/emailDisplay';
import { formatEmails } from 'erxes-ui/modules/display/utils/formatEmails';
import { ValidationStatus } from 'erxes-ui/types/ValidationStatus';

export const EmailDisplay = ({
  maxVisible,
  primaryEmail,
  emails,
  emailValidationStatus,
  onEmailClick,
  onEmailDoubleClick,
  onEmailKeyActivate,
}: EmailDisplayProps) => {
  const emailsWithProperties = formatEmails(primaryEmail, emails, emailValidationStatus);

  const values = emailsWithProperties.filter((item) => item.email);
  const visible = maxVisible === undefined ? values : values.slice(0, maxVisible);
  const remaining = values.length - visible.length;

  return (
    <div
      className={
        maxVisible === undefined ? 'flex gap-2' : 'flex min-w-0 max-w-full items-center gap-1'
      }
    >
      {visible.map(
        (email) =>
          email.email && (
            <span key={email.email} className="inline-flex min-w-0">
              {onEmailClick ? (
                // Rendered inside table/detail triggers, which are buttons
                // themselves, so the chip is a span acting as a button.
                <Button
                  asChild
                  size="sm"
                  variant="secondary"
                  className="min-w-0 max-w-full h-6 w-fit rounded-sm border gap-1 cursor-pointer hover:bg-primary/10 hover:text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
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
                    <span className="truncate">{email.email}</span>
                  </span>
                </Button>
              ) : (
                <Badge variant="secondary" className="min-w-0">
                  {email.isPrimary &&
                    (email.status === ValidationStatus.Valid ? (
                      <IconCircleDashedCheck className="text-success size-4" />
                    ) : (
                      <IconCircleDashed className="text-muted-foreground size-4" />
                    ))}
                  <span className="truncate">{email.email}</span>
                </Badge>
              )}
            </span>
          ),
      )}
      {remaining > 0 && (
        <Badge variant="secondary" className="shrink-0 text-muted-foreground">
          +{remaining}
        </Badge>
      )}
    </div>
  );
};
