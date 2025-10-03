import {
  EmailDisplay,
  EmailListField,
  PopoverScoped,
  RecordTableInlineCell,
  TEmailsOnValueChange,
  ValidationStatus,
} from 'erxes-ui';
import { useCompaniesEdit } from '../hooks/useEditCompany';

export const CompanyEmails = ({
  primaryEmail,
  _id,
  emails,
  emailValidationStatus,
  scope,
  Trigger,
}: {
  primaryEmail: string;
  _id: string;
  emails: string[];
  emailValidationStatus?: ValidationStatus;
  scope?: string;
  Trigger: React.ComponentType<{ children: React.ReactNode }>;
}) => {
  const { companiesEdit } = useCompaniesEdit();
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
    <PopoverScoped scope={scope || ''} modal>
      <Trigger>
        <EmailDisplay {...emailProps} />
      </Trigger>
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
