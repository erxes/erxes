import React from "react";
import { MultipleSelector, MultiSelectOption } from "erxes-ui/components/multiselect";
import { IGoalType } from "../types";

export interface Option {
  value: string;
  label: string;
}

export function generateGoalTypeOptions(array: IGoalType[] = []): MultiSelectOption[] {
  return array.map((item) => ({
    value: item._id,
    label: item.entity || "",
  }));
}

type Props = {
  label: string;
  name: string;
  value?: string[];               // multiple selected values (ids)
  options?: IGoalType[];
  onSelect: (value: string[], name: string) => void;
};

export default function SelectGoalType({
  label,
  name,
  value = [],
  options = [],
  onSelect,
}: Props) {
  const goalOptions = generateGoalTypeOptions(options);

  // Convert incoming value[] into MultiSelectOption[]
  const selected = goalOptions.filter((opt) => value.includes(opt.value));

  const handleChange = (items: MultiSelectOption[]) => {
    onSelect(items.map((i) => i.value), name);
  };

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>

      <MultipleSelector
        value={selected}
        options={goalOptions}
        placeholder="Select goal type(s)..."
        onChange={handleChange}
      />
    </div>
  );
}