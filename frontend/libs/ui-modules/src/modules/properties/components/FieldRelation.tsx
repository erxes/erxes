import { SelectCompany, SelectCustomer } from 'ui-modules/modules/contacts';
import { SpecificFieldProps } from './Field';
import { useState } from 'react';
import { SelectProduct } from 'ui-modules/modules/products';
import {
  SelectBranches,
  SelectDepartments,
} from 'ui-modules/modules/structure';
import { SelectMember } from 'ui-modules/modules/team-members';

export const FieldRelation = ({
  field,
  value,
  handleChange,
  inCell,
  id,
}: SpecificFieldProps) => {
  const [currentValue, setCurrentValue] = useState<string | string[] | null>(
    value,
  );

  const SelectRelationComponent = (() => {
    if (field.relationType === 'core:customer') {
      return inCell ? SelectCustomer.InlineCell : SelectCustomer;
    }
    if (field.relationType === 'core:company') {
      return inCell ? SelectCompany.InlineCell : SelectCompany;
    }
    if (field.relationType === 'core:product') {
      return inCell ? SelectProduct.InlineCell : SelectProduct;
    }

    if (field.relationType === 'core:teamMembers') {
      return inCell ? SelectMember.InlineCell : SelectMember;
    }

    if (field.relationType === 'core:branch') {
      return inCell ? SelectBranches.InlineCell : SelectBranches.Root;
    }

    if (field.relationType === 'core:department') {
      return inCell ? SelectDepartments.InlineCell : SelectDepartments.Root;
    }
  })();

  if (!SelectRelationComponent) {
    return null;
  }

  return (
    <SelectRelationComponent
      scope={id}
      value={currentValue ?? undefined}
      mode={'single'}
      onValueChange={(val) => {
        setCurrentValue(val ?? null);
        val !== value && handleChange(val);
      }}
      placeholder=""
    />
  );
};
