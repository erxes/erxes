import { useCustomerEdit } from 'ui-modules/modules/contacts/hooks';
import { SelectMember } from 'ui-modules/modules/team-members';

export const CustomerOwner = ({
  _id,
  ownerId,
  inTable = false,
  scope,
}: {
  _id: string;
  ownerId?: string;
  inTable?: boolean;
  scope?: string;
}) => {
  const { customerEdit } = useCustomerEdit();

  const SelectComponent = inTable
    ? SelectMember.InlineCell
    : SelectMember.Detail;

  return (
    <SelectComponent
      mode="single"
      value={ownerId}
      size="lg"
      scope={scope}
      onValueChange={(value) => {
        customerEdit({
          variables: {
            _id,
            ownerId: value,
          },
        });
      }}
    />
  );
};
