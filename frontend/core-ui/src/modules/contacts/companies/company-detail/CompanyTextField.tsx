import { TextField } from 'erxes-ui';
import { useCompaniesEdit } from 'ui-modules';

export const CompanyTextField = ({
  field,
  _id,
  ...props
}: Omit<React.ComponentProps<typeof TextField>, 'scope' | 'onValueChange'> & {
  field: string;
  fieldId?: string;
  _id: string;
}) => {
  const { companiesEdit } = useCompaniesEdit();
  const onSave = (value: string) => {
    companiesEdit({
      variables: { _id, [field]: value },
    });
  };
  return <TextField {...props} value={props.value} onSave={onSave} />;
};
