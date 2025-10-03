import { useCompaniesEdit } from 'ui-modules/modules/contacts/hooks';
import { SelectMember } from 'ui-modules/modules/team-members';

export const CompanyOwner = ({
  _id,
  ownerId,
  scope,
  inTable,
}: {
  _id: string;
  ownerId?: string;
  scope?: string;
  inTable?: boolean;
}) => {
  const { companiesEdit } = useCompaniesEdit();

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
        companiesEdit({
          variables: {
            _id,
            ownerId: value as string,
          },
        });
      }}
    />
  );
};
