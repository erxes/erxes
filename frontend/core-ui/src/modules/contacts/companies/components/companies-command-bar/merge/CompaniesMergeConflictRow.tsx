import { ChoiceboxGroup } from 'erxes-ui';
import { MergingFieldContainer } from '@/contacts/customers/components/customers-command-bar/merge/MergingFieldContainer';
import { useCompaniesMergeContext } from '@/contacts/companies/hooks/useCompaniesMergeContext';
import {
  MergeChoice,
  MergeConflictItem,
} from '@/contacts/companies/utils/companyMerge';

export const CompaniesMergeConflictRow = ({
  conflict,
}: {
  conflict: MergeConflictItem;
}) => {
  const { selectChoice } = useCompaniesMergeContext();
  const { key, label, type, selected, options } = conflict;

  const handleValueChange = (choice: string) =>
    selectChoice(key, choice as MergeChoice);

  return (
    <ChoiceboxGroup
      value={selected}
      onValueChange={handleValueChange}
      direction="row"
      className="gap-3"
    >
      {options.map(({ choice, fieldValue }) => (
        <MergingFieldContainer
          key={choice}
          fieldName={label}
          fieldValue={fieldValue}
          type={type}
          value={choice}
        />
      ))}
    </ChoiceboxGroup>
  );
};
