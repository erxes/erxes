import { SelectCompany, SelectCustomer } from 'ui-modules/modules/contacts';
import { SpecificFieldProps } from './Field';
import { ComponentType, useState } from 'react';
import { SelectProduct } from 'ui-modules/modules/products';
import {
  SelectBranches,
  SelectDepartments,
} from 'ui-modules/modules/structure';
import { SelectMember } from 'ui-modules/modules/team-members';

type RelationSelectProps = {
  scope: string;
  value?: string | string[];
  onValueChange: (value?: string | string[] | null) => void;
  inCell?: boolean;
};

const COMMON_PROPS = { mode: 'single', placeholder: '' } as const;

const RELATION_SELECT_BY_TYPE: Record<
  string,
  ComponentType<RelationSelectProps>
> = {
  'core:customer': ({ inCell, ...props }) =>
    inCell ? (
      <SelectCustomer.InlineCell {...props} {...COMMON_PROPS} />
    ) : (
      <SelectCustomer {...props} {...COMMON_PROPS} />
    ),
  'core:company': ({ inCell, ...props }) =>
    inCell ? (
      <SelectCompany.InlineCell {...props} {...COMMON_PROPS} />
    ) : (
      <SelectCompany {...props} {...COMMON_PROPS} />
    ),
  'core:product': ({ inCell, ...props }) =>
    inCell ? (
      <SelectProduct.InlineCell {...props} {...COMMON_PROPS} />
    ) : (
      <SelectProduct {...props} {...COMMON_PROPS} />
    ),
  'core:teamMembers': ({ inCell, ...props }) =>
    inCell ? (
      <SelectMember.InlineCell {...props} {...COMMON_PROPS} />
    ) : (
      <SelectMember {...props} {...COMMON_PROPS} />
    ),
  'core:branch': ({ inCell, ...props }) =>
    inCell ? (
      <SelectBranches.InlineCell {...props} {...COMMON_PROPS} />
    ) : (
      <SelectBranches.Root {...props} {...COMMON_PROPS} />
    ),
  'core:department': ({ inCell, ...props }) =>
    inCell ? (
      <SelectDepartments.InlineCell {...props} {...COMMON_PROPS} />
    ) : (
      <SelectDepartments.Root {...props} {...COMMON_PROPS} />
    ),
};

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

  const SelectRelation = RELATION_SELECT_BY_TYPE[field.relationType || ''];

  if (!SelectRelation) {
    return null;
  }

  return (
    <SelectRelation
      scope={id}
      value={currentValue ?? undefined}
      inCell={inCell}
      onValueChange={(val = null) => {
        setCurrentValue(val);
        val !== value && handleChange(val);
      }}
    />
  );
};
