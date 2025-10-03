import { ITextFieldContainerProps, TextField } from 'erxes-ui';
import { useCompaniesEdit } from '@/contacts/companies/hooks/useCompaniesEdit';

export const CompanyTextField = ({
  placeholder,
  value,
  field,
  _id,
  scope,
}: ITextFieldContainerProps) => {
  const { companiesEdit } = useCompaniesEdit();
  const onSave = (editingValue: string) => {
    companiesEdit(
      {
        variables: { _id, [field]: editingValue },
      },
      [field],
    );
  };
  return (
    <TextField
      placeholder={placeholder}
      value={value}
      scope={scope}
      onSave={onSave}
    />
  );
};
