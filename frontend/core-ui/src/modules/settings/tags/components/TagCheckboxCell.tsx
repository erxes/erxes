import { Checkbox } from 'erxes-ui';

interface TagCheckboxCellProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const TagCheckboxCell = ({
  checked,
  onCheckedChange,
}: TagCheckboxCellProps) => {
  return (
    <div
      className="w-10 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 data-[checked=true]:opacity-100"
      data-checked={checked}
      onClick={(e) => e.stopPropagation()}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(val) => onCheckedChange(!!val)}
        aria-label="Select tag"
      />
    </div>
  );
};
