import { FullNameField } from 'erxes-ui';
import { useCustomerEdit } from '../hooks';

export const CustomerName = ({
  _id,
  firstName,
  lastName,
  scope,
  children,
}: {
  _id?: string;
  firstName?: string;
  lastName?: string;
  scope: string;
  children?: React.ReactNode;
}) => {
  const { customerEdit } = useCustomerEdit();

  return (
    <FullNameField
      firstName={firstName}
      lastName={lastName}
      scope={scope}
      onValueChange={(newFirstName, newLastName) => {
        customerEdit({
          variables: {
            _id,
            firstName: newFirstName,
            lastName: newLastName,
            middleName: '',
          },
        });
      }}
    >
      {children}
    </FullNameField>
  );
};
