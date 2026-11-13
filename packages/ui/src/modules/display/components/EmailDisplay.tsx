import { IconCircleDashed, IconCircleDashedCheck } from '@tabler/icons-react';
import { Badge } from 'erxes-ui/components/badge';
import { Button } from 'erxes-ui/components/button';
import type { EmailDisplayProps } from 'erxes-ui/modules/display/types/emailDisplay';
import { formatEmails } from 'erxes-ui/modules/display/utils/formatEmails';
import type { IEmailField } from 'erxes-ui/modules/inputs/types/emailField';
import { ValidationStatus } from 'erxes-ui/types/ValidationStatus';

const EmailText = ({ email, isPrimary, status }: IEmailField) => (
  <>
    {isPrimary &&
      (status === ValidationStatus.Valid ? (
        <IconCircleDashedCheck className="text-success size-4" />
      ) : (
        <IconCircleDashed className="text-muted-foreground size-4" />
      ))}
    <span className="truncate">{email}</span>
  </>
);

type EmailChipProps = Pick<
  EmailDisplayProps,
  'onEmailClick' | 'onEmailDoubleClick' | 'onEmailKeyActivate'
> & { item: IEmailField; email: string };

const EmailChip = ({
  item,
  email,
  onEmailClick,
  onEmailDoubleClick,
  onEmailKeyActivate,
}: EmailChipProps) => {
  if (!onEmailClick) {
    return (
      <Badge variant="secondary" className="min-w-0">
        <EmailText {...item} />
      </Badge>
    );
  }

  return (
    <Button
      asChild
      size="sm"
      variant="secondary"
      className="min-w-0 max-w-full h-6 w-fit rounded-sm border gap-1 cursor-pointer hover:bg-primary/10 hover:text-primary-text focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- the chip sits inside table and detail triggers that are buttons, and a button may not contain a button
        role="button"
        tabIndex={0}
        onClick={(event) => {
          event.stopPropagation();
          onEmailClick(email);
        }}
        onDoubleClick={(event) => {
          event.stopPropagation();
          onEmailDoubleClick?.(email);
        }}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;

          event.preventDefault();
          event.stopPropagation();
          (onEmailKeyActivate ?? onEmailClick)(email);
        }}
      >
        <EmailText {...item} />
      </span>
    </Button>
  );
};

export const EmailDisplay = ({
  maxVisible,
  primaryEmail,
  emails,
  emailValidationStatus,
  ...handlers
}: EmailDisplayProps) => {
  const values = formatEmails(primaryEmail, emails, emailValidationStatus).filter(
    (item) => item.email,
  );

  const visible = maxVisible === undefined ? values : values.slice(0, maxVisible);
  const remaining = values.length - visible.length;

  return (
    <div
      className={
        maxVisible === undefined ? 'flex gap-2' : 'flex min-w-0 max-w-full items-center gap-1'
      }
    >
      {visible.map(
        (item) =>
          item.email && (
            <span key={item.email} className="inline-flex min-w-0">
              <EmailChip item={item} email={item.email} {...handlers} />
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
