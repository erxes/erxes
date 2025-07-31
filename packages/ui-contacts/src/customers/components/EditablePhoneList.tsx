import React, { useState, useMemo, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import { components } from "react-select";
import { DEFAULT_LABELS } from "core/src/data/constants";
import Button from "@erxes/ui/src/components/Button";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import styled from 'styled-components';
import { 
  FlexCenter,
  FormColumn,
  FormWrapper,
  AttachmentContainer
} from '@erxes/ui/src/styles/main';

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

// Styled components for layout
const PhoneEntry = styled(FlexCenter)`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const SelectContainer = styled(FormColumn)`
  max-width: 150px;
`;

const InputContainer = styled(FormColumn)`
  flex: 1;
`;

const EditablePhoneList = ({ phones, onChange, labels }: Props) => {
  const defaultPhoneLabels = useMemo(
    () =>
      (labels || DEFAULT_LABELS.phone).map((item) => ({
        value: item.name,
        label: item.name.charAt(0).toUpperCase() + item.name.slice(1),
      })),
    [labels]
  );

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

  useEffect(() => {
     const defaultTypes = defaultPhoneLabels.map((opt) => opt.value);
  
     const unknownTypes = phones
      .map((e) => e.type)
      .filter((type) => !defaultTypes.includes(type))
      .filter((type) => !customOptions.some((opt) => opt.value === type));
  
     if (unknownTypes.length > 0) {
      setCustomOptions((prev) => [
        ...prev,
        ...unknownTypes.map((type) => ({
          value: type,
          label: type.charAt(0).toUpperCase() + type.slice(1),
        })),
      ]);
     }
    }, )

  const flattenOptions = () =>
    groupedOptions.flatMap((group) => group.options);

  const getAvailableGroupedOptions = () => {
    const primaryPhone = phones.find((p) => p.type === "primary");
    
    const filterOutPrimary = (opt: { value: string }) => opt.value !== "primary";

      return [
        {
          label: "Default",
          options: primaryPhone
             ? defaultPhoneLabels.filter(filterOutPrimary)
             : defaultPhoneLabels,
        },
        {
          label: "Custom",
          options: primaryPhone
            ? customOptions.filter(filterOutPrimary)
            : customOptions,
        },
      ];
    
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
    const removed = phones[index];
    const updated = phones.filter((_, i) => i !== index);
    onChange(updated);

    if (
      !defaultPhoneLabels.some((opt) => opt.value === removed.type) &&
      !updated.some((p) => p.type === removed.type)
    ) {
      setCustomOptions((prev) =>
        prev.filter((opt) => opt.value !== removed.type)
      );
    }
  };

  const CustomOption = (props: any) => {
    const option = props.data;

    return (
      <components.Option {...props}>
        <FlexCenter>
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
                e.stopPropagation();
                setCustomOptions((prev) =>
                  prev.filter((o) => o.value !== option.value)
                );

                const fallback =
                  defaultPhoneLabels.find((d) => d.value !== "primary")
                    ?.value || "other";

                const updatedPhones = phones.map((p) =>
                  p.type === option.value ? { ...p, type: fallback } : p
                );
                onChange(updatedPhones);
              }}
            >
              ×
            </span>
          )}
        </FlexCenter>
      </components.Option>
    );
  };

  return (
    <FormGroup>
      <FormWrapper>
        {phones.map((item, index) => {
          const availableOptions = getAvailableGroupedOptions();
          const selectedOption =
            flattenOptions().find((opt) => opt.value === item.type) || null;

          return (
            <PhoneEntry key={index}>
              <SelectContainer>
                <CreatableSelect
                  value={selectedOption}
                  options={getAvailableGroupedOptions()}
                  onChange={(selected) =>
                    selected && handleTypeChange(index, selected.value)
                  }
                  onCreateOption={(inputValue) => {
                    const newValue = inputValue.trim().toLowerCase();
                    if (!newValue) return;

                    if (
                      newValue === "primary" &&
                      phones.some((p) => p.type === "primary")
                    ) {
                      return;
                    }

                    const newOption = {
                      value: newValue,
                      label:
                        newValue.charAt(0).toUpperCase() + newValue.slice(1),
                    };

                    setCustomOptions((prev) => [...prev, newOption]);
                    handleTypeChange(index, newValue);
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
              </SelectContainer>

              <InputContainer>
                <FormControl
                  name={`phone-${index}`}
                  value={item.phone}
                  placeholder={
                    item.type === "primary" ? "Primary phone" : "Phone number"
                  }
                  onChange={(e: any) =>
                    handlePhoneChange(index, e.target.value)
                  }
                />
              </InputContainer>

              <div>
                <Button
                  btnStyle="simple"
                  icon="trash"
                  size="small"
                  onClick={() => handleRemovePhone(index)}
                />
              </div>
            </PhoneEntry>
          );
        })}
      </FormWrapper>

      <AttachmentContainer>
        <Button
          btnStyle="simple"
          icon="plus"
          onClick={handleAddPhone}
          uppercase={false}
          size="small"
        >
          Add phone
        </Button>
      </AttachmentContainer>
    </FormGroup>
  );
};

export default EditablePhoneList;

