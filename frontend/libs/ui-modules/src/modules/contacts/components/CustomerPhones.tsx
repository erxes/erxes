import {
  type IPhoneFieldProps,
  PhoneDisplay,
  PhoneField,
  PopoverScoped,
  RecordTableInlineCell,
  type ValidationStatus,
} from 'erxes-ui';
import { useCustomerEdit } from 'ui-modules/modules/contacts/hooks';

interface CustomerPhonesProps {
  _id: string;
  primaryPhone: string;
  phones: string[];
  phoneValidationStatus?: `${ValidationStatus}`;
  scope?: string;
  Trigger: React.ComponentType<{ children: React.ReactNode }>;
}

export function CustomerPhones({
  _id,
  primaryPhone,
  phones: _phones,
  phoneValidationStatus,
  scope,
  Trigger,
}: CustomerPhonesProps) {
  const { customerEdit } = useCustomerEdit();

  const phoneProps = {
    primaryPhone,
    phones: _phones,
    phoneValidationStatus: phoneValidationStatus as ValidationStatus,
  };

  const handleValueChange = (values: IPhoneFieldProps) => {
    customerEdit({
      variables: {
        _id,
        ...values,
      },
    });
  };

  const handleValidationStatusChange = (status: ValidationStatus) => {
    customerEdit({
      variables: {
        _id,
        phoneValidationStatus: status,
      },
    });
  };

  return (
    <PopoverScoped scope={scope || ''}>
      <Trigger>
        <PhoneDisplay {...phoneProps} />
      </Trigger>
      <RecordTableInlineCell.Content className="w-72">
        <PhoneField
          recordId={_id}
          {...phoneProps}
          onValueChange={handleValueChange}
          onValidationStatusChange={handleValidationStatusChange}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
}
