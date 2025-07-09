import React, { useState, useMemo } from "react";
import CreatableSelect from "react-select/creatable";
import { components } from "react-select";
import { DEFAULT_LABELS } from "core/src/data/constants";
import Button from "@erxes/ui/src/components/Button";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import ControlLabel from "@erxes/ui/src/components/form/Label";

type Phone = {
  type: string;
  phone: string;
};

type Label = {
  name: string;
  forType: string;
  type: string;
};

type Props = {
  phones: Phone[];
  onChange: (phones: Phone[]) => void;
  labels?: Label[];
};

const EditablePhoneList = ({ phones, onChange, labels }: Props) => {
  const defaultPhoneLabels = (labels || DEFAULT_LABELS.phone).map((item) => ({
    value: item.name,
    label: item.name.charAt(0).toUpperCase() + item.name.slice(1),
  }));

  const [customOptions, setCustomOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const groupedOptions = useMemo(
    () => [
      { label: "Default", options: defaultPhoneLabels },
      { label: "Custom", options: customOptions },
    ],
    [defaultPhoneLabels, customOptions]
  );

  const flattenOptions = () => {
    return groupedOptions.flatMap((group) => group.options);
  };

  const getAvailableOptions = (currentIndex: number) => {
    const primaryPhone = phones.find((phone) => phone.type === "primary");

    const flatOptions = [...defaultPhoneLabels, ...customOptions];
    if (primaryPhone) {
      return flatOptions.filter((option) => option.value !== "primary");
    }

    return flatOptions;
  };

  const handleTypeChange = (index: number, newType: string) => {
    let updated = [...phones];

    if (newType === "primary") {
      updated = updated.map((p, i) =>
        i !== index && p.type === "primary" ? { ...p, type: "other" } : p
      );
    }

    updated[index] = { ...updated[index], type: newType };
    onChange(updated);
  };

  const handlePhoneChange = (index: number, newPhone: string) => {
    const updated = [...phones];
    updated[index] = { ...updated[index], phone: newPhone };
    onChange(updated);
  };

  const handleAddPhone = () => {
    const nonprimary =
      flattenOptions().find((opt) => opt.value !== "primary")?.value || "other";
    onChange([...phones, { type: nonprimary, phone: "" }]);
  };

  const handleRemovePhone = (index: number) => {
    const removedPhone = phones[index];
    const updatedPhones = phones.filter((_, i) => i !== index);
    onChange(updatedPhones);

    // If removedPhone.type is custom and no phones use it anymore, remove it
    if (
      !defaultPhoneLabels.some((opt) => opt.value === removedPhone.type) &&
      !updatedPhones.some((p) => p.type === removedPhone.type)
    ) {
      setCustomOptions((prev) =>
        prev.filter((opt) => opt.value !== removedPhone.type)
      );
    }
  };

  // Custom Option renderer: shows "×" next to custom options in dropdown
  const CustomOption = (props: any) => {
    const option = props.data;

    return (
      <components.Option {...props}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{option.label}</span>
          {customOptions.find((opt) => opt.value === option.value) && (
            <span
              style={{
                marginLeft: 8,
                color: "#999",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              onClick={(e) => {
                e.stopPropagation(); // prevent selecting this option
                setCustomOptions((prev) =>
                  prev.filter((o) => o.value !== option.value)
                );

                // Update phones using this type to fallback
                const fallback =
                  defaultPhoneLabels.find((d) => d.value !== "primary")?.value ||
                  "other";
                const updatedPhones = phones.map((p) =>
                  p.type === option.value ? { ...p, type: fallback } : p
                );
                onChange(updatedPhones);
              }}
            >
              ×
            </span>
          )}
        </div>
      </components.Option>
    );
  };

  return (
    <FormGroup>
      {phones.map((item, index) => {
        const availableOptions = getAvailableOptions(index);
        const selectedOption =
          flattenOptions().find((opt) => opt.value === item.type) || null;

        return (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 10,
              gap: 10,
            }}
          >
            <div style={{ width: 150 }}>
              <CreatableSelect
                value={selectedOption}
                options={groupedOptions}
                onChange={(selected) =>
                  selected && handleTypeChange(index, selected.value)
                }
                onCreateOption={(inputValue) => {
                  if (
                    inputValue.toLowerCase() === "primary" &&
                    phones.some((p) => p.type === "primary")
                  ) {
                    return;
                  }

                  const newOption = {
                    value: inputValue,
                    label:
                      inputValue.charAt(0).toUpperCase() + inputValue.slice(1),
                  };

                  setCustomOptions((prev) => [...prev, newOption]);
                  handleTypeChange(index, inputValue);
                }}
                components={{ Option: CustomOption }}
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "34px",
                    height: "34px",
                    fontSize: "14px",
                  }),
                  indicatorsContainer: (base) => ({
                    ...base,
                    height: "34px",
                  }),
                  option: (base) => ({
                    ...base,
                    padding: "8px 12px",
                    fontSize: "14px",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    fontSize: "14px",
                  }),
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <FormControl
                name={`phone-${index}`}
                value={item.phone}
                onChange={(e: any) => handlePhoneChange(index, e.target.value)}
              />
            </div>

            <div>
              <Button
                btnStyle="simple"
                icon="trash"
                size="small"
                onClick={() => handleRemovePhone(index)}
              />
            </div>
          </div>
        );
      })}

      <Button
        btnStyle="simple"
        icon="plus"
        onClick={handleAddPhone}
        uppercase={false}
        size="small"
      >
        Add phone
      </Button>
    </FormGroup>
  );
};

export default EditablePhoneList;


