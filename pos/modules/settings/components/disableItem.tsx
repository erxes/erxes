import { useState } from 'react';
import { Label } from "@radix-ui/react-label";
import { Checkbox } from "@/components/ui/checkbox";

interface DisableItemProps {
  onChange?: (checked: boolean) => void;
  defaultChecked?: boolean;
}

const DisableItem = ({ onChange, defaultChecked }: DisableItemProps) => {
  const [isChecked, setIsChecked] = useState(defaultChecked || false);

  const handleChange = (checked: boolean) => {
    setIsChecked(checked);
    if (onChange) {
      onChange(checked);
    }
  };

  return (
    <Label
      className="w-full pb-5 flex gap-2 items-center"
      htmlFor="foodRestriction"
    >
      <Checkbox
        id="foodRestriction"
        checked={isChecked}
        onCheckedChange={handleChange}
        aria-label="Food restriction toggle"
      />
      Хоол хязгаарлалт
    </Label>
  );
};

export default DisableItem;