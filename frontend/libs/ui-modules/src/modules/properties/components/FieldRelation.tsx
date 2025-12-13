import { SelectCustomer } from 'ui-modules/modules/contacts';

export const FieldRelation = ({ field, value, handleChange, loading }: any) => {
  if (field.relationType === 'core:customer') {
    return (
      <SelectCustomer.InlineCell
        value={value}
        onValueChange={(value) => {
          handleChange(value);
        }}
      />
    );
  }

  if (field.relationType === 'core:company') {
    return <div>Company</div>;
  }

  return <div>Relation</div>;
};
