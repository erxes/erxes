import { useComposeEmail } from '../hooks/useComposeEmail';
import {
  EmailDisplay,
  EmailListField,
  PopoverScoped,
  RecordTableInlineCell,
  TEmailsOnValueChange,
  ValidationStatus,
} from 'erxes-ui';
import { useCompaniesEdit } from '../hooks/useEditCompany';
import { useEmailDoubleClick } from './useEmailDoubleClick';

export const CompanyEmails = ({
  primaryEmail,
  _id,
  emails,
  emailValidationStatus,
  scope,
  Trigger,
  onEmailClick,
}: {
  primaryEmail: string;
  _id: string;
  emails: string[];
  emailValidationStatus?: ValidationStatus;
  scope?: string;
  Trigger: React.ComponentType<{ children: React.ReactNode }>;
  onEmailClick?: (email: string) => void;
}) => {
  const { companiesEdit } = useCompaniesEdit();
  const { canComposeEmail, composeEmail } = useComposeEmail();
  const activateEmail =
    onEmailClick ||
    (canComposeEmail
      ? (email: string) => composeEmail({ companyId: _id, email })
      : undefined);
  const { open, setOpen, handleEmailClick, handleEmailDoubleClick } =
    useEmailDoubleClick(activateEmail);
  const emailProps = {
    primaryEmail,
    emails,
    emailValidationStatus: emailValidationStatus || ValidationStatus.Invalid,
  };

  const handleValidationStatusChange = (status: ValidationStatus) => {
    companiesEdit({
      variables: {
        _id,
        emailValidationStatus: status,
      },
    });
  };

  const handleValueChange: TEmailsOnValueChange = (values) => {
    companiesEdit({
      variables: {
        _id,
        ...values,
      },
    });
  };

  return (
    <PopoverScoped scope={scope || ''} modal open={open} onOpenChange={setOpen}>
      <div className="flex min-w-0 items-center">
        <Trigger>
          <EmailDisplay
            {...emailProps}
            onEmailClick={handleEmailClick}
            onEmailDoubleClick={handleEmailDoubleClick}
            onEmailKeyActivate={activateEmail || handleEmailClick}
          />
        </Trigger>
      </div>
      <RecordTableInlineCell.Content className="w-72">
        <EmailListField
          recordId={_id}
          {...emailProps}
          onValueChange={handleValueChange}
          onValidationStatusChange={handleValidationStatusChange}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};
