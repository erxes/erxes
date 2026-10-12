import { ITextFieldContainerProps, TextField } from 'erxes-ui';
import { useCompaniesEdit } from 'ui-modules';

export const CompanyTextField = ({
  placeholder,
  value,
  field,
  _id,
  scope,
}: ITextFieldContainerProps) => {
  const { companiesEdit } = useCompaniesEdit();
  const onSave = (editingValue: string) => {
    companiesEdit({
      variables: { _id, [field]: editingValue },
    });
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
