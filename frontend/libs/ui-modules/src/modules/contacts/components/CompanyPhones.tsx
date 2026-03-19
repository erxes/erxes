import {
  PhoneDisplay,
  PhoneField,
  PopoverScoped,
  RecordTableInlineCell,
  type IPhoneFieldProps,
  type ValidationStatus,
} from 'erxes-ui';
import { useCompaniesEdit } from 'ui-modules/modules/contacts/hooks';

interface CompanyPhonesProps {
  readonly _id: string;
  readonly primaryPhone: string;
  readonly phones: string[];
  readonly phoneValidationStatus?: ValidationStatus;
  readonly scope?: string;
  readonly Trigger: React.ComponentType<{ children: React.ReactNode }>;
}

export function CompanyPhones({
  _id,
  primaryPhone,
  phones: _phones,
  phoneValidationStatus,
  scope,
  Trigger,
}: CompanyPhonesProps) {
  const { companiesEdit } = useCompaniesEdit();

  const phoneProps = {
    primaryPhone,
    phones: _phones,
    phoneValidationStatus,
  };

  const handleValueChange = (values: IPhoneFieldProps) => {
    companiesEdit({
      variables: {
        _id,
        ...values,
      },
    });
  };

  const handleValidationStatusChange = (status: ValidationStatus) => {
    companiesEdit({
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
