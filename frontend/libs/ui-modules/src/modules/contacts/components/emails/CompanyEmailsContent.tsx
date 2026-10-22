import {
  EmailDisplay,
  EmailListField,
  PopoverScoped,
  RecordTableInlineCell,
} from 'erxes-ui';
import { useCompanyEmails } from 'ui-modules/modules/contacts/hooks/emails/useCompanyEmails';
import { useCompanyEmailsContext } from 'ui-modules/modules/contacts/hooks/emails/useContactEmailsContext';

export const CompanyEmailsContent = () => {
  const { scope, Trigger, _id } = useCompanyEmailsContext();
  const {
    open,
    setOpen,
    activateEmail,
    emailProps,
    handleValueChange,
    handleValidationStatusChange,
    handleEmailClick,
    handleEmailDoubleClick,
  } = useCompanyEmails();
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
