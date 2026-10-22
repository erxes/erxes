import {
  EmailDisplay,
  EmailListField,
  PopoverScoped,
  RecordTableInlineCell,
} from 'erxes-ui';
import { useCustomerEmailsContext } from 'ui-modules/modules/contacts/hooks/emails/useContactEmailsContext';
import { useCustomerEmails } from 'ui-modules/modules/contacts/hooks/emails/useCustomerEmails';

export const CustomerEmailsContent = () => {
  const { scope, Trigger, _id } = useCustomerEmailsContext();
  const {
    open,
    setOpen,
    activateEmail,
    emailProps,
    handleValueChange,
    handleValidationStatusChange,
    handleVerifiedEmailClick,
    handleVerifiedEmailDoubleClick,
  } = useCustomerEmails();
  return (
    <PopoverScoped scope={scope || ''} modal open={open} onOpenChange={setOpen}>
      <div className="flex min-w-0 items-center">
        <Trigger>
          <EmailDisplay
            {...emailProps}
            onEmailClick={handleVerifiedEmailClick}
            onEmailDoubleClick={handleVerifiedEmailDoubleClick}
            onEmailKeyActivate={activateEmail || handleVerifiedEmailClick}
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
