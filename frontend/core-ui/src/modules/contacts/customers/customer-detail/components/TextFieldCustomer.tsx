import { TextField } from 'erxes-ui';
import { useCustomerEdit } from 'ui-modules';

interface TextFieldProps {
  field: string;
  fieldId?: string;
  _id: string;
}

export const TextFieldCustomer = ({
  field,
  _id,
  ...props
}: Omit<React.ComponentProps<typeof TextField>, 'scope' | 'onValueChange'> &
  TextFieldProps) => {
  const { customerEdit } = useCustomerEdit();
  const onSave = (newValue: string) => {
    customerEdit({
      variables: { _id, [field]: newValue },
    });
  };

  return <TextField {...props} value={props.value} onSave={onSave} />;
};
